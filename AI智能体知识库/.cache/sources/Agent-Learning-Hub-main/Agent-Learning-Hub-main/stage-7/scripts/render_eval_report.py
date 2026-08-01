#!/usr/bin/env python3
"""Render Stage 7 eval results as a standalone HTML report."""

from __future__ import annotations

import argparse
import csv
import html
import sys
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from eval_common import summarize_results


def load_results(path: Path) -> list[dict[str, str]]:
    with path.open(newline="", encoding="utf-8") as f:
        return list(csv.DictReader(f))


def render_html(rows: list[dict[str, str]], summary: dict[str, object]) -> str:
    failure_counts = Counter(row["failure_type"] for row in rows if row["success"] != "true" and row["failure_type"])

    def row_tr(row: dict[str, str]) -> str:
        ok = row["success"] == "true"
        cls = "pass" if ok else "fail"
        return (
            f"<tr class='{cls}'>"
            f"<td>{html.escape(row['task_id'])}</td>"
            f"<td>{html.escape(row['success'])}</td>"
            f"<td>{html.escape(row.get('failure_type', ''))}</td>"
            f"<td>{html.escape(row.get('tool_calls', ''))}</td>"
            f"<td>{html.escape(row.get('latency_ms', ''))}</td>"
            f"<td>{html.escape(row.get('notes', ''))}</td>"
            f"</tr>"
        )

    failure_rows = "".join(
        f"<li><strong>{html.escape(k or 'unknown')}</strong>: {v}</li>" for k, v in failure_counts.most_common()
    ) or "<li>No failures</li>"

    body_rows = "".join(row_tr(r) for r in rows)

    return f"""<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Agent Eval Report</title>
  <style>
    :root {{ font-family: system-ui, sans-serif; color: #1a1a1a; background: #f6f8fa; }}
    body {{ max-width: 960px; margin: 2rem auto; padding: 0 1rem; }}
    h1 {{ font-size: 1.5rem; }}
    .cards {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 1rem; }}
    .card {{ background: #fff; border-radius: 8px; padding: 1rem; box-shadow: 0 1px 3px rgba(0,0,0,.08); }}
    .card .val {{ font-size: 1.75rem; font-weight: 700; }}
    table {{ width: 100%; border-collapse: collapse; background: #fff; margin-top: 1.5rem; font-size: 0.875rem; }}
    th, td {{ border: 1px solid #e1e4e8; padding: 0.5rem; text-align: left; }}
    th {{ background: #eaeef2; }}
    tr.pass td:first-child {{ border-left: 4px solid #2da44e; }}
    tr.fail td:first-child {{ border-left: 4px solid #cf222e; }}
    ul {{ background: #fff; padding: 1rem 1.5rem; border-radius: 8px; }}
  </style>
</head>
<body>
  <h1>Agent Learning Hub — Eval Report</h1>
  <div class="cards">
    <div class="card"><div class="val">{summary['passed']}/{summary['total']}</div>Passed</div>
    <div class="card"><div class="val">{summary['success_rate']}%</div>Success rate</div>
    <div class="card"><div class="val">{summary['avg_tool_calls']}</div>Avg tool calls</div>
    <div class="card"><div class="val">{summary['avg_latency_ms']}ms</div>Avg latency</div>
  </div>
  <h2>Failure taxonomy</h2>
  <ul>{failure_rows}</ul>
  <h2>Tasks</h2>
  <table>
    <thead><tr><th>Task</th><th>Success</th><th>Failure</th><th>Tools</th><th>Latency</th><th>Notes</th></tr></thead>
    <tbody>{body_rows}</tbody>
  </table>
</body>
</html>
"""


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--results", type=Path, default=Path("evals/results.csv"))
    parser.add_argument("--out", type=Path, default=Path("evals/report.html"))
    args = parser.parse_args()

    rows = load_results(args.results)
    if not rows:
        print("No results to render")
        return 1

    summary = summarize_results([{k: v for k, v in row.items()} for row in rows])
    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(render_html(rows, summary), encoding="utf-8")
    print(f"Wrote {args.out}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
