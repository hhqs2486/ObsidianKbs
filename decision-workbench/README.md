# Decision Workbench

> 将 Obsidian 从静态笔记仓库升级为动态决策工作台

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Obsidian](https://img.shields.io/badge/Obsidian-1.4%2B-7C3AED.svg)](https://obsidian.md)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3%2B-3178C6.svg)](https://www.typescriptlang.org/)
[![Build](https://img.shields.io/badge/Build-esbuild-FFCF00.svg)](https://esbuild.github.io/)

Decision Workbench 是一个 Obsidian 插件，在笔记-任务双向关联的基础上提供看板视图、沉浸式仪表板和决策建议引擎，帮助你从「记了什么」走向「该做什么」。

> 本插件是 [ObsidianKbs](https://github.com/hhqs2486/ObsidianKbs) 仓库的子目录（`decision-workbench/`），与多个知识库共存于同一 Git 仓库中。

---

## 核心特性

### 1. 笔记-任务双向关联

笔记中的 frontmatter 字段和 `- [ ]` 待办列表会被自动提取为结构化任务。任务与笔记之间建立双向关联：每篇笔记知道它关联了哪些任务，每个任务也知道它来源于哪篇笔记。

```markdown
---
task:
  status: in-progress
  priority: high
  due: "2026-08-05"
tags: [PCB, 器件选型]
---

# 设计电源模块原理图

- [x] 确定电源拓扑
- [ ] 选定关键器件
- [ ] 绘制原理图
```

保存笔记后，插件自动提取任务、关联标签、收集 wikilink，并在看板上生成对应的任务卡片。

### 2. Kanban 看板视图

三列看板（待办 / 进行中 / 已完成），支持：

- **拖拽切换状态** — 拖动卡片在列之间移动
- **右键菜单** — 打开来源笔记、标记完成、设置优先级、删除任务
- **标签徽章** — 卡片上显示前 3 个标签
- **优先级标记** — 高优先级任务左侧红色边框
- **进度条** — 子任务完成比例可视化
- **路由徽章** — 根据标签路由表显示处理流程名称
- **决策建议区** — 底部面板展示分析结果，支持「采纳」「忽略」操作

### 3. 沉浸式仪表板

全屏仪表板视图，作为 Obsidian 的默认首页：

| 区域 | 内容 |
|------|------|
| 顶部栏 | 实时时钟 · 日期 · 快捷操作按钮 |
| 左栏 | KPI 网格（笔记/标签/完成率/超期）· SVG 进度环 · 14 天活跃度柱状图 · 快捷入口 · 最近笔记 |
| 中央 | 浮动知识岛屿卡片（按文件夹分组，带 emoji 图标和 float 动画） |
| 右栏 | 优先关注任务 · 决策建议摘要（支持采纳/忽略）· 标签云 · 决策日志 |
| 底部 | 导航条（仪表板/看板/分析/加任务/设置） |

### 4. 决策建议引擎

四种分析类型，每次运行后产出结构化建议并回流写入相关笔记的 frontmatter：

| 分析类型 | 建议类型 | 说明 |
|----------|----------|------|
| 标签聚类 | `missing-link` | 发现标签相似但未互链的笔记群，建议补充 wikilink |
| 链接路径推理 | `link-suggestion` | 检测间接关联（A→B→C），建议创建直接链接缩短检索路径 |
| 上下文聚合 | `task-order` | 检测共享关联笔记的任务，推断可能存在依赖关系 |
| 超期检测 | `priority-adjust` | 进行中任务超期时建议重新评估优先级 |
| 框架分析 | `framework-5w1h` / `framework-swot` | 对标记了 `decision-framework` 的笔记执行结构化分析 |

建议去重后按 `max_suggestions` 截断，写入笔记的 `suggestions` 和 `suggestionsGeneratedAt` 字段。

### 5. 5W1H / SWOT 决策框架

在笔记 frontmatter 中添加 `decision-framework: "5w1h"` 或 `"swot"`，引擎会自动执行结构化分析：

**5W1H 六维分析：**
- **What** — 任务是什么
- **Why** — 为什么做（从关联笔记和标签推断动机）
- **When** — 何时完成（截止日期 + 紧迫度评估）
- **Where** — 所属领域（从标签推断项目/知识域）
- **Who** — 谁来做
- **How** — 如何做（从子任务推断执行路径和进度）

**SWOT 四象限分析：**
- **Strengths** — 优势（关联笔记数、标签覆盖、已完成子任务）
- **Weaknesses** — 劣势（缺乏上下文、未拆分子任务、进度滞后）
- **Opportunities** — 机会（同类标签任务可复用、未关联的相关笔记）
- **Threats** — 威胁（超期、资源冲突、并行负载过高）

框架分析还会根据紧迫度、严重度和当前状态自动计算建议优先级。

### 6. 自然语言任务录入

用一句话描述任务，系统自动解析时间、优先级和标签：

```
明天上午10点设计电源模块原理图 #PCB 紧急
```

解析结果：
- 标题：设计电源模块原理图
- 截止：2026-08-02T10:00
- 优先级：high
- 标签：PCB

支持的时间表达式：`今天`、`明天`、`后天`、`大后天`、`下周三`、`本周五`、`这周末`、`3天后`、`2周后`、`下个月5号`、`上午10点`、`下午3点` 等。

支持的优先级关键词：`紧急`、`非常重要`、`立即`、`asap`（高）、`不急`、`有空再做`（低）、`一般`（中）。

### 7. JSONL 决策日志

每次分析运行后追加一行 JSON 到 `decision_log.jsonl`（只追加不覆盖，崩溃不丢历史），记录：

```json
{"ts":"2026-08-01T12:00:00.000Z","suggestions":5,"byType":{"missing-link":2,"task-order":3},"tasksTotal":345,"tasksTodo":200,"tasksInProgress":50,"tasksDone":95}
```

### 8. 个人规则文件 `decision-rules.md`

在 vault 根目录创建 `decision-rules.md`，用 YAML 代码块自定义分析行为：

```markdown
# 决策规则

## 分析参数

```yaml
similarity_threshold: 0.2    # 标签相似度阈值（默认 0.3）
max_suggestions: 10          # 最大建议数（默认 5）
max_clusters: 8              # 最大聚类数（默认 5）
```

## 优先级自动提升规则

```yaml
# condition 格式: tag:标签名 或 due:天数
priority_rules:
  - condition: "tag:PCB"
    priority: high
  - condition: "due:3"
    priority: high
  - condition: "tag:学习"
    priority: medium
```

## 标签路由表

```yaml
# 按标签自动分配处理流程，卡片上显示路由徽章
routes:
  PCB: 器件选型流程
  学习: 费曼学习法流程
  Python: 编程开发流程
```
```

修改后无需重启，下次运行分析时自动生效。

---

## 快速开始

```bash
# 1. 克隆仓库
git clone https://github.com/hhqs2486/ObsidianKbs.git
cd ObsidianKbs/decision-workbench

# 2. 安装依赖并构建
npm install
npm run build

# 3. 部署到你的 vault（替换路径）
cp main.js styles.css manifest.json \
  "/path/to/your-vault/.obsidian/plugins/decision-workbench/"
```

在 Obsidian 中：设置 → 第三方插件 → 关闭「安全模式」→ 启用「Decision Workbench」。插件会自动打开仪表板视图。

---

## 安装

### 方式一：手动安装

1. 下载 `main.js`、`styles.css`、`manifest.json` 三个文件
2. 在你的 Obsidian vault 中创建 `.obsidian/plugins/decision-workbench/` 目录
3. 将三个文件放入该目录
4. 在 Obsidian 设置 → 第三方插件中启用「Decision Workbench」

### 方式二：从源码构建

```bash
git clone https://github.com/hhqs2486/ObsidianKbs.git
cd ObsidianKbs/decision-workbench
npm install
npm run build
```

构建产出 `main.js`，连同 `styles.css` 和 `manifest.json` 复制到 vault 的 `.obsidian/plugins/decision-workbench/` 目录。

### 多 Vault 部署

如果你有多个 vault，将三个文件分别复制到每个 vault 的 `.obsidian/plugins/decision-workbench/` 目录，然后各自在设置中启用。

---

## 使用指南

### 基本流程

1. **打开仪表板** — 插件加载后自动打开仪表板作为默认视图，或点击左侧 ribbon 图标
2. **扫描笔记** — 首次使用时，插件会自动扫描所有笔记并提取任务。也可在设置页手动触发
3. **运行分析** — 点击仪表板或看板上的「运行分析」按钮，等待引擎产出建议
4. **处理建议** — 在看板的决策建议区点击「采纳」（打开关联笔记并移除建议）或「忽略」（仅移除建议）
5. **管理任务** — 拖拽卡片切换状态，右键菜单设置优先级/删除

### 命令面板

| 命令 | 功能 |
|------|------|
| 打开决策仪表板 | 切换到沉浸式仪表板视图 |
| 打开决策看板 | 切换到 Kanban 看板视图 |
| 打开任务详情面板 | 在右侧侧栏打开任务详情 |
| 从当前笔记提取任务 | 手动触发当前笔记的任务提取 |
| 运行决策分析 | 手动触发决策引擎分析 |
| 关联笔记到任务 | 选择笔记并关联到指定任务 |
| 用自然语言添加任务 | 弹出输入框，输入一句话创建任务 |

### 设置项

| 设置 | 说明 | 默认值 |
|------|------|--------|
| 自动提取任务 | 笔记保存时自动提取任务和关联 | 开启 |
| 决策分析间隔 | 自动运行决策引擎的最小间隔（秒） | 300 |
| 关联强度阈值 | 笔记自动关联的最小相似度（0-1） | 0.3 |
| 看板列配置 | 自定义看板列名称和数量 | 待办/进行中/已完成 |

---

## 项目架构

```
decision-workbench/
├── main.ts                        # 插件入口（生命周期、命令注册、视图激活）
├── manifest.json                  # Obsidian 插件清单
├── styles.css                     # 全量 CSS 变量样式（看板+仪表板+面板+弹窗）
├── esbuild.config.mjs             # esbuild 构建配置（CJS、tree-shaking、路径别名）
├── tsconfig.json                  # TypeScript 配置
├── package.json                   # npm 配置
├── .gitignore                     # Git 忽略规则（node_modules / data.json / .dep.json）
└── src/
    ├── types/
    │   └── index.ts               # 全部类型定义 + 默认设置/规则
    ├── core/
    │   ├── TaskStore.ts            # JSON 任务存储（CRUD + 持久化）
    │   ├── NoteExtractor.ts        # frontmatter + checkbox + callout 提取
    │   ├── TaskLinker.ts           # 双向绑定 + 自动关联建议
    │   ├── DecisionEngine.ts       # 四类分析 + 去重 + 回流写入 + 日志
    │   └── DecisionFrameworks.ts  # 5W1H / SWOT 框架分析
    ├── graph/
    │   └── DecisionGraph.ts       # 内存有向图（BFS 最短路径 + 邻居查询）
    ├── views/
    │   ├── BoardView.ts           # Kanban 看板（拖拽 + 右键 + 建议区）
    │   ├── DashboardView.ts       # 沉浸式仪表板（三栏 + 浮动岛屿 + 代际锁）
    │   └── TaskPanel.ts           # 右侧任务详情面板
    ├── settings/
    │   └── SettingsTab.ts         # 插件设置页
    └── utils/
        ├── frontmatter.ts         # frontmatter 安全读写
        ├── similarity.ts          # Jaccard 相似度 + 标签聚类
        └── nlpParser.ts           # 中文自然语言任务解析
```

### 技术栈

- **TypeScript** + **esbuild** — 类型安全 + 极速构建
- **Obsidian Plugin API** — `ItemView`、`PluginSettingTab`、`MetadataCache`
- **零运行时依赖** — 不引入任何 npm 运行时包，仅依赖 Obsidian 内置 API
- **全量 CSS 变量** — 所有颜色/字体/圆角引用 Obsidian CSS 变量，暗色/亮色主题自动跟随

---

## 数据存储

| 文件 | 位置 | 说明 |
|------|------|------|
| `tasks.json` | `.obsidian/plugins/decision-workbench/` | 任务存储（JSON 格式） |
| `decision_log.jsonl` | `.obsidian/plugins/decision-workbench/` | 决策日志（只追加） |
| `decision-rules.md` | vault 根目录 | 用户自定义规则文件 |
| `data.json` | `.obsidian/plugins/decision-workbench/` | 插件设置 |

所有数据存储在 vault 内部，不依赖外部服务。笔记文件的 frontmatter 会被原地更新（添加 `suggestions` 字段），不会创建额外文件。

---

## 兼容性

- **Obsidian 1.4.0+** — 桌面端和移动端均支持
- **与 Dataview / Kanban 插件不冲突** — Decision Workbench 聚焦决策层，不替代 Dataview 的查询能力或 Kanban 的看板功能
- **主题兼容** — 全量使用 Obsidian CSS 变量，兼容所有官方和第三方主题

---

## 开发

```bash
# 开发模式（文件监听 + inline sourcemap）
npm run dev

# 生产构建（tree-shaking + 压缩）
npm run build
```

构建配置使用 esbuild，输出 CJS 格式的 `main.js`，external 排除 `obsidian`、`electron`、`@codemirror/*`、`@lezer/*`。

---

## 已知限制

- **无同步** — 所有数据存储在本地 vault 内，不支持跨设备同步（可通过 Git 或 Obsidian Sync 同步 vault 文件）
- **中文优先** — 自然语言解析针对中文优化，英文支持有限（时间表达式和优先级关键词支持英文，但解析精度较低）
- **无撤销** — 建议的「采纳」和「忽略」操作不可撤销，被移除的建议需要重新运行分析才能恢复
- **大规模 vault 性能** — 超过 1000 篇笔记的 vault 在首次扫描时可能需要数秒，后续增量更新不受影响

---

## FAQ

<details>
<summary><b>插件支持移动端吗？</b></summary>

支持。插件仅使用 Obsidian 跨平台 API，桌面端和移动端均可运行。但移动端的拖拽体验受触控操作限制，建议使用右键菜单替代拖拽。
</details>

<details>
<summary><b>会修改我的笔记文件吗？</b></summary>

会，但仅限于 frontmatter。插件会在笔记的 frontmatter 中添加 `suggestions` 和 `suggestionsGeneratedAt` 字段（如果不存在）。不会修改笔记正文内容。如果不需要此行为，可在设置中关闭「回流写入建议」。
</details>

<details>
<summary><b>与 Dataview / Kanban 插件冲突吗？</b></summary>

不冲突。Decision Workbench 聚焦决策层（建议引擎 + 框架分析），Dataview 聚焦查询层（DQL 查询），Kanban 聚焦看板层（Markdown 看板）。三者可以同时使用，互补而非替代。
</details>

<details>
<summary><b>如何备份数据？</b></summary>

所有数据文件（`tasks.json`、`decision_log.jsonl`、`data.json`）位于 `.obsidian/plugins/decision-workbench/` 目录。备份整个 `.obsidian` 目录即可。`decision-rules.md` 位于 vault 根目录，需单独备份。
</details>

---

## 许可证

[MIT License](https://opensource.org/licenses/MIT)
