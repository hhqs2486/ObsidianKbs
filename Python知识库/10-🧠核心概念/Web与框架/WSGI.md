---

类型: 概念
主题: Web与框架
创建: 2026-07-21
复习: 
状态: 种子
tags: [Python, Web与框架, 概念]
---
---

# WSGI

## 一句话定义
> WSGI（Web Server Gateway Interface）是 Python 官方规定的"Web 服务器 ↔ Python Web 程序"之间的沟通协议（接口标准）。

## 它解决什么问题 / 为什么存在
- 早期每个 Python Web 框架都用自己的方式接服务器，换个服务器（Apache/Nginx）或换个框架就跑不起来。WSGI 统一了接口：服务器只要会"调用一个函数并传 environ 和 start_response"，框架只要"实现这个函数"，两边就能随意组合。

## 核心原理（大二能懂的水平）
- WSGI 把一次请求抽象成：服务器准备好一个字典 `environ`（装着请求方法、URL、请求头等所有信息）和一个回调函数 `start_response(status, headers)`，然后调用你的 Web 程序 `app(environ, start_response)`；你的程序返回一个可迭代的字节串（响应体）。
- Flask 内部靠 **Werkzeug** 来真正处理和实现这套调用。
- 对大二理解：它就是一个"约定好的函数签名"，让服务器和框架互不认识也能配合。

## 关键参数 / 易错点
- `environ` 是 WSGI 环境字典（不是 Flask 的 request，但 Flask 的 request 是从它造出来的）。
- `start_response` 必须先调用以发送状态码和响应头。
- WSGI 本身处理不了静态文件、SSL 等，这些交给前面的服务器（如 Nginx）。
- 误区：以为 WSGI 是服务器——它不是，它是接口；**gunicorn / uwsgi** 才是 WSGI 服务器。

## 类比（帮助理解）
- 像 USB 接口标准。电脑（服务器）和 U 盘（Web 程序）都不用关心对方厂家，只要都遵守 USB 协议就能通电传数据。

## 设计时怎么用（反推思维）
> 当我要把一个 Flask 程序部署上线时，我不会让 `flask run` 的开发服务器扛流量，而是前面放 gunicorn（WSGI 服务器）或 Nginx+uwsgi——因为 WSGI 标准保证"换服务器不用改框架代码"。

## 典型应用 / 我在哪见过
- 任何 Python Web 框架（Flask/Django）与服务器之间的桥接；部署时必用。

## 关联
- 前置知识：[[Python]]
- 相关：[[Flask]]
- 反例/误区：把 `flask run` 的开发服务器直接用于生产（不支持高并发、无 WSGI 服务器能力）。

## 来源
- 《Flask Web开发实战》第1、16章；本地文本 `.cache\Flask实战\ch06`、`.cache\Flask实战\ch22`
