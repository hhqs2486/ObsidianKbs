---

类型: 概念
主题: 网络爬虫
创建: 2026-07-21
复习: 
状态: 种子
tags: [Python, 网络爬虫, 概念]
---
---

# CSS选择器

## 一句话定义
> 用网页样式选择器（标签 / 类 / id / 层级关系）定位元素的语法；Python 中由 BeautifulSoup 的 `.select()` 与 lxml 的 `cssselect` 提供。

## 它解决什么问题 / 为什么存在
- 对学过前端/CSS 的人更直观：按 class、id、标签组合选中元素，再取文本与属性。
- 与 XPath选择器 能力相近，是解析层另一条主流路线，写法通常更短。

## 核心原理（大二能懂的水平）
- 选择器语法：`div.content > p`（类 content 的 div 下直接 p）、`#id`（id 选择）、`.class`、`a[href]`（带 href 的 a）。
- 流程（以 BeautifulSoup 为例）：`soup.select('css表达式')` 返回 Tag 列表，再对每个 Tag 取 `.get_text()`（文本）或 `tag['href']`（属性）。底层仍是 DOM 树遍历。

## 关键参数 / 易错点
- 与 XPath 能力相近但表达力略弱（轴、函数更少）；遇到复杂谓词/层级，XPath 更顺手。
- BeautifulSoup 的解析器有差异：`html.parser`（Python 自带）、`lxml`（更快、需安装）；解析器不同，对不规范 HTML 的容错不同。
- 取属性用 `tag['href']` 或 `tag.get('href')`（后者取不到返回 None 不报错）。
- 注意：BeautifulSoup 这个"库"归别的书所有，这里只谈"CSS 选择器"这一解析概念。

## 类比（帮助理解）
- 就像写 CSS 给元素"上色"时用的那种选中规则，现在用来"选中并取数"。

## 设计时怎么用（反推思维）
> 团队熟悉前端、页面用清晰 class/id 时，我用 CSS选择器 解析最快；需要复杂谓词或轴则换 XPath选择器；解析库可直接选 BeautifulSoup（他人所有），不必自己造轮子。

## 典型应用 / 我在哪见过
- 按 `.item` 批量取列表、按 `#title` 取标题、按 `a[href^="http"]` 过滤外链。

## 关联
- 前置知识：[[网络爬虫]] [[urllib]]
- 相关（本课所有）：[[XPath选择器]] [[动态网页爬取]]
- 他人所有（仅链接）：[[BeautifulSoup]] [[requests库]] [[反爬虫进阶]]

## 来源
- 本书第5章（CSS 选择器与 BeautifulSoup 解析部分）（PDF 为图片版，结合章节结构整理）
