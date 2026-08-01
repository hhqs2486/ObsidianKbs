---

类型: 概念
主题: 网络爬虫
创建: 2026-07-21
复习: 
状态: 种子
tags: [Python, 网络爬虫, 概念]
---
---

# Scrapy

## 一句话定义
> 基于 Twisted 异步框架的 Python 爬虫框架，把"请求调度—下载—解析—存储"流程模块化、可扩展。

## 它解决什么问题 / 为什么存在
- 手写 requests 循环很难做并发、去重、重试、分布式；Scrapy 内置调度器、下载器、中间件、管道，只需定制几个模块就能应对强反爬与大规模抓取。

## 核心原理（大二能懂的水平）
- 架构组件：Engine(引擎，核心) / Scheduler(调度器，请求入队) / Downloader(下载器) / Spiders(蜘蛛，写解析逻辑) / Item Pipeline(清洗存储) / Downloader & Spider Middlewares(钩子)。
- 数据流：Spider 产出 `Request` → Scheduler 入队 → Downloader 下载 → `Response` 回 Spider 解析出 `Item` 和新 `Request` → Item 进 Pipeline。全程异步，最大化利用带宽。

## 关键参数 / 易错点
- Spider 四要素：`name`(唯一) / `allowed_domains`(限域) / `start_urls`(起点) / `parse`(解析回调)。
- 后续请求：`yield scrapy.Request(url, callback=self.parse)`；相对 URL 用 `response.urljoin(next)`。
- `Item` 用 `scrapy.Item` + `scrapy.Field` 定义，比字典多一层字段保护，防拼写错。
- 快速导出：`scrapy crawl quotes -o quotes.json`（Feed Exports 支持 json/csv/xml 等）。
- `settings.py` 配置 `ROBOTSTXT_OBEY`、`DOWNLOADER_MIDDLEWARES`、`ITEM_PIPELINES`；命令行建项目 `scrapy startproject`、建蜘蛛 `scrapy genspider`。

## 类比（帮助理解）
- 像一条工厂流水线：每个工位(下载/解析/清洗)只干一件事，Engine 是传送带，Middleware 是可在传送带上动手脚的质检员。

## 设计时怎么用（反推思维）
> 做中大型或需要高并发、可扩展的采集系统时，我会选 Scrapy；规则简单页面用 Spider + CSS/XPath；整站翻页用 CrawlSpider + LinkExtractor；要清洗入库写 Item Pipeline；要多机协同接 Scrapy-Redis。

## 典型应用 / 我在哪见过
- 电商全站商品、招聘信息聚合、新闻大规模采集；可对接反爬中间件与分布式。

## 关联
- 前置知识：[[网络爬虫]] [[并发编程]]
- 相关：[[BeautifulSoup]](也可在 Scrapy 内做解析) [[CSS选择器]] [[XPath选择器]] [[并发爬虫]] [[爬虫数据存储]] [[反爬虫进阶]]
- 对比：[[爬虫实战]] 中提到的 pyspider（快速但扩展性弱）

## 来源
- 《Python 3网络爬虫开发实战》第13章 Scrapy 框架的使用
