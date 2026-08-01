---
类型: 概念
主题: httpx（异步 HTTP 客户端）
tags: [Python, 现代Python与生态, 概念]
创建: 2026-07-21
复习:
状态: 种子
---

# httpx（异步 HTTP 客户端）

## 一句话定义
> 现代 HTTP 客户端，requests 的精神继承者，支持异步与 HTTP/2。

## 它解决什么问题 / 为什么存在
- requests 不支持 async；并发抓取要换 aiohttp，API 不统一。

## 核心原理（大二能懂的水平）
- `httpx.get(...)` 同步；`async with httpx.AsyncClient() as c: await c.get(...)` 异步；HTTP/2、连接池。

## 关键参数 / 易错点
- 异步要 `await` 且在 async 函数里；大量并发注意连接数/超时。

## 类比（帮助理解）
- 像 requests 装上了异步引擎。

## 设计时怎么用（反推思维）
> 写并发抓取/调用外部 API 时用 httpx 替代 requests。

## 关联
- 前置知识：[[requests库]]
- 相关：[[并发编程]]

## 来源
- httpx 官方文档
