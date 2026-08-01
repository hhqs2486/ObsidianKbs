# Skill 是什么，不是什么

Stage 5 的核心判断：

> Skill 是可复用、可版本化、可分发的能力包；它既不是一次性 prompt，也不是工具本身。

这篇笔记厘清 Skill 与 Tool / Prompt / MCP 的边界，避免"把一段长 prompt 当成 skill"的常见错误。

---

## 1. 先给结论

| 概念 | 是什么 | 不是什么 |
| --- | --- | --- |
| Tool | 可调用接口（函数） | 一串流程知识 |
| Prompt | 一次性指令 | 可发现、可复用资产 |
| MCP | 接外部工具/数据源的协议 | agent 内部能力 |
| **Skill** | 何时用 + 怎么做 + 如何验收的流程包 | 单个函数或单句指令 |

Skill = 触发器 + 步骤 + 资源（脚本/模板）+ 验收标准。

---

## 2. 一个最小 SKILL.md

```markdown
---
name: release-note-writer
description: 根据 git diff 生成发布说明。当用户要"写 release notes / 总结改动"时使用。
---

## 何时使用
用户提供了 diff / 提交范围，要求产出变更的读者友好总结。

## 步骤
1. 读取 diff，归类（feature / fix / chore）
2. 对每条写一句用户视角的说明
3. 套用 templates/release.md 模板

## 验收
- 不含内部分支名噪音
- 每条改动有"对用户意味着什么"
```

注意：逻辑尽量抽到 `scripts/`，SKILL.md 只描述"做什么"，不堆大段代码。

---

## 3. 常见误区

- **把长 prompt 当 skill**：prompt 用完即弃，skill 要可被发现、可复用、可版本化。
- **skill 里塞大段逻辑不抽脚本**：agent 每次把整段塞进上下文，既贵又易错。把可执行部分放 `scripts/`。
- **没有触发条件**：`description` 写得太泛，agent 不知道什么时候该用，等于没装。
- **没有验收标准**：写完无法判断是否真的提升任务成功率。

---

## 4. 工程建议

- 每个 skill 配一个 smoke test（`step04_run_smoke_cases.py` 思路）：用固定输入验证输出合格；
- `description` 用"当用户……时使用"句式，明确触发场景；
- 资源（模板、脚本）随 skill 一起分发，避免运行时缺文件；
- 把 skill 当"小型操作手册"维护：能更新、能回滚、能对比效果。

对应代码见 `stage-5/`。

---

## 5. 自测题

1. 给"根据用户问题查数据库"的能力选 Tool 还是 Skill？为什么？
2. 什么情况下一段 prompt 升级成 skill 才合理？
3. skill 里的可执行逻辑应该放在哪里，为什么不要全写进 SKILL.md？
4. 没有 `description` 触发条件的 skill，对 agent 意味着什么？
