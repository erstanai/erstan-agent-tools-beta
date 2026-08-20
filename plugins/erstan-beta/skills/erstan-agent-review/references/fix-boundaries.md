# Fix boundaries

Assign a fix to the lowest reusable boundary that owns the defect.

## Agent definition

Use for graph topology, node responsibilities, model choice, explicit Skill or
tool policies, bound tools, approval design, and node-level instructions.

## Skill

Use for reusable domain semantics, mappings, input requirements, validation,
workflow guidance, recovery rules, and business completion evidence. Do not put
customer-specific rules into the platform.

## Platform

Use for routing, streaming/replay parity, persistence, checkpoint recovery,
context projection, generic large-file execution, approvals, idempotency,
effect tracking, tool schema transport, and cross-Agent UX. Do not compensate
for a platform defect by teaching every Skill a workaround.

## Connector or provider

Use for upstream schemas, provider validation, authentication, remote timeouts,
and provider-specific error fidelity. Preserve enough response detail for the
Agent to correct a request without exposing credentials.

## Decision rules

- Fix an isolated configuration mistake in the Agent.
- Fix repeated domain behavior in the Skill.
- Fix behavior shared by unrelated Agents in the platform.
- Fix an upstream contract mismatch at the connector boundary.
- Split a finding when more than one boundary contributes.
- Prefer a small contract and a regression test over a case-specific prompt
  patch.
- Do not broaden permissions, bypass approval, or retry an uncertain write just
  to make a test pass.
