"""
Stage 8 agent loop — tools, retry, timeout, trace, cost cap.

Used by cli.py (Step 8). Not a standalone entry point.
"""

from __future__ import annotations

import time
from typing import Any

from common import (
    CostTracker,
    Settings,
    get_client,
    get_model,
    load_settings,
    new_trace,
    setup_logging,
)
from tools import TOOL_SCHEMAS, run_tool

log = setup_logging()


def _append_assistant(messages: list[dict[str, Any]], assistant) -> None:
    messages.append(
        {
            "role": "assistant",
            "content": assistant.content or "",
            "tool_calls": [
                {
                    "id": tc.id,
                    "type": "function",
                    "function": {
                        "name": tc.function.name,
                        "arguments": tc.function.arguments,
                    },
                }
                for tc in (assistant.tool_calls or [])
            ],
        }
    )


def _append_tool_results(messages: list[dict[str, Any]], assistant) -> None:
    for tc in assistant.tool_calls or []:
        try:
            out = run_tool(tc.function.name, tc.function.arguments)
        except Exception as exc:  # noqa: BLE001
            out = f"工具执行异常: {exc}"
        messages.append({"role": "tool", "tool_call_id": tc.id, "content": out})


def _record_usage(cost: CostTracker, response) -> None:
    usage = getattr(response, "usage", None)
    if not usage:
        return
    cost.add_usage(
        getattr(usage, "prompt_tokens", 0) or 0,
        getattr(usage, "completion_tokens", 0) or 0,
    )


def _call_model(client, model: str, messages: list[dict[str, Any]], settings: Settings):
    last_exc: Exception | None = None
    for attempt in range(1, settings.max_retries + 2):
        try:
            return client.chat.completions.create(
                model=model,
                messages=messages,
                tools=TOOL_SCHEMAS,
                timeout=settings.request_timeout_sec,
            )
        except Exception as exc:  # noqa: BLE001
            last_exc = exc
            log.warning("API attempt %s failed: %s", attempt, exc)
            if attempt <= settings.max_retries:
                time.sleep(min(2**attempt * 0.5, 4.0))
    raise RuntimeError(f"API 调用失败（已重试 {settings.max_retries} 次）: {last_exc}")


def _dry_run_answer(question: str) -> str:
    return (
        f"[DRY RUN] 已收到任务：{question[:200]}。"
        "未调用 API。设置 AGENT_DRY_RUN=false 并使用有效 OPENAI_API_KEY 以运行真实 agent。"
    )


def run_agent(question: str, settings: Settings | None = None) -> str:
    settings = settings or load_settings()
    log.setLevel(settings.log_level)
    trace = new_trace(settings)
    cost = CostTracker(settings.max_cost_usd)

    trace.write("run_started", question=question, dry_run=settings.dry_run)

    if settings.dry_run:
        answer = _dry_run_answer(question)
        trace.write("run_finished", answer=answer, **cost.snapshot())
        return answer

    client = get_client()
    model = get_model()
    messages: list[dict[str, Any]] = [
        {
            "role": "system",
            "content": (
                "你是 Stage 8 可部署 CLI Agent。"
                "读取文件或计算时必须调用工具，禁止编造工具结果。"
            ),
        },
        {"role": "user", "content": question},
    ]

    for step in range(1, settings.max_steps + 1):
        if cost.is_over_budget():
            msg = f"已达成本上限 ${settings.max_cost_usd}（估算 ${cost.estimated_usd:.4f}）"
            trace.write("run_stopped", reason="cost_cap", step=step, **cost.snapshot())
            return msg

        trace.write("step_started", step=step)
        try:
            response = _call_model(client, model, messages, settings)
        except RuntimeError as exc:
            trace.write("run_failed", step=step, error=str(exc))
            return str(exc)

        _record_usage(cost, response)
        assistant = response.choices[0].message

        if not assistant.tool_calls:
            answer = (assistant.content or "").strip() or "(空回复)"
            trace.write("run_finished", step=step, answer=answer[:500], **cost.snapshot())
            return answer

        _append_assistant(messages, assistant)
        _append_tool_results(messages, assistant)
        trace.write(
            "tools_executed",
            step=step,
            tools=[tc.function.name for tc in assistant.tool_calls],
            **cost.snapshot(),
        )

    msg = f"已达最大步数 {settings.max_steps}，请缩小任务或提高 AGENT_MAX_STEPS。"
    trace.write("run_stopped", reason="max_steps", **cost.snapshot())
    return msg
