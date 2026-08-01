# Stage 3: Claude Code Harness Study

Stage 3 是阅读与拆解阶段，目标不是复刻完整 Claude Code，而是理解现代 coding agent runtime 的工程结构：tool system、query loop、permission、MCP、state、TUI 与 CLI bootstrap。

## 学习入口

| 入口 | 说明 |
| --- | --- |
| [claude-code-docs/README.md](claude-code-docs/README.md) | 12 章导读目录 |
| [claude-code-docs/00-概览与项目结构.md](claude-code-docs/00-概览与项目结构.md) | 架构全貌与最小 agent loop |
| [claude-code-docs/06-权限系统.md](claude-code-docs/06-权限系统.md) | 权限检查链路 |
| [../stage-7/docs/claude-code-permissions.md](../stage-7/docs/claude-code-permissions.md) | 与 Stage 7 safety gate 的对照 |

## 推荐顺序

1. 先读第 00、01、02 章，理解 tool call 和 query loop。
2. 再读第 05、06、07 章，理解状态、权限与 MCP。
3. 最后读第 09、10、11 章，理解 TUI / CLI / harness 设计取舍。

## 源码说明

`claude-code-source-code/` 目录是占位目录，本仓库不分发第三方源码。需要源码级对照时，请使用官方公开材料、已授权的源码副本，或在本地把对应项目 clone 到 `stage-3/claude-code-source-code/` 后阅读。

Stage 3 的文档应保持自洽：即使没有源码目录，读者也能通过 12 章导读理解关键架构。
