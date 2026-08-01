#!/usr/bin/env bash
# Create good first issues on GitHub (requires gh auth login).
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

if ! command -v gh >/dev/null 2>&1; then
  echo "Install GitHub CLI: brew install gh && gh auth login"
  exit 1
fi

if ! gh auth status >/dev/null 2>&1; then
  echo "Run: gh auth login"
  exit 1
fi

create_issue() {
  local title="$1"
  local body="$2"
  if gh issue list --search "$title in:title" --json title --jq '.[].title' | grep -Fq "$title"; then
    echo "SKIP (exists): $title"
  else
    gh issue create --title "$title" --label "good first issue,help wanted" --body "$body"
    echo "CREATED: $title"
  fi
}

create_issue "[新手任务] 在 README 快速开始补充 bootstrap 说明" \
"目标：README 快速开始区块链接 scripts/bootstrap.sh 并说明 smoke test 步骤。

范围：README.md

验收标准：
- Quick start 含 ./scripts/bootstrap.sh
- 说明 check_github_setup.sh 用途"

create_issue "[新手任务] 为 stage-1 README 添加英文摘要" \
"目标：stage-1/README.md 增加 English summary 段落（不改代码）。

范围：stage-1/README.md

验收标准：
- 至少 1 段 English overview
- 保留现有中文内容"

create_issue "[新手任务] 新增 1 条 skill 相关 eval 任务" \
"目标：stage-7/evals/tasks.csv 新增 1 条 skill 相关 eval 任务。

范围：evals/tasks.csv + 必要时 TEACHING_RESPONSES

验收标准：
- 新增 1 行有效 eval 任务
- 相关 smoke / eval 可跑通"

create_issue "[新手任务] 修复 README 失效资源链接" \
"目标：扫描 README Curated Resources，修复失效链接或标注 archived。

范围：README.md

验收标准：
- 检查并修复/标注所有失效外链
- PR 描述列出改动链接清单"

create_issue "[新手任务] 优化 index.html 移动端布局" \
"目标：index.html 在窄屏下 stage 导航不溢出。

范围：index.html CSS only

验收标准：
- 375px 宽度下布局正常
- 不破坏桌面端现有样式"

echo "Done. Labels may need to exist — create 'good first issue' and 'help wanted' in repo settings if missing."
