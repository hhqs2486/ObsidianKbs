---

类型: 教程
来源: 《Foundations of Python 3 Network Programming》(Brandon Rhodes & John Goerzen, 2nd ed.)
创建: 2026-07-21
状态: 已读待消化
KEY: 072b_netprog_basic
质量: SCANNED(图片版)
tags: [Python, 教程]
---
---

# Python 3 网络编程基础（Foundations of Python 3 Network Programming）

## 这条教程在解决什么
- 把「用 Python 做网络编程」这件事，从最底层的裸 socket、字节流，一路讲到 SMTP/IMAP/FTP/SSL 这些高层协议，以及服务器如何用多进程、多线程、异步三种方式同时服务多客户端。
- 它是一本「地基书」：不讲某个框架（Flask/Django 那是上层），而是讲所有上层网络库下面的共同底座——理解了它，再看 [[requests库]]、[[HTTP客户端]]、[[网络爬虫]] 都会更通透。

## 关键内容（按 PDF 章节提纲）

### 第1部分 底层网络（Low-Level Networking）
- 第1章 客户/服务器网络介绍：用「查 Google Maps 经纬度」逐步拆出 [[网络协议栈]] 的四层（应用 → HTTP → [[socket编程]] → 裸字节），讲清 IP、端口、路由、分片的角色。
- 第2章 网络客户端：手写 [[UDP协议]] 客户端，讲超时、重试、指数退避、请求 ID，以及 DNS 主机名解析。
- 第3章 网络服务器：手写 [[TCP协议]] 服务器（bind/listen/accept 套路），处理连接、读写、半关闭。
- 第4章 域名系统（DNS）：正向/反向解析、MX 记录、根据名字定位邮件/服务主机。
- 第5章 高级网络操作：广播/组播、用 [[select与poll与epoll]] 做 I/O 多路复用、非阻塞 socket、原始 socket 的高级用法。

### 第2部分 Web Service
- 第6章 Web 客户端访问：用标准库 `urllib`/`http.client` 发 HTTP 请求、处理重定向与压缩（现代实践见 [[requests库]] 与 [[urllib]]）。
- 第7章 解析 HTML 和 XHTML：用 HTMLParser 抽取页面信息（现代解析见 [[BeautifulSoup]]，属 [[网络爬虫]] 范畴）。
- 第8章 XML 和 XML-RPC：DOM/SAX 解析 XML，以及用 XML-RPC 做进程间远程调用。

### 第3部分 E-mail 服务
- 第9章 E-mail 的编写和编码：`email` 模块构造带附件/MIME 的邮件。
- 第10章 简单邮件传输协议（SMTP）：用 `smtplib` 发信。
- 第11章 POP：用 `poplib` 拉取邮件。
- 第12章 IMAP：用 `imaplib` 在服务器端检索/管理邮件（比 POP 功能更完整）。

### 第4部分 多用途的客户端协议
- 第13章 FTP：用 `ftplib` 传输文件。
- 第14章 数据库客户端：通过 DB-API 连接并查询关系型数据库。
- 第15章 SSL：在 socket 之上加 TLS 加密（`ssl` 模块、证书校验）。

### 第5部分 服务器端框架
- 第16章 SocketServer：标准库提供的服务器骨架，快速搭 TCP/UDP 服务。
- 第17章 SimpleXMLRPCServer：基于 XML-RPC 的远程调用服务器。
- 第18章 CGI：通过通用网关接口让 Web 服务器跑 Python 脚本。
- 第19章 mod_python：把 Python 嵌进 Apache 的较早方案（现已过时）。

### 第6部分 多任务处理
- 第20章 forking：用多进程（fork）让服务器一连接一进程。
- 第21章 线程：用多线程同时服务多客户端（与 [[并发编程]] 同主题）。
- 第22章 异步通信：用 `select` 事件循环 + 非阻塞 socket 在单线程里扛高并发（底层即 [[select与poll与epoll]]，现代演进见 [[异步网络编程]] 的 asyncio）。

## 我卡住/没懂的地方
- 书里用的是 Python 2 时代的示例（`httplib`、`urllib`、`asyncore`、`asynchat`），与 Python 3 的 `http.client`、异步 `asyncio` 命名/写法不同，迁移时要小心（[[socket编程]] 的 bytes 收发就是最大差异点）。
- UDP 的「客户端 `connect()` 不是真连接」「广播已略过时」这类反直觉语义，需要结合 [[UDP协议]] 反复体会。
- 三大并发模型（fork / 线程 / 异步）各自的「进程数/线程数/连接数」上限与适用边界，适合对照 [[并发编程]] 一起复盘。

## 它背后的原理（别只记操作）
- 网络编程本质是「在 [[网络协议栈]] 的某一层上说话」：调 API 用高层库，自定义可靠传输落回 [[TCP协议]] 的 socket，要广播/轻协议用 [[UDP协议]]。
- 所有高层协议（HTTP、SMTP、FTP、IMAP）最终都跑在 [[socket编程]]（TCP 或 UDP）之上——它们是「应用层协议」，替你管好了报文格式、状态机、错误处理。
- 高并发的引擎是 [[select与poll与epoll]]：一个线程用一次系统调用就知道「哪些 socket 就绪」，再配合非阻塞 I/O 演化出 [[异步网络编程]]。

## 我能复用/改编的点
> 换个需求，这套做法还能怎么用？

- 任何「两个程序跨网络对话」的需求：先判断要可靠（[[TCP协议]]）还是要轻量/广播（[[UDP协议]]），再照 [[socket编程]] 套路搭骨架。
- 调别人接口/抓网页 → 用 [[HTTP客户端]] / [[requests库]]，别手搓 socket；要并发抓取 → 接 [[异步网络编程]] 或 [[并发编程]]。
- 写需要同时服务多客户端的服务时，从三种并发模型里选：连接少而重 → 线程/进程；连接海量且多为短请求 → 异步事件循环（[[select与poll与epoll]] + 非阻塞）。

## 关联
- 概念（本集群，已存在，仅链接）：[[网络协议栈]] [[socket编程]] [[TCP协议]] [[UDP协议]] [[select与poll与epoll]] [[HTTP客户端]] [[异步网络编程]]
- 概念（他人所有，仅链接）：[[并发编程]] [[requests库]] [[urllib]] [[BeautifulSoup]]
- 主 anchor（本集群总览）：本笔记是「网络编程」集群第二 anchor，对应书为 *Foundations of Python 3 Network Programming*（主 anchor 概念卡若已建，名为 Foundations of Python 3 Network Programming）。

## 来源
- 《Foundations of Python 3 Network Programming》(Brandon Rhodes & John Goerzen, 2nd ed.)；KEY `072b_netprog_basic`。
- **PDF 为图片版，结合章节结构整理**：缓存文本 `full.txt` 接近 0KB（约 1KB），无可用正文；本笔记内容依据 `.cache/072b_netprog_basic/manifest.json` 中的真实 TOC（6 部分 / 22 章）及网络编程领域知识撰写，未编造任何命令或代码。
