# Publishing Erstan Agent Tools Beta

This temporary repository packages public beta integration metadata and agent
instructions. It does not deploy the hosted MCP service and must not be
submitted to external plugin directories. Distribute its repository install
instructions directly to approved beta users.

## Release checklist

1. Run the manual **Sync production distribution** workflow for the reviewed
   production ref and inspect its pull request. The workflow applies the beta
   identity and QA endpoint transform; it never merges or publishes.
2. Confirm `https://api-qa.erstan.com/v1/mcp` is beta-ready and exposes the
   OAuth discovery and authorization behavior required by each target host.
3. Confirm tool annotations, input and output schemas, error behavior, and
   approval boundaries match the public Skills.
4. Confirm the sync selected the same prerelease version in `package.json`, both
   plugin manifests, and the Claude marketplace entry. The release checker
   enforces alignment.
5. Run `npm run verify` and all native validators documented in the README.
6. Review the exact Git archive. The release checker rejects files outside the
   allowlist and any symlink in the distribution.
7. Merge the reviewed commit to `main`, then push a `v<package-version>` tag on
   that exact commit. The release workflow verifies the tag and creates the
   GitHub release and archives automatically.
8. Test a fresh Codex install and a fresh Claude Code install with an approved
   beta user,
   OAuth grant, narrow permissions, approval, denial, revocation, and expiry.

## Automated GitHub release

The tag must exactly match the version shared by `package.json`, both plugin
manifests, and the Claude marketplace entry. For example, version
`0.2.0-beta.1` must be released as `v0.2.0-beta.1`:

```text
git tag v0.2.0-beta.1
git push origin v0.2.0-beta.1
```

`.github/workflows/release.yml` then runs the distribution verifier, creates
ZIP and TAR.GZ archives from the tagged Git tree, writes SHA-256 checksums, and
creates the GitHub release with generated notes. A mismatched version tag fails
before any release is published. Re-running the workflow replaces the assets
on an existing release instead of creating a duplicate.

## OpenAI / ChatGPT boundary

Do not submit this beta plugin to the universal directory. If a separately
registered beta connection is required for developer testing, keep its review,
access, and retirement plan separate from the production listing.

There is deliberately no `.app.json` in this repository. A local OpenAI app
mapping is valid only after OpenAI assigns the actual technical identifier,
whose value begins with `plugin_asdk_app` or `asdk_app_`. If developer-mode
mapping is later required, copy that exact registered identifier, add it in a
reviewed release, and validate the installable bundle. Never publish a guessed,
example, or substitute identifier.

## Claude handoff

The root marketplace is `.claude-plugin/marketplace.json`, and its Erstan Beta
entry must continue to use the relative source `./plugins/erstan-beta`. The plugin's
`.mcp.json` points directly to the hosted URL. Users initiate OAuth with `/mcp`;
do not add `userConfig`, headers, bearer-key prompts, or token variables.

Before a direct beta release, run:

```text
claude plugin validate .
```

Do not submit this repository to the Anthropic directory. Record direct beta
distribution checks in the release issue rather than adding user or reviewer
secrets here.

## Codex handoff

The repository marketplace is `.agents/plugins/marketplace.json`. Validate
`plugins/erstan-beta` with the Codex plugin validator, install from the released
repository in a clean profile, and confirm that the host presents OAuth rather
than requesting a static key.

## External readiness owned outside this repository

- QA OAuth discovery, consent, token expiry, refresh, and revocation.
- Stable tool schemas, safe annotations, idempotency behavior, and durable run
  reconciliation.
- **Settings > Connected apps** UI for profiles, permissions, allowlists,
  approvals, active
  sessions, audit visibility, and revoke controls.
- Direct-distribution instructions, retirement communication, privacy and
  terms review, and support operations.
