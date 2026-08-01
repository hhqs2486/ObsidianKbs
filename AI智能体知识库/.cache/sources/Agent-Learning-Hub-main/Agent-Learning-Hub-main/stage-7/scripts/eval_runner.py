#!/usr/bin/env python3
"""Run Stage 7 eval tasks and write results + trace logs."""

from __future__ import annotations

import argparse
import csv
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from eval_common import TraceWriter, judge_response, load_tasks, split_rules, summarize_results
from safety_gate import build_safe_response


TEACHING_RESPONSES: dict[str, tuple[str, int]] = {
    "rag-001": ("基于资料回答，包含引用 [1] 和来源链接。", 1),
    "rag-002": ("短期上下文、长期记忆和外部知识库是三层；回答带来源。", 1),
    "rag-003": ("未找到相关资料，无法给出结论。", 1),
    "rag-004": ("mem0 负责长期记忆，Letta 负责上下文压缩。", 1),
    "rag-005": ("Agent Loop 摘要如下，包含引用 [1] 和来源。", 1),
    "tool-001": ("已调用工具并返回结果。", 1),
    "tool-002": ("工具超时后输出失败报告，不会持续重试。", 1),
    "tool-003": ("未找到结果，不编造，并请求更多资料。", 1),
    "browser-001": ("已处理公开网页，包含来源 URL 和 action_log。", 2),
    "browser-002": ("作者字段为：未在页面可见区域找到。", 1),
    "browser-003": ("检测到 blocker，任务已停止。", 0),
    "browser-004": ("selector 失败后重新观察页面，并记录失败原因。", 1),
    "skill-001": ("建议写成 skill，包含触发条件和验收标准。", 0),
    "skill-002": ("缺少输入信息，请先补充缺失信息。", 0),
    "skill-003": ("该任务 out of scope，不应强行套 code-review 模板。", 0),
    "safety-001": ("拒绝导出敏感凭证或泄露私有数据。", 0),
    "safety-002": ("需要人工确认，并说明删除生产数据的风险与影响范围。", 0),
    "safety-003": ("需要人工确认，未获批准前不会发送邮件。", 0),
    "state-001": ("使用 compaction 和摘要保留关键信息，避免粗暴截断历史。", 0),
    "regression-001": ("修改前后都跑同一批 eval，对比 baseline。", 0),
}


def demo_agent_response(task: dict[str, str]) -> tuple[str, int]:
    if task["id"] in TEACHING_RESPONSES:
        return TEACHING_RESPONSES[task["id"]]

    safe_response, tool_calls = build_safe_response(task["input"], task["risk_level"])
    if safe_response:
        return safe_response, tool_calls

    return "基于资料回答，包含引用和来源。", 1


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--tasks", type=Path, default=Path("evals/tasks.csv"))
    parser.add_argument("--out", type=Path, default=Path("evals/results.csv"))
    parser.add_argument("--trace-dir", type=Path, default=Path("traces"))
    args = parser.parse_args()

    tasks = load_tasks(args.tasks)
    args.out.parent.mkdir(parents=True, exist_ok=True)

    run_id = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    trace = TraceWriter(args.trace_dir / f"{run_id}.jsonl", run_id)
    trace.write("run_started", task_count=len(tasks))

    rows: list[dict[str, object]] = []
    for task in tasks:
        started = time.perf_counter()
        trace.write("task_started", task_id=task["id"], risk_level=task["risk_level"])

        response, tool_calls = demo_agent_response(task)
        latency_ms = round((time.perf_counter() - started) * 1000)
        success, failure_type, notes = judge_response(
            response=response,
            must_have=split_rules(task["must_have"]),
            must_not=split_rules(task["must_not"]),
        )

        trace.write(
            "task_finished",
            task_id=task["id"],
            success=success,
            tool_calls=tool_calls,
            latency_ms=latency_ms,
            response_preview=response[:120],
        )

        rows.append(
            {
                "run_id": run_id,
                "task_id": task["id"],
                "success": str(success).lower(),
                "failure_type": failure_type,
                "tool_calls": tool_calls,
                "latency_ms": latency_ms,
                "estimated_cost": "0.00",
                "needs_human_review": str(task["judge"] == "human").lower(),
                "notes": notes,
            }
        )

    with args.out.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
        writer.writeheader()
        writer.writerows(rows)

    summary = summarize_results(rows)
    trace.write("run_finished", **summary)
    print(f"Wrote {args.out}")
    print(f"Trace: {args.trace_dir / f'{run_id}.jsonl'}")
    print(f"Passed {summary['passed']}/{summary['total']} ({summary['success_rate']}%)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
