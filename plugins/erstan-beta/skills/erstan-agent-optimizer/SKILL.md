---
name: erstan-agent-optimizer
description: "Retrieve and optimize an existing Erstan Agent from its current graph and version-correlated run evidence. Use when a user asks to improve Agent reliability, efficiency, tool or Skill routing, context use, orchestration, or write safety. Do not use for ordinary Agent creation or a narrowly specified edit that does not require evidence-based optimization."
---

# Erstan Agent optimizer

Produce the smallest evidence-backed Agent candidate that improves measured
behavior without hiding Skill, connector, or platform defects inside prompt
text. Optimization is proposal-only unless the user separately authorizes a
saved update, live preview, or publication.

## Required protocol

Read [the Agent optimization protocol](references/optimization-protocol.md)
before proposing a candidate or changing an Agent.

## Workflow

1. Establish the requested stage: analysis, local candidate, saved update,
   live preview, or publication. Treat each later stage as separate authority.
2. Call `get_agent_builder_guide`, the relevant detailed
   `get_agent_node_catalog` entries, `list_agent_tools`, and
   `list_agent_skills`. Retrieve the complete current Agent with `get_agent`
   and record its ID, current/published versions, opaque revision, graph,
   policies, bindings, and unknown fields.
3. Correlate diagnostic evidence by Agent ID and executed version. Use
   `get_run` plus every `get_run_trace` page when accessible. When the user
   supplies an authorized local diagnostics export, inspect its manifest,
   traces, transcript, and artifact availability without copying sensitive
   payloads into the report. A different or absent version supports a drift
   finding, not a claim about the current graph.
4. Retrieve every bound workspace Skill with `get_agent_skill` when readable.
   Record `system:<key>` or inaccessible Skill packages as evidence gaps.
   Inspecting a Skill does not authorize changing it.
5. Classify every finding as Agent, Skill, platform, connector/provider, or a
   split boundary. Change the Agent only for graph topology, node roles,
   instructions, policies, bindings, approval design, and orchestration it
   owns.
6. Assemble a complete candidate graph and a structured baseline-to-candidate
   diff. Tie each changed field to direct evidence and an expected observable
   outcome. Preserve unrelated metadata, positions, nodes, edges, opaque
   fields, approval controls, stable identities, and safe retry behavior.
7. Call `validate_agent` against the candidate when the connected app permits
   non-mutating validation. Stop at a candidate and validation report unless
   the user explicitly asked for a saved update.
8. For an authorized update, re-read the Agent, reconcile version drift, and
   call `update_agent` with the latest revision and a new stable idempotency
   key. Do not test the draft or publish it under the update authorization.
9. Call `test_agent` only after explicit live-preview authorization. Real
   integrations and side effects remain possible. For writes, independently
   reconcile effects by stable business identity.
10. Call `publish_agent` only after explicit publication approval for the exact
    validated revision. Report the retained published version after a re-read.

## Optimization constraints

- Do not reduce tool calls, prompt size, or elapsed time by weakening business
  validation, approvals, idempotency, reconciliation, or completion evidence.
- Do not claim token or cost improvement unless exact comparable usage was
  persisted. Label it unavailable otherwise.
- Do not fix reusable domain procedure in a one-off Agent instruction or teach
  Agents to work around a platform persistence, compaction, or routing defect.
- Treat completed write tool results as trace completion, not proof that every
  external record is correct.
- An unchanged graph is a baseline, not an optimized candidate.

## Deliverable

Lead with whether a safe optimization is supported. Provide version
correlation, findings by owner/severity, the complete proposed graph or exact
changed fields, a structured diff, validation results, expected measurements,
representative evaluation cases, and every action still requiring approval.
