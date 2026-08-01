---
类型: 教程
来源: 联网调研 2024-2026
tags:
  - AI智能体知识库
  - 教程
创建: 2026-07-22
状态: 已读待消化
task:
  id: task-msab6mjldfn9ni
---

# 09 · 现代 AI Agent 与生态前沿（2024–2026 速览）

## 这条教程在解决什么
- 本书《AI Agents in Depth》偏原理，本篇补上"2024–2026 年工程生态"：协议、框架、评测、Computer Use、推理模型、记忆、安全、语音。给 2026 年想动手做 Agent 的人一张"该关注什么"的地图。
- 配套概念卡在 `10-🧠核心概念/现代AI Agent与生态/`（共 25 张）。

## 关键内容（按 8 个方向）

### 1. Agent 协议 / 互操作
- **背后原理**：把"通信"从实现中抽离成开放标准。CopilotKit 提出"协议三角"：[[MCP]]（Agent↔工具/数据，Anthropic 2024-11，JSON-RPC）、[[A2A 协议]]（Agent↔Agent，Google 2025-04，后入 Linux Foundation，JSON-RPC + Agent Card）、[[AG-UI]]（Agent↔用户前端，CopilotKit，HTTP POST + SSE 事件流）。[[ACP]]（IBM BeeAI）已合并进 A2A。
- **可复用点**：接外部工具先用 MCP，跨框架协同 Agent 用 A2A，做实时前端用 AG-UI——别为每个数据源写一次性集成。

### 2. 主流 Agent 框架 / SDK（2024–2026）
- **背后原理**：框架分几条路——代码优先极简（[[OpenAI Agents SDK]] 2025-03，Agent/Runner/Handoff/Guardrail；[[Smolagents]] 让 Agent 写代码行动；[[Pydantic AI]] 强类型安全）；云原生托管（[[Google ADK]] 2025-04，Gemini+Vertex AI，内置 eval）；图/状态机（[[LangGraph]]）；对话式多 Agent（[[AutoGen]]，现 AG2）；角色驱动（[[CrewAI]]）；给 Agent 一台电脑（[[Claude Agent SDK]] 2025-09，由 Claude Code SDK 更名）。
- **可复用点**：以 OpenAI 模型为主要生产 + 要可观测→OpenAI Agents SDK；Gemini/上云→ADK；复杂长流程要回滚→LangGraph；快速原型/内容管线→CrewAI；通用桌面操作→Claude Agent SDK；Python 类型控→Pydantic AI；小模型/边缘→Smolagents。

### 3. Agent 评测新基准
- **背后原理**：Agent 要"真跑环境、自动判分"。家族：[[AgentBench]]（2023，8 环境广撒网，已退休）、[[WebArena]]（2023，812 网页任务）、[[OSWorld]]（2024，369 真实桌面任务）、[[τ-bench]]（Sierra，客服工具调用 + pass^k 可靠性）、[[BrowseComp]]（OpenAI，困难网页研究）、GAIA（通用助理）、[[SWE-bench]]（已有卡，真实修代码）。
- **可复用点**：按任务类型选基准做回归——网页看 WebArena、桌面看 OSWorld（用 Verified 版）、客服看 τ-bench 的 pass^k（可靠性 > 单次通过率）。

### 4. Computer Use / GUI Agent
- **背后原理**：把 OS 当环境（截图=观察，click/type=动作，完成=奖励）。代表：Claude Computer Use（2024-10）、OpenAI Operator/CUA（2025-01，OSWorld 38.1%）、字节 UI-TARS / UI-TARS-2（2025，native VLM+RL，OSWorld 47.5%）、Google Project Mariner。OSWorld SOTA 从 12.24%(2024)→72.6%(2025 底，超人类 72.36%)。
- **可复用点**：操作无 API 的桌面/网页用 Computer Use 路线；GUI Grounding 是瓶颈，优先评估 ScreenSpot 类基准；敏感步骤必须沙箱 + 人工确认。

### 5. 推理模型对 Agent 的影响
- **背后原理**：o1（2024-09）首创"先思考再答"；o3/o4-mini（2025-04）首次让推理模型自主判断"何时、如何调工具"，o3 比 o1 困难任务重大错误少约 20%，曾连续调约 600 次工具——这正是 Agent 行为。o3 在 SWE-bench Verified 约 69.1%。
- **可复用点**：复杂规划/多步任务用推理模型当"规划者"，便宜小模型当"执行者"（planner/worker 分层，见 ADK）。推理更强 ≠ 不用工具/记忆/安全。

### 6. Agent 记忆 / 状态方案
- **背后原理**：上下文窗口 ≠ 记忆，[[RAG]] ≠ 记忆。新一代：Mem0（向量+图双存储，LoCoMo 66.9%）、Zep/Graphiti（时序知识图谱，带有效期边，LoCoMo 80.32%）、Letta（状态化编程）。解决了"跨会话连续 + 个性化"。
- **可复用点**：要做个性化/长期助手就接记忆层；明确"记什么、何时取、怎么处理矛盾"。无限上下文不会消灭记忆，只改变其角色（管理优先级与生命周期）。

### 7. Agent 安全
- **背后原理**：能行动的 Agent 影响面远大于聊天机器人。头号风险是 prompt injection（OWASP LLM Top 10 连续第一，间接注入最危险）；还有参数注入→RCE（Trail of Bits 2025-10）。防御：沙箱（隔离/临时/无网/只读/限资源）、权限最小化（短时凭据、不可逆动作 HITL）、全量审计、AI 网关。
- **可复用点**：生产 Agent 默认沙箱化 + 最小权限 + 关键动作人工确认 + 审计；别把 Agent 当可信脚本跑（Claude Code 用户默认批准了 93% 弹窗，形同虚设）。

### 8. 语音 / 实时 Agent
- **背后原理**：语音 Agent 用单一语音模型直出音频（比 ASR+LLM+TTS 串联更自然低延迟）。OpenAI [[Realtime API]]（2024-10 公测→gpt-realtime GA）支持工具调用、远程 MCP、图片输入、SIP 电话；架构用 Handoff（主 Agent 路由到专职子 Agent）+ VAD（判断何时插话）。
- **可复用点**：客服/电话场景用 Realtime API + SDK 的 RealtimeAgent；注意 24kHz 采样、处理打断、断线重连、PII 加密；语音里同样有注入/权限问题。

## 2026 年想动手做 Agent：一张地图
1. **先定形态**：纯对话 / 工具型 / 多 Agent 协作 / 操作电脑 / 语音 —— 决定框架选型。
2. **选框架**：OpenAI Agents SDK（通用生产）、ADK（Gemini 云）、LangGraph（复杂长流程）、Claude Agent SDK（通用桌面）、CrewAI（快速原型）。
3. **接协议**：工具走 [[MCP]]，跨 Agent 走 [[A2A 协议]]，实时前端走 [[AG-UI]]。
4. **评测**：按任务类型挂基准（WebArena/OSWorld/τ-bench），看可靠性而非单次分。
5. **加记忆**：需要个性化就接 Mem0/Zep。
6. **守安全**：沙箱 + 最小权限 + HITL + 审计，从第一天就做。

## 我卡住/没懂的地方
- ACP 与 A2A 的"合并"具体迁移路径在工程上怎么落（本库仅作历史参考，新项目直接用 A2A）。
- 各家基准 SOTA 分数随月份变化极快，跨模型横向比必须注明日期与具体系统版本。
- "推理模型 + Agent" 与 "Agent 安全" 的张力：模型越强越自主，沙箱/权限越关键。

## 它背后的原理（别只记操作）
- Agent 生态的底层矛盾是"互操作 vs 厂商锁定"：协议（MCP/A2A/AG-UI）是把控制面标准化；框架是把执行面产品化；评测是把质量面客观化；安全是把风险面隔离化。四者共同决定一个 Agent 能否从 demo 走到生产。

## 我能复用/改编的点
- 协议三角（MCP+A2A+AG-UI）可直接作为"架构通信层"模板。
- planner/worker + 推理模型当规划者，是成本与能力平衡的通法。
- "沙箱 + 最小权限 + HITL + 审计"是任何能行动 Agent 的安全基线，可做成 checklist。

## 关联
- 概念卡：`10-🧠核心概念/现代AI Agent与生态/` 下 25 张（[[Agent 协议]] [[MCP]] [[A2A 协议]] [[AG-UI]] [[ACP]] [[OpenAI Agents SDK]] [[Claude Agent SDK]] [[Google ADK]] [[LangGraph]] [[AutoGen]] [[CrewAI]] [[Smolagents]] [[Pydantic AI]] [[Agent 评测基准]] [[τ-bench]] [[WebArena]] [[OSWorld]] [[BrowseComp]] [[AgentBench]] [[Computer Use]] [[GUI Agent]] [[推理模型]] [[Agent 记忆]] [[Agent 安全]] [[语音 Agent]] [[Realtime API]]）
- 本书已有：[[Agent范式]] [[函数调用 Function Calling]] [[多智能体]] [[RAG]] [[上下文工程]] [[反思 Reflection]] [[评估]] [[SWE-bench]] [[工具沙箱]]

## 来源（关键，含日期）
- Anthropic《Introducing the Model Context Protocol》(2024-11)；MCP 官网 modelcontextprotocol.io
- Google《Agent2Agent (A2A)》Google Cloud Next 25 (2025-04-09)；Linux Foundation 公告 (2025-06-23)
- CopilotKit《AG-UI Protocol》(2024–2025)；《AG-UI Is Redefining the Agent–User Interaction Layer》(2025)
- IBM Research《Agent Communication Protocol》及《ACP Joins Forces with A2A》(2025)
- OpenAI Agents SDK（2025-03，Swarm 继任）；Swarm 仓库（2024-10）
- Anthropic《Building agents with the Claude Agent SDK》(2025-09-29)；《Introducing Claude Sonnet 4.5》(2025-09)
- Google ADK（2025-04，Apache 2.0）；Google I/O 2025 公告
- LangChain LangGraph 文档；CrewAI / AutoGen(AG2) / Smolagents(HF) / Pydantic AI 官方文档（2024–2025）
- AgentBench(2023-08)、WebArena(2023-07, ICLR2024)、OSWorld(os-world.github.io, 2024)、τ-bench / τ2-bench(Sierra, 2024–)、BrowseComp(OpenAI, ~2025)、GAIA(ICLR2024)、SWE-bench
- Anthropic Claude 3.5 Sonnet Computer Use (2024-10)；OpenAI Operator/CUA (2025-01)；字节 UI-TARS (2025-01) / UI-TARS-2 (2025-09)；Google Project Mariner (2024-12)
- OpenAI o1 (2024-09)；o3/o4-mini (2025-04，o3-pro 2025-06)
- Mem0 论文 arXiv:2504.19413 (2025)；Zep/Graphiti 文档；kylinmiao.me 记忆市场报告 (2026-04)
- OWASP LLM Top 10 (2025 更新)；Trail of Bits《Prompt injection to RCE》(2025-10)；Anthropic Claude Code 沙箱博客 (2025-10)
- OpenAI《Introducing gpt-realtime》+ Realtime API 文档 (2025)；openai-agents-js《Building Voice Agents》

> 标注"待核实"的项：OpenAI Agents SDK 2026-04 沙箱/长时程更新（单一来源）；BrowseComp 精确发布月份与最新 SOTA 数字；Mem0 融资额/star 数/Zep 最新分数；ADK 2.0 图工作流 GA 时间；gpt-realtime-1.5 / Realtime Mini 精确 GA 时间与价格细分；Pydantic AI 1.0 精确月份。以上均已在对应概念卡来源节标注。
