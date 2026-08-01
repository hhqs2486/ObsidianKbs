---

类型: 教程
来源: Mining the Social Web, 2nd Edition (O'Reilly)
创建: 2026-07-21
状态: 已读待消化
tags: [Python, 教程]
---
---

# 从社交媒体中挖掘数据（Mining the Social Web, 2nd Ed）

## 定位 / 适合谁
- 一本「用 Python 抓取并分析社交平台公开数据」的实战书，覆盖 Twitter、Facebook、LinkedIn、Google+、网页、邮箱、GitHub、语义网。
- 适合：想做社交网络分析、舆情/趋势挖掘、调用平台 API 的读者；需要一定 [[Python]] 与 [[网络爬虫]] 基础。

## 章节脉络（按 TOC）
- 导览·Twitter：趋势话题、搜索、词频统计、词汇多样性、直方图可视化
- Facebook：Social Graph API、Open Graph 协议、粉丝页/好友关系分析
- LinkedIn：连接数据导出、聚类（数据归一化、相似度度量、聚类算法）
- Google+：TF-IDF 入门、NLTK、文档相似度、bigram 分析
- 网页：[[网络爬虫]]（广度优先爬取）、[[自然语言处理]]（分句、摘要、实体分析）
- 邮箱：Unix mailbox、转 JSON、存 MongoDB、时间序列可视化
- GitHub：属性图建模、图中心性度量、兴趣图可视化
- 语义网：microformats、RDF 推理
- Part II·Twitter Cookbook：OAuth、流式 API、时间序列采集等 25+ 实用食谱

## 关键知识点（双链到 语言核心）
- 数据操作基石：[[列表]]、[[字典]]、[[字符串]]、[[推导式]]、[[文件IO]]、[[序列化(json与pickle)]]、[[模块与包]]、[[标准库]]、[[异常处理]]、[[迭代器与生成器]]
- 进阶语言特性：[[函数基础]]、[[类与对象]]、[[并发编程]]
- 分析能力（数据科学与AI 子类，已验证存在）：[[网络爬虫]]、[[自然语言处理]]、[[数据可视化]]、[[数据分析]]、[[数据科学]]、[[机器学习]]（聚类 / TF-IDF）

## 互补关系
- 与 [[网络爬虫]]（requests / BeautifulSoup）互补：本书侧重「平台 API + OAuth 鉴权」，爬虫书侧重「HTML 解析」。
- 与 [[自然语言处理]]、[[机器学习]] 互补：提供 TF-IDF、聚类等算法在真实语料上的端到端案例。
- 数据落库部分可衔接 [[序列化(json与pickle)]] 与 MongoDB 实战（库中暂无 MongoDB 卡，故不双链）。

## 来源
- Mining the Social Web, 2nd Edition (O'Reilly, 2013)，key=016，TEXT 版，内容依据真实 TOC 与正文整理。
