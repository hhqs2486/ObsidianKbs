---

类型: 概念
主题: Web与框架
创建: 2026-07-21
复习: 
状态: 种子
tags: [Python, Web与框架, 概念]
---
---

# 会话Session与Cookie

## 一句话定义
> **Cookie** 是服务端下发给浏览器、之后每次请求自动带回的小文本；**Session** 是服务端保存的"用户状态"，靠 Cookie 里的 `sessionid` 把多次请求关联到同一个用户。

## 它解决什么问题 / 为什么存在
- HTTP 本身**无状态**：每次请求服务器都"不认识你是谁"。登录后怎么记住"这个人是已登录的张三"？靠 Cookie（客户端的 id）+ Session（服务端的状态）配合。

## 核心原理（大二能懂的水平）
- 登录成功后，服务端在内存/Redis 里存一份 session 数据，并下发一个带 `sessionid` 的 Cookie。
- 之后浏览器每次请求都自动带 Cookie，服务端用 `sessionid` 查到对应的 session，就知道你是谁、购物车有什么。
- 框架普遍提供 session 对象（[[Flask]] 的 `session`、[[Django框架]] 的 `request.session`），底层靠签名/加密 Cookie 或服务器存储。

## 关键参数 / 易错点
- Cookie 存在客户端、**明文可见**，绝不放密码等敏感信息；大小通常 ≤4KB。
- Session 需要服务端存储（内存/数据库/Redis），多机部署要共享存储否则"换台机器就掉登录"。
- 必须设 `SECRET_KEY` 给 Cookie 签名，否则可被伪造；生产开 `HttpOnly` + `Secure`（HTTPS）防窃取。
- 误区：把 Session 当成"存在浏览器里"——其实数据在服务端，浏览器只存一把钥匙（sessionid）。

## 类比（帮助理解）
- 像游乐园手环：你手腕上的手环（Cookie 里的 sessionid）是凭证，工作人员一扫（服务端查 session）就知道你买了全天票（登录态），不用每次重新买票。

## 设计时怎么用（反推思维）
> 做需要"记住用户"的任何系统（登录、购物车、偏好设置）时，我会用 Session 存状态、Cookie 存 id，并配合 [[用户认证Web]] 做身份校验。

## 典型应用 / 我在哪见过
- 登录保持、购物车、多步表单暂存、第三方登录回调态。

## 关联
- 前置知识：[[请求与响应]] [[用户认证Web]]
- 相关：[[WSGI]] [[中间件]] [[Django框架]] [[Flask]] [[ORM对象关系映射]]
- 反例/误区：把 JWT 和 Session 混为一谈——JWT 把状态放客户端、自校验，Session 把状态放服务端。

## 来源
- 《Python高效开发实战 Django Tornado Flask Twisted》（刘长龙，2016）用户与会话章节；PDF 为图片版，结合章节结构整理。
