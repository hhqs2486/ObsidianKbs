# Stage 6：Browser And Computer-Use Agents

学习让 agent 操作公开网页或桌面 UI：观察页面、选择动作、执行点击/输入、处理失败，并把每一步记录下来。完成这一阶段后，你应该能做一个只访问公开网页的 browser agent，并说明它的安全边界。

对应主 README 的检查项：

| 检查项 | 对应文件 |
| --- | --- |
| 区分 browser agent 和 API tool | `step01_validate_url.py` + Day 1 概念表 |
| 用 Playwright 做观察和点击 | `step02_observe_page.py` + `browser-agent/agent.py` |
| 给浏览器操作加安全限制 | `browser-agent/policies.md` + `browser_common.py` |
| 处理页面变化、加载失败、定位失败 | `browser_common.py` + `browser-agent/agent.py` |
| 记录截图、DOM、动作日志 | `browser-agent/agent.py` |
| **产出**（公开网页 browser agent） | `browser-agent/agent.py` |

---

## 0. 环境准备（15-30 分钟）

任选一条路线即可。

### 路线 A：Playwright（推荐先学）

```bash
cd stage-6
python3 -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
playwright install chromium
```

验证：

```bash
python step01_validate_url.py https://example.com
python step02_observe_page.py https://example.com
python step03_run_agent.py https://example.com
```

### 路线 B：browser-use

```bash
cd stage-6
python3 -m venv .venv
source .venv/bin/activate
pip install browser-use
playwright install chromium
```

适合看完整 browser agent 产品形态，但建议先理解 Playwright 的基础动作。

---

## 1. 先立安全边界

这一阶段只做公开网页，不做敏感账号、不绕过验证码、不批量抓取、不越权访问。

建议写在 agent system prompt 或配置里：

```text
Allowed:
- 访问公开网页
- 提取页面中已经可见的信息
- 点击普通导航、筛选、展开按钮
- 记录截图、DOM、动作日志

Not allowed:
- 登录个人账号或企业账号
- 绕过验证码、付费墙、权限限制
- 删除、购买、发送消息、提交表单
- 批量爬取或违反 robots / 平台规则
```

---

## 2. 学习顺序（建议 3-5 天）

每天跟一步；**标了 ✍️ 的建议自己敲一遍**。

### Day 1 — Browser Agent 和 API Tool 的区别

| 维度 | API Tool | Browser Agent |
| --- | --- | --- |
| 输入 | 结构化参数 | 页面视觉/DOM/文本 |
| 动作 | 调接口 | 点击、输入、滚动、等待 |
| 失败 | HTTP 错误、schema 错误 | 元素消失、页面变更、遮挡、弹窗 |
| 证据 | 响应 JSON | screenshot、DOM、network、console |
| 风险 | API 权限越界 | 账号、隐私、误点击、平台规则 |

**✍️ 手写练习**

1. 选一个公开网页，写出 5 个可允许动作和 5 个禁止动作。
2. 把“打开网页并提取标题”分别写成 API tool 思路和 browser agent 思路。

---

### Day 2 — 最小观察-动作循环

目标：打开公开网页，读取标题和正文片段，保存截图。

最小数据流：

```text
user 目标
  -> navigate(url)
  -> observe(title, url, visible text, screenshot path)
  -> decide(action)
  -> act(click / fill / wait / extract)
  -> log(step)
```

建议动作日志格式：

```json
{
  "step": 1,
  "url": "https://example.com",
  "observation": "页面标题和主要文本",
  "action": {"type": "extract", "target": "main content"},
  "result": "success",
  "evidence": {"screenshot": "runs/001.png"}
}
```

**✍️ 手写练习**

3. 用 Playwright 打开 `https://example.com`，打印 title。
4. 保存一张截图到 `runs/`。
5. 写一个 `action_log.jsonl`，每一步追加一行 JSON。

示例代码：

```bash
cd stage-6/browser-agent
python agent.py https://example.com
```

---

### Day 3 — 失败恢复

浏览器 agent 的难点不是“会点”，而是点不到时知道怎么停、怎么换证据。

常见失败：

| 失败 | 处理方式 |
| --- | --- |
| 页面加载慢 | 短等待 + 重取 DOM，不要无限 wait |
| 元素定位失败 | 换更稳定 locator，或先搜索文本 |
| 页面结构变化 | 重新观察，不复用旧元素引用 |
| 弹窗/遮挡 | 明确识别后关闭；不确定就停止 |
| 任务进入登录页 | 停止并报告 blocker |

**✍️ 手写练习**

6. 故意写错一个 selector，捕获异常并记录失败原因。
7. 加一个最大步数，例如 `MAX_STEPS = 8`，防止循环点击。
8. 写一个 blocker 报告模板：当前 URL、目标、观察到的阻塞、建议下一步。

---

### Day 4 — 提取公开信息

目标：做一个“公开网页摘要助手”。

建议约束：

- 只接收 `http/https` URL
- 不自动登录
- 不点击破坏性按钮
- 输出必须包含来源 URL
- 每次运行都保存 action log

**✍️ 手写练习**

9. 输入一个公开文章 URL，提取标题、作者、发布时间、正文摘要。
10. 如果找不到作者或时间，输出 `未在页面可见区域找到`，不要编造。
11. 把截图路径和提取文本一起写进 `runs/<timestamp>/`。

---

### Day 5 — 加一层 Agent 决策

在前四天的确定性脚本上，再让 LLM 做动作选择。不要一开始就让模型全权控制浏览器。

建议动作 schema：

```json
{
  "action": "click | fill | wait | extract | stop",
  "target": "页面文本或 selector",
  "value": "输入内容，可选",
  "reason": "为什么下一步做这个"
}
```

**✍️ 手写练习**

12. 限制模型只能输出上面的 JSON。
13. 如果模型输出 `click`，先检查目标是否在 allowlist 中。
14. 当模型连续两次失败时，强制 `stop` 并输出失败报告。

**完成标准**

- [ ] 能解释 browser agent 和 API tool 的差别
- [ ] 能用 Playwright 或 browser-use 打开公开网页并提取信息
- [ ] 每次运行都有截图或 DOM 证据
- [ ] 每一步动作都写入 action log
- [ ] 能处理 selector 失败、加载失败、登录页 blocker
- [ ] agent 有明确 allowlist / denylist 和最大步数

---

## 3. 文件说明

| 文件 | 作用 |
| --- | --- |
| `README.md` | Stage 6 学习指南 |
| `requirements.txt` | Playwright 依赖 |
| `browser_policy.py` | URL 校验（无 Playwright 依赖） |
| `browser_common.py` | 日志、登录 blocker、DOM 摘录 |
| `step01_validate_url.py` | 公开 URL 校验 |
| `step02_observe_page.py` | 最小页面观察 |
| `step03_run_agent.py` | 调用最终 agent |
| `browser-agent/agent.py` | 公开网页 browser agent |
| `browser-agent/policies.md` | 允许/禁止动作 |
| `browser-agent/runs/` | 截图、DOM、action log |
| `browser-agent/tests/public_cases.md` | smoke cases |

---

## 4. 常见问题

**Q: 可以直接上 browser-use 吗？**  
可以，但建议先用 Playwright 写一次确定性脚本。否则很容易把 locator、等待、弹窗、日志这些基础问题误判成模型问题。

**Q: 为什么只做公开网页？**  
浏览器 agent 最容易触碰账号、隐私和平台规则。学习阶段先把动作空间收窄，才能看清观察、决策和恢复机制。

**Q: 页面变了怎么办？**  
不要假设旧 selector 永远有效。失败后重新观察页面，把当前 DOM / screenshot 作为新证据，再决定是否继续。

---

## 5. 学完后

1. 回到根目录 [README.md](../README.md)，勾选 Stage 6 五项。  
2. 进入 [Stage 7](../stage-7/)：给 agent 加 eval、trace、失败分类和安全检查。

有问题时，优先看 action log：browser agent 的 bug 通常藏在“观察到了什么”和“为什么选择这个动作”之间。
