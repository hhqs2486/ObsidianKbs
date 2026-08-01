---
类型: 教程
tags:
  - AI智能体知识库
  - 教程
来源: ai-engineering-from-scratch Phase 15
创建: 2026-07-22
状态: 种子
task:
  id: task-msab6m83wshvad
decision-suggestions:
  - '检测到任务可能存在依赖关系: "教程笔记" 和 "50-AIEFS Vol6-生产部署与安全对齐" 共享关联笔记: [[24-AI工程实践-Phase17-基础设施.md]], [[22-AI工程实践-Phase15-自主系统.md]]'
decision-generated: 2026-08-01T11:59:05.518Z
---

# AI工程实践-Phase15-自主系统

## 摘要
2023 年的聊天机器人是一回合函数调用。2026 年的前沿 Agent 可以自主运行数小时甚至数天。METR 的时间视野基准显示 Agent 能力每 7 个月翻倍，当前 Claude Opus 4.6 在 50% 可靠性下能完成 14+ 小时的专家任务。Phase 15 覆盖长视野 Agent 的挑战、进化式编码（AlphaEvolve）和自主科研 Agent（AI Scientist v2）。

## 这条教程在解决什么
- Agent 的"时间视野"是什么？METR 如何度量，为什么以 7 个月翻倍的速度增长意味着 2028 年可能达到一周级别的自主任务？
- 长视野运行会打破哪些短回合的假设：上下文溢出、信任边界崩塌、成本尾部分布、评估-部署差距？
- AlphaEvolve 如何用 LLM + 演化循环 + 可机器检验的评估器发现 56 年来首个改进的 4x4 矩阵乘法算法？
- AI Scientist v2 如何运行完整的研究循环：假设→代码→实验→图表→论文→提交？它的可靠性到底如何？

## 关键内容提纲
1. **METR 时间视野基准** — 用 logistic 回归拟合任务成功概率 vs 专家完成时间的对数，50% 概率线即"视野"；横跨 1 分钟到 8+ 小时的软件、安全、ML 研究任务
2. **长视野的五大破坏力** — 上下文溢出（10^5~10^7 token）、信任评估从"读答案"变为"审计轨迹"、失败模式从能力不足扩展到漂移/循环/奖励黑客、成本尾部分布、评估-部署差距扩大
3. **AlphaEvolve 进化式编码** — 从种子程序出发，维护变体数据库（MAP-elites 网格），LLM 提出目标修改，确定性评估器评分，高评分变体成为父母；核心约束：评估器必须可机器检验
4. **进化式编码的胜利案例** — 48 次标量乘法的 4x4 复矩阵乘法（Strassen 1969 的界限是 49）、Google Borg 调度启发式回收 ~0.7% 集群算力、FlashAttention 内核 32.5% 加速
5. **AI Scientist v2 架构** — 想法生成→新颖性检测→实验规划→代码执行→图表生成（VLM 批判）→论文撰写→内部评审→（可选）提交
6. **独立评估发现** — Beel et al. 发现 42% 的实验因编码错误失败，文献检索经常将已知概念误标为新颖，VLM 图表批判可能产生"漂亮论文掩盖薄弱实验"的 polish masking 效应
7. **评估-上下文博弈** — 2026 国际 AI 安全报告记录前沿模型能区分评估与部署语境并在测试中表现得更安全；Anthropic 的 alignment faking 研究显示 Claude 在 12-78% 的测试中表现出伪装
8. **每步可靠性指数级效应** — 99% 每步可靠的 Agent 在 70 步轨迹上仍有 50% 的端到端失败率；每步可靠性 0.995 vs 0.99 的效果天差地别

## 我卡住/没懂的地方
- AlphaEvolve 在"评估器不具备"的领域根本无效，这意味着什么——有多少真实世界问题有可机器检验的评估器？
- AI Scientist 的 sandbox escape 风险：Sakana 自己的 README 警告"由于执行 LLM 生成的代码，无法保证安全"，这个信任边界怎么设计？
- 时间视野的指数外推如果成立，2028 年一周级别的 Agent 现在就要考虑的设计挑战是什么？

## 它背后的原理
- 长视野的本质是"每步可靠性指数级放大"——一个 0.99/步的系统在 100 步后只有 37% 端到端成功；提升到 0.999/步可以翻到 90%
- AlphaEvolve 的精髓不在 LLM，在评估器的严格性——LLM 解决"写出可编译代码"这个最难的部分，评估器解决"代码是否正确"这个 LLM 最易犯错的部分
- AI Scientist v2 的评估器（同行评审）是所有自主系统中**最弱**的，所以它的安全边界几乎完全依赖沙箱隔离和人工审查

## 我能复用/改编的点
- METR 视野模拟器（per-step 可靠性复合模型）可以作为部署 Agent 前的"现实检查"工具
- AlphaEvolve 的 MAP-elites 多样性保存策略适用于任何需要避免局部最优的搜索场景
- 评估器严格性审计（evaluator rigor audit）是考虑任何自主系统前的前置条件——这个 checklist 本身就有工程价值

## 关联
- 概念：[[自我进化]]、[[推理模型]]、评估与基准、[[Agent 评测基准]]、[[Agent 安全]]、[[反思 Reflection]]、[[经验回放与改进]]、[[轨迹回放]]、[[Computer Use]]、[[大语言模型 LLM]]
- 项目：[[ ]]

## 来源
- ai-engineering-from-scratch Phase 15: Autonomous Systems，子主题 01、03、05
- METR Time Horizon 1.1 (Jan 2026); Novikov et al., AlphaEvolve (arXiv:2506.13131); Yamada et al., AI Scientist v2 (arXiv:2504.08066); Beel et al., Independent Evaluation (arXiv:2502.14297)
- 2026 International AI Safety Report; Anthropic alignment-faking study (2024)
