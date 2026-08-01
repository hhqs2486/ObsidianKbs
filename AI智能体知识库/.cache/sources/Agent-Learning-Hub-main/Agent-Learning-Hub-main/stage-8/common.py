"""Stage 8 shared config, logging, trace, and cost tracking."""

from __future__ import annotations

import json
import logging
import os
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path

from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

# Rough USD per 1K tokens (gpt-4o-mini class); teaching estimate only.
COST_PER_1K_INPUT = 0.00015
COST_PER_1K_OUTPUT = 0.0006


@dataclass(frozen=True)
class Settings:
    max_steps: int
    request_timeout_sec: float
    max_retries: int
    max_cost_usd: float
    trace_dir: Path
    log_level: str
    dry_run: bool


def load_settings() -> Settings:
    return Settings(
        max_steps=int(os.getenv("AGENT_MAX_STEPS", "12")),
        request_timeout_sec=float(os.getenv("AGENT_REQUEST_TIMEOUT_SEC", "60")),
        max_retries=int(os.getenv("AGENT_MAX_RETRIES", "2")),
        max_cost_usd=float(os.getenv("AGENT_MAX_COST_USD", "0.50")),
        trace_dir=Path(os.getenv("AGENT_TRACE_DIR", "traces")),
        log_level=os.getenv("AGENT_LOG_LEVEL", "INFO").upper(),
        dry_run=os.getenv("AGENT_DRY_RUN", "false").lower() in {"1", "true", "yes"},
    )


def setup_logging(level: str = "INFO") -> logging.Logger:
    logging.basicConfig(
        level=getattr(logging, level, logging.INFO),
        format="%(asctime)s %(levelname)s %(message)s",
    )
    return logging.getLogger("stage8")


def get_client() -> OpenAI:
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise RuntimeError("请设置 OPENAI_API_KEY。复制 .env.example 为 .env 后填写。")
    base_url = os.getenv("OPENAI_BASE_URL")
    if base_url:
        return OpenAI(api_key=api_key, base_url=base_url)
    return OpenAI(api_key=api_key)


def get_model() -> str:
    return os.getenv("OPENAI_MODEL", "gpt-4o-mini")


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


class CostTracker:
    def __init__(self, max_cost_usd: float) -> None:
        self.max_cost_usd = max_cost_usd
        self.input_tokens = 0
        self.output_tokens = 0

    def add_usage(self, input_tokens: int, output_tokens: int) -> None:
        self.input_tokens += max(0, input_tokens)
        self.output_tokens += max(0, output_tokens)

    @property
    def estimated_usd(self) -> float:
        return (
            self.input_tokens / 1000 * COST_PER_1K_INPUT
            + self.output_tokens / 1000 * COST_PER_1K_OUTPUT
        )

    def is_over_budget(self) -> bool:
        return self.estimated_usd > self.max_cost_usd

    def snapshot(self) -> dict[str, float | int]:
        return {
            "input_tokens": self.input_tokens,
            "output_tokens": self.output_tokens,
            "estimated_usd": round(self.estimated_usd, 6),
            "max_cost_usd": self.max_cost_usd,
        }


def new_trace(settings: Settings, run_id: str | None = None) -> TraceWriter:
    rid = run_id or datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    path = settings.trace_dir / f"{rid}.jsonl"
    return TraceWriter(path, rid)
