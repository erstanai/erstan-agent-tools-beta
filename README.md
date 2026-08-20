# Erstan Agent Tools Beta

Temporary Erstan Beta integration for AI coding agents. This repository
packages one broad plugin that connects beta users to Erstan's isolated QA
environment and supplies focused instructions for building and reviewing
Agents, operating runs, managing Skills, and working with authorized workspace
content.

> **Beta environment:** Data and OAuth grants in this plugin are separate from
> production. Install the production `erstan` plugin when your workspace is
> migrated. This repository will then be retired.

The plugin contains no Erstan API key. Each user signs in to
`https://api-qa.erstan.com/v1/mcp` with OAuth through their AI host. Erstan's
server-side beta access policy remains the access boundary; repository
visibility does not grant product access.

## What is included

- `erstan-agent-builder` — create, revise, validate, test, and publish Agent
  graphs.
- `erstan-agent-review` — review Agent definitions and diagnose runs from
  durable evidence.
- `erstan-run-operator` — launch published Agents and safely handle waits,
  approvals, and traces.
- `erstan-skill-manager` — manage complete, versioned Erstan Skill packages.
- `erstan-work-manager` — work with authorized tasks, projects, documents,
  folders, and files.

## Permission model

Erstan is the source of truth for what the connection may access. Users manage
connected apps, workspace scope, allowed tool families, project or team
allowlists, and Erstan-side approval policy in **Settings > Connected apps**.

Initial authorization defaults to the recommended **Build** profile. It includes
**View agents**, **Build agents**, **Run agents**, **Publish agents**, and
the read-only **View runs**, **View work**, **View documents**, and **View
files** permissions. It does not permit task, document, or file writes. Use
**Review** for read-only access. For writes, use **Custom** with the applicable
**Manage work**, **Edit documents**, or **Edit files** permission, or choose
**Full access**.

Users manage and revoke the connection in **Settings > Connected apps**.
Reducing access takes effect directly. Increasing permissions or changing to a
broader profile requires explicit OAuth reauthorization so a background agent
cannot expand its own grant.

Claude, Codex, ChatGPT, or another MCP host owns the local connection session
and its own confirmation controls. A host may narrow access or require an extra
confirmation, but it cannot grant permissions that Erstan denied. Revoking the
connection in Erstan invalidates it for every host session that uses it.

This two-layer model keeps permissions understandable:

1. Erstan decides the maximum authorized data and actions.
2. The AI host decides whether to invoke an action within that boundary.

## Install in Codex

`erstan-beta@erstan-beta` means `plugin-name@marketplace-name`; it is not an
account ID or secret.

```text
codex plugin marketplace add erstanai/erstan-agent-tools-beta
codex plugin add erstan-beta@erstan-beta
```

Open a new Codex session, use `/plugins` to confirm the installation, connect
the `erstan-beta` MCP server when prompted, and complete browser sign-in. The
plugin uses the remote server configuration in
`plugins/erstan-beta/.mcp.json`.

## Install in Claude Code

```text
claude plugin marketplace add erstanai/erstan-agent-tools-beta
claude plugin install erstan-beta@erstan-beta
```

Run `/reload-plugins`, then `/mcp` to connect `erstan-beta` and complete OAuth.
Claude Code initiates the remote MCP authorization; the plugin does not ask the
user to paste a bearer token or API key.

## Install in Claude Cowork / Desktop

Open **Customize > Plugins > Browse plugins**, select **Add marketplace**, and
enter:

```text
https://github.com/erstanai/erstan-agent-tools-beta
```

Install **Erstan Beta** and complete browser sign-in when prompted. Plugins are
available in Claude Cowork and Claude Code, not the standard Claude Chat
surface.

## Update or remove

Use the host's plugin browser to update, disable, or uninstall Erstan Beta.
Removing the local plugin does not revoke an existing Erstan OAuth grant.
Review or revoke grants in **Settings > Connected apps** in Erstan.

Published versions and checksums are available from [GitHub
Releases](https://github.com/erstanai/erstan-agent-tools-beta/releases).

## ChatGPT and other hosts

This temporary beta repository is not submitted to the universal ChatGPT and
Codex plugin directory. It intentionally does not contain `.app.json`: an
OpenAI app mapping must use a real registered `plugin_asdk_app...` or
`asdk_app_...` identifier assigned during publication. See
[Publishing](docs/PUBLISHING.md) for the distribution boundary.

Other MCP clients can connect directly to:

```text
https://api-qa.erstan.com/v1/mcp
```

The deployed server must expose standards-compliant OAuth discovery and
authorization. There is no static-key fallback in this distribution.

## Verify locally

Requirements: Node.js 20 or later, Python 3, and optionally Claude Code for its
native validator.

```text
npm run verify
python C:/Users/<you>/.codex/skills/.system/plugin-creator/scripts/validate_plugin.py plugins/erstan-beta
python C:/Users/<you>/.codex/skills/.system/skill-creator/scripts/quick_validate.py plugins/erstan-beta/skills/erstan-agent-builder
claude plugin validate .
```

Run the skill validator once for each directory under
`plugins/erstan-beta/skills`. CI runs the repository-owned release verifier; the
native Codex, Skill, and Claude validators remain required release gates because
their availability and schemas are owned by their respective hosts.

## Toolkit separation

This repository is the small, installable end-user distribution. Maintainer
CLI utilities and offline diagnostic fixtures belong in the separate
`erstan-agent-toolkit` repository and must not be copied into a plugin release.

## License

Apache License 2.0. See [LICENSE](LICENSE).
