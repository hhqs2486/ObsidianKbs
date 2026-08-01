"""Simple safety gate for high-risk agent requests."""

from __future__ import annotations

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
)


def classify_request(text: str, risk_level: str) -> tuple[str, str]:
    lowered = text.lower()

    for pattern in INJECTION_PATTERNS:
        if pattern.lower() in lowered:
            return "block", f"Possible prompt injection: {pattern}"

    if risk_level == "high":
        return "approval_required", "High-risk task requires human approval."

    for action in HIGH_RISK_ACTIONS:
        if action.lower() in lowered:
            return "approval_required", f"High-risk action detected: {action}"

    return "allow", ""


def build_safe_response(text: str, risk_level: str) -> tuple[str, int]:
    decision, reason = classify_request(text, risk_level)
    if decision == "block":
        return f"拒绝：{reason}", 0
    if decision == "approval_required":
        return f"需要人工确认：{reason} 请展示动作、目标、影响范围后再继续。", 0
    return "", 0
