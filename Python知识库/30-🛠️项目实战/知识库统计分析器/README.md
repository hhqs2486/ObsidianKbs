# 知识库统计分析器

> Python 项目实战 #1 — 从需求反推实现的完整项目

## 背景

三套 Obsidian 知识库（Python/云计算/嵌入式）各有 200-500 篇笔记。每次想看看"标签分布怎么样""有没有断链""哪些笔记还没打标签"，都得手动翻。这个工具一键搞定。

## 做了什么

`analyze_vault.py` — 单个 vault 分析器：
- 扫描所有 `.md` 文件，解析 YAML frontmatter
- 统计笔记总数 + 按目录分布（带柱状图）
- 提取所有 `[[双链]]`，检测断链（排除代码块里的误匹配）
- 统计标签种类 + Top 10 热门标签
- 列出无标签笔记
- 最近修改 Top 5

`batch_analyze.py` — 一键跑三个库，汇总输出。

## 技术栈

| 知识点 | 用在哪里 |
|--------|----------|
| `pathlib.Path` | 文件遍历，跨平台路径 |
| `os.walk()` | 递归扫描目录 |
| `re` (正则) | 解析 frontmatter、提取 wikilink、过滤代码块 |
| `yaml` (PyYAML) | 解析 YAML frontmatter |
| `collections.Counter` | 标签频次统计 |
| `collections.defaultdict` | 按目录分组统计 |
| `rich` | 终端美化：彩色表格、面板、进度条 |

## 用法

```bash
# 分析单个库
python analyze_vault.py "C:/Users/liang/ObsidianKbs/Python知识库"

# 批量跑三库
python batch_analyze.py
```

## 跑出来的发现

- Python 库: 514 篇 / 21 种标签 / 15 条真实断链 / 8 篇无标签
- 云计算库: 252 篇 / 95 种标签 / 断链集中在 README 代码示例
- 嵌入式库: 263 篇 / 125 种标签 / 22 篇无标签（FreeRTOS 教程系列缺标签 + 📌本区用途文件）
