# Skill package and lifecycle rules

## Package shape

- `SKILL.md` is required and remains the entry path.
- Preserve every related text file by safe relative path.
- A package may declare sandbox actions with a key, title, runtime, entry path,
  language, side-effect classification, and timeout.
- Action entry points must name files present in the complete package.
- Reject absolute paths, traversal, reserved paths, and case-insensitive
  collisions.
- Treat path rewriting, file or action removal, collision collapse, and
  runtime, language, or side-effect coercion as validation failures even when
  the server returns a normalized package. Compare returned `packageJson` with
  the submitted package before saving.

`sideEffects: "none"` and `sideEffects: "external"` are security-relevant
declarations. They describe an action but never grant it permission.

## Lifecycle

- Read `get_agent_builder_guide` and current tool schemas before a write.
  `lifecycle.skillSavesAreDrafts: true` confirms the staged-save contract.
  An SDK installation, plugin version, or public REST feature flag does not
  establish the connected MCP server's lifecycle behavior.
- `validate_agent_skill` validates and normalizes without saving.
- `create_agent_skill` creates a workspace draft.
- `get_agent_skill` returns a workspace Skill's complete current package and
  `currentVersion`, plus `publishedVersion` and `hasDraft` when supported.
  The current package can be newer than the published package. It does not
  accept `system:<key>` refs.
- With staged saves confirmed, `update_agent_skill` replaces the complete
  draft package using the `expectedVersion` paired with the edited content.
  It retains the prior published package and availability. Omit `status`
  unless the user separately authorizes an availability change; setting it
  to draft is not how staging works. Preserve returned content and its guard
  together for the next operation.
- `publish_agent_skill` revalidates and promotes the exact approved current
  version using its `expectedVersion`. Do not automatically replace a stale
  guard: re-read, compare, and obtain approval for changed publication content.
- Publish required Skills explicitly before publishing the Agent; Agent
  publication never publishes dependencies for you. Shared Skill publication
  affects future consumers. Snapshot-backed admitted runs and their
  continuations retain the selected immutable packages; legacy runs without
  snapshot evidence cannot be assumed to have that guarantee.

If the staged-save flag is absent or false, do not assume a published Skill
can be edited privately. A confirmed legacy server may update live content
immediately: require explicit authorization for that live change. If the
behavior is unknown, or only a staged draft was authorized, stop at validation
and report the capability gap. Do not clone, change status, or publish as a
workaround. A missing capability does not itself authorize any fallback write.

Skill reads use **View agents**. Validation, creation, and update use **Build
agents**. Publication uses **Publish agents**. Present these exact permission
groups from **Settings > Connected apps** rather than legacy scope names.

The MCP Skill create, update, and publish schemas do not expose an
`idempotencyKey`; do not copy SDK/REST write options into these tools. After
an ambiguous creation, search workspace Skills and compare `packageName` and
the complete package. Catalog absence is inconclusive because it may omit
drafts. After an ambiguous update or publication, re-read and reconcile the
package and lifecycle state. Never retry an uncertain write blindly.
