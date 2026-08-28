# Work tools and boundaries

## Tasks and projects

- `list_projects` and `read_project` provide authorized project context.
- `list_task_options` resolves the selectable teams, projects, Task-eligible
  published Agents, assignable members and labels, and valid parent Tasks before
  create/update calls. `parent_tasks` excludes terminal Tasks and, when anchored
  to an existing Task, that Task and all descendants.
  Anchor it with `taskId` while editing, or `projectId`/`teamId` while creating;
  use `include`, `search`, and `limit` for large workspaces. It uses **View
  work**, so do not request **View agents** merely to resolve a Task Agent.
- `list_tasks` provides summaries. `read_task` is the authoritative complete
  read: scalar properties, project/team, parent and ordered children, labels,
  participants, attachments/references, bounded activity, thread references,
  linked runs, approval history, scheduling, lifecycle timestamps, output,
  error, usage, metadata, and external-execution state.
- `create_task` creates a queued, human-assigned task. A top-level task needs an
  authorized project or team. A subtask uses `parentTaskId` and inherits its
  parent's project and team.
- `update_task` changes Task properties. Read first and send only intended
  fields. Parent moves require an accessible non-terminal parent in the same
  workspace/team and cannot form a cycle. If a move omits `sortOrder`, Erstan
  appends the Task to the new parent's children.
- Use dedicated lifecycle tools for cancellation/archive/delete rather than
  writing those statuses through `update_task`. Agent switching and assignment,
  review, or date changes can be locked until a terminal Task is reopened.
- `externalExecution` defaults to false. Set it only for deliberate delivery to
  the external queue.
- `get_next_task`, `start_task`, `comment_on_task`, and `complete_task` operate
  the external task-delivery lifecycle. Comments do not resume Agent runs or
  resolve approvals.
- `update_task_comment` changes text inertly and preserves existing mention
  lineage; even Agent-looking text cannot route a new run. `delete_task_comment`
  soft-deletes the comment. Re-read after either operation.
- `comment_on_task` accepts optional inline attachments as
  `{ name, type, base64 }`. The server cannot read a local path, so read and
  base64-encode the file before calling the tool. `body` may be omitted when at
  least one attachment is present.
- Comment attachments are stored in the Task's team. For a Team-less Task, use
  its allowlisted workflow default when available or pass an allowlisted
  `teamId`; never select another team to work around an access failure. The
  task-scoped upload needs **Manage work**, not **Edit files**.
- A comment can carry at most 10 files, subject to workspace upload limits and
  the 25 MB complete JSON-request limit including base64 expansion. The result
  returns `taskAttachmentId` and `teamFileId`. `read_task` preserves each
  attachment's comment `activityId`; use `read_file` only when `fileReadable`
  is true and **View files** is granted.
- `comment_on_task` is not idempotent. After a lost or timed-out attachment
  response, use `read_task` to reconcile the expected comment and attachment;
  do not repeat the write unless the durable state proves it did not commit.
- `add_task_attachment` accepts `upload` (`name`, `type`, `base64`),
  `team_file` (`teamFileId`), `document` (`documentId`), or `external_url`
  (HTTP/HTTPS `url`). Inbox references are deliberately excluded.
- `remove_task_attachment` removes only the TaskAttachment relationship. It
  never deletes the underlying Team file or document. Treat a lost response as
  ambiguous and reconcile with `read_task` before retrying.
- `add_task_participant` accepts a valid workspace/team user or eligible Agent.
  Assignee/reviewer roles also update the Task's corresponding property.
- `add_task_reaction` and `remove_task_reaction` target either the Task
  description or an exact activity ID and act as the authenticated user.
- Call `get_task_lifecycle_impact` before `archive_task` or `delete_task`.
  Impact includes descendants, active work, runs, approvals, threads, activity,
  and attachments. Pass `cancelActiveWork: true` only after the user accepts
  that impact. `delete_task` is a soft delete with retained audit/run integrity
  and requires `confirmTitle` to exactly match the fresh `read_task` result.
- Parent/child links do not widen the connection resource boundary. Reads
  expand only allowlisted parent/child detail, and archive/delete fails closed
  unless every cascaded descendant remains allowlisted.
- `restore_task` restores the recorded pre-archive status and lifecycle
  timestamps. `cancel_task` uses the durable execution-cancellation path.
- `start_task` has no idempotency key or public claimant identity. After a lost
  or timed-out response, re-read the original task and report ambiguous
  ownership; do not retry the claim or fetch a different task.

## Task-linked runs and approvals

- `read_task.runs` contains exact `runId`/execution, `threadId`, and
  `checkpointThreadId` references. Pending approvals point back to their run.
- `get_task_run` and `get_task_run_trace` derive read access from the visible
  Task plus exact Task-to-execution-to-thread lineage. They use **View work**;
  do not ask for **View runs** as a second boundary.
- `reply_to_task_run` and `decide_task_run_approval` use **Manage work** and the
  same exact lineage. They do not require **Run agents**. General run tools stay
  bound to the exact connection that started a non-Task run.
- Always call `get_task_run` immediately before a reply/decision and copy its
  current `pendingInteraction.interactionId`. Reply only to `user_input`.
  Approval accepts only exact `approve` or `reject`; never infer a decision
  from prose or add feedback fields.
- Historical and archived Task runs remain readable. Reply/approval mutations
  require an actionable, non-archived Task. A stale interaction, mismatched
  Task/run/thread, or already-accepted response fails closed; re-read rather
  than changing IDs or retrying blindly.

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
Task-linked runs do not add another resource allowlist: the exact visible Task
relationship is the boundary. A relationship mismatch is not permission to try
the general run tools or probe another Task ID.
