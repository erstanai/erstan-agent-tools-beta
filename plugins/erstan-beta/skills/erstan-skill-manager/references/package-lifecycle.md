# Skill package and lifecycle rules

## Package shape

- `SKILL.md` is required and remains the entry path.
- Preserve every related text file by safe relative path.
- A package may declare sandbox actions with a key, title, runtime, entry path,
  language, side-effect classification, and timeout.
- Action entry points must name files present in the complete package.
- Reject absolute paths, traversal, reserved paths, and case-insensitive
  collisions.
- Treat path rewriting, file or action removal, collision collapse, and
  runtime, language, or side-effect coercion as validation failures even when
  the server returns a normalized package. Compare returned `packageJson` with
  the submitted package before saving.

`sideEffects: "none"` and `sideEffects: "external"` are security-relevant
declarations. They describe an action but never grant it permission.

## Lifecycle

- `validate_agent_skill` validates and normalizes without saving.
- `create_agent_skill` creates a workspace draft.
- `get_agent_skill` returns a workspace Skill's complete current package and
  optimistic version. It does not accept `system:<key>` refs.
- `update_agent_skill` replaces the complete package using the current
  `expectedVersion` and preserves lifecycle status unless explicitly changed.
  Updating a published Skill therefore changes its live package immediately;
  the server does not create an isolated draft. Require explicit live-change
  authorization or stop at validation.
- `publish_agent_skill` revalidates and explicitly publishes the current draft
  using the current `expectedVersion`.

Skill reads use **View agents**. Validation, creation, and update use **Build
agents**. Publication uses **Publish agents**. Present these exact permission
groups from **Settings > Connected apps** rather than legacy scope names.

`create_agent_skill` has no idempotency key. After an ambiguous response,
search workspace Skills and compare `packageName` and the complete package.
Never retry while creation remains uncertain.
