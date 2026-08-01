---

类型: 概念
主题: Web与框架
创建: 2026-07-21
复习: 
状态: 种子
tags: [Python, Web与框架, 概念]
---
---

# Django框架

## 一句话定义
> Django 是 Python 的"全栈重量级"Web 框架，号称 batteries included（电池全配齐）——ORM、后台管理、路由、模板、用户认证开箱即用，按约定写就能跑出完整网站。

## 它解决什么问题 / 为什么存在
- 用 Flask 这类微框架做中大型网站时，数据库、后台、权限、表单都得自己拼；Django 把这些"通用部件"直接做好，让团队用统一约定快速交付功能完整的产品（CMS、后台系统、SaaS）。

## 核心原理（大二能懂的水平）
- 采用 **MTV** 模式：Model（对应数据库表，靠 [[ORM对象关系映射]] 生成 SQL）、Template（HTML 模板，靠 [[模板引擎Jinja2]] 渲染）、View（处理请求的函数/类）。
- `urls.py` 里的 URLconf 做 [[路由(Web)]]，把 URL 映射到 View。
- 自带 `admin` 后台：定义好 Model 就能自动生成数据管理界面。
- 一次请求：Nginx→WSGI 服务器→Django 中间件链→路由→View→Model 查库→Template→响应原路返回。

## 关键参数 / 易错点
- `DEBUG=False` 必须上生产（否则暴露调试栈）；`ALLOWED_HOSTS` 要配域名。
- 改了 Model 必须 `makemigrations` + `migrate`，否则库表不同步。
- ORM 的 **N+1 查询** 是性能大坑（应用 `select_related`/`prefetch_related`）。
- `SECRET_KEY` 绝不能提交到公网仓库。

## 类比（帮助理解）
- 像"精装房/拎包入住"：水电网家具（ORM、后台、认证）都装好了，你只管摆自己的东西；对比 [[Flask]] 像"裸车"，核心小但要自己后装。

## 设计时怎么用（反推思维）
> 做需要后台管理、用户系统、内容发布的中大型站点（如内部管理系统、博客平台、SaaS）时，我会选 Django——它用"约定"换"速度"，省下大量重复搭建。

## 典型应用 / 我在哪见过
- 内容管理系统、电商后台、数据看板、社交网站（Instagram 早期即用 Django）。
- 本书中 Django 作为四大框架之一，演示"全栈一条龙"开发完整项目。

## 关联
- 前置知识：[[Python]] [[WSGI]] [[虚拟环境]] [[包管理pip]]
- 相关：[[ORM对象关系映射]] [[路由(Web)]] [[模板引擎Jinja2]] [[中间件]] [[用户认证Web]] [[会话Session与Cookie]] [[Web部署]] [[Flask]] [[Tornado]]
- 反例/误区：超轻量小接口硬上 Django 反而显得重；微型原型用 [[Flask]] 更利落。

## 来源
- 《Python高效开发实战 Django Tornado Flask Twisted》（刘长龙，2016）Django 部分；PDF 为图片版，结合章节结构整理。
