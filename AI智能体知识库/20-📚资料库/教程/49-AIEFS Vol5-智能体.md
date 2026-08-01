---
类型: 教程
主题: 现代AI Agent与生态
tags:
  - AI智能体知识库
  - 教程
  - 现代AI Agent与生态
  - 多智能体协作
  - 工具与函数调用
  - 代码智能体
  - 上下文工程
  - 记忆与知识库
  - 评估与基准
  - 自我进化
  - 多模态与实时
  - 推理部署与安全对齐
  - AIEFS
来源: AIEFS Vol.5 Agents
创建: 2026-07-30
状态: 已完成
task:
  id: task-msab6ll1hxw87h
decision-suggestions:
  - "39 篇笔记标签相似但未互链: 建议补充 [[20-📚资料库/教程/49-AIEFS Vol5-智能体.md]] → [[10-🧠核心概念/现代AI Agent与生态/进化式编码.md]] (相似度: 50%)"
decision-generated: 2026-08-01T13:21:27.994Z
---

# AIEFS Vol.5 — AI Agents 教程笔记

> 本教程笔记源自 *AI Engineering from Scratch, Volume 5: Agents*（即《AI Agents in Depth》），覆盖从多模态 AI、工具与协议、Agent 工程、自主系统到多智能体与群体的 5 大模块、约 140 个核心章节。它是整套知识库中「智能体」主题的总纲。

---

## 一、Part I — 多模态 AI（Ch.03–28）

### 1. 视觉-语言模型基础（Ch.04–13）

ViT 把图像切成 patch 当作 token；CLIP 用对比学习对齐图文，开启零样本分类；BLIP-2 用 Q-Former 当模态桥；Flamingo 用门控交叉注意力做少样本 VLM；LLaVA 用视觉指令微调把任意视觉编码器接进 LLM。

- 开放权重配方（Ch.10）：数据质量 > 参数量，指令数据多样性决定上限
- InternVL3 走原生多模态预训练；Chameleon/Emu3 走 early-fusion / next-token 统一建模
- 2026 角色：多模态是 Agent「看世界」的底座，所有 computer-use / VLA 都建立在此

关联卡片：[[多模态]] [[视觉理解]] [[CLIP]]

### 2. 视频、音频与具身（Ch.20–24）

视频语言模型用时序 token + grounding；Omni 模型（Qwen2.5-Omni）拆出 Thinker-Talker 双通道；具身 VLA（RT-2、OpenVLA、π0、GR00T）把视觉-语言对齐到**动作**空间。

- 文档理解（Ch.25–27）：ColPali 走 vision-native 文档 RAG，绕开 OCR
- 多模态 RAG（Ch.27）：跨模态检索是朴素 RAG 的多模态推广

关联卡片：[[多模态]] [[VLA Vision-Language-Action]] [[RAG]] [[知识库]]

### 3. 多模态 Agent 与 Computer Use（Ch.28）

把「看屏幕 + 推理 + 操作」合进一个 Agent 循环，是本卷 multimodal 部分的 capstone。

关联卡片：[[多模态与实时地图]] [[视觉理解]]

---

## 二、Part II — 工具与协议（Ch.29–52）

### 4. 函数调用深入（Ch.31）

三厂商 2024 收敛到同一工具循环、其余全分叉：OpenAI 用 `tools`/`tool_calls`，Anthropic 用 `tool_use`/`tool_result` 块，Gemini 用 `functionDeclarations` + unique-id 关联。`strict: true` 用受限解码强制 schema 合规。

- 每厂商有硬上限（工具数、schema 深度、参数长度），超限报错签名不同
- `tool_choice` 可强制 / 禁止 / 自动选工具

关联卡片：[[函数调用 Function Calling]] [[受限解码]]

### 5. MCP 协议族（Ch.35–47）

MCP 是 **agent-to-tool** 标准：Primitives + JSON-RPC 生命周期；Server/Client SDK；stdio 与 Streamable HTTP/SSE 传输；Resources/Prompts 暴露上下文；Sampling 让 server 反向请求 LLM。安全分两篇：工具投毒、rug pull、跨 server 影子攻击，以及 OAuth 2.1 + 增量授权。

- 企业侧用 Gateway + Registry 做控制面；生产中用 enrollment + JWKS 刷新 + audience 绑定

关联卡片：[[MCP]] [[Agent 协议]] [[工具沙箱]]

### 6. A2A — Agent-to-Agent 协议（Ch.48）

MCP 是 agent-to-tool，A2A 是 **agent-to-agent**：让不同框架下的不透明 Agent 协作。Google 2025-04 发布、2025-06 捐给 Linux 基金会、2026-04 达 v1.0（150+ 支持方）。每个 Agent 在 `/.well-known/agent.json` 发布 **Agent Card**；交互建模为 Task 生命周期（submitted→working→input-required→completed/failed/canceled/rejected）；用 Message-Parts 与 Artifact 传递输出。A2A 与 MCP **互补不替代**。

关联卡片：[[A2A 协议]] [[Agent 协议]] [[MCP]]

### 7. 路由层与 Skills（Ch.50–51）

LLM 路由层（LiteLLM / OpenRouter / Portkey）做 provider 抽象；Skills / Agent SDK（Anthropic Skills、AGENTS.md、OpenAI 风格）把可复用能力打包。

关联卡片：[[函数调用 Function Calling]] [[现代AI Agent与生态地图]]

---

## 三、Part III — Agent 工程（Ch.53–95）

### 8. Agent Loop：Observe-Think-Act（Ch.54）

2026 年每个 Agent 都是 2022 ReAct 循环的变体（Claude Code、Cursor、Devin、Operator 皆然）。每轮交错 reasoning token、工具调用、观察，直到停止条件触发。**先把这个循环学透再碰任何框架**。

- ReAct：Thought / Action / Observation 三段，各自「承重」
- ALFWorld +34、WebShop +10；HotpotQA 上靠检索 grounding 从幻觉恢复
- 2026 转向原生推理（Responses API、加密 reasoning 透传），thought token 是 2022 的权宜之计

关联卡片：[[ReAct]] [[推理 Reasoning]] [[任务分解]]

### 9. 规划与反思模式（Ch.55–58）

- **ReWOO / Plan-and-Execute**：先整体规划再并行执行，减少 ReAct 的反复往返
- **Reflexion**：用自然语言自我反思作为隐式强化信号
- **Tree of Thoughts / LATS**：分支探索 + 搜索做审慎推理
- **Self-Refine / CRITIC**：生成-反馈-改进的迭代

关联卡片：[[ReWOO Plan-Execute]] [[Reflexion 口头强化学习]] [[Tree-of-Thoughts]] [[Self-Refine 自我纠错]] [[反思 Reflection]]

### 10. Agent 记忆（Ch.60–62）

上下文窗口有限，对话/文档/工具轨迹无限。MemGPT（Packer et al. 2023）把 OS 虚拟内存重述：主上下文=RAM、外部存储=磁盘、记忆工具=页入/页出；Agent 用「中断」查询/修改外部记忆再拼回下个 prompt。Mem0 2025 实测：**4k 窗口 + 外部记忆** 比 128k 基线更能抓住长程事实。

- 记忆块 + sleep-time compute；混合记忆 = 向量 + 图 + KV

关联卡片：[[Agent 记忆]] [[记忆与知识库地图]] [[向量数据库]] [[长期记忆]]

### 11. 技能库与终身学习（Ch.63–64）

Voyager 用技能库做 lifelong learning；HTN + 进化搜索做规划。

关联卡片：[[自我进化]] [[ReAct]]

### 12. 运行时与角色化团队（Ch.67–71）

Actor Model 用异步消息 + 类型化运行时；Role-Based Teams 拆角色/任务/流程；OpenAI Agents SDK 用 Handoffs + Guardrails + Tracing；把 harness 当库用（subagents + session store）；生产运行时追求快速实例化与类型化工件。

关联卡片：[[Agent 运行时 Runtime]] [[Agent 权限系统]] [[代码智能体地图]]

### 13. 失败模式与安全防护（Ch.79–80）

Agent 典型崩法：上下文溢出、工具结果误导、规划偏离。Prompt Injection 用 PVE（Privilege / Verification / Escape）防御；编排模式（supervisor / swarm / hierarchical）按任务结构选型。

关联卡片：[[Agent 安全]] [[Agent 安全门禁]] [[多智能体协作地图]]

### 14. 评测驱动的 Agent 开发（Ch.72–83）

- **SWE-bench**：2294 个真实 GitHub issue，门控在 FAIL_TO_PASS 单测；SWE-bench Verified（500 题人工精标）是「能否交付真补丁」主基准；SWE-bench+ 发现 32.67% 成功补丁在 issue 文本里泄漏了答案
- **GAIA**：对人简单对 AI 难，三级难度，测通才工具使用
- **AgentBench**：8 个环境测多环境推理，开源 LLM 的主要瓶颈在环境接入
- 实践：先 eval-driven 再写 Agent；分离 builder 与 marker（Reviewer Agent）；验证门（Verification Gates）

关联卡片：[[AgentBench]] [[WebArena]] [[OSWorld]] [[Agent 评测基准]] [[评估与基准地图]]

### 15. Agent Workbench 工程（Ch.84–95）

「能力强模型仍失败」的根因在 harness：可执行约束的指令、repo 记忆与持久状态、scope 契约、运行时反馈环、多会话交接。Minimal Agent Workbench = 一个可复用的能力包。

关联卡片：[[Agent 运行时 Runtime]] [[Claude Code 工程实践]] [[代码智能体地图]]

---

## 四、Part IV — 自主系统（Ch.96–118）

### 16. 从聊天机器人到长视野 Agent（Ch.97）

范式转移：单次对话 → 跨多步/多日、能自己排程与恢复的长程 Agent。

关联卡片：[[长视野 Agent]] [[自我进化]]

### 17. 自我提升与自动化科研（Ch.98–101）

- STaR / V-STaR / Quiet-STaR：自教推理
- AlphaEvolve：进化式编码 Agent
- Darwin Gödel Machine / AI Scientist v2：开放式的自我修改与自主科研
- Anthropic AAR：自动化对齐研究

关联卡片：[[AI Scientist]] [[自我进化]] [[反思 Reflection]]

### 18. 自主编码 Agent 与权限（Ch.105–108）

2026 自主编码 Agent 格局；权限模式（permission modes）决定自动化程度；Browser Agent 做长视野网页任务；Long-Running Background Agent 用持久执行（durable execution）。

- 动作预算、迭代上限、成本治理（Action Budgets / Iteration Caps / Cost Governors）防止失控

关联卡片：[[Agent 权限系统]] [[Agent 运行时 Runtime]] [[长视野 Agent]] [[语音 Agent]]

### 19. 安全熔断与人工在环（Ch.109–118）

Kill Switch / Circuit Breaker / Canary Token；Human-in-the-Loop 用 propose-then-commit；Checkpoints + Rollback；Constitutional AI 与规则覆盖；Llama Guard 做输入输出分类；参照 Responsible Scaling / Preparedness / METR 时间视野做能力评估与社会尺度风险治理。

关联卡片：[[Agent 安全门禁]] [[Agent 安全]] [[Constitutional AI]] [[上下文压缩]]

---

## 五、Part V — 多智能体与群体（Ch.119–144）

### 20. 为什么要多智能体（Ch.120）

单 Agent 天花板：上下文溢出、需要混合专长、串行瓶颈。正确做法是「拆更多 Agent」而非「更大的 Agent」。

关联卡片：[[多智能体协作地图]] [[多智能体协作地图]]

### 21. 通信协议与历史（Ch.121–122）

FIPA-ACL 用 communicative acts（request/inform）做 Agent 通信语言；现代通信协议在 JSON-RPC / 消息 schema 上重建这套语义。

关联卡片：[[FIPA ACL 协议]] [[Agent 通信协议栈]] [[A2A 协议]]

### 22. 编排原语与模式（Ch.123–130）

- Multi-Agent Primitive Model：把协作拆成最小原语
- Supervisor / Orchestrator-Worker：集中调度
- Hierarchical：分层架构及其失败模式
- Society of Mind / Multi-Agent Debate：多角色辩论提升质量
- Role Specialization：Planner / Critic / Executor / Verifier
- Parallel / Swarm / Networked：并行、群、网络三种拓扑
- Group Chat + Speaker Selection；Handoffs + Routines 做无状态编排

关联卡片：[[多智能体协作地图]] [[多智能体协作地图]] [[ReWOO Plan-Execute]]

### 23. 共识、协商与涌现（Ch.131–140）

- A2A 在多 Agent 下的 Task 委派；Shared Memory / Blackboard 共享状态
- Consensus + BFT：拜占庭容错；Voting / Self-Consistency / Debate Topology
- Negotiation / Bargaining；Generative Agents 与涌现仿真；Theory of Mind 与涌现协调
- 群优化（PSO / ACO）用于 LLM；MARL（MADDPG / QMIX / MAPPO）是多 Agent 强化学习主力

关联卡片：[[群体涌现]] [[多智能体协作地图]] [[多智能体协作地图]] [[多智能体强化学习]]

### 24. 生产扩展、失败模式与基准（Ch.141–144）

- 生产扩展：队列、检查点、持久性
- 失败模式：MAST、groupthink、 monoculture、级联错误
- 评测与协调基准（含前面 SWE-bench / WebArena / OSWorld / AgentBench 的跨 Agent 维度）

关联卡片：[[Agent 评测基准]] [[评估与基准地图]] [[Agent 运行时 Runtime]]

---

## 总结

AIEFS Vol.5 的主线是**从一个 ReAct 循环长成一整套 Agent 工程体系**：

1. **多模态底座（Part I）**：ViT/CLIP/VLM/VLA 让 Agent 能看、能听、能动作
2. **工具与协议（Part II）**：函数调用 + MCP（agent-to-tool）+ A2A（agent-to-agent）定义 Agent 怎么接入外部世界
3. **Agent 工程（Part III）**：Agent Loop 是一切的核；在其上长出自记忆、规划、反思、运行时、评测、workbench
4. **自主系统（Part IV）**：从单次对话走向长视野、自我提升、带熔断与人工在环的自主 Agent
5. **多智能体与群体（Part V）**：用「更多 Agent」突破单 Agent 天花板，靠协议、编排、共识与涌现协同

贯穿全书的桥梁：**Agent Loop（ReAct）是原子，记忆/规划/反思是脚手架，协议（MCP/A2A）是接入外部世界的接口，评测是防失控的护栏**。先把 Ch.54 的循环学透，其余都是围绕它的工程化。
