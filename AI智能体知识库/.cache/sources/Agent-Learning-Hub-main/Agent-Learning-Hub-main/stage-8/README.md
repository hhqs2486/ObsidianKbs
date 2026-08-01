# Stage 8: Ship A Real Agent

一个可 clone、可配置、可观测的 **CLI Agent** 最小产品，整合 Stage 1（agent loop）与 Stage 7（安全门禁 / trace / eval 思维）。

## 用户与任务

| 项 | 定义 |
|----|------|
| **用户** | 会一点 Python、想跑通「真实 agent 产品形态」的开发者 |
| **任务** | 用自然语言下达任务；agent 在权限边界内选工具、执行、给出可验证结果 |
| **成功标准** | ① 30 秒内跑起 CLI；② 高风险操作触发人工确认；③ 每次运行有 trace 日志；④ 超步数/超时/成本上限可预期失败 |

## 能力清单（对应主 README Stage 8）

- [x] 明确用户、任务、成功标准（本文档）
- [x] 日志、trace、错误重试、超时、成本上限 → `common.py` + `agent.py`
- [x] 权限边界与人工确认 → `safety.py`
- [x] CLI 部署 → `cli.py`
- [x] 运行 / 配置 / 扩展说明 → 见下方快速开始

## 目录

```text
stage-8/
  README.md           # 本文件
  SHIP_WORKFLOW.md    # 增量 MR 工作流（9 步已完成）
  .env.example
  requirements.txt
  common.py           # 配置、日志、trace、成本
  tools.py            # calculator + read_file
  safety.py           # 安全门禁
  agent.py            # agent loop
  cli.py              # CLI 入口
  step01_smoke.py     # smoke test
  traces/             # 运行后生成
```

## 快速开始

```bash
cd stage-8
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # 填入 OPENAI_API_KEY

# 无 API key 可先验证
python step01_smoke.py

# 真实运行
python cli.py "读取 stage-1/notes.txt 并总结内容"

# 高风险任务需人工确认
python cli.py --approve "删除生产环境备份"
```

## 扩展工具

在 `tools.py` 中：

1. 添加 `TOOL_SCHEMAS` 条目
2. 实现对应函数
3. 在 `run_tool()` 中分发

## 限制（v1）

- 仅 CLI，无 Web / Bot / GitHub Action
- 工具集：读仓库内文件 + 计算器
- 需要 OpenAI 兼容 API；`AGENT_DRY_RUN=true` 可离线 smoke

## 状态

**Stage 8 已完成**（Step 1–9 全部 merge）。详见 [SHIP_WORKFLOW.md](SHIP_WORKFLOW.md)。
