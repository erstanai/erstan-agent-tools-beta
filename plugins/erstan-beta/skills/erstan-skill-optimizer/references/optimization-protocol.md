# Skill optimization protocol

Use this protocol to improve a reusable Skill without optimizing one historical
example at the expense of its contract.

## Establish the baseline

Retrieve the complete current workspace package with `get_agent_skill`. Record
the Skill ID, immutable package name, current version, lifecycle status,
`SKILL.md`, every related file, and every action field. System Skill packages
are not readable and therefore cannot be optimized through this workflow.

Correlate diagnostics with the bound Skill ID and executed Agent version. A
combined executed Skill prompt can establish instructions visible to the model,
but does not establish the historical Skill version unless that version is
persisted separately.

## Decide what belongs in the Skill

Skill-owned improvements include:

- input signature and applicability rules;
- reusable parsing, mappings, validation, batching, and recovery;
- exact tool argument contracts and provider-specific business procedure;
- stable identities, duplicate handling, reconciliation, and safe retries;
- examples or references needed across Agents;
- deterministic sandbox actions that replace repeated ad hoc computation.

Agent graph/routing/policy belongs in the Agent. Generic persistence,
compaction, replay, artifact retention, approval, and effect-tracking behavior
belongs in the platform. Upstream schema/authentication/error fidelity belongs
to the connector or provider.

## Context optimization

Keep `SKILL.md` sufficient to choose and execute the common path safely. Move
large tables, uncommon variants, detailed examples, or schemas into clearly
linked related files when they can be read selectively. Use an executable
action only for repeatable deterministic work; preserve a concise model-facing
contract describing when to invoke it, inputs, outputs, failure meaning, and
side effects.

Context reduction is not successful when it removes necessary business gates
or causes extra tool calls, retries, user questions, or ambiguous writes.

## Package and evaluation gates

The candidate must retain safe relative paths, case-insensitive uniqueness,
`SKILL.md` as entry path, and complete action metadata. Compare server-normalized
validation output field by field with the submitted package.

Evaluate baseline and candidate on representative valid inputs plus malformed,
duplicate, missing-mapping, provider-failure, and ambiguous-effect cases where
relevant. Business correctness and external readback outrank brevity, elapsed
time, and tool-call count. Use token/cache measurements only when exact fields
are available for both runs.
