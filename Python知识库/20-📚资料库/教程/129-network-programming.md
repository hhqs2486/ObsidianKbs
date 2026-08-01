---

类型: 教程
来源: Foundations of Python 3 Network Programming, 2nd Edition（Brandon Rhodes & John Goerzen）
创建: 2026-07-21
状态: 已读待消化
tags: [Python, 教程]
---
---

# Foundations of Python 3 Network Programming（Python 3 网络编程基础 第2版）

## 这条教程在解决什么
- 把「用 Python 做网络编程」这件事从底层讲到应用层：从裸 [[socket编程]]、[[UDP协议]]、[[TCP协议]]，到 [[HTTP客户端]]、邮件、FTP、SSH、RPC，再到高并发的 [[异步网络编程]] 服务端架构。
- 预设读者「会 Python、但不懂网络」：书不教你怎么配网线/路由器，只教「网络已经通了之后，怎么写程序用它」。
- 本书是「网络编程」概念簇（cluster）的 **anchor 书**：本卷负责建立并拥有该簇的概念卡（[[socket编程]] [[TCP协议]] [[UDP协议]] [[HTTP客户端]] [[异步网络编程]] [[select与poll与epoll]] [[WebSocket]] [[网络协议栈]]）。

## 关键内容（按 TOC / 章节脉络）
- **第1章 客户端/服务器网络导论**：核心思想是「协议栈（stack）」与「优先用现成库」。用「查 Google Maps 经纬度」四层递进示例（googlemaps 库 → [[HTTP客户端]]/urllib → 裸 [[socket编程]] → 字节流），并把 IP、路由、MTU/分片、IPv4/IPv6 讲透。还顺带介绍了 virtualenv/pip 工作流。
- **第2章 UDP**：[[UDP协议]] 全貌——数据报、端口三档（知名/注册/临时）、`bind/connect/sendto/recvfrom`、不可靠性、超时+指数退避、请求 ID 防重/防伪、广播、MTU 探测、socket 选项（SO_BROADCAST 等）。
- **第3章 TCP**：[[TCP协议]] 全貌——三次握手、`listen/accept` 两种 socket、四元组标识连接、`sendall` vs 部分 `send`、`recv_all`、死锁、半关闭 `shutdown`、SO_REUSEADDR、TIME-WAIT、socket 当文件（`makefile`）。
- **第4章 Socket 名字与 DNS**：主机名↔IP 解析（`getaddrinfo`/`gethostbyname`）、`socket.getservbyname`。
- **第5章 网络数据与错误**：字节/文本、结构体打包、网络错误分类与捕获。
- **第6章 TLS/SSL**：在 [[网络协议栈]] 之上加加密，把明文协议升级成安全协议（也点出 spoofing 的真安全要靠它）。
- **第7章 服务端架构**：本书高潮——阻塞 vs 非阻塞、[[select与poll与epoll]] 事件驱动服务器（`server_poll.py`）、`asyncore`/`asynchat`、并对 non-blocking / asynchronous 术语做了辨析；明确建议「别手搓 select，用现成框架」。
- **第8章 缓存、消息队列与 Map-Reduce**：ØMQ 等（并指出想用 UDP 做消息队列不如直接用 ØMQ）。
- **第9–18章 应用层协议实战**：[[HTTP客户端]]（第9章 HTTP）、屏幕抓取（第10章，提醒 JS 渲染页的坑）、Web 应用（第11章）、邮件编解码/SMTP/POP/IMAP（第12–15章）、Telnet & SSH（第16章）、FTP（第17章）、RPC（第18章）。
- （末尾为 Index；示例沿用 Python 2 语法如 `print`/`httplib`，但 API 与原理在 Python 3 通用，仅 `send/recv` 改为 bytes 需注意。）

## 我卡住/没懂的地方
- 书示例是 Python 2（urllib2/httplib、print 语句），与「Python 3」书名略有错位；落地时要用 `http.client`/`urllib` 并注意 bytes/str。
- `asyncore`/`asynchat` 已过时，现代应平移到 `asyncio`；本书未覆盖 `asyncio`（属 [[并发编程]]），需跨书补。

## 它背后的原理（别只记操作）
- **一切网络程序都是协议栈的一层**：你站在哪一层，就复用下面所有层，别手搓底层（[[网络协议栈]]）。
- **TCP 给「可靠流」、UDP 给「裸数据报」**，二者之上才能长出 HTTP、邮件、RPC 等；选哪个由「要不要可靠、要不要广播、连接密度」决定。
- **高并发靠「一个线程 + 事件循环多路复用」**，而非无脑开线程（[[select与poll与epoll]] / [[异步网络编程]]）。
- **优先用标准库/成熟第三方库**，手搓协议极易出错——这是全书反复强调的 lesson。

## 我能复用/改编的点
> 写任何需联网的程序时：先判断落在协议栈哪层 → 优先用高层库（[[requests库]]/[[urllib]] 发 HTTP、[[网络爬虫]] 做采集）；要自定义可靠通信就基于 [[TCP协议]] 的 socket 并记得 `SO_REUSEADDR`/`sendall`/`recv_all`/防死锁；要扛海量长连接就上 [[异步网络编程]]（asyncio/aiohttp）。需要服务器主动推送时用 [[WebSocket]]。

## 关联
- 本簇概念卡（本卷所有）：[[网络协议栈]] [[socket编程]] [[TCP协议]] [[UDP协议]] [[HTTP客户端]] [[异步网络编程]] [[select与poll与epoll]] [[WebSocket]]
- 跨簇链接（他人所有，仅链接）：[[requests库]] [[urllib]] [[网络爬虫]] [[并发编程]]

## 与其他书的互补关系
- **互补《Python 3网络爬虫开发实战》/《python网络爬虫从入门到实践》**（网络爬虫簇，拥有 [[requests库]] [[urllib]] [[网络爬虫]]）：那两本是「用 HTTP 抓网页」的应用视角；本书是「HTTP/TCP/socket 底层原理 + 服务端架构」的理论底座。爬虫书只链接，不重复建卡。
- **互补《Python编程精进》**（拥有 [[并发编程]]，含 asyncio）：本书第7章的事件驱动/non-blocking 是 [[并发编程]] 在网络 I/O 上的具体体现；asyncio 现代写法由精进卷补全。
- **互补 Web 与框架簇（Flask 等）**：框架之下的「请求怎么在 socket/TCP 上跑起来」，正是本书所讲。
- 本书是「网络编程」子类的唯一 anchor，负责该簇全部概念卡的建设与去重。

## 来源
- Foundations of Python 3 Network Programming, 2nd Edition（Brandon Rhodes & John Goerzen），370 页，TEXT 版（非图片版）。本笔记据 `.cache/007_Foundations of Python 3 Network Programming, Sec/` 下 full.txt 与分章 txt 整理。
