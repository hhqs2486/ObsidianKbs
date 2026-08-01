---

类型: 概念
主题: 网络爬虫
创建: 2026-07-21
复习: 
状态: 种子
tags: [Python, 网络爬虫, 概念]
---
---

# 数据管道Pipeline

## 一句话定义
> Scrapy 里位于 Spider 之后的处理链（Item Pipeline），负责把解析出的 Item 依次做"清洗—校验—去重—存储"。

## 它解决什么问题 / 为什么存在
- Spider 解析出来的往往是"脏数据"（空字段、类型不对、重复），不能直接入库。
- Pipeline 把"加工与落库"从解析逻辑里解耦，让 Spider 只管"取数"，加工交给可插拔的流水线。

## 核心原理（大二能懂的水平）
- 每个 Pipeline 是一个类，核心是 `process_item(self, item, spider)`，处理完必须 `return item` 给下一个。
- 生命周期钩子：`open_spider`（爬虫启动时建连接）、`close_spider`（结束时关连接/刷盘）。
- `settings.py` 里用 `ITEM_PIPELINES` 按顺序串起多个 Pipeline（数字小先执行）。
- 常见工序：去空字段、类型转换（字符串→数字/日期）、去重、写 MySQL / MongoDB / Redis；简单导出也可用 Feed Exports（`-o xxx.json/csv`）。

## 关键参数 / 易错点
- 多个 Pipeline 顺序敏感：先清洗再落库，别把脏数据先写进去。
- `process_item` 必须 `return item`，否则下游 Pipeline 收不到（踩过坑）。
- 要丢弃脏数据用 `raise DropItem(...)`；落库异常要捕获，别让整条流水线崩。
- 落库细节（编码、事务、索引）见 [[爬虫数据存储]]；去重可在此结合 [[URL去重]] / Redis。

## 类比（帮助理解）
- 像工厂的"质检—包装—入库"流水线：每件产品依次过几道工序，合格了才进仓库。

## 设计时怎么用（反推思维）
> 需要清洗/入库/去重时我写 Pipeline：按"清洗 → 校验 → 落库"顺序排 `ITEM_PIPELINES`；落库逻辑放 [[爬虫数据存储]]；需要去重可在这一步结合 [[URL去重]] / Redis。让 Spider 保持"只取数"的清爽。

## 典型应用 / 我在哪见过
- Scrapy 项目里把商品/新闻写入 MySQL 或 MongoDB；与 [[Scrapy]] [[并发爬虫]] 搭配做生产级采集。

## 关联
- 前置知识：[[Scrapy]] [[网络爬虫]]
- 相关：[[爬虫数据存储]] [[URL去重]] [[并发爬虫]] [[增量爬取]]

## 来源
- 《Python项目案例开发从入门到实战：爬虫、游戏和机器学习》Scrapy 章节（Item Pipeline，PDF 为图片版，结合章节结构整理）
