"""Permission boundary and human-approval gate for Stage 8 CLI agent."""

from __future__ import annotations

from enum import Enum

INJECTION_PATTERNS = (
    "忽略之前",
    "ignore previous",
    "ignore all prior",
    "reveal system prompt",
    "导出 token",
    "export token",
)

HIGH_RISK_ACTIONS = (
    "删除",
    "发送邮件",
    "publish",
    "付款",
    "导出用户",
    "rm -rf",
    "drop table",
)


class Decision(str, Enum):
    ALLOW = "allow"
    BLOCK = "block"
    APPROVAL_REQUIRED = "approval_required"


def classify_request(text: str) -> tuple[Decision, str]:
    lowered = text.lower()

    for pattern in INJECTION_PATTERNS:
        if pattern.lower() in lowered:
            return Decision.BLOCK, f"Possible prompt injection: {pattern}"

    for action in HIGH_RISK_ACTIONS:
        if action.lower() in lowered:
            return Decision.APPROVAL_REQUIRED, f"High-risk action detected: {action}"

    return Decision.ALLOW, ""


def gate_user_input(text: str) -> tuple[str | None, str]:
    """Return (blocked_or_hold_message, decision). None message means proceed."""
    decision, reason = classify_request(text)
    if decision is Decision.BLOCK:
        return f"拒绝：{reason}", decision.value
    if decision is Decision.APPROVAL_REQUIRED:
        return (
            f"需要人工确认：{reason} "
            "请说明动作、目标、影响范围；确认后带 `--approve` 重新运行。",
            decision.value,
        )
    return None, decision.value


def parse_approve_flag(argv: list[str]) -> tuple[bool, list[str]]:
    approve = "--approve" in argv
    cleaned = [arg for arg in argv if arg != "--approve"]
    return approve, cleaned
