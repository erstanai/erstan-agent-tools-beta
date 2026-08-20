---
name: erstan-agent-builder
description: "Create, revise, validate, test, and publish Erstan Agent graphs through the hosted Erstan MCP server. Use when a user asks to build an Agent, change its nodes or tools, repair a draft, configure triggers or Skills, preview a draft, or publish an explicitly approved revision."
---

# Erstan Agent builder

Build against the live Erstan authoring contract. Treat creation, update,
testing, and publication as separate lifecycle actions.

## Reference

Read [lifecycle and graph rules](references/lifecycle-and-graph.md) before
creating or changing a graph. The live guide, node catalog, and tool schemas
remain authoritative when that reference differs.

## Workflow

1. Establish the intended Agent behavior, owner team, inputs, outputs, tool and
   Skill needs, and whether the request authorizes only a proposal, a saved
   draft, a live preview, or publication.
2. Call `get_agent_builder_guide`, then `get_agent_node_catalog` with the detail
   needed for every proposed node. Call `list_agent_tools` and
   `list_agent_skills` before choosing bindings. Never invent a node field,
   action type, tool, Skill ID, connection ID, or policy value.
3. For an existing Agent, call `get_agent` and retain its complete graph,
   `currentVersion`, published state, and opaque `revision`. Preserve unrelated
   metadata, nodes, edges, positions, and bindings.
4. Assemble the complete candidate graph. Use canonical node types and an
   explicit top-level `data.toolPolicy` on every tool-capable AI node. Pin every
   capability required for deterministic or write-capable work.
5. Run `validate_agent` against the candidate or saved draft before a write
   when the live schema supports that path. Resolve errors within the requested
   scope. Report unrelated pre-existing errors instead of silently expanding
   the change.
6. Use `create_agent` for a new draft or `update_agent` with the latest
   `revision` for an existing draft. Re-read or use the returned revision after
   every successful mutation.
7. Validate the persisted draft. Treat `valid: false` as a failed validation
   even when the MCP call itself succeeded.
8. Call `test_agent` only when the user explicitly authorizes a live preview.
   Preview uses real tools and may create external effects.
9. Call `publish_agent` only after an explicit publication request, successful
   validation, and a final check that the exact current revision is intended.
   Never describe a draft as published unless the tool confirms publication.

## Concurrency and approvals

- Send a stable `idempotencyKey` with `create_agent`, `update_agent`, and
  `publish_agent`. After a timeout or lost response, reuse that key only with
  byte-for-byte equivalent intent and arguments. Never reuse it for a changed
  graph, revision, version, or publication decision.
- Re-read before choosing a new key after an ambiguous mutation. Do not use an
  idempotency key to bypass a revision or version conflict.
- On a revision or version conflict, re-read once and reapply only the requested
  change when concurrent edits do not overlap. Stop when they affect the same
  behavior or a second conflict occurs.
- Never add automatic write approval. Use `require_approval` or `deny` where
  the live catalog permits a write policy.
- Do not publish, run a draft test, or widen access merely because the tools are
  available. Tool availability is not user authorization.
- Return the Agent ID, lifecycle state, current version, builder URL when
  present, validation outcome, and any action still requiring human approval.
