# Agent lifecycle and graph rules

Use this reference as a guardrail, then retrieve the live contract from Erstan.

## Lifecycle

- `create_agent` creates a draft; it does not test, publish, or run it.
- `get_agent` is the source of the complete current graph, version, published
  state, and opaque revision.
- `update_agent` replaces only the supplied editable fields and requires the
  latest revision. Submit complete `nodes` and `edges` when changing the graph.
- `validate_agent` is non-mutating but requires authoring scopes.
- `test_agent` runs the current draft with real integrations and normal
  approval rules.
- `publish_agent` revalidates and publishes the exact guarded revision.
- `run_agent` operates a published snapshot and is not a draft-test substitute.

After an Agent has been published, externally editable metadata may be more
restricted than graph fields. Follow the live guide and use the Erstan UI when
it identifies an app-only change.

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
