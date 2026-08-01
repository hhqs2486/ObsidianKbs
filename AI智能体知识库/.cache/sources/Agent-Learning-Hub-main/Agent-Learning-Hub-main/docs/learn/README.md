# 学习笔记区（docs/learn）

这里收录从各 Stage 实战中提炼出来的「概念笔记」。和 `stage-*/` 里的可运行代码不同，本目录聚焦**为什么这样设计**，帮助你在写代码之前先建立心智模型。

## 怎么用这个目录

1. 先按 Stage 跑通对应代码（`stage-1` ~ `stage-8`）。
2. 跑通后回到这里，读对应主题的笔记，把「能跑」升级成「理解」。
3. 带着笔记里的自测题，重新审视自己的实现。

## 笔记索引

| 笔记 | 关联 Stage | 一句话 |
| --- | --- | --- |
| [多 Agent 交互：A2A 还是共享状态？](./a2a-vs-shared-state.md) | Stage 4 | 同系统内部协作主流是 coordinator + shared state，A2A 更适合跨系统 |
| [多 Agent 术语速查](./glossary.md) | Stage 4 / 5 | A2A、MCP、Shared State、Coordinator、Trace 等核心概念的最短定义 |
| [多 Agent 常见问题与自测](./multi-agent-faq.md) | Stage 4 | 常见误区、排错清单与自测题 |
| [最小 Agent Loop：为什么 50 行就够了](./stage-1-minimal-loop.md) | Stage 1 | loop 才是 agent 本质，框架帮的是工程化不是 loop 本身 |
| [RAG、记忆与上下文：三层不要混](./stage-2-rag-memory.md) | Stage 2 | 短期上下文 / 会话记忆 / 长期记忆是三种东西，RAG 不属记忆 |
| [Skill 是什么，不是什么](./stage-5-skills.md) | Stage 5 | Skill 是可复用能力包，不是一次性 prompt 也不是工具 |
| [为什么 Eval 先于更多 Agent](./stage-7-eval.md) | Stage 7 | 没有 eval 只能算 demo，先有测试集再加复杂度 |
| [从 Demo 到可部署 Agent](./stage-8-deploy.md) | Stage 8 | demo 跑通只是开始，交付要日志 / trace / 权限 / 部署 |
| [上下文压缩与记忆：长会话为什么不爆窗](./stage-9-compaction-memory.md) | Stage 9 | 压缩控窗口、记忆留事实，锚点保护关键信息 |

> 索引会随笔记增加而更新。新增一篇笔记时，记得在上表补一行。

## 贡献一篇笔记

欢迎把你踩过的坑沉淀成笔记。建议结构：

```text
1. 先给结论（一张表或一句话）
2. 用图/伪代码解释主流程
3. 列出常见误区
4. 给出工程建议
5. 末尾放 3~5 道自测题
```

提交前请确认：标题用中文、代码块标注语言、图用 mermaid，并在本 README 的索引表里加上你的笔记。
