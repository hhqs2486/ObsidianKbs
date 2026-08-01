---

类型: 概念
主题: Web与框架
创建: 2026-07-21
复习: 
状态: 种子
tags: [Python, Web与框架, 概念]
---
---

# ASGI

## 一句话定义
> ASGI（Asynchronous Server Gateway Interface）是 [[WSGI]] 的异步继任者——Python Web 服务器与异步 Web 程序之间的接口标准，支持 WebSocket、长连接等"双工/长连接"协议。

## 它解决什么问题 / 为什么存在
- [[WSGI]] 把一次交互固化成"一个请求 → 一个同步响应"，处理不了 WebSocket、Server-Sent Events 这种"连接一直开着、双向通信"的场景。ASGI 用异步消息通道打破了这个限制。

## 核心原理（大二能懂的水平）
- ASGI 应用是一个 `async` 可调用：`app(scope, receive, send)`。
- `scope` 装着连接元数据（类型 http/websocket、路径、头部等）；`receive` 异步收消息（请求/事件），`send` 异步发消息（响应/推送）。
- 服务器（uvicorn/daphne）负责驱动这个调用；框架（[[Django框架]] Channels、FastAPI）实现它。

## 关键参数 / 易错点
- 签名与 WSGI 完全不同（`app(environ, start_response)` vs `app(scope, receive, send)`），不能混用。
- uvicorn / daphne / hypercorn 是 ASGI 服务器；gunicorn 默认只跑 WSGI（需加 uvicorn worker）。
- 异步函数里同样不能写阻塞调用，否则失去异步意义。

## 类比（帮助理解）
- [[WSGI]] 像只能收信、寄信的邮局（一次一封，寄完结束）；ASGI 像还能打电话、开视频会议的客服中心（连接保持，双向实时）。

## 设计时怎么用（反推思维）
> 做需要 WebSocket / 实时双向通信 / 高并发异步的接口时，我会选 ASGI 体系（如 FastAPI、Django Channels），而不是只支持同步请求-响应的 WSGI。

## 典型应用 / 我在哪见过
- 实时聊天（WebSocket）、流式响应、异步 API（FastAPI）、Django Channels 项目。
- 本书虽以 WSGI 框架为主，但 ASGI 是理解 Tornado/异步 Web 演进的关键对照概念。

## 关联
- 前置知识：[[WSGI]] [[Python]] [[请求与响应]]
- 相关：[[Tornado]] [[Twisted]] [[Web部署]] [[Django框架]]
- 反例/误区：纯同步 CRUD 用 WSGI 足矣，ASGI 的异步复杂度未必划算。

## 来源
- 《Python高效开发实战 Django Tornado Flask Twisted》（刘长龙，2016）对比章节整理；PDF 为图片版，结合异步 Web 演进补充。
