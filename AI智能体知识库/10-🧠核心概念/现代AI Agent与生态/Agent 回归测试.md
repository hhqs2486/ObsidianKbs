---
类型: 概念
主题: 现代AI Agent与生态
tags: [AI智能体知识库, 现代AI Agent与生态]
创建: 2026-07-30
复习: 
状态: 已完成
---

# Agent 回归测试

## 一句话定义
> Agent 回归测试是用固定测试集在每次改动（prompt / 工具 / 模型）后重跑评估，对比 baseline 判断"成功率升了还是降了"，防止 Agent 越改越差。

## 它解决什么问题 / 为什么存在
- "看几个 demo 觉得能用了"不是评估，是碰运气。prompt 一改可能顺手修了一个 bug，却让完整率掉 34%，11 天后才被发现。
- LLM 输出是随机的，少量样例看不出 5% 的退化；只有可重复的信号能拦住退化。

## 核心原理（大二电子信息工程专业学生能懂）
- **正确顺序**：eval（固定测试集）→ trace（看失败在哪）→ 安全门禁 → 才加更多 Agent。
- **错误顺序**：堆更多 Agent → 不知为啥变差 → 无法回归 → 越改越糟。
- **评估三法**：自动指标（BLEU/ROUGE/BERTScore）、LLM-as-judge（强模型按 rubric 打分，与人类相关度 80-88%）、人工评估（校准用）。
- **rubric 设计**：给 1-5 分每个等级锚定具体行为（相关性/正确性/有用性/安全性），锚定能把评分方差降 30-40%。
- **数据集三类**：golden（核心回归，50-100+）、对抗样本（注入/越界）、生产分布抽样。
- **样本量**：50 条时 95% 置信区间宽达 19 点，分不清 80% 与 96%；至少 200 条才能做部署决策。
- **回归流程**：跑 baseline → 改 → 跑 new → 配对检验 → 显著退化就 block。CI 里每 PR 跑（如 promptfoo / DeepEval / Braintrust）。

## 关键参数 / 易错点
- 没有 baseline：改 prompt 后不知变好还是变坏。
- 忽略失败分类：只盯成功率，不区分"工具失败/检索失败/模型失败/状态失败"，无从下手修。
- 测试集与训练/微调数据重叠：测的是记忆不是泛化。
- 用弱模型当 judge：GPT-3.5 当裁判噪声大，judge 至少要不弱于被评模型。

## 类比（帮助理解）
- 像给 Agent 做"单元测试 + 回归门禁"：每次提交都跑一遍，红了就不让合并。

## 设计时怎么用（反推思维）
> 做 Agent 时，我会从第一天攒 ≥20 条固定任务覆盖正常与边界，每次改 prompt/工具都跑回归对比 baseline，再决定能不能上（见 [[评估]]、[[Agent 追踪 Trace]]）。

## 典型应用 / 我在哪见过
- promptfoo、DeepEval、LangSmith、Braintrust、Phoenix 等 eval 平台；开源仓库里 `tasks.csv`(input/must_have/must_not/risk_level) + `results.csv`。

## 关联
- 前置知识：[[评估]], [[Agent]], [[大语言模型 LLM]]
- 相关：[[Agent 追踪 Trace]], [[Agent 安全]], [[Agent 安全门禁]]
- 反例/误区：用"我看几个例子觉得行"代替回归——随机性会掩盖退化。

## 来源
- ai-engineering-from-scratch 仓库 `phases/11-llm-engineering/10-evaluation/docs/en.md`
- Agent-Learning-Hub 仓库 `docs/learn/stage-7-eval.md`
