---
name: erstan-agent-review
description: "Review Erstan Agent definitions, Skill bindings, tools, runs, traces, and persisted outputs to diagnose failures and recommend bounded fixes. Use when an Agent behaves incorrectly, stalls, repeats work, loses context, misuses a tool, or differs between live streaming and reload."
---

# Erstan Agent review

## Objective

Reconstruct what the Agent was configured to do, what the runtime actually did,
and where the observed behavior diverged. Base every finding on an Agent
definition, run record, trace event, persisted conversation item, tool result,
or reproducible request.

## Resources

- Read the [Agent checklist](references/agent-checklist.md) when reviewing the
  graph, model, instructions, Skill policy, tool policy, or write boundary.
- Read the [run checklist](references/run-checklist.md) when diagnosing a run,
  trace, stream, persisted output, approval, retry, or tool effect.
- Read [fix boundaries](references/fix-boundaries.md) before assigning a remedy
  to the Agent, Skill, platform, or connector.

## Workflow

1. Establish the requested scope: review, diagnosis, proposed change, or an
   authorized implementation.
2. Capture stable identifiers for the workspace, Agent, version, run, thread,
   and relevant tool calls without copying credentials into reports.
3. Read `get_agent_builder_guide` and the relevant detailed fields from
   `get_agent_node_catalog`, then inspect the Agent with `get_agent`,
   `list_agent_tools`, and `list_agent_skills`. Call `get_agent_skill` only for
   a workspace Skill ID. Never pass a `system:<key>` ref: system Skill packages
   are not readable through that tool. Record that evidence limitation instead
   of treating it as a missing workspace Skill. Do not infer current schemas
   from screenshots.
4. Run `validate_agent` when the connected app has **Build agents**, then apply
   the Agent checklist. Validation is non-mutating, but its current permission
   group is **Build agents**, which includes the required **View agents**
   dependency. Users manage that access in **Settings > Connected apps**.
5. For a run issue, read `get_run` and page `get_run_trace` to the latest
   terminal event, then apply the run checklist. Run evidence may be restricted
   to the exact credential or connection that launched it. A `run_not_found`
   from another connection is not evidence that the run never existed.
6. When the run came from the UI or another connection, review an authorized,
   downloaded local diagnostics directory: manifest first, every trace file
   second, persisted transcript third, and any HAR/SSE evidence last.
7. Compare live presentation with persisted conversation and trace evidence
   when the report involves disappearing, duplicated, truncated, or reordered
   content.
8. Classify each root cause using the fix-boundary guide. Separate primary
   cause, contributing conditions, and unrelated observations.
9. Recommend the smallest generic fix that preserves correct behavior for
   other Agents. Implement only when the request authorizes changes.
10. Validate the revised Agent, then exercise the smallest representative run.
   For writes, verify the business effect by stable identity before retrying.

## Evidence standards

- Prefer raw trace sequence and timestamps over UI ordering.
- Correlate a run to a definition only when Agent ID and executed version
  match. Treat absent identity, version, status, or model evidence as
  unverified rather than as a defect.
- Distinguish provider output, model-visible compacted output, projected SSE
  output, and persisted output.
- Inspect exact tool arguments, results, approval state, dispatch state, and
  effect state. A failed response does not prove a write did not occur.
- Treat `in_doubt` as requiring reconciliation, not blind retry.
- Report missing call arguments, business identity, occurrence/dispatch state,
  or provider detail as missing evidence; do not fill those gaps from model
  narration.
- Do not claim context loss merely because a final answer is poor; identify the
  context, compaction, routing, or persistence evidence that supports it.
- Treat an unknown pinned Skill or tool reference as a configuration failure
  even if validation reports only a warning.

## Report format

Lead with the outcome, then list findings in severity order. For each finding
include:

- observed behavior;
- direct evidence and stable identifiers;
- root cause and owning boundary;
- user impact;
- smallest safe fix;
- regression test or verification step.

State what was ruled out. Keep secrets, full sensitive payloads, and unrelated
customer data out of the report.
