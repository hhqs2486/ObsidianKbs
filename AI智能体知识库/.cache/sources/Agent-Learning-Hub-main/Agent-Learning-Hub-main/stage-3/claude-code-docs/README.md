# Claude Code 源码学习指南

> Claude Code v2.1.88 · ~512,664 行代码 · ~1,884 个源文件

全球最顶级的开源 Agent Runtime 逐模块深度解析，共 12 章教学文档。

---

## 章节目录

| 章节 | 文件 | 核心内容 | 关键文件 |
|------|------|---------|---------|
| 第00章 | [00-概览与项目结构.md](./00-概览与项目结构.md) | 架构全貌、技术栈、目录结构、最小 Agent 循环 | — |
| 第01章 | [01-Tool系统.md](./01-Tool系统.md) | Tool 接口、buildTool 工厂、40+ 工具清单、BashTool 详解 | `src/Tool.ts` |
| 第02章 | [02-Query引擎.md](./02-Query引擎.md) | Agent 主循环、流式处理、并发执行、Auto Compact | `src/query.ts` |
| 第03章 | [03-Agent系统.md](./03-Agent系统.md) | 子 Agent、Fork Worktree、蜂群协作、Teammate | `src/tools/AgentTool/` |
| 第04章 | [04-Task系统.md](./04-Task系统.md) | 7 种 TaskType、状态机、磁盘输出流、LocalShellTask | `src/Task.ts` |
| 第05章 | [05-状态管理.md](./05-状态管理.md) | AppState、DeepImmutable、Store 模式、Speculation | `src/state/` |
| 第06章 | [06-权限系统.md](./06-权限系统.md) | PermissionMode、规则引擎、权限检查链路、DenialTracking | `src/utils/permissions/` |
| 第07章 | [07-MCP集成.md](./07-MCP集成.md) | MCP 协议、工具加载、Resources、ToolSearch 延迟加载 | `src/services/mcp/` |
| 第08章 | [08-服务层.md](./08-服务层.md) | API 客户端、Compact 压缩、Analytics、记忆系统、Plugin | `src/services/` |
| 第09章 | [09-UI层.md](./09-UI层.md) | Ink/React TUI、工具渲染生命周期、虚拟滚动、输入系统 | `src/ink/` `src/main.tsx` |
| 第10章 | [10-CLI入口.md](./10-CLI入口.md) | 三种运行模式、60+ 命令分类、Bootstrap、Bridge 模式 | `src/entrypoints/` |
| 第11章 | [11-设计精髓.md](./11-设计精髓.md) | 14 个核心设计模式、学习方法、隐藏功能分析 | — |

---

## 快速导航

### 按问题查找

**"工具调用是怎么执行的？"** → [第01章](./01-Tool系统.md) + [第02章](./02-Query引擎.md)

**"子 Agent 怎么工作？"** → [第03章](./03-Agent系统.md)

**"如何防止 context 溢出？"** → [第02章](./02-Query引擎.md#六auto-compact--context-窗口管理)

**"权限系统怎么工作？"** → [第06章](./06-权限系统.md)

**"MCP 工具是怎么加载的？"** → [第07章](./07-MCP集成.md)

**"全局状态怎么管理？"** → [第05章](./05-状态管理.md)

**"终端 UI 是怎么渲染的？"** → [第09章](./09-UI层.md)

**"这个系统最厉害的设计是什么？"** → [第11章](./11-设计精髓.md)

---

## 推荐学习顺序

```
新手路线（理解基础）：
  第00章 → 第01章 → 第02章 → 第05章

深度路线（掌握架构）：
  第00章 → 第01章 → 第02章 → 第03章 → 第04章 → 第05章

安全路线（理解权限）：
  第01章 → 第06章 → 第07章

扩展路线（自定义 Agent）：
  第01章 → 第03章 → 第07章 → 第10章

完整路线：
  按顺序 第00章 → 第11章
```

---

## 配套资源

- **交互式学习面板**：`./claude-code-学习指南.html`（在浏览器打开）
- **架构图**：`./Claude Code — Agent Runtime 架构.html`
- **源码**：不随本仓库分发；如需对照源码，请按 [stage-3/README.md](../README.md) 的说明自行获取公开版本或官方文档。
- **深度分析报告**：本目录第 00–11 章即为学习笔记主体。

---

*版本：Claude Code v2.1.88 | 文档创建：2026-04*
