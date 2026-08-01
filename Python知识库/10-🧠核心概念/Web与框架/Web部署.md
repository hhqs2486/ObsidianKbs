---

类型: 概念
主题: Web与框架
创建: 2026-07-21
复习: 
状态: 种子
tags: [Python, Web与框架, 概念]
---
---

# Web部署

## 一句话定义
> Web 部署是把开发好的 Python Web 程序放到服务器上，让外部用户通过域名/IP **稳定、安全、高并发**访问的一整套配置与运维。

## 它解决什么问题 / 为什么存在
- `flask run` / 框架自带开发服务器不能扛并发、无安全防护、进程一挂就全瘫，只能本地调试。生产需要"反向代理 + WSGI/ASGI 服务器 + 进程守护"的正经架构。

## 核心原理（大二能懂的水平）
- 典型生产栈：**Nginx**（反向代理 / 托管 [[静态文件]] / 终结 SSL）→ **WSGI 服务器**（gunicorn、uWSGI）或 **ASGI 服务器**（uvicorn、daphne）→ 你的 app（[[Flask]]/[[Django框架]]/[[Tornado]]）。
- Nginx 把外部请求转发给应用服务器，应用服务器按 [[WSGI]]/[[ASGI]] 接口调用你的程序。
- 用 systemd / supervisor 守护进程，崩溃自动重启；用虚拟环境隔离依赖（[[虚拟环境]] [[包管理pip]]）。

## 关键参数 / 易错点
- **致命**：把 `flask run` 或 `DEBUG=True` 的开发服务器直接暴露到公网——既不安全也不扛压。
- 静态文件没交给 Nginx，全压在 Python 上会变慢。
- 进程没守护（没有 systemd/supervisor），一崩全站挂。
- `SECRET_KEY`、数据库密码等走环境变量，别硬编码进仓库。
- 多机/多 worker 时，[[会话Session与Cookie]] 的 Session 存储要共享（Redis），否则换进程就掉登录。

## 类比（帮助理解）
- 把"路边试吃摊"升级成"正式餐厅"：要有门面接待（Nginx）、后厨批量出餐（gunicorn）、店长盯班（systemd）、还要符合卫生规范（安全配置）。

## 设计时怎么用（反推思维）
> 项目要上线时，我会先确定栈：Nginx + gunicorn(WSGI) 或 uvicorn(ASGI)，配好静态目录、HTTPS、进程守护和环境变量，再做 [[Web开发]] 收尾。

## 典型应用 / 我在哪见过
- 云服务器（ECS/轻量应用）部署、Docker 容器化、Nginx+gunicorn 经典组合。

## 关联
- 前置知识：[[WSGI]] [[ASGI]] [[静态文件]]
- 相关：[[Flask]] [[Django框架]] [[Tornado]] [[虚拟环境]] [[包管理pip]] [[中间件]]
- 反例/误区：以为 `python app.py` 跑起来能当生产服务器。

## 来源
- 《Python高效开发实战 Django Tornado Flask Twisted》（刘长龙，2016）部署章节；PDF 为图片版，结合章节结构整理。
