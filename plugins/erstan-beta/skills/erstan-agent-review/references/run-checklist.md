# Run and trace checklist

## Establish the run

- Record Agent/version, run ID, thread ID, trigger provenance, start/end time,
  status, and pending interaction.
- Page the trace until a terminal event; report if collection is truncated.

## Reconstruct chronology

- Order by canonical sequence, using timestamps as supporting evidence.
- Correlate model calls, narration, tool calls/results, approvals, retries,
  compaction, checkpoint recovery, and terminal persistence.
- Compare live SSE, reconnect replay, thread reload, and exported diagnostics
  only when the symptom involves presentation divergence.

## Inspect tools

- Pair each call/result by tool call ID.
- Inspect resolved arguments, file-backed argument references, provider detail,
  retries, timeout, dispatch state, and effect state.
- For write failures or timeouts, verify the business effect by stable identity
  before deciding whether retry is safe.
- Confirm the model received actionable result detail or a readable durable
  reference when output was compacted.

## Inspect context and state

- Identify compaction or projection boundaries and what the model could see.
- Check whether durable working files/state remained available across turns.
- Look for repeated questions, repeated tool work, stale route data, or a final
  answer inconsistent with the most recent evidence.

## Confirm completion

- Require a durable terminal status and persisted assistant outcome.
- For writes, accept domain-appropriate post-write evidence such as stable
  record existence, expected line count, and reconciled totals.
- Distinguish a successful business effect from a failed response path or failed
  UI presentation.

## Compare runs

- Compare elapsed time, model and token usage, tool counts, retries, failures,
  compactions, approval pauses, and verified business outcomes.
- Do not call a run better solely because it is faster or cheaper.
