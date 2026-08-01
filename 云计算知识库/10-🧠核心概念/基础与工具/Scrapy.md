---
类型: 概念
主题: Scrapy
tags: [概念, 网络爬虫, 爬虫框架]
创建: 2026-07-21
复习: 
状态: 种子
---

# Scrapy

## 一句话定义
> 用 Python 写的**开源异步爬虫框架**，是 [[爬虫框架]] 生态里最主流的实战选择之一；本书用 Java 手搓，Scrapy 是"现成轮子"对照。

## 它解决什么问题 / 为什么存在
- 让开发者用很少代码写出**可扩展、可并行**的爬虫：调度、去重、重试、并发、Pipeline 全内置，只需写 Spider（解析规则）和 Item Pipeline（清洗入库）。
- 一句话：**把"手搓爬虫"的样板代码一次性封装好**。

## 核心原理（大二能懂的水平）
- 基于 **Twisted 异步网络框架**，单进程高并发。
- 数据流：Spider 产出 `Request`/`Item` → **Engine** 调度 → **Downloader** 下载得到 `Response` → 回传给 Spider 解析 → `Item` 经 **Pipeline** 清洗入库。
- **Selector**（XPath / CSS）做 [[网页解析]]；新链接继续产出 `Request`，形成抓取循环（就是第1篇 BFS 的框架版）。

## 关键参数 / 易错点
- `CONCURRENT_REQUESTS`：并发数，权衡速度与 [[反爬虫]]。
- `DOWNLOAD_DELAY`：礼貌延迟，防封。
- `ROBOTSTXT_OBEY`：是否遵守 robots。
- **中间件**（Downloader Middleware / Spider Middleware）：扩展 UA 池、代理池、重试、降速。
- **易错**：在 Spider/解析里写**阻塞 IO**（慢查询、大文件下载）会卡死事件循环——耗时操作放 Pipeline 或单独线程/进程。

## 类比（帮助理解）
> 像一条"自动化捕鱼船"：你画好渔网形状（Spider），船自动巡航（调度）、撒网（下载）、分拣鱼（解析）、入舱（存储）。你只管"网怎么织"，船自己跑。

## 设计时怎么用（反推思维）
> 做采集系统时，我会用 **Scrapy 搭单个采集器**，把多个 Scrapy 实例打包成 [[微服务]]，用 [[Kubernetes]] 按站点数量/抓取压力弹性伸缩；框架管"单体内能跑"，K8s 管"多实例协同与高可用"。

## 典型应用 / 我在哪见过
- 新闻聚合、价格监控、SEO/舆情分析、通用站点采集。
- 本书第1篇的 `MyCrawler` 手搓示例，换成 Scrapy 就是：Queue→Scheduler、HtmlParserTool→Selector、DownLoadFile→Downloader、主循环→Spider+Engine。

## 关联
- 前置知识：[[爬虫框架]] [[网络爬虫]] [[网页解析]]
- 相关：[[反爬虫]] [[数据采集]]
- 反例/误区：在 Spider 回调里调阻塞 API（数据库同步写、requests 同步请求）。
- 云原生衔接（只链接）：[[微服务]] [[Kubernetes]]

## 来源
- 通用知识（本书以 Java 手搓为主，Scrapy 为生态对照，帮助理解框架分层）。
