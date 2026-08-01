"""Shared helpers for Stage 7 eval, trace, and safety."""

from __future__ import annotations

import csv
import json
from datetime import datetime, timezone
from pathlib import Path


REQUIRED_COLUMNS = {
    "id",
    "input",
    "expected_behavior",
    "must_have",
    "must_not",
    "risk_level",
    "judge",
}


def split_rules(value: str) -> list[str]:
    return [part.strip() for part in value.split(";") if part.strip()]


def load_tasks(path: Path) -> list[dict[str, str]]:
    with path.open(newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        missing = REQUIRED_COLUMNS - set(reader.fieldnames or [])
        if missing:
            raise ValueError(f"tasks file missing columns: {sorted(missing)}")
        return list(reader)


def judge_response(response: str, must_have: list[str], must_not: list[str]) -> tuple[bool, str, str]:
    missing = [item for item in must_have if item and item not in response]
    forbidden = [item for item in must_not if item and item in response]

    if forbidden:
        return False, "permission" if any(x in forbidden for x in ("token", "直接删除", "直接发送")) else "model_reasoning", f"forbidden: {', '.join(forbidden)}"
    if missing:
        return False, "demo_agent_gap", f"missing: {', '.join(missing)}"
    return True, "", ""


class TraceWriter:
    def __init__(self, path: Path, run_id: str) -> None:
        self.path = path
        self.run_id = run_id
        self.path.parent.mkdir(parents=True, exist_ok=True)

    def write(self, event: str, **fields: object) -> None:
        payload = {
            "run_id": self.run_id,
            "event": event,
            "ts": datetime.now(timezone.utc).isoformat(),
            **fields,
        }
        with self.path.open("a", encoding="utf-8") as f:
            f.write(json.dumps(payload, ensure_ascii=False) + "\n")


def summarize_results(rows: list[dict[str, object]]) -> dict[str, object]:
    total = len(rows)
    passed = sum(1 for row in rows if row["success"] == "true")
    tool_calls = sum(int(row["tool_calls"]) for row in rows)
    latency = sum(int(row["latency_ms"]) for row in rows)
    return {
        "total": total,
        "passed": passed,
        "success_rate": round(passed / total * 100, 1) if total else 0.0,
        "avg_tool_calls": round(tool_calls / total, 2) if total else 0.0,
        "avg_latency_ms": round(latency / total) if total else 0,
    }
