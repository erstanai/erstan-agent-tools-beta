# Contributor guidance

This is a public, allowlisted beta distribution repository. Keep it small and safe.

- Never add credentials, customer data, production traces, private diagnostics,
  local environment files, or generated caches.
- Keep the Codex and Claude plugin names and versions aligned with the package
  version and both marketplace entries.
- Keep the hosted MCP URL exactly `https://api-qa.erstan.com/v1/mcp` unless an
  intentional release changes it everywhere.
- Keep the plugin and marketplace identity exactly `erstan-beta` so it can be
  installed beside the production `erstan` plugin without a name collision.
- Do not submit this temporary repository to a public plugin directory. Beta
  access is enforced by Erstan OAuth and server-side access policy.
- Do not add static authentication headers, key fields, or token environment
  variables. Authentication is OAuth through the host.
- Do not add `.app.json` without a real registered OpenAI app identifier and a
  deliberate publication review.
- Put maintainer CLI tools and offline diagnostics in the separate toolkit,
  never in this plugin. Repository-owned distribution sync automation may stay
  here, but user-facing optimization belongs in hosted-MCP Skills rather than
  npm CLI commands.
- Run `npm run verify`, the Codex plugin validator, all seven skill validators,
  and `claude plugin validate .` before release.
