---
name: erstan-skill-optimizer
description: "Retrieve and optimize an existing workspace Erstan Skill from its complete package and correlated run evidence. Use when a user asks to reduce context or tool churn, clarify reusable procedure, add deterministic actions, improve recovery or reconciliation, or strengthen reliability without losing business rules. Do not use for ordinary Skill creation or import."
---

# Erstan Skill optimizer

Produce a complete, reviewable Skill package candidate that improves reusable
behavior while preserving business rules, related files, action metadata, and
lifecycle safety. Optimization is proposal-only unless the user explicitly
authorizes a live workspace update or later publication.

## Required protocol

Read [the Skill optimization protocol](references/optimization-protocol.md)
before proposing or applying a package change.

## Workflow

1. Establish the requested stage: analysis, local candidate, server
   validation, live package update, or publication. Do not combine stages.
2. Call `list_agent_skills` when discovery is required, then
   `get_agent_skill` for the exact workspace Skill ID. It cannot retrieve a
   `system:<key>` Skill. Record the immutable package name, current version,
   lifecycle status, complete `packageJson`, files, and action declarations.
3. Correlate run evidence by Agent ID, executed Agent version, and bound Skill
   ID. When an export contains the exact executed Skill prompt but not a Skill
   version, compare content cautiously and record that historical package
   identity remains unverified.
4. Inspect `SKILL.md`, every related text file, and every executable action as
   one package. Identify repeated instructions, irrelevant always-loaded
   context, ambiguous tool arguments, missing batching/recovery/reconciliation,
   and deterministic work better owned by a sandbox action.
5. Separate Skill findings from Agent routing/policy, platform
   persistence/context/export, and connector/provider defects. Do not encode
   platform workarounds as universal domain instructions.
6. Build a complete candidate package and structured diff. Tie every changed
   file or action field to evidence, an expected outcome, and a regression
   check. Preserve unmodified files, action identities, runtime/language,
   entry paths, timeouts, and side-effect declarations.
7. Call `validate_agent_skill` with the complete candidate. Compare the
   returned normalized `packageJson` with the submitted package and stop on a
   dropped/coerced file, path, action, runtime, language, or side-effect field.
8. Stop at the validated proposal unless a workspace update is explicitly
   authorized. Re-read immediately before an authorized update and use the
   latest `currentVersion` as `expectedVersion`.
9. A published Skill has no isolated draft fork: `update_agent_skill` changes
   its live package immediately. Require explicit live-change authorization;
   a request to optimize, preview, validate, or create a proposal is not enough.
10. Call `publish_agent_skill` only after separate publication approval for an
    exact validated draft version.

## Optimization constraints

- Keep the trigger description discriminating and keep the critical decision
  procedure in `SKILL.md`. Move only selectively needed details into referenced
  files or executable actions.
- Do not shorten instructions by deleting fixed mappings, validation gates,
  approvals, idempotency, reconciliation, recovery, or completion evidence.
- When adding batching, batch only read-only tools; writes stay
  one-per-`tool_invoke` (large args via `argsSource` `workbench_json` from
  `state/`/`output/`), and bulk results are consumed in code from the result
  artifact, never via `er_tool_result_read`.
- Do not convert model-readable procedure into code unless deterministic
  execution materially improves reliability and the action's side effects are
  declared accurately.
- Do not claim token/cost improvement without exact comparable usage or write
  correctness without external readback.
- An unchanged package is a baseline, not an optimized candidate.

## Deliverable

Lead with whether the evidence supports a Skill change. Provide package/version
identity, findings by owner/severity, changed files/actions, a structured diff,
validation and normalization comparison, expected measurements, evaluation
cases, and any live update or publication still requiring approval.
