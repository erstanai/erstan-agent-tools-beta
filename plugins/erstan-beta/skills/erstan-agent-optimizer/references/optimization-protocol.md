# Agent optimization protocol

Use this protocol to distinguish a defensible optimization from a prompt patch
that merely changes one observed run.

## Evidence and correlation

Record the current Agent ID, current version, published version, and revision.
For each diagnostic run, record the Agent ID, executed version, start lane,
model/provider when present, terminal state, tool calls/results by occurrence,
compaction evidence, persisted messages, artifact availability, and exact
usage only when present.

- A run with a different Agent ID is comparative evidence only.
- A run with a different version can demonstrate historical behavior and
  version drift, but cannot prove the current graph has the same defect.
- Current Skill packages may differ from the instructions used by a historical
  run. Record that limitation when the trace lacks exact Skill-version evidence.
- Screenshots establish visible symptoms, not graph or write-effect truth.

## Ownership decision

| Boundary | Optimize here when the evidence concerns |
| --- | --- |
| Agent | Graph shape, node responsibility, routing, model/tool/Skill policy, bindings, approval design, node-level instructions |
| Skill | Reusable domain rules, parsing, mappings, batching (read-only batch children; per-item governed writes), recovery, reconciliation, examples, executable actions |
| Platform | Generic routing, persistence, replay, context projection, approvals, effect tracking, export/retention, cross-Agent behavior |
| Connector/provider | Upstream schema, authentication, validation, provider timeout, or error fidelity |

Split the finding when multiple boundaries contribute. Do not move a reusable
Skill rule into the Agent simply because the Agent is easier to edit.

## Candidate requirements

For every proposed change record:

- Agent node and field path;
- direct evidence and affected run/occurrence;
- owner boundary and reason the Agent is the correct owner;
- expected improvement and possible regression;
- verification case and success condition.

Preserve complete graph fields from `get_agent`. Required tools for
deterministic or write-capable work remain pinned. Do not introduce automatic
approval or broaden access. Keep write reconciliation independent of model
narration.

## Evaluation

Compare baseline and candidate with representative inputs, including malformed
input, duplicate business identities, provider rejection, and ambiguous write
effects where relevant. Compare business correctness and external readback
before speed, tool-call count, or model usage. Use exact token/cache usage only
when both runs persist comparable fields.

Validation proves schema acceptability, not business correctness. A successful
preview proves only that the tested case ran; it does not authorize publication.
