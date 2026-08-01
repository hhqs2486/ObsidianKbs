---

类型: 概念
主题: Web与框架
创建: 2026-07-21
复习: 
状态: 种子
tags: [Python, Web与框架, 概念]
---
---

# 用户认证Web

## 一句话定义
> 用户认证是 Web 程序"确认你是谁、记住你登录了没"的机制；Flask 里最基础的做法是用 **session（加密 Cookie）** 保存登录态，配合 Flask-Login 这类扩展做更完整的管理。

## 它解决什么问题 / 为什么存在
- HTTP 本身"无状态"——每次请求服务器都不记得你上次来过。认证解决"怎么让服务器跨请求认出同一个用户"，从而区分游客/已登录、控制谁能看哪些页面。

## 核心原理（大二能懂的水平）
- 用户提交账号密码 → 视图校验 → 通过后把 `session['user_id']=id`（session 是个加密签名 Cookie，服务器私钥签名防篡改，浏览器每次自动带上）。
- 之后每个请求 Flask 从 Cookie 解出 session 还原登录态。
- 配合 `before_request` 钩子可统一做"未登录跳登录页"。`logout` 只需 `session.pop('user_id')`。
- 更完整用 Flask-Login 管 user 对象与登录钩子。

## 关键参数 / 易错点
- 必须设 `SECRET_KEY` 否则 session 无法签名。
- session 存在客户端 Cookie，别放密码等敏感明文。
- Cookie 默认有有效期，可设 `session.permanent`。
- `before_request` 里 return 会拦截请求。
- 密码绝不能明文存库（应哈希，如 Werkzeug 的 `generate_password_hash`）。
- 易错：用普通变量记登录态（进程内存，多请求/多进程就丢）。

## 类比（帮助理解）
- 像游乐园手环：你入园刷票（登录），工作人员给你一个防伪手环（session Cookie），之后玩项目亮手环就放行（请求带 session），出口摘掉（logout）。手环本身在你手上（客户端），但防伪码只有园方认。

## 设计时怎么用（反推思维）
> 做带"个人中心"的网站时，我会用 session 存 user_id 标记登录，用 `before_request` 钩子保护需登录的路由，未登录就 `redirect` 到登录页——实现"跨请求记住你是谁"。

## 典型应用 / 我在哪见过
- 登录/注册、会员中心、权限分级（管理员/普通用户）、"记住我"。
- 本书第2章用 `session['logged_in']=True` 模拟登录态做演示。

## 关联
- 前置知识：[[请求与响应]]
- 相关：[[蓝本Blueprint]] [[Web开发]]
- 反例/误区：用全局变量或进程内存存登录态（多进程/重启即失效）。

## 来源
- 《Flask Web开发实战》第2、7章；本地文本 `.cache\Flask实战\ch07`、`.cache\Flask实战\ch12`
