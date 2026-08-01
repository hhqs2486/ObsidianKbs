---
类型: 概念
主题: 多智能体协作
tags: [AI智能体知识库, 多智能体协作]
创建: 2026-07-30
复习: 
状态: 已完成
---

# FIPA ACL 协议

## 一句话定义
> FIPA ACL 是 2000 年由 IEEE 标准化的"Agent 通信语言"：它规定一条消息由"言语行为（我要做什么）+ 内容（关于什么）"组成，相当于给 Agent 之间的对话定了一套动词表（inform / request / propose…）。今天的 MCP、A2A 都是它的"JSON 版轻量复刻"。

## 它解决什么问题 / 为什么存在
- 多个 Agent 要协作，前提是有共同语言。FIPA ACL 在 2000 年给出参考实现：20 个 performative（言语行为）、SL0/SL1 内容语言、contract-net / subscribe-notify 等交互协议。
- 它后来因为"本体（ontology）负担太重、Web 赢了"而在工业界淡出；但 2026 年 LLM 多 Agent 复兴，正悄悄用 JSON 契约替代 performative、用自然语言替代本体，重新实现同一套思想。读懂 FIPA 能帮你分辨：哪些新协议是"真创新"，哪些只是"换皮复刻"。

## 核心原理（大二能懂的水平）
- **言语行为理论（Speech Acts）**：Austin 发现有些句子不是描述世界而是"改变世界"——"我承诺""我请求"。Searle 归纳为五类：assertive / directive / commissive / expressive / declarative。KQML(1993) 把它变成线协议，FIPA-ACL(2000) 清理后标准化成约 20 个 performative：
  - `inform`："我告诉你 P 为真"
  - `request`："我请你做 X"
  - `query-if`："P 为真吗？" / `query-ref`："X 的值是多少？"
  - `propose` / `accept-proposal` / `reject-proposal` / `cfp`（call for proposals）
  - `subscribe`（变化时通知我）/ `cancel` / `failure` / `not-understood` 等
- **消息信封**：一条 FIPA 消息 = 7 个信封字段（sender / receiver / content / language / ontology / protocol / conversation-id / reply-with）+ 1 个 content 负载。你每次给 JSON 协议加"重试、线程号、本体"时，都是在重造这 7 个字段。
- **两个参考平台**：JADE（Java，最常用 FIPA 运行时）、JACK（BDI 推理，商业化、采用少）。现在 MCP 和 A2A 是 2026 版的"容器"。

## 关键参数 / 易错点
- **本体开销**：FIPA 要求共享本体才能解析 content，而商定本体是长达数年的标准工程；Web 直接 HTTP+JSON 赢了。这是它衰落的主因。
- **形式语义没人用**：SL 给了严格的真值条件，但大多数生产系统用自由文本 content，忽略形式化。
- **丢掉本体后的代价（语义漂移）**：没有共享本体，Agent 从自然语言推断含义。2026 真实故障：两个 Agent 用同一个词（如"customer"）指微妙不同的概念，接收方按错误理解行动，schema 校验兜不住。缓解（不必回到完整本体）：content 上加 JSON Schema、用 typed artifacts、在信封里显式写 performative 让意图 unambiguous。
- **三种值得迁移的交互协议**：① Contract Net（管理者发 cfp，投标者 propose，管理者 accept/reject）——任务市场模式的原型；② Subscribe/Notify——2026 每个事件总线；③ Request-When——"当 Y 成立时做 X"，对应持久化工作流的延迟任务。

## 类比（帮助理解）
- 就像 HTTP 状态码 + 动词：FIPA 的 performative 相当于给"消息意图"建了一份标准动词表，避免每个团队自己发明一套"我要你干嘛"的写法。
- 现代对照：`MCP tools/call` ≈ FIPA `request`；`MCP resources/read` ≈ `query-ref`；`A2A 任务生命周期` ≈ contract-net + request-when。同一信封，不同语法。

## 设计时怎么用（反推思维）
> 设计 Agent 间消息格式时，我会先反推"需要多严格的意图语义"：若只是工具调用，现代 JSON 协议够用；但若要可证明的语义（如"inform 蕴含发送者相信该内容"）或已知正确的交互模式（contract-net），就直接复用 FIPA 的交互协议模式，而不是从零重吵"要不要有 cancel"。同时用 JSON Schema 替代重本体，避免语义漂移。

## 典型应用 / 我在哪见过
- JADE / JACK 历史平台（2000s）。
- 2026 映射：MCP 对应工具调用类言语行为，A2A 对应 Agent 对等言语行为，ACP 对应审计轨迹类，ANP 对应去中心化身份扩展——都是 ACL 后代，只是 JSON 语法 + 更松语义。
- 实用技能：拿到任何新协议 spec，先问"这是 inform 套了 JSON 皮，还是真新东西？"

## 关联
- 前置知识：[[Agent 通信协议栈]]、[[多智能体]]
- 相关：[[A2A 协议]]、[[Agent 通信]]
- 反例/误区：以为 FIPA"过时无用"——其实现代协议是它的轻量复刻；以为自然语言内容"零成本"——丢掉本体带来语义漂移故障。

## 来源
- AIEFS Vol.5 Agents, Ch.121 Heritage of FIPA-ACL and Speech Acts
- FIPA ACL Message Structure Specification (fipa00037, 2000)
- Liu et al., arXiv:2505.02279（现代协议 ↔ FIPA 谱系）
