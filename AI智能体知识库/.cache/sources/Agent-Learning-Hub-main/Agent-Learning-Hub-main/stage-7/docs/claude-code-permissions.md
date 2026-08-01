# Claude Code 权限控制原理与 Stage 7 安全门禁对照

> 面向 Agent Learning Hub 学习者：读完本文，你应能解释 Claude Code（CC）如何在每次工具调用前做权限决策，并知道 Stage 7 的 `safety_gate.py` 对应生产系统里的哪一层。

## 为什么需要权限控制

Coding Agent 和普通 Chatbot 的最大差别之一，是它会 **真的执行动作**：跑 shell、改文件、发请求、连 MCP 工具。

如果没有权限门控，Agent 只有两种极端：

- 全自动：快，但危险（误删文件、越权、被 prompt injection 利用）
- 全人工：安全，但无法自动化

Claude Code 的设计目标是 **在自主性和安全之间取平衡**：

1. 默认要求确认
2. 多层独立检查
3. 用户决策可持久化
4. 企业策略可覆盖个人设置

---

## 一、全局模式：先看大开关

在检查具体工具之前，CC 先看当前 `PermissionMode`：

| 模式 | 含义 | 典型场景 |
| --- | --- | --- |
| `default` | 按规则判断，必要时弹窗 | 日常开发 |
| `plan` | 只读探索，禁止写操作 | 先规划再动手 |
| `bypassPermissions` | 跳过全部权限检查 | CI/CD、完全受信环境 |

### Plan 模式

进入 plan 模式后，所有 **写操作** 会被拦截，只读工具（Read、Search 等）仍可用。模型需要通过 `ExitPlanMode` 退出规划，用户确认后才允许执行变更。

这相当于给 Agent 加了一个 **“只思考、不落地”** 的安全 sandbox。

### bypassPermissions 模式

开启条件非常严格，一般只在自动化流水线中使用。此模式下 Agent 可以不经确认执行任何工具——**风险极高**，不应在本地开发机默认开启。

---

## 二、规则引擎：allow / deny / ask

CC 的权限配置核心是 `ToolPermissionContext`，里面有三张规则表：

```text
alwaysDenyRules   → 命中即拒绝（最高优先级）
alwaysAllowRules  → 命中即放行
alwaysAskRules    → 命中即强制弹窗
```

### 规则来源与优先级

```text
enterprise（企业策略，用户不可覆盖）
  ↓
project（.claude/settings.json）
  ↓
user（~/.claude/settings.json）
  ↓
session（当前会话临时授权）
```

### 配置示例

```json
{
  "permissions": {
    "allow": [
      "Bash(git *)",
      "Bash(npm run *)",
      "Read(*)"
    ],
    "deny": [
      "Bash(rm -rf *)",
      "Bash(sudo *)"
    ],
    "ask": [
      "Bash(curl *)"
    ],
    "defaultMode": "default"
  }
}
```

规则不是简单的工具名，而是 **带 pattern 的匹配**：

- `Bash(git *)` 可匹配 `git commit -m 'fix'`
- `Read(*)` 允许读取任意文件
- `Bash(sudo *)` 直接封死 sudo

---

## 三、一次工具调用的完整链路

模型发起 tool call 后，**执行前**会经过这条 permission gate：

```text
① validateInput()
   └── 输入格式/语义校验；失败则直接返回给模型，不弹 UI

② 检查 PermissionMode
   ├── bypassPermissions → 直接执行
   └── plan + 写操作 → 拒绝

③ alwaysDenyRules
   └── 命中 → 立即拒绝

④ alwaysAllowRules
   └── 命中 → 直接放行

⑤ tool.checkPermissions()
   └── 工具专属逻辑（Bash 最复杂）

⑥ PreToolUse Hook
   └── 用户自定义脚本：allow / deny / ask

⑦ Auto Classifier（Auto Mode）
   └── LLM 分类器预判安全性

⑧ 用户确认 UI
   ├── Allow Once → 仅本次
   ├── Allow Always → 写入 settings
   └── Deny → 拒绝并记录
```

### 两个关键设计点

**validateInput 与 checkPermissions 分离**

- `validateInput`：业务校验（路径是否存在、old_string 是否唯一）
- `checkPermissions`：安全决策（能不能做）

输入不合法时，不应浪费用户注意力弹权限窗。

**Hooks 是叠加层，不是替代品**

PreToolUse Hook 跑在用户配置的 shell 脚本上，可以在内置规则之外再加一层 allow/deny/ask。PostToolUse 则在执行后做审计或输出拦截。

---

## 四、Bash 与文件路径：最复杂的两类权限

### Bash 命令匹配

Bash 不会只看工具名，而是解析命令语义：

```text
命令: git commit -m 'fix'
提取前缀: git commit
规则: Bash(git *)
结果: 匹配 → allow
```

源码里用 `preparePermissionMatcher` 优化性能：命令只解析一次，再对多条规则批量匹配。

### 文件路径校验

文件读写/edit 还有路径级检查：

- 是否在工作目录内
- `additionalDirectories` 是否包含目标路径
- deny 规则是否覆盖该路径

因此 CC 的权限不只是「能不能用 Bash」，还包括 **「能不能碰这个路径」**。

---

## 五、用户确认如何被记住

用户在弹窗里点 **Allow Always** 后，决策会持久化：

| scope | 写入位置 | 生效范围 |
| --- | --- | --- |
| `session` | 内存 | 当前会话 |
| `project` | `.claude/settings.json` | 当前项目 |
| `global` | `~/.claude/settings.json` | 所有项目 |

这就是为什么第一次会问、之后同类操作可能自动放行。

---

## 六、DenialTracking：防止 Agent 死磕

如果某个工具连续被拒绝（默认阈值 3 次），系统会 fallback 到提示模式，避免模型反复尝试同一被拒绝的操作。

子 Agent 还有独立的 `localDenialTracking`，避免污染主线程状态。这在 multi-agent 场景里很重要：子任务被拒绝不应错误地影响主会话的权限计数。

---

## 七、与 Stage 7 `safety_gate.py` 的对照

Stage 7 的教学代码是生产级 permission gate 的 **极简教学版**：

| Claude Code | Stage 7 示例 |
| --- | --- |
| `alwaysDenyRules` | `INJECTION_PATTERNS` → `block` |
| `alwaysAskRules` + UI | `approval_required` |
| `alwaysAllowRules` | `allow` |
| `DenialTracking` | eval 失败计数 + 回归测试 |
| `PermissionUpdate` | 用户确认后写入 settings |
| PreToolUse Hook | 可扩展的外部脚本层 |
| Auto Classifier | 未来可接 LLM 安全分类器 |

Stage 7 的 `classify_request()` 只有三类决策：

```python
"block"              # 直接拒绝（如 prompt injection）
"approval_required"  # 需要人工确认（如删除、发邮件）
"allow"              # 可继续
```

CC 的工程化程度远高于此：pattern 匹配、分 source、plan 模式、路径校验、企业远程策略、telemetry 追踪。

### 对照实验建议

1. 运行 `python step03_safety_gate.py`，观察三类输入的决策
2. 打开 `evals/tasks.csv` 里 `safety-*` 任务，看 `must_have` / `must_not` 如何约束 Agent 行为
3. 阅读 [stage-3/claude-code-docs/06-权限系统.md](../../stage-3/claude-code-docs/06-权限系统.md)，对照完整链路

---

## 八、实战配置建议

### 日常开发（推荐起点）

```json
{
  "permissions": {
    "allow": ["Bash(git *)", "Bash(npm run *)", "Read(*)"],
    "deny": ["Bash(sudo *)", "Bash(rm -rf *)"],
    "defaultMode": "default"
  }
}
```

### 先规划再执行

1. 进入 plan 模式，只读探索代码库
2. 确认改动方案
3. 退出 plan，再执行 FileEdit / Bash

### CI 自动化

- 仅在受信 runner 上开启 `bypassPermissions`
- 用 `deny` 封死 `sudo`、`rm -rf`、网络 exfil 类命令
- 配合 eval 回归，防止 prompt 改动导致权限行为退化

---

## 九、学习路径建议

如果你正在学 Stage 5–7，推荐顺序：

```text
Stage 5  → 写 Skill，定义「这类任务怎么做、怎么验收」
Stage 6  → Browser Agent，学「观察 → 动作 → 证据 → 遇阻即停」
Stage 7  → Eval + Safety Gate，学「固定任务测 Agent、trace 查失败、gate 拦风险」
CC 权限  → 看生产级 permission gate 如何把上述思想工程化
```

对应仓库文件：

| 主题 | 路径 |
| --- | --- |
| CC 权限源码导读 | [stage-3/claude-code-docs/06-权限系统.md](../../stage-3/claude-code-docs/06-权限系统.md) |
| Stage 7 安全门禁代码 | [../safety_gate.py](../safety_gate.py) |
| Stage 7 安全策略 | [../safety/policy.md](../safety/policy.md) |
| Stage 7 eval 任务 | [../evals/tasks.csv](../evals/tasks.csv) |

---

## 十、一句话总结

Claude Code 的权限控制不是一句 system prompt，而是围绕 **每次 tool call** 构建的多层 permission gate：**全局模式 → 分层规则 → 工具级 check → Hooks → 分类器 → 用户确认 → 决策持久化 → 拒绝追踪**。

Stage 7 的 `safety_gate.py` 帮你用 40 行代码理解这套思想的内核；CC 源码则展示了如何把它做成可配置、可审计、可企业管控的生产系统。

---

## 延伸阅读

- [Claude Code Tool 系统 — 权限检查四层结构](../../stage-3/claude-code-docs/01-Tool系统.md)
- [Claude Code Hooks](../../stage-3/claude-code-docs/10-CLI入口.md)
- [Stage 7 README — Evaluation, Observability, And Safety](../README.md)
