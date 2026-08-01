# Stage 8 增量交付工作流

> **规则：每完成 1 个文件 → 提 MR → merge 到 `main` → 再开始下一步。**  
> 这样每次 merge 都会计入 GitHub 贡献（独立仓库 + 邮箱已关联时）。

对 Agent 说：「继续 Stage 8 Step N」即可；若已配置 GitHub MCP，会自动开分支并提 MR。

## 进度

| Step | 文件 | 状态 | MR |
|------|------|------|-----|
| 1 | [README.md](README.md) | ✅ 完成 | #5 |
| 2 | `.env.example` | ✅ 完成 | #6 |
| 3 | `requirements.txt` | ✅ 完成 | #7 |
| 4 | `common.py` | ✅ 完成 | #8 |
| 5 | `tools.py` | ✅ 完成 | #9 |
| 6 | `safety.py` | ✅ 完成 | #10 |
| 7 | `agent.py` | ✅ 完成 | #11 |
| 8 | `cli.py` | ✅ 完成 | #12 |
| 9 | `step01_smoke.py` | ✅ 完成 | #13 |
| 10 | 主 README Stage 8 区块 | 🔄 进行中 | — |

---

## Step 1 — `README.md`

**交付**：项目说明、用户/任务/成功标准、目录规划。

```bash
git checkout main && git pull
git checkout -b stage-8/step-01-readme
# 仅添加 stage-8/README.md
git add stage-8/README.md
git commit -m "feat(stage-8): add project README and success criteria"
git push -u origin stage-8/step-01-readme
# 开 MR → merge
```

### ⛔ 停止

**merge 到 `main` 后再做 Step 2。**

---

## Step 2 — `.env.example`

**交付**：API key、成本上限、超时等环境变量模板。

```bash
git checkout main && git pull
git checkout -b stage-8/step-02-env
git add stage-8/.env.example
git commit -m "feat(stage-8): add environment variable template"
git push -u origin stage-8/step-02-env
```

### ⛔ 停止 — merge 后再 Step 3

---

## Step 3 — `requirements.txt`

**交付**：stage-8 最小依赖。

### ⛔ 停止 — merge 后再 Step 4

---

## Step 4 — `common.py`

**交付**：配置加载、结构化日志、trace 写入、成本计数器。

### ⛔ 停止 — merge 后再 Step 5

---

## Step 5 — `tools.py`

**交付**：`read_file`、`calc` 等工具 schema + 执行器。

### ⛔ 停止 — merge 后再 Step 6

---

## Step 6 — `safety.py`

**交付**：block / approval_required / allow（复用 Stage 7 思路）。

### ⛔ 停止 — merge 后再 Step 7

---

## Step 7 — `agent.py`

**交付**：带重试、超时、步数上限、trace 的 agent loop。

### ⛔ 停止 — merge 后再 Step 8

---

## Step 8 — `cli.py`

**交付**：CLI 部署入口（`python cli.py "任务"`）。

### ⛔ 停止 — merge 后再 Step 9

---

## Step 9 — `step01_smoke.py`

**交付**：无 API key 也能跑的 smoke test（mock 或 dry-run）。

### ✅ 完成

更新主 [README.md](../README.md) Stage 8 区块，勾选检查项，再开最后一个 MR。

---

## 本地快速命令

```bash
# 查看当前 step
grep -n "待做\|进行中" stage-8/SHIP_WORKFLOW.md | head -3

# merge 后同步
git checkout main && git pull
```
