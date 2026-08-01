"""多 agent 协调器。

重点：agent 之间不要自由聊天；由 coordinator 控制状态、路由和停止条件。
"""

from __future__ import annotations

import json
from dataclasses import asdict, dataclass, field
from typing import Any

from agents import run_json_agent, run_text_agent


@dataclass
class TraceEvent:
    step: int
    role: str
    action: str
    summary: str


@dataclass
class MultiAgentState:
    task: str
    research: str = ""
    draft: str = ""
    review: str = ""
    final: str = ""
    trace: list[TraceEvent] = field(default_factory=list)
    max_steps: int = 8

    def compact_json(self) -> str:
        """给 supervisor 的短状态，避免把完整长文本反复塞回模型。"""
        payload: dict[str, Any] = {
            "task": self.task,
            "has_research": bool(self.research),
            "has_draft": bool(self.draft),
            "has_review": bool(self.review),
            "has_final": bool(self.final),
        }
        return json.dumps(payload, ensure_ascii=False)

    def add_trace(self, step: int, role: str, action: str, content: str) -> None:
        self.trace.append(
            TraceEvent(step=step, role=role, action=action, summary=content[:160])
        )


def run_fixed_pipeline(task: str) -> MultiAgentState:
    """固定顺序：research -> write -> review -> revise。"""
    state = MultiAgentState(task=task)

    research = run_text_agent("researcher", task)
    state.research = research.content
    state.add_trace(1, "researcher", "collect_notes", research.content)

    draft = run_text_agent("writer", task, context=state.research)
    state.draft = draft.content
    state.add_trace(2, "writer", "write_draft", draft.content)

    review = run_text_agent("reviewer", task, context=state.draft)
    state.review = review.content
    state.add_trace(3, "reviewer", "review_draft", review.content)

    final = run_text_agent(
        "reviser",
        task,
        context=f"草稿：\n{state.draft}\n\n审阅意见：\n{state.review}",
    )
    state.final = final.content
    state.add_trace(4, "reviser", "revise_final", final.content)
    return state


def run_supervised(task: str, max_steps: int = 8) -> MultiAgentState:
    """由 supervisor 动态选择下一步，带最大步数保护。"""
    state = MultiAgentState(task=task, max_steps=max_steps)

    for step in range(1, max_steps + 1):
        decision = run_json_agent("supervisor", task, context=state.compact_json())
        next_role = str(decision.get("next", "")).strip()
        state.add_trace(step, "supervisor", f"route:{next_role}", str(decision))

        if next_role == "done":
            break
        if next_role == "research":
            result = run_text_agent("researcher", task)
            state.research = result.content
            state.add_trace(step, "researcher", "collect_notes", result.content)
        elif next_role == "write":
            result = run_text_agent("writer", task, context=state.research)
            state.draft = result.content
            state.add_trace(step, "writer", "write_draft", result.content)
        elif next_role == "review":
            result = run_text_agent("reviewer", task, context=state.draft)
            state.review = result.content
            state.add_trace(step, "reviewer", "review_draft", result.content)
        elif next_role == "revise":
            context = f"研究：\n{state.research}\n\n草稿：\n{state.draft}\n\n审阅：\n{state.review}"
            result = run_text_agent("reviser", task, context=context)
            state.final = result.content
            state.add_trace(step, "reviser", "revise_final", result.content)
        else:
            state.add_trace(step, "coordinator", "stop_invalid_route", next_role)
            break

        if state.final:
            break

    return state


def state_to_dict(state: MultiAgentState) -> dict[str, Any]:
    data = asdict(state)
    data["trace"] = [asdict(event) for event in state.trace]
    return data


def print_trace(state: MultiAgentState) -> None:
    print("\n=== Trace ===")
    for event in state.trace:
        print(f"{event.step:02d} | {event.role:<11} | {event.action:<18} | {event.summary}")
