# Work tools and boundaries

## Tasks and projects

- `list_projects` and `read_project` provide authorized project context.
- `list_tasks` and `read_task` provide authorized task state and provenance.
- `create_task` creates a queued, human-assigned task. A top-level task needs an
  authorized project or team. A subtask uses `parentTaskId` and inherits its
  parent's project and team.
- `externalExecution` defaults to false. Set it only for deliberate delivery to
  the external queue.
- `get_next_task`, `start_task`, `comment_on_task`, and `complete_task` operate
  the external task-delivery lifecycle. Comments do not resume Agent runs or
  resolve approvals.
- `start_task` has no idempotency key or public claimant identity. After a lost
  or timed-out response, re-read the original task and report ambiguous
  ownership; do not retry the claim or fetch a different task.

## Documents

- Use `search_documents` to resolve candidates and `read_document` for current
  content and publish status.
- Use `list_folders` before creating content in a folder.
- `create_document` creates content in an authorized team.
- `append_section` and `replace_section` make section-level changes. Read the
  target first, use the narrowest edit, and verify afterward.
- Draft and published documents can both be valid working context. Do not
  mistake publish status for access authority.

## Files

- `list_files` resolves authorized team files and folders.
- `read_file` returns text inline or bounded base64 and includes a content hash.
- `write_file` creates by team/name or updates by file ID. Binary content uses
  base64. Updates are versioned, but still require correct target selection and
  readback.

## Access failures

Task, document, and file access is constrained by both scope and project/team
allowlists. Treat not-found and forbidden results as boundaries. Ask the user
to change the Erstan connection grant when broader access is genuinely needed;
the model must not attempt to expand its own permissions.
