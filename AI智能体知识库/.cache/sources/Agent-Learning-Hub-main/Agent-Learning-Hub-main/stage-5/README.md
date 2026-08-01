# Stage 5：Skills, Protocols, And Capability Packaging

把一类 agent 能力从「临时 prompt」升级成可复用、可测试、可分发的 skill。完成这一阶段后，你应该能写出一个结构清晰的 `SKILL.md`，并能解释它和 tool、MCP、A2A、ACP 的关系。

对应主 README 的检查项：

| 检查项 | 对应文件 |
| --- | --- |
| 区分 Skill 和 Tool | `step01_boundaries.py` |
| 区分 Skill 和 Prompt | Day 1 练习 + `step01_boundaries.py` |
| 区分 Skill 和 MCP | `step01_boundaries.py` |
| 阅读 Claude Code / OpenClaw Skills | Day 2 文档 |
| 写最小 `SKILL.md` | `my-skill/SKILL.md` + `step02_load_skill.py` |
| 加脚本或模板文件 | `my-skill/templates/` + `my-skill/scripts/smoke_check.py` |
| 写 smoke test | `step04_run_smoke_cases.py` + `my-skill/tests/smoke.md` |
| **产出**（可复用 skill） | `my-skill/` |

---

## 0. 材料准备（10 分钟）

```bash
cd stage-5
python step01_boundaries.py
python step02_load_skill.py
python step04_run_smoke_cases.py
```

这一阶段不要求先写复杂代码，重点是把流程知识结构化。

建议准备一个你真实会复用的任务，例如：

- code-review：检查 diff 风险、缺测试、兼容性问题
- research-report：从资料生成带引用报告
- migration-helper：迁移 API / 配置 / 数据结构
- pdf-extraction：抽取 PDF 表格、图片、引用
- release-note-writer：从 commit / PR 生成发布说明
- **teach**（[skills/teach/](../skills/teach/)）：让 AI 充当私人导师，按"知识-技能-智慧"方式引导学习——当你自己学习这个仓库时，可以直接用这个 skill

建议目录：

```text
stage-5/
  my-skill/
    SKILL.md
    templates/
      output.md
    scripts/
      smoke_check.py
    tests/
      smoke.md
```

本目录已经提供一套可直接参考的最小示例：`my-skill/`。

---

## 1. 三个边界先分清

| 概念 | 负责什么 | 不负责什么 |
| --- | --- | --- |
| Prompt | 一次性指令、语气、格式约束 | 长期维护、资源组织、自动发现 |
| Tool | 可执行接口，例如搜索、读文件、发请求 | 告诉 agent 何时用、如何组合 |
| Skill | 可复用流程知识、模板、脚本、验收标准 | 代替真实工具执行 |

一句话判断：

```text
如果它是「一次对话里的写法」，多半是 prompt。
如果它是「机器可以调用的函数」，多半是 tool。
如果它是「一类任务的操作手册 + 资源包」，多半是 skill。
```

---

## 2. 学习顺序（建议 3-4 天）

每天跟一步；**标了 ✍️ 的建议自己敲一遍**。

### Day 1 — 从 prompt 改写成 skill

先写一个你平时会复制粘贴的 prompt，再把它拆成 skill。

**你要理解的概念**

- skill 的触发条件要具体，不能写成“所有任务都用我”
- skill 应该告诉 agent 何时加载额外文件，避免上下文污染
- skill 的价值在于降低重复解释成本，而不是堆更多规则

**✍️ 手写练习**

1. 写一段 10 行以内的 prompt，描述一个你常做的任务。
2. 把它拆成四段：何时使用、步骤、输出格式、验收标准。
3. 写一个反例：这个 skill 不应该在什么场景使用？

---

### Day 2 — 协议和能力包的分层

阅读：

- [Claude Code Skills](https://code.claude.com/docs/en/skills)
- [Claude Agent Skills](https://docs.claude.com/en/docs/agents-and-tools/agent-skills)
- [OpenClaw Skills](https://github.com/openclaw/openclaw/blob/main/docs/tools/skills.md)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [Agent2Agent Protocol](https://google-a2a.github.io/A2A/specification/)
- [Agent Client Protocol](https://agentclientprotocol.com/)

**你要理解的分层**

```text
User task
  -> Skill: 任务流程、策略、模板、验收标准
  -> Tool / MCP: 连接真实工具和数据源
  -> A2A: agent 之间发现和协作
  -> ACP: 宿主应用和 agent 的交互接口
```

**✍️ 手写练习**

4. 画出你的 skill 需要哪些真实工具：文件、搜索、浏览器、数据库、CLI。
5. 标注哪些工具适合本地函数，哪些适合 MCP server。

---

### Day 3 — 写最小 `SKILL.md`

建议从这个骨架开始：

```markdown
---
name: my-skill
description: Use when ...
---

# My Skill

## When To Use

## Inputs

## Steps

## Output

## Verification

## When Not To Use
```

**✍️ 手写练习**

6. 在 `my-skill/SKILL.md` 里填完整触发条件。
7. 加一个 `templates/output.md`，约束最终产物结构。
8. 加一个 `scripts/smoke_check.py` 或等价脚本，检查输出是否包含必要字段。

---

### Day 4 — Smoke Test 和迭代

一个 skill 没有测试，很容易变成“看起来很完整的 prompt 噪声”。

建议写 3 个 smoke case：

| Case | 输入 | 期望 |
| --- | --- | --- |
| happy path | 资料完整、目标明确 | 输出符合模板 |
| missing info | 缺关键信息 | agent 会先问问题 |
| out of scope | 不该使用该 skill | agent 不强行套模板 |

**✍️ 手写练习**

9. 写 `tests/smoke.md`，包含 3 个 case。
10. 让 agent 用你的 skill 跑一次，记录失败点。
11. 只改 skill 文档，不改用户请求，再跑一次，看成功率是否提升。

示例检查脚本：

```bash
cd stage-5
python my-skill/scripts/smoke_check.py my-skill/samples/good_report.md
python step04_run_smoke_cases.py
```

**完成标准**

- [ ] `SKILL.md` 能让另一个人读懂何时使用、如何执行
- [ ] skill 至少包含一个模板或脚本资源
- [ ] smoke test 覆盖 happy path、missing info、out of scope
- [ ] 你能解释：这个 skill 需要哪些 tool / MCP 支撑
- [ ] 你能指出：什么情况下不应该加载这个 skill

---

## 3. 文件说明

| 文件 | 作用 |
| --- | --- |
| `README.md` | Stage 5 学习指南 |
| `skill_common.py` | 加载/校验 `SKILL.md` |
| `report_check.py` | 校验 review report 输出格式 |
| `step01_boundaries.py` | Prompt / Tool / Skill / 协议边界 |
| `step02_load_skill.py` | 校验示例 skill |
| `step03_validate_report.py` | 校验单个 report |
| `step04_run_smoke_cases.py` | 跑 smoke cases |
| `my-skill/SKILL.md` | 示例 skill 定义 |
| `my-skill/templates/review_report.md` | 输出模板 |
| `my-skill/samples/good_report.md` | 通过 smoke 的示例报告 |
| `my-skill/samples/bad_report.md` | 故意失败的反例 |
| `my-skill/scripts/smoke_check.py` | CLI 版 report 校验 |
| `my-skill/tests/smoke.md` | smoke case 说明 |
| `../skills/teach/SKILL.md` | teach skill 参考——本仓库自带的 AI 导师 skill，学习时可直接使用 |

---

## 4. 常见问题

**Q: Skill 是不是越详细越好？**  
不是。skill 要写“稳定复用的流程”，不要把一次任务的所有背景都塞进去。

**Q: 什么时候应该写 tool，而不是 skill？**  
当你需要真实执行动作，比如查数据库、调用 API、读文件、跑命令，就应该写 tool。skill 只负责告诉 agent 怎么组织这些动作。

**Q: Skill 会不会污染上下文？**  
会。触发条件越泛、内容越长，越容易污染。好的 skill 应该让 agent 只在任务需要时加载必要资源。

---

## 5. 学完后

1. 回到根目录 [README.md](../README.md)，勾选 Stage 5 八项。  
2. 进入 [Stage 6](../stage-6/)：把浏览器或桌面操作接成可观察、可恢复、可审计的 agent 行为。
3. 如果你对 skill 的结构还有疑问，可以参见 [skills/teach/SKILL.md](../skills/teach/SKILL.md)——它是本仓库自带的完整 skill 示例，同时也是一个实用工具，供你学习仓库内容时直接使用。

有问题时，优先检查 **When To Use** 是否太泛，以及 smoke test 是否真的覆盖了失败场景。
