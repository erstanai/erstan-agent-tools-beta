---
name: erstan-run-operator
description: "Discover and run published Erstan Agents, monitor asynchronous runs, handle user-input and approval waits, and inspect durable traces. Use when a user asks to invoke an Erstan Agent, continue or approve a waiting run, check run status, diagnose execution, or reconcile a possibly ambiguous tool effect."
---

# Erstan run operator

Operate one run through its complete durable lifecycle without guessing state
or duplicating side effects.

## Reference

Read [run lifecycle](references/run-lifecycle.md) before launching or
continuing a run.

## Workflow

1. Confirm the intended Agent, lane, input, attachments, and material external
   effects. Use `list_agents` to resolve a published Agent and its public lane
   contract. Do not launch a run from a vague name or guessed input schema.
2. Require an explicit request to launch. Supply a stable `idempotencyKey` when
   a retry, network failure, or upstream event could otherwise create a
   duplicate run.
3. Call `run_agent` once and preserve the returned run ID and the Erstan
   connection that launched it.
4. Poll `get_run` at a reasonable interval. Honor server retry guidance and do
   not restart a merely slow run.
5. When status is `waiting`, inspect top-level `interruptDisposition` and the
   current `pendingInteraction`:
   - Continue only when `interruptDisposition === "actionable"` and a current
     `pendingInteraction` is present. Its own `status` field is not the
     actionability discriminator.
   - For user input, obtain the user's answer unless it is already explicit,
     then call `reply_to_run` with the exact current `interactionId`.
   - For approval, show the bounded proposed action and obtain the user's
     explicit approve or reject decision before `decide_run_approval`.
   - If the interaction is retained, claimed, or changed, keep polling or
     re-read; never reuse an older interaction ID.
6. Stop polling at `completed`, `failed`, or `cancelled`. Report the durable
   status, final response or error, and any unresolved external effect.
7. When mechanism matters, page `get_run_trace` chronologically through every
   cursor. Pair tool calls and results by call and occurrence identity rather
   than tool name alone.

## Safety

- A failed or timed-out write response does not prove the write failed. Verify
  the destination by stable business identity before any retry.
- Never self-approve a waiting action, infer a user's answer, or reuse an
  interaction ID from an earlier wait.
- Do not claim access to runs launched by another credential or connection. If
  Erstan returns not found, report the ownership boundary and request an
  authorized diagnostic export when appropriate.
- Do not invent or call `cancel_run`; it is not in the hosted MCP tool set.
  Cancellation is currently performed in the Erstan UI or another host surface
  that explicitly exposes it. Re-read `get_run` afterward to confirm status.
- Keep credentials, raw sensitive payloads, and unrelated customer data out of
  reports.
