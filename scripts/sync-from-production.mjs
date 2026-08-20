import { lstat, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const betaRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const productionMcpUrl = ["https://api", "erstan.com/v1/mcp"].join(".");
const betaMcpUrl = "https://api-qa.erstan.com/v1/mcp";
const betaPluginName = "erstan-beta";
const betaRepositoryUrl = "https://github.com/erstanai/erstan-agent-tools-beta";
const versionPattern = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/;

function usage(message) {
  if (message) console.error(message);
  console.error("Usage: node scripts/sync-from-production.mjs [--source <path>] [--version <semver>]");
  process.exitCode = 2;
}

function parseArgs(argv) {
  const result = {
    source: path.resolve(betaRoot, "..", "erstan-agent-tools"),
    version: undefined,
  };
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--source" || argument === "--version") {
      const value = argv[index + 1];
      if (!value || value.startsWith("--")) {
        usage(`${argument} requires a value.`);
        return null;
      }
      result[argument.slice(2)] = value;
      index += 1;
    } else {
      usage(`Unknown argument: ${argument}`);
      return null;
    }
  }
  result.source = path.resolve(result.source);
  return result;
}

function assertWithin(parent, target, label) {
  const relative = path.relative(parent, target);
  if (!relative || relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error(`${label} must be a child of ${parent}: ${target}`);
  }
}

async function readJson(file) {
  return JSON.parse(await readFile(file, "utf8"));
}

async function writeJson(file, value) {
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

async function collectFiles(root, directory = root) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    const stat = await lstat(absolute);
    if (stat.isSymbolicLink()) {
      throw new Error(`Refusing to sync symlink: ${absolute}`);
    }
    if (entry.isDirectory()) {
      files.push(...await collectFiles(root, absolute));
    } else if (entry.isFile()) {
      files.push(path.relative(root, absolute));
    } else {
      throw new Error(`Unsupported production entry: ${absolute}`);
    }
  }
  return files.sort();
}

async function replaceTree(source, target, transform = (_relative, contents) => contents) {
  assertWithin(betaRoot, target, "Sync target");
  await rm(target, { recursive: true, force: true });
  await mkdir(target, { recursive: true });
  for (const relative of await collectFiles(source)) {
    const sourceFile = path.join(source, relative);
    const targetFile = path.join(target, relative);
    const contents = await readFile(sourceFile);
    const transformed = await transform(relative.split(path.sep).join("/"), contents);
    await mkdir(path.dirname(targetFile), { recursive: true });
    await writeFile(targetFile, transformed);
  }
}

function transformSkill(relative, contents) {
  const source = contents.toString("utf8").replace(/\r\n/g, "\n");
  if (!relative.endsWith("/agents/openai.yaml")) return source;
  const transformed = source
    .replaceAll('value: "erstan"', `value: "${betaPluginName}"`)
    .replaceAll(productionMcpUrl, betaMcpUrl);
  if (transformed === source || transformed.includes(productionMcpUrl) || transformed.includes('value: "erstan"')) {
    throw new Error(`Could not apply the required beta MCP transform to ${relative}`);
  }
  return transformed;
}

function section(markdown, startHeading, endHeading) {
  const start = markdown.indexOf(`${startHeading}\n`);
  const end = markdown.indexOf(`${endHeading}\n`, start + startHeading.length);
  if (start === -1 || end === -1) {
    throw new Error(`Could not find ${startHeading} through ${endHeading}`);
  }
  return markdown.slice(start, end);
}

function replaceSection(markdown, startHeading, endHeading, replacement) {
  const current = section(markdown, startHeading, endHeading);
  return markdown.replace(current, replacement);
}

const args = parseArgs(process.argv.slice(2));
if (!args) process.exit();

const sourceRoot = args.source;
if (sourceRoot.toLowerCase() === betaRoot.toLowerCase()
  || sourceRoot.toLowerCase().startsWith(`${betaRoot.toLowerCase()}${path.sep}`)) {
  throw new Error("Production source must be outside the beta repository.");
}

const sourcePackage = await readJson(path.join(sourceRoot, "package.json"));
if (sourcePackage.name !== "erstan-agent-tools") {
  throw new Error(`Production source has unexpected package name: ${sourcePackage.name ?? "missing"}`);
}

const betaVersion = args.version ?? `${sourcePackage.version}-beta.1`;
if (!versionPattern.test(betaVersion)) {
  throw new Error(`Beta version is not valid semantic versioning: ${betaVersion}`);
}
const productionCoreVersion = sourcePackage.version.split("-", 1)[0];
if (!betaVersion.startsWith(`${productionCoreVersion}-`)) {
  throw new Error(`Beta version must be a prerelease of production ${productionCoreVersion}: ${betaVersion}`);
}

const sourcePluginRoot = path.join(sourceRoot, "plugins", "erstan");
const betaPluginRoot = path.join(betaRoot, "plugins", betaPluginName);
assertWithin(sourceRoot, sourcePluginRoot, "Production plugin source");
assertWithin(betaRoot, betaPluginRoot, "Beta plugin target");

await replaceTree(
  path.join(sourcePluginRoot, "skills"),
  path.join(betaPluginRoot, "skills"),
  transformSkill,
);
await replaceTree(
  path.join(sourcePluginRoot, "assets"),
  path.join(betaPluginRoot, "assets"),
);

const betaPackage = {
  ...sourcePackage,
  name: "erstan-agent-tools-beta",
  version: betaVersion,
  description: "Temporary Erstan Beta plugin and skills for building, reviewing, and optimizing Agents and Skills.",
  scripts: {
    ...sourcePackage.scripts,
    "sync:production": "node scripts/sync-from-production.mjs",
  },
};
await writeJson(path.join(betaRoot, "package.json"), betaPackage);

const sourceCodexManifest = await readJson(path.join(sourcePluginRoot, ".codex-plugin", "plugin.json"));
const betaCodexManifest = {
  ...sourceCodexManifest,
  name: betaPluginName,
  version: betaVersion,
  description: "Build, review, and optimize Erstan Agents and Skills in the isolated QA environment.",
  repository: betaRepositoryUrl,
  interface: {
    ...sourceCodexManifest.interface,
    displayName: "Erstan Beta",
    shortDescription: "Build and optimize in Erstan Beta",
    longDescription: "Use the isolated Erstan QA environment to build, review, and optimize Agents and Skills, operate published runs, and work with authorized beta workspace content.",
    defaultPrompt: [
      "Build or optimize an Erstan Beta Agent for this workflow.",
      "Diagnose this Erstan Beta Agent run and recommend the smallest safe fix.",
      "Review my Erstan Beta work and carry out the authorized next steps.",
    ],
  },
};
await writeJson(path.join(betaPluginRoot, ".codex-plugin", "plugin.json"), betaCodexManifest);

const sourceClaudeManifest = await readJson(path.join(sourcePluginRoot, ".claude-plugin", "plugin.json"));
await writeJson(path.join(betaPluginRoot, ".claude-plugin", "plugin.json"), {
  ...sourceClaudeManifest,
  name: betaPluginName,
  displayName: "Erstan Beta",
  version: betaVersion,
  description: "Build, review, and optimize Erstan Agents and Skills in the isolated QA environment.",
  repository: betaRepositoryUrl,
});

const sourceCodexMarketplace = await readJson(path.join(sourceRoot, ".agents", "plugins", "marketplace.json"));
const codexEntry = sourceCodexMarketplace.plugins?.[0];
if (!codexEntry) throw new Error("Production Codex marketplace must contain one plugin entry.");
await writeJson(path.join(betaRoot, ".agents", "plugins", "marketplace.json"), {
  ...sourceCodexMarketplace,
  name: betaPluginName,
  interface: {
    ...sourceCodexMarketplace.interface,
    displayName: "Erstan Beta",
  },
  plugins: [{
    ...codexEntry,
    name: betaPluginName,
    source: {
      ...codexEntry.source,
      path: `./plugins/${betaPluginName}`,
    },
  }],
});

const sourceClaudeMarketplace = await readJson(path.join(sourceRoot, ".claude-plugin", "marketplace.json"));
const claudeEntry = sourceClaudeMarketplace.plugins?.[0];
if (!claudeEntry) throw new Error("Production Claude marketplace must contain one plugin entry.");
await writeJson(path.join(betaRoot, ".claude-plugin", "marketplace.json"), {
  ...sourceClaudeMarketplace,
  name: betaPluginName,
  description: "Temporary Erstan Beta plugin for Claude Code.",
  plugins: [{
    ...claudeEntry,
    name: betaPluginName,
    displayName: "Erstan Beta",
    source: `./plugins/${betaPluginName}`,
    description: "Build, review, and optimize Erstan Agents and Skills in the isolated QA environment.",
    version: betaVersion,
  }],
});

await writeJson(path.join(betaPluginRoot, ".mcp.json"), {
  mcpServers: {
    [betaPluginName]: {
      type: "http",
      url: betaMcpUrl,
    },
  },
});

const sourceReadme = await readFile(path.join(sourceRoot, "README.md"), "utf8");
const betaReadmePath = path.join(betaRoot, "README.md");
const betaReadme = await readFile(betaReadmePath, "utf8");
const included = section(sourceReadme, "## What is included", "## Permission model");
await writeFile(
  betaReadmePath,
  replaceSection(betaReadme, "## What is included", "## Permission model", included),
  "utf8",
);

const skillNames = (await readdir(path.join(betaPluginRoot, "skills"), { withFileTypes: true }))
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();

console.log(`Synced production ${sourcePackage.version} to beta ${betaVersion}.`);
console.log(`Copied ${skillNames.length} Skills: ${skillNames.join(", ")}`);
console.log(`Rewrote the MCP identity to ${betaPluginName} at ${betaMcpUrl}.`);
