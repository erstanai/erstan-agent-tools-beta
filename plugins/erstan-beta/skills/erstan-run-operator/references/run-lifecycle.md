# Run lifecycle

## Launch

- `run_agent` starts a published Agent asynchronously.
- Select a lane from `list_agents`; multi-lane Agents require an explicit lane.
- Chat lanes require a message. Structured lanes use their advertised input
  schema.
- Attachments are top-level run arguments and require a name, MIME type, and
  base64 content or an existing Erstan storage key. Local file paths are not
  server-readable. The complete request is limited to 25 MB.
- Reuse the same idempotency key for the same logical launch attempt.

## Poll and wait

`get_run` is authoritative for lifecycle state. A waiting run may expose a
`pendingInteraction` with a single-use opaque `interactionId`.

- `reply_to_run` answers a current user-input interaction.
- `decide_run_approval` approves or rejects a current approval interaction.
- A later wait has a different interaction ID. Re-read after conflicts or
  status changes.
- A retained/claimed continuation is not permission to submit again.
- Actionability is the top-level `interruptDisposition` returned by `get_run`.
  Submit only when it is exactly `actionable` and `pendingInteraction` is
  present.
- This MCP tool set does not expose `cancel_run`. Use the Erstan UI or another
  host surface that explicitly offers cancellation, then confirm with
  `get_run`.

## Durable evidence

Use `get_run_trace` for execution mechanism:

1. Request bounded pages and follow each opaque next cursor.
2. Stop on a missing, unchanged, or repeated cursor.
3. Preserve chronological sequence and occurrence identity.
4. Pair each tool call with its result using the persisted call identity.
5. Reconcile one durable terminal event with `get_run`.

For a material write, destination-system readback is stronger evidence than a
tool response. Treat an in-doubt effect as unknown until reconciled.
