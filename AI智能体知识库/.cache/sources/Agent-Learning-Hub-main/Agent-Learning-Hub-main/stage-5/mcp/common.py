"""Stage 5 各步骤共用的路径与配置。"""

from __future__ import annotations

import json
import os
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()

STAGE_DIR = Path(__file__).resolve().parent
SAMPLE_DATA_DIR = STAGE_DIR / "sample_data"
MOVIES_FILE = SAMPLE_DATA_DIR / "movies.json"


def get_host() -> str:
    return os.getenv("MCP_HOST", "127.0.0.1")


def get_port() -> int:
    return int(os.getenv("MCP_PORT", "8000"))


def get_http_path() -> str:
    return os.getenv("MCP_HTTP_PATH", "/mcp")


def load_movies() -> list[dict]:
    if not MOVIES_FILE.exists():
        raise FileNotFoundError(f"找不到示例数据：{MOVIES_FILE}")
    with MOVIES_FILE.open(encoding="utf-8") as f:
        return json.load(f)
