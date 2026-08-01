---
类型: 概念
主题: 自我进化
tags: [AI智能体知识库, 自我进化]
创建: 2026-07-30
复习: 
状态: 已完成
---

# Reflexion 口头强化学习

## 一句话定义
> Reflexion 是"用自然语言当强化信号"的自我进化方法：每次试错后，Agent 写一句"我为什么失败"的反思存进记忆，下一次尝试带着这句反思重来——不更新权重、不跑梯度，纯靠语言在多次试验间传递经验。

## 它解决什么问题 / 为什么存在
- 一个 Agent 失败了。标准 RL 要跑几千次试验、算梯度、更新权重——贵、慢，且多数生产 Agent 没有为每个失败准备的训练预算。
- Reflexion（Shinn et al., NeurIPS 2023）换个问法：让 Agent 想想"为什么挂了"，把这句想法放进 prompt 再试一次，行不行？结果在 ALFWorld 胜过 ReAct、HotpotQA 提升、代码生成（HumanEval/MBPP）当时 SOTA——全程零梯度步。

## 核心原理（大二能懂的水平）
- **三个组件 + 一个数据结构**：
  - `Actor`：生成轨迹（ReAct 式循环）。
  - `Evaluator`：给轨迹打分——二元 / 启发式 / 自我评估。
  - `Self-Reflector`：对失败写一句自然语言反思（如"我选错工具，因为把问 X 的题误读成问 Y"）。
  - `Episodic memory`：过往反思列表，prepend 到下一次试验的 prompt。
- 一次试验：Actor 跑 → Evaluator 打分 → 低分则 Self-Reflector 产出反思存入记忆 → 下次试验全新开始但能看到反思。
- **三类 Evaluator**：
  1. 标量（外部二元信号）：ALFWorld 成功/失败、HumanEval 测试过/不过。最简单、信号最强。
  2. 启发式：预定义失败特征（"同样动作连出两次=卡住""轨迹超 50 步=低效"）。
  3. 自我评估：LLM 给自己的轨迹打分。无真值时用，信号弱，宜配工具验证（CRITIC）。
  - 2026 默认混用：有标量用标量，无则自我评估，启发式当安全护栏。
- **为什么是模式而非新算法**：几乎所有生产"自愈"Agent 都跑某个变体——Letta 的 sleep-time compute（空闲时反思写记忆块）、Claude Code 的 CLAUDE.md / "save memory"（反思存为 learnings）、pro-workflow 的 /learn-rule（纠错存为显式规则）、LangGraph 的 reflection 节点。共同洞见：自然语言足够丰富，能在多次运行间承载"我从失败中学到什么"。

## 关键参数 / 易错点
- **何时有用**：有清晰失败信号（测试挂/工具错/答错）；任务类可复现；反思有改进空间（动作预算够）。
- **何时没用**：首次就成功；失败是外部的（网络挂、工具坏——反思"网络挂了"对将来无益）；反思变成"迷信"——把一次偶发 flaky 跑当普遍规律记下来。
- **2026 坑：记忆腐烂（memory rot）**：反思越积越多，部分过时或错误，重跑随缓冲增大变慢。缓解：定期压缩、给反思加 TTL、或用独立 sleep-time 清理 Agent（Letta）。
- **对抗性 Actor**：若 Actor 忽略反思，需最小 prompt 工程强制它"注意反思"。

## 类比（帮助理解）
- 像考完试订正错题本：不重新训练大脑（不更新权重），只是把"这道题我错在 X"写进本子，下次考前翻一眼。
- 像运动员赛后录像复盘：写下"我为什么丢分"，下场带这笔记，不靠肌肉记忆重练。

## 设计时怎么用（反推思维）
> 做会反复试错的自愈 Agent 时，我会先反推"失败信号从哪来、经验要不要跨次保留"：有自动判分→用标量 Evaluator + 反思存入 episodic memory；要长期进化→把反思外化为可压缩/带 TTL 的记忆（避免腐烂）。并区分"可改的失败"与"外部故障"，后者不值得反思。

## 典型应用 / 我在哪见过
- Letta sleep-time compute、Claude Code /memory 与 pro-workflow /learn-rule、LangGraph reflection 节点、OpenAI Agents SDK 用 Guardrail 按分拒轨迹 + 跨运行 Session 实现。

## 关联
- 前置知识：[[反思 Reflection]]、[[自我改进]]
- 相关：[[自我进化]]、[[Self-Refine 自我纠错]]、[[经验学习]]
- 反例/误区：以为反思总能加速——外部故障/迷信式反思反而拖累；反思无界累积导致 memory rot。

## 来源
- AIEFS Vol.5 Agents, Ch.56 Reflexion: Verbal Reinforcement Learning
- Shinn et al., Reflexion (arXiv:2303.11366)
- 关联模式见 Letta Sleep-time Compute、Anthropic 上下文工程（episodic buffer 管理）
