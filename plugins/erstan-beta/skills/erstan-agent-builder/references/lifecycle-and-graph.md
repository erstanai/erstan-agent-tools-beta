# Agent lifecycle and graph rules

Use this reference as a guardrail, then retrieve the live contract from Erstan.

## Lifecycle

- `create_agent` creates a draft; it does not test, publish, or run it.
- `get_agent` is the source of the complete current graph, version, published
  state, and opaque revision.
- `update_agent` replaces only the supplied editable fields and requires the
  revision paired with the edited baseline. Submit complete `nodes` and `edges`
  when changing the graph. Retain returned content and its revision together;
  revisions from historical version reads are not current write guards.
- `validate_agent` is non-mutating but requires authoring scopes.
- `test_agent` runs the current draft with real integrations and normal
  approval rules.
- `publish_agent` revalidates and publishes the exact approved guarded revision.
  It does not automatically publish bound Skills; publish required Skills
  separately only with explicit approval. Validation, preview, and publication
  are independent operations, not an imposed testing or deployment workflow.
- `run_agent` operates a published snapshot and is not a draft-test substitute.

When `get_agent_builder_guide` advertises
`lifecycle.agentPresentationVersioned: true`, edits to name, description,
category, tags, difficulty, and estimated time stage with the graph and promote
together on publication. `behaviorType` remains immutable after first
publication. If the capability is absent or false, follow the live metadata
restrictions rather than assuming staged presentation. Use the Erstan UI for
app-only operations such as archive/delete; do not invent MCP tools.

## Guarded draft previews

Inspect the live `test_agent` schema before preparing the request:

- `version` is the current draft version guard. Send the revision paired with
  that content when the schema advertises `revision`.
- Only when the user explicitly selects Skill versions and the schema supports
  both fields, send top-level `skillVersions: [{ skillId, version }]` together
  with the required Agent `revision`. Never put these controls inside `input`.
- Each selected Skill requires edit access and must be allowed by the Agent's
  existing Skill policy. Unselected Skills and child Agents use published
  content; do not implicitly substitute their drafts or widen policy.
- If the requested exact preview is unsupported, report the capability gap.
  Do not silently omit the selections, publish dependencies, or fall back to a
  published run to make the request succeed.
- Use a stable `idempotencyKey` for the identical preview intent when supported.
  It deduplicates that test independently of published runs. Unknown effects
  still require reconciliation, not a fresh-key launch.

Preview is a real hosted run with costs, tool effects, and normal approval
rules, not execution of unsaved local files. Poll the returned run handle. A
guarded preview seals its selected graph; later edits or publication may fork
and advance the version. Check for drift before the next write and retain the
returned content and guard together. A successful preview neither publishes
content nor authorizes publication.

## Graph construction

- Use `get_agent_node_catalog` for node types, fields, required values, enums,
  aliases, triggers, action types, and limits.
- Use unique, non-empty node and edge IDs. Every edge must reference submitted
  nodes, and every graph needs a supported start node.
- Externally supported starts include chat, input form, schedule, and webhook.
  Do not substitute app-only event triggers.
- Keep `node.type` and `data.nodeType`, when present, consistent.
- Use `data.skillIds` with IDs returned by `list_agent_skills`.

## Tool policy

- Use `none` when a node must have no tools.
- Use `pinned_only` for deterministic, production, accounting, ERP, or
  write-capable work.
- Use `auto_discover` only on node types that advertise it and only for
  exploratory, low-risk assistance. Required tools must still be pinned.
- Use the exact binding returned by `list_agent_tools`, including source and
  connection identity. Do not pin runtime meta-tools or hidden/internal tools.
- Never introduce automatic approval or an `allow` write policy through
  external authoring. Preserve an existing server-managed exception only when
  the live guide explicitly permits an identical binding.

## Conflict handling

When a guarded mutation conflicts:

1. Re-read the Agent.
2. Compare the new graph with the intended change.
3. Preserve unrelated concurrent edits and retry once only if the changes do
   not overlap.
4. Stop and request a decision for overlapping edits or another conflict.
