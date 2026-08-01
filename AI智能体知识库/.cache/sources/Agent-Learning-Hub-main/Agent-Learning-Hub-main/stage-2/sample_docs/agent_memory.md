# Agent 记忆分层（教学样例）

## 三种记忆

1. **短期上下文（Working Context）**  
   本次 API 调用里 `messages` 数组的内容——模型**直接可见**的工作台。  
   可以包含：最近几轮原文、更早对话的 summary、system prompt、tool 结果等。  
   容量受 context window 限制；Stage 2 的 `step07` 就是这个列表。

2. **会话记忆（Session Memory）**  
   同一会话（session）从开头到现在的**完整历史**，通常持久化在数据库或 session store。  
   模型默认看不到；harness 每次请求前，从中**按需选取**一部分放进 Working Context。  
   可以存完整原文，也可以存 summary——存什么与会话边界有关，**怎么选进窗口**才是 compaction 的事。

3. **长期记忆（Long-term Memory）**  
   跨会话持久化的事实与偏好，例如「用户叫 Alex、喜欢 Python」。  
   Stage 2 用 **mem0** 实现这一层；和 Session Memory 的区别是**跨越多次聊天**，而不只是当前 session。

---

## 总览：四层信息从哪来

```mermaid
flowchart TB
    subgraph visible["模型本次可见 · Working Context"]
        WC["messages[]<br/>system + summary + 最近轮次 + tool 结果"]
    end

    subgraph session["当前会话 · Session Memory"]
        SM["session store<br/>turn1 → turn2 → … → turnN<br/>（完整原文 + 可选 summary）"]
    end

    subgraph longterm["跨会话 · Long-term Memory"]
        LM["mem0<br/>用户偏好 / 历史结论 / 画像"]
    end

    subgraph external["外部知识 · RAG"]
        RAG["RAGFlow / 知识库<br/>文档 chunk + 引用"]
    end

    SM -->|"compaction / 按需加载"| WC
    LM -->|"recall_user_memory"| WC
    RAG -->|"search_knowledge"| WC

    User(["用户提问"]) --> WC
    WC --> LLM(["LLM 推理"])
    LLM --> Answer(["带引用的回答"])

    LLM -.->|"add 对话事实"| LM
    LLM -.->|"追加 turn"| SM
```

| 层级 | 回答的问题 | Stage 2 对应 |
| --- | --- | --- |
| Working Context | 模型**这次**看到什么？ | `step07` 的 `messages` |
| Session Memory | **这次聊天**发生过什么？ | 教程中简化，Stage 3 harness 补全 |
| Long-term Memory | **这个用户**是谁、偏好什么？ | `mem0` / `step05` |
| RAG | **资料里**写了什么？ | `RAGFlow` / `step03–04` |

---

## 流程 1：Session → Working Context（compaction）

窗口没满时，最近几轮原文可以直接进 `messages`；窗口快满时，harness 从 Session Memory 里**选 + 压**，再组装 Working Context。

```mermaid
flowchart LR
    subgraph store["Session Memory（数据库）"]
        T1["turn 1–40 原文"]
        T2["turn 41–50 原文"]
    end

    subgraph compact["Compaction"]
        SUM["summary(turn 1–40)"]
    end

    subgraph window["Working Context（本次 API）"]
        M["system<br/>+ summary<br/>+ turn 41–50 原文<br/>+ 新 user 消息"]
    end

    T1 --> SUM
    T2 --> M
    SUM --> M
```

要点：

- **Session Memory** = 存（完整档案）
- **Compaction** = 选 + 变（旧消息 → summary）
- **Working Context** = 模型这次能看到的窗口

---

## 流程 2：一次 Agent 请求如何拼上下文

对应 Stage 2 `step07` / `agent.py` 的单轮推理：

```mermaid
sequenceDiagram
    participant U as 用户
    participant H as Harness / Agent Loop
    participant R as RAGFlow
    participant M as mem0
    participant L as LLM

    U->>H: 提问
    H->>H: 组装 messages（Working Context）

    alt 需要查资料
        H->>L: chat.completions + tools
        L-->>H: tool_call: search_knowledge
        H->>R: retrieve(query)
        R-->>H: chunks [1][2]
        H->>H: 追加 role=tool 消息
    end

    alt 需要查用户偏好
        H->>L: 继续推理
        L-->>H: tool_call: recall_user_memory
        H->>M: search(query)
        M-->>H: 记忆片段
        H->>H: 追加 role=tool 消息
    end

    H->>L: 最终推理
    L-->>H: 带 [1][2] 引用的回答
    H-->>U: 返回答案
    H->>M: add（可选：写入新事实）
```

Stage 2 当前**已实现**：Working Context + RAG + mem0。  
**未实现**：Session Memory 持久化、compaction（Letta / Claude Code 在 Stage 3 学）。

---

## 流程 3：三种记忆的生命周期

```mermaid
flowchart TD
    Start(["新 session 开始"]) --> WC0["Working Context<br/>只有 system + 首轮 user"]

    WC0 --> Loop{"还有 user 输入？"}
    Loop -->|是| Append["messages 追加 assistant / tool"]
    Append --> Check{"token 快满了？"}

    Check -->|否| Loop
    Check -->|是| Compact["Compaction<br/>旧消息 → summary"]
    Compact --> Save["Session Memory 保留完整历史"]
    Save --> Rebuild["重建 Working Context<br/>summary + 最近原文"]
    Rebuild --> Loop

    Loop -->|session 结束| End(["session 结束"])

    Append -.->|"跨 session 抽取事实"| Mem0["mem0 长期记忆"]
    Mem0 -.->|"下次 session recall"| Rebuild

    End --> Next(["新 session"])
    Next --> Mem0
```

---

## RAG 与记忆的区别

```mermaid
flowchart LR
    Q(["用户问题"])

    Q --> RAG
    Q --> MEM

    subgraph RAG["RAG · 外部知识"]
        R1["知识库文档"]
        R2["回答：资料里写了什么"]
    end

    subgraph MEM["mem0 · 长期记忆"]
        M1["用户画像 / 偏好"]
        M2["回答：这个用户是谁"]
    end

    RAG --> Merge(["合并进 Working Context"])
    MEM --> Merge
    Merge --> A(["最终回答"])
```

- **RAG**：从外部知识库检索文档片段，回答「资料里写了什么」。
- **长期记忆**：记住「这个用户是谁、之前聊过什么结论」。

两者可以并存：RAG 提供证据，mem0 提供用户画像。
