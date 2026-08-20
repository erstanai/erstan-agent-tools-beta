import { createHash } from "node:crypto";
import { lstat, readFile, readdir } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const mcpUrl = "https://api-qa.erstan.com/v1/mcp";
const productionMcpUrl = ["https://api", "erstan.com/v1/mcp"].join(".");
const pluginName = "erstan-beta";
const repositoryUrl = "https://github.com/erstanai/erstan-agent-tools-beta";
const websiteUrl = "https://signup.erstan.com/";
const privacyPolicyUrl = "https://signup.erstan.com/privacy/";
const termsOfServiceUrl = "https://signup.erstan.com/terms/";
const versionPattern = /^\d+\.\d+\.\d+-[0-9A-Za-z.-]+$/;
const failures = [];

// SHA-256 fingerprints keep private diagnostic identifiers out of the public
// distribution while still rejecting an accidental exact disclosure.
const privateSurfaceFingerprints = [
  { length: 12, digest: "881cc81b00a7eedf049a7d0b82b0c210059c1b6b7867cfd7404113a74832a9bc" },
  { length: 13, digest: "82f6c3c44f38ee73daec642e50575885db07f0e4960b2f036b50b83d243af360" },
  { length: 14, digest: "1ba9654c09d31c3341a0b23f7a0e530ebb7581e612d7d76949495cf005055fc1" },
  { length: 19, digest: "bd317a84598eae783048ad5bd721e3093b3ff064847a1c5bcf81dc74cc31c7e5" },
  { length: 10, digest: "8aaa4f05df96274518e4510068ee3da0aa65883cf6c44f1f6cfb95f2198c6c85" }
];

const expectedFiles = new Set([
  ".agents/plugins/marketplace.json",
  ".claude-plugin/marketplace.json",
  ".gitattributes",
  ".github/workflows/release.yml",
  ".github/workflows/sync-production.yml",
  ".github/workflows/verify.yml",
  ".gitignore",
  "AGENTS.md",
  "LICENSE",
  "NOTICE",
  "README.md",
  "SECURITY.md",
  "docs/PUBLISHING.md",
  "package.json",
  "plugins/erstan-beta/.claude-plugin/plugin.json",
  "plugins/erstan-beta/.codex-plugin/plugin.json",
  "plugins/erstan-beta/.mcp.json",
  "plugins/erstan-beta/assets/erstan-icon.svg",
  "plugins/erstan-beta/assets/erstan-logo.svg",
  "plugins/erstan-beta/skills/erstan-agent-builder/SKILL.md",
  "plugins/erstan-beta/skills/erstan-agent-builder/agents/openai.yaml",
  "plugins/erstan-beta/skills/erstan-agent-builder/references/lifecycle-and-graph.md",
  "plugins/erstan-beta/skills/erstan-agent-optimizer/SKILL.md",
  "plugins/erstan-beta/skills/erstan-agent-optimizer/agents/openai.yaml",
  "plugins/erstan-beta/skills/erstan-agent-optimizer/references/optimization-protocol.md",
  "plugins/erstan-beta/skills/erstan-agent-review/SKILL.md",
  "plugins/erstan-beta/skills/erstan-agent-review/agents/openai.yaml",
  "plugins/erstan-beta/skills/erstan-agent-review/references/agent-checklist.md",
  "plugins/erstan-beta/skills/erstan-agent-review/references/fix-boundaries.md",
  "plugins/erstan-beta/skills/erstan-agent-review/references/run-checklist.md",
  "plugins/erstan-beta/skills/erstan-run-operator/SKILL.md",
  "plugins/erstan-beta/skills/erstan-run-operator/agents/openai.yaml",
  "plugins/erstan-beta/skills/erstan-run-operator/references/run-lifecycle.md",
  "plugins/erstan-beta/skills/erstan-skill-manager/SKILL.md",
  "plugins/erstan-beta/skills/erstan-skill-manager/agents/openai.yaml",
  "plugins/erstan-beta/skills/erstan-skill-manager/references/package-lifecycle.md",
  "plugins/erstan-beta/skills/erstan-skill-optimizer/SKILL.md",
  "plugins/erstan-beta/skills/erstan-skill-optimizer/agents/openai.yaml",
  "plugins/erstan-beta/skills/erstan-skill-optimizer/references/optimization-protocol.md",
  "plugins/erstan-beta/skills/erstan-work-manager/SKILL.md",
  "plugins/erstan-beta/skills/erstan-work-manager/agents/openai.yaml",
  "plugins/erstan-beta/skills/erstan-work-manager/references/work-tools.md",
  "scripts/check-release.mjs",
  "scripts/sync-from-production.mjs"
]);

const expectedSkills = [
  "erstan-agent-builder",
  "erstan-agent-optimizer",
  "erstan-agent-review",
  "erstan-run-operator",
  "erstan-skill-manager",
  "erstan-skill-optimizer",
  "erstan-work-manager"
];

function fail(message) {
  failures.push(message);
}

function assert(condition, message) {
  if (!condition) fail(message);
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function containsPrivateSurface(value) {
  const normalized = value.toLowerCase();
  for (const fingerprint of privateSurfaceFingerprints) {
    for (let offset = 0; offset <= normalized.length - fingerprint.length; offset += 1) {
      if (sha256(normalized.slice(offset, offset + fingerprint.length)) === fingerprint.digest) {
        return true;
      }
    }
  }
  return false;
}

function relativePath(absolutePath) {
  return path.relative(root, absolutePath).split(path.sep).join("/");
}

async function collectFiles(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (directory === root && entry.name === ".git") continue;
    const absolute = path.join(directory, entry.name);
    const relative = relativePath(absolute);
    const stat = await lstat(absolute);
    if (stat.isSymbolicLink()) {
      fail(`Symlinks are not permitted in a release: ${relative}`);
      continue;
    }
    if (entry.isDirectory()) {
      files.push(...await collectFiles(absolute));
    } else if (entry.isFile()) {
      files.push(relative);
    } else {
      fail(`Unsupported filesystem entry: ${relative}`);
    }
  }
  return files;
}

async function text(relative) {
  return readFile(path.join(root, relative), "utf8");
}

async function json(relative) {
  try {
    return JSON.parse(await text(relative));
  } catch (error) {
    fail(`${relative} is not valid JSON: ${error.message}`);
    return {};
  }
}

function scalar(yaml, key) {
  const match = yaml.match(new RegExp(`^\\s*${key}:\\s*["']([^"']+)["']\\s*$`, "m"));
  return match?.[1];
}

function parseSkillFrontmatter(markdown, relative) {
  const normalized = markdown.replace(/\r\n/g, "\n");
  if (!normalized.startsWith("---\n")) {
    fail(`${relative} must begin with YAML frontmatter`);
    return {};
  }
  const end = normalized.indexOf("\n---\n", 4);
  if (end === -1) {
    fail(`${relative} has unterminated YAML frontmatter`);
    return {};
  }
  const result = {};
  for (const line of normalized.slice(4, end).split("\n")) {
    const match = line.match(/^([a-z_]+):\s*(.+)$/);
    if (!match) {
      fail(`${relative} has unsupported frontmatter syntax: ${line}`);
      continue;
    }
    result[match[1]] = match[2].replace(/^(["'])(.*)\1$/, "$2");
  }
  const keys = Object.keys(result).sort();
  assert(keys.join(",") === "description,name", `${relative} frontmatter must contain only name and description`);
  return result;
}

async function checkMarkdownLinks(markdown, relative) {
  const linkPattern = /\[[^\]]*\]\(([^)]+)\)/g;
  for (const match of markdown.matchAll(linkPattern)) {
    const target = match[1].trim().split(/[?#]/, 1)[0];
    if (!target || /^(?:https?:|mailto:|#)/i.test(match[1].trim())) continue;
    const absolute = path.resolve(root, path.dirname(relative), decodeURIComponent(target));
    assert(absolute.startsWith(`${root}${path.sep}`), `${relative} links outside the repository: ${target}`);
    try {
      const stat = await lstat(absolute);
      assert(stat.isFile(), `${relative} link is not a file: ${target}`);
    } catch {
      fail(`${relative} has a broken relative link: ${target}`);
    }
  }
}

const files = (await collectFiles(root)).sort();
for (const file of files) {
  if (!expectedFiles.has(file)) fail(`File is not on the release allowlist: ${file}`);
}
for (const file of expectedFiles) {
  if (!files.includes(file)) fail(`Allowlisted file is missing: ${file}`);
}

assert(!files.some((file) => file.endsWith("/.app.json") || file === ".app.json"), ".app.json requires a real registered OpenAI app ID and must not ship yet");

const packageJson = await json("package.json");
const codexManifest = await json("plugins/erstan-beta/.codex-plugin/plugin.json");
const claudeManifest = await json("plugins/erstan-beta/.claude-plugin/plugin.json");
const codexMarketplace = await json(".agents/plugins/marketplace.json");
const claudeMarketplace = await json(".claude-plugin/marketplace.json");
const mcp = await json("plugins/erstan-beta/.mcp.json");

assert(packageJson.private === true, "package.json must remain private to prevent accidental npm publication");
assert(packageJson.name === "erstan-agent-tools-beta", "package.json name must identify the beta distribution");
assert(versionPattern.test(packageJson.version ?? ""), "package.json must use a semantic prerelease version");
assert(packageJson.scripts?.["sync:production"] === "node scripts/sync-from-production.mjs", "package.json must expose the production sync command");
if (process.env.RELEASE_TAG) {
  assert(
    process.env.RELEASE_TAG === `v${packageJson.version}`,
    `Release tag ${process.env.RELEASE_TAG} must exactly match package version v${packageJson.version}`,
  );
}
assert(codexManifest.name === pluginName, `Codex plugin name must be ${pluginName}`);
assert(claudeManifest.name === pluginName, `Claude plugin name must be ${pluginName}`);
assert(codexManifest.version === packageJson.version, "Codex plugin version must match package.json");
assert(claudeManifest.version === packageJson.version, "Claude plugin version must match package.json");
assert(codexManifest.license === "Apache-2.0", "Codex plugin license must be Apache-2.0");
assert(claudeManifest.license === "Apache-2.0", "Claude plugin license must be Apache-2.0");
assert(codexManifest.mcpServers === "./.mcp.json", "Codex plugin must reference its local .mcp.json");
assert(claudeManifest.mcpServers === "./.mcp.json", "Claude plugin must reference its local .mcp.json");
assert(codexManifest.repository === repositoryUrl, "Codex plugin repository must point to the beta repository");
assert(claudeManifest.repository === repositoryUrl, "Claude plugin repository must point to the beta repository");
assert(!Object.hasOwn(codexManifest, "apps"), "Codex plugin must not declare apps before a real OpenAI app is registered");
assert(codexManifest.author?.url === websiteUrl, "Codex plugin author URL must use the direct HTTPS Erstan site");
assert(claudeManifest.author?.url === websiteUrl, "Claude plugin author URL must use the direct HTTPS Erstan site");
assert(codexManifest.interface?.websiteURL === websiteUrl, "Codex plugin website URL must use the direct HTTPS Erstan site");
assert(codexManifest.interface?.privacyPolicyURL === privacyPolicyUrl, "Codex plugin privacy URL must use the direct HTTPS Erstan site");
assert(codexManifest.interface?.termsOfServiceURL === termsOfServiceUrl, "Codex plugin terms URL must use the direct HTTPS Erstan site");

const codexEntries = codexMarketplace.plugins ?? [];
assert(codexMarketplace.name === pluginName, `Codex marketplace name must be ${pluginName}`);
assert(codexMarketplace.interface?.displayName === "Erstan Beta", "Codex marketplace display name must be Erstan Beta");
assert(codexEntries.length === 1 && codexEntries[0]?.name === pluginName, "Codex marketplace must contain exactly the Erstan Beta plugin");
assert(codexEntries[0]?.source?.source === "local" && codexEntries[0]?.source?.path === "./plugins/erstan-beta", "Codex marketplace source must be ./plugins/erstan-beta");

const claudeEntries = claudeMarketplace.plugins ?? [];
assert(claudeMarketplace.name === pluginName, `Claude marketplace name must be ${pluginName}`);
assert(claudeMarketplace.owner?.url === websiteUrl, "Claude marketplace owner URL must use the direct HTTPS Erstan site");
assert(claudeEntries.length === 1 && claudeEntries[0]?.name === pluginName, "Claude marketplace must contain exactly the Erstan Beta plugin");
assert(claudeEntries[0]?.source === "./plugins/erstan-beta", "Claude marketplace source must be ./plugins/erstan-beta");
assert(claudeEntries[0]?.version === packageJson.version, "Claude marketplace version must match package.json");

const mcpRootKeys = Object.keys(mcp).sort();
const server = mcp.mcpServers?.[pluginName];
assert(mcpRootKeys.join(",") === "mcpServers", ".mcp.json may contain only mcpServers at its root");
assert(Object.keys(mcp.mcpServers ?? {}).join(",") === pluginName, ".mcp.json must define only the Erstan Beta server");
assert(server?.type === "http", "Erstan MCP transport type must be http");
assert(server?.url === mcpUrl, `Erstan MCP URL must be ${mcpUrl}`);
assert(Object.keys(server ?? {}).sort().join(",") === "type,url", "Erstan MCP config may contain only type and url; OAuth belongs to the host");
const serializedMcp = JSON.stringify(mcp).toLowerCase();
for (const forbidden of ["authorization", "bearer", "header", "apikey", "api_key", "token", "userconfig", "env"]) {
  assert(!serializedMcp.includes(forbidden), `.mcp.json must not contain static authentication field or text: ${forbidden}`);
}

const prompts = codexManifest.interface?.defaultPrompt;
assert(Array.isArray(prompts) && prompts.length > 0 && prompts.length <= 3, "Codex plugin must provide one to three starter prompts");
for (const prompt of Array.isArray(prompts) ? prompts : []) {
  assert(typeof prompt === "string" && prompt.length <= 128, "Each Codex starter prompt must be a string of at most 128 characters");
}

for (const skillName of expectedSkills) {
  const skillPath = `plugins/erstan-beta/skills/${skillName}/SKILL.md`;
  const yamlPath = `plugins/erstan-beta/skills/${skillName}/agents/openai.yaml`;
  const markdown = await text(skillPath);
  const metadata = parseSkillFrontmatter(markdown, skillPath);
  assert(metadata.name === skillName, `${skillPath} name must match its directory`);
  assert((metadata.description ?? "").length >= 80, `${skillPath} needs a specific trigger description`);
  await checkMarkdownLinks(markdown, skillPath);

  const yaml = await text(yamlPath);
  const displayName = scalar(yaml, "display_name");
  const shortDescription = scalar(yaml, "short_description");
  const defaultPrompt = scalar(yaml, "default_prompt");
  assert(Boolean(displayName), `${yamlPath} requires a quoted display_name`);
  assert((shortDescription?.length ?? 0) >= 25 && (shortDescription?.length ?? 0) <= 64, `${yamlPath} short_description must contain 25-64 characters`);
  assert(defaultPrompt?.includes(`$${skillName}`), `${yamlPath} default_prompt must mention $${skillName}`);
  assert(yaml.includes('type: "mcp"') && yaml.includes(`value: "${pluginName}"`), `${yamlPath} must depend on the Erstan Beta MCP server`);
  assert(yaml.includes(`url: "${mcpUrl}"`), `${yamlPath} must use the QA MCP URL`);
  assert(yaml.includes("allow_implicit_invocation: true"), `${yamlPath} must explicitly allow implicit invocation`);
}

for (const asset of ["plugins/erstan-beta/assets/erstan-icon.svg", "plugins/erstan-beta/assets/erstan-logo.svg"]) {
  const svg = await text(asset);
  assert(/<svg\b/i.test(svg) && /viewBox="[^"]+"/i.test(svg), `${asset} must be an SVG with a viewBox`);
  assert(!/<script\b|\bon\w+\s*=|\bhref\s*=\s*["']https?:/i.test(svg), `${asset} must not contain scripts, event handlers, or external references`);
}

const textualFiles = files.filter((file) => !file.startsWith(".git/") && !file.endsWith("LICENSE"));
for (const file of textualFiles) {
  const contents = await text(file);
  const unfinishedWords = [
    ["TO", "DO"].join(""),
    ["FIX", "ME"].join(""),
    ["CHANGE", "ME"].join(""),
    ["REPLACE", "_ME"].join("")
  ].join("|");
  const secretPatterns = [
    [/ers_(?:live|test)_[A-Za-z0-9_-]{8,}/i, "Erstan API key"],
    [/authorization\s*:\s*bearer\s+\S+/i, "bearer authorization"],
    [/eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/, "JWT"],
    [/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/, "private key"],
    [new RegExp(`\\b(?:${unfinishedWords})\\b`), "unfinished marker"]
  ];
  for (const [pattern, label] of secretPatterns) {
    assert(!pattern.test(contents), `${file} contains a forbidden ${label}`);
  }
  assert(!contents.includes(productionMcpUrl), `${file} points at the production MCP endpoint`);
  assert(!containsPrivateSurface(contents), `${file} exposes a private diagnostic surface`);
}

if (failures.length > 0) {
  console.error("Release verification failed:\n");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log(`Release verification passed: ${files.length} allowlisted files, ${expectedSkills.length} skills, version ${packageJson.version}.`);
}
