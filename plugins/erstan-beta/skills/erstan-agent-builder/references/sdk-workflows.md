# Optional JavaScript SDK and private repositories

Use this reference only when the user asks to work through JavaScript or keep
Agents, Skills, and prompts in their own repository. The hosted-MCP plugin and
`@erstan/sdk` are separate clients of Erstan; neither installs nor updates the
other. The SDK is JavaScript ESM for Node.js 22+, with TypeScript declarations.
Follow the SDK's reviewed release instructions; do not assume an npm release
exists or copy maintainer tools into this plugin.

## A small, optional starting point

The SDK repository provides `examples/run-agent`, `examples/human-review`,
`examples/skill-package-roundtrip`, and `examples/agents-in-git`. Prefer the
smallest relevant sample. No repository layout, manifest, test runner, CI
pipeline, GitHub integration, or deployment framework is required. Erstan does
not need access to the user's private repository.

Keep Agent definitions and complete Skill packages as ordinary files. Prompts
can be text files that the user's code loads into Agent instructions or Skill
packages; do not invent a separate hosted Prompt API. Preserve related Skill
files, actions, and extension metadata. Review exports before committing them;
credentials, sensitive traces, and customer data do not belong in Git.

Use one SDK package for QA and production. Configure `ErstanClient` with the
explicit intended `apiBase` origin (no `/v1` suffix) and the corresponding
credential through trusted application configuration. Check `client.context.get()`
for the expected workspace, permissions, and capabilities before authoring.
Do not fall back from QA to production, reuse the wrong environment's credentials,
or treat two Git branches sharing one remote draft as isolated environments.
The installed plugin continues to use host-managed OAuth; SDK credentials must
not be added to plugin manifests or MCP configuration.

## SDK/REST authoring boundaries

- Staged authoring requires `capabilities.stagedAuthoring` and a compatible
  `authoringContract`; the SDK checks the supported contract before authoring.
  Guarded previews and draft Skill overrides have additional capability checks.
  A missing capability is not permission to retry through a legacy write path.
- Exported content and its workspace/resource identity and revision stay
  together. Explicit history reads are read-only, not guards for current writes.
  On a revision conflict, re-read and reconcile; never paste a fresh revision
  onto stale local edits. Retain returned content and its revision together.
- SDK authoring mutations require an explicit `idempotencyKey`; update, publish,
  and preview also require the revision paired with the intended content.
  Reuse a key only for identical intent. An unknown outcome or expired response
  receipt requires inspection and reconciliation, not a blind new-key write.
  These are SDK/REST rules, not extra arguments for arbitrary MCP tools.
- Saving stages content; validation does not save, execute, or publish it.
  Preview runs the saved remote draft with real tools, possible costs/effects,
  and normal approvals. Unsaved local edits do not participate. Tests are
  optional samples, not automatic on import or a required publication gate.
- Publish only the exact approved version. Publish required Skills separately
  before the Agent; no operation implicitly publishes dependencies, and multiple
  resources do not form an atomic deployment. Shared Skill publication affects
  future consumers; admitted snapshot-backed runs keep their selections.

For MCP work, use the live builder guide and tool schemas instead. In particular,
MCP Skill updates/publication use `expectedVersion`, while Agent writes use
`revision`. Do not infer REST-only history endpoints, idempotency receipts, or
SDK cancellation methods are available as MCP tools.
