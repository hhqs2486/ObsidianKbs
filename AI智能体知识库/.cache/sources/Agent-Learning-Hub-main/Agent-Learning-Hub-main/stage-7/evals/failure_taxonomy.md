# Failure Taxonomy

Use one primary failure type per failed task. Add a note when a failure spans multiple layers.

| Failure Type | Meaning | Fix Direction |
| --- | --- | --- |
| `prompt` | Instruction is unclear or conflicts with the desired behavior. | Tighten the task prompt or system prompt. |
| `tool_schema` | Tool parameters are ambiguous, too broad, or missing required fields. | Redesign the schema and add validation. |
| `tool_runtime` | Tool crashed, timed out, or returned malformed data. | Improve error handling and retries. |
| `retrieval` | Search returned no evidence, bad evidence, or wrong citations. | Tune query, chunking, reranking, or source filtering. |
| `model_reasoning` | Model had evidence but chose the wrong plan or conclusion. | Improve examples, add decomposition, or switch model. |
| `state` | Memory, context, session, or compaction caused stale/wrong behavior. | Inspect state transitions and context window contents. |
| `permission` | The agent attempted or was blocked from a risky action. | Add a clearer safety gate or approval flow. |
| `environment` | Network, browser, file, dependency, or page changed unexpectedly. | Make the environment observable and reproducible. |
| `demo_agent_gap` | The Stage 7 toy runner does not implement the needed behavior. | Replace `demo_agent_response` with your real agent call. |
