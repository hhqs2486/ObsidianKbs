---
name: {{SKILL_NAME}}
description: {{DESCRIPTION}}
---

# Agent Eval Runner

Use this skill when designing, running, or reviewing agent evaluation suites with trace logs and pass/fail rules.

## When To Use

- The user asks to create eval tasks, run regression tests on an agent, or compare eval baselines.
- Input includes task CSV, expected behaviors, must_have / must_not rules, or trace JSONL files.
- Output should be a structured eval report with success rate and failure taxonomy.

## When Not To Use

- The user only wants unit tests for pure functions without agent behavior.
- There is no eval harness, task list, or measurable acceptance criteria.

## Steps

1. Confirm eval dimensions: correctness, tool use, safety, latency, cost.
2. Load or draft tasks with columns: id, input, expected_behavior, must_have, must_not, risk_level, judge.
3. Run the eval runner and capture results CSV + trace JSONL.
4. Render HTML report for human review.
5. Classify failures using failure_taxonomy.md and propose fixes.

## Output

- Summary table: total, passed, success_rate, avg_tool_calls, avg_latency_ms.
- Top failure types with example task IDs.
- Action items tied to changed code or prompts.

## Verification

- Every failing task has a concrete note (missing / forbidden / permission).
- Report paths exist: evals/results.csv, evals/report.html, traces/*.jsonl.
- No fabricated pass rates — numbers must match the CSV.
