---

类型: 教程
来源: 《Python 3网络爬虫开发实战》崔庆才
创建: 2026-07-21
状态: 已读待消化
tags: [Python, 教程]
---
---

# Python3网络爬虫开发实战

## 这条教程在解决什么
- 把"用 Python 从零搭一个能应对真实网站（含 Ajax、动态渲染、登录、验证码、封 IP）的爬虫"这件事，从零散的 HTTP/解析/存储知识点串成一套可落地的工程能力。
- 不只教"怎么发请求"，而是教"看到一类网站，怎么反推出该用什么技术、怎么组织代码、怎么部署"。

## 关键内容（按 PDF 章节提纲）
- 第2章 爬虫基础：URI/URL、HTTP/HTTPS、请求方法(GET/POST)、请求头(User-Agent/Cookie/Referer)、响应状态码、网页组成(HTML/CSS/JS)、DOM 节点树、会话与 Cookies、代理原理。
- 第3章 基本库：urllib 与 requests——发请求、带请求头、会话保持(Session)、设置代理、文件上传、超时。
- 第4章 解析库：XPath/lxml 与 BeautifulSoup——把 HTML 变成可提取的节点树。
- 第5章 数据存储：TXT/JSON/CSV 文件存储；MySQL(PyMySQL，事务ACID)；MongoDB(PyMongo，schema 灵活)；Redis(缓存/队列/去重)。
- 第6章 Ajax 数据爬取：分析 XHR 请求，直接抓接口返回的 JSON，而不是硬解析页面。
- 第7章 动态渲染页面：Selenium / Splash 渲染 JS 后再抓取。
- 第8章 验证码的识别：tesserocr 图形验证码 OCR；极验滑动验证码用 Selenium 模拟缺口与轨迹；点触验证码接超级鹰打码平台。
- 第9章 代理的使用：proxies 参数设代理(HTTP/HTTPS/SOCKS5)；用 Redis 有序集合搭代理池并做分数机制剔除失效代理。
- 第10章 模拟登录：分析登录请求(Form Data / authenticity_token)，用程序拿登录后 Cookies，并维护 Cookies 池。
- 第11章 App 的爬取：抓包提取 App 后端接口。
- 第12章 pyspider 框架：带 WebUI 的可视化快速开发框架(Handler/on_start/crawl)。
- 第13章 Scrapy 框架：架构(Engine/Scheduler/Downloader/Spiders/Item Pipeline/Middlewares)、数据流、Spider/Item/Request、选择器、Feed Exports、可扩展中间件。
- 第14章 分布式爬虫：Scrapy-Redis、共享爬取队列、Request 指纹去重集合、Bloom Filter。
- 第15章 分布式部署：Scrapyd / Docker 部署。

## 我卡住/没懂的地方
- 极验滑动验证码的"人类轨迹"如何模拟才不像机器（加速度曲线、随机抖动）。
- Bloom Filter 的误判率与内存占用的定量权衡，什么规模才值得上。
- Scrapy 中 Downloader Middleware 与 Spider Middleware 的精确执行顺序与短路逻辑。

## 它背后的原理（别只记操作）
- 爬虫本质 = 程序化地发 HTTP 请求并解析响应；请求拿到的是 HTML/JSON，解析靠选择器或正则。
- 并发提升速度靠"把网络等待时间重叠"：I/O 密集下多线程/协程有效（受 GIL 影响但等待时不占 CPU）。
- 反爬与反反爬是"请求特征"(IP / UA / Cookie / 行为节奏) 的博弈；分布式靠"共享队列 + 去重集合"把单机任务拆到多机协同。

## 我能复用/改编的点
> 换个需求，这套做法还能怎么用？

- 任何"采外部数据"的需求（竞品监控、舆情分析、价格比对、文献聚合）都能套同一套路：
  分析目标站点类型 → requests/Scrapy 取数 → BeautifulSoup/XPath 解析 → MySQL/Mongo 存储 → 按需加代理/模拟登录/分布式。
- 代理池、Cookies 池、去重集合(Bloom Filter) 是三个可独立复用的"基础设施组件"，不局限于爬虫。

## 关联
- 概念：[[网络爬虫]] [[requests库]] [[BeautifulSoup]] [[Scrapy]] [[并发爬虫]] [[反爬虫进阶]] [[爬虫数据存储]] [[爬虫实战]]
- 项目：[[爬虫实战]]
- 基础/技术（他人所有，仅链接）：[[Python]] [[正则表达式爬虫]] [[XPath选择器]] [[CSS选择器]] [[并发编程]] [[数据科学]]

## 来源
- 《Python 3网络爬虫开发实战》崔庆才；缓存文本位于 `.cache/爬虫开发实战/`（manifest.json + chNN_*.txt）
