# 多 Agent 常见问题与自测

配合 [A2A 还是共享状态？](./a2a-vs-shared-state.md) 和 [术语速查](./glossary.md) 一起看。这里收集 Stage 4 阶段最常踩的坑和一份自测清单。

## 1. 常见误区

### 误区一：一上来就让 agent 互相聊天

自由聊天会马上出现“谁决定下一步 / 谁拥有最终答案 / 中间产物存哪里”的问题。

> 正确做法：agent 只读输入、写输出，coordinator 决定下一步。

### 误区二：把 Shared State 当成唯一形态

Shared State 不一定是内存对象，也可以是数据库、文件系统、artifact store、message bus。它们本质都在把一个 agent 的输出变成另一个 agent 可读的输入。

### 误区三：过早上 A2A

同一个系统内部的编排，用 coordinator + shared state 就够了。A2A 是跨系统 / 跨组织 agent 互操作才需要的，过早引入只会增加复杂度。

### 误区四：没有 MaxSteps

没有步数上限的调度循环很容易死循环。任何多 agent demo 都应该有一个明确的停止条件。

## 2. 排错清单

当多 agent 流程跳不起来或结果不对时，按顺序检查：

```text
[ ] coordinator 是不是真的在根据 state 选下一步？
[ ] 每个角色是不是只写自己该写的字段？
[ ] 上一步的输出是不是真的写回了 shared state？
[ ] 下一个角色是不是读到了最新状态？
[ ] trace 里能不能看到每一步？
[ ] 是不是撞到了 MaxSteps 提前退出？
```

大部分问题都出在“状态没写回”或“读到了旧状态”。

## 3. 自测题

试着不看笔记回答：

1. 同一个 repo 里做 `research -> write -> review -> revise`，为什么通常不需要 A2A？
2. 为什么不让 agent 自由互相聊天？至少说出三个工程上的问题。
3. Shared State 除了内存对象，还能是哪几种形态？各适合什么场景？
4. MCP 和 A2A 各自解决的是什么问题？举一个你会用哪个的例子。
5. 生产环境上多 agent 之前，至少要先回答哪几个问题？

> 答不上来的题，回到 [a2a-vs-shared-state.md](./a2a-vs-shared-state.md) 对应章节重读。
