---
name: erstan-skill-optimizer
description: "Retrieve and optimize an existing workspace Erstan Skill from its complete package and correlated run evidence. Use when a user asks to reduce context or tool churn, clarify reusable procedure, add deterministic actions, improve recovery or reconciliation, or strengthen reliability without losing business rules. Do not use for ordinary Skill creation or import."
---

# Erstan Skill optimizer

Produce a complete, reviewable Skill package candidate that improves reusable
behavior while preserving business rules, related files, action metadata, and
lifecycle safety. Optimization is proposal-only unless the user explicitly
authorizes a saved workspace update, live preview, or later publication.

## Required protocol

Read [the Skill optimization protocol](references/optimization-protocol.md)
before proposing or applying a package change.
Before a saved update or publication, also read the shared
[package lifecycle rules](../erstan-skill-manager/references/package-lifecycle.md).

## Workflow

1. Establish the requested stage: analysis, local candidate, server
   validation, saved package update, live preview, or publication. Do not combine
   stages. Read `get_agent_builder_guide` to check `lifecycle.skillSavesAreDrafts`
   before assuming a published Skill can be edited without a live change.
2. Call `list_agent_skills` when discovery is required, then
   `get_agent_skill` for the exact workspace Skill ID. It cannot retrieve a
   `system:<key>` Skill. Record the immutable package name, current version,
   lifecycle status, `publishedVersion` and `hasDraft` when exposed, complete
   `packageJson`, files, and action declarations.
3. Correlate run evidence by Agent ID, executed Agent version, and bound Skill
   ID and immutable Skill version identity when exposed. The latest package
   may be an unpublished draft, not what ran. When an export contains the exact
   executed Skill prompt but not its version, compare content cautiously and
   record that historical package identity remains unverified.
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
   authorized. Re-read before an authorized update, reconcile drift without
   overwriting concurrent changes, and revalidate the complete candidate. Use
   the `currentVersion` paired with that baseline as `expectedVersion`.
9. With `lifecycle.skillSavesAreDrafts: true`, an update stages a new package
   and keeps the prior published package live. Do not change status to stage it.
   Otherwise follow the legacy/unknown-server boundary in the lifecycle rules;
   a draft-only request must never become an immediate live change. For an
   explicitly authorized Agent preview of this draft Skill, follow the shared
   [guarded preview rules](../erstan-agent-builder/references/lifecycle-and-graph.md).
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
cases, and any saved update, live preview, or publication still requiring approval.
