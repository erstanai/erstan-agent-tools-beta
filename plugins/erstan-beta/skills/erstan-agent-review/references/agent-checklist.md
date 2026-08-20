# Agent definition checklist

## Identity and version

- Confirm Agent ID, draft revision, published version, status, team, and model.
- Diagnose the version that ran, not merely the latest draft.

## Graph and routes

- Require a valid start lane and connected, unique node IDs.
- Check edge source/target IDs, terminal paths, loops, approval paths, and
  follow-up routing.
- Ensure human follow-ups enter the intended conversational lane.

## Instructions and state

- Give each node one clear responsibility and objective completion criteria.
- Keep domain rules in a Skill; keep platform mechanics out of customer prompts.
- For large inputs, require deterministic processing and durable intermediate
  state rather than model-side accumulation.
- Ensure later turns can recover necessary state without replaying side effects.

## Skills

- Use explicit `skillPolicy`: normally `pinned_only` for deterministic work.
- Resolve refs through `list_agent_skills`. Inspect workspace Skill IDs with
  `get_agent_skill`; never pass a `system:<key>` ref to that tool because system
  packages are not readable through it.
- Require workspace Skills to be published and readable. For a listed system
  ref, record the package-content evidence limitation; treat unknown refs as
  blocking.
- Avoid duplicating large Skill bodies in node instructions.

## Tools and writes

- Use explicit `toolPolicy` and pin every required connector tool.
- Verify tool names and schemas against `list_agent_tools`.
- Keep read, plan/review, write, and verification responsibilities clear.
- Define stable external/business IDs and uncertain-effect reconciliation.
- Confirm approval and workspace write policies match the intended automation.

## Validation

- Run platform validation and resolve errors before publishing.
- Test missing input, ambiguity, retry, partial failure, and successful terminal
  behavior as applicable.
