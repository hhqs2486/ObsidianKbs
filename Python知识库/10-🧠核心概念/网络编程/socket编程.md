---

类型: 概念
主题: 网络编程
创建: 2026-07-21
复习: 
状态: 种子
tags: [Python, 网络编程, 概念]
---
---

# socket编程

## 一句话定义
> Socket（套接字）是操作系统提供的「网络通信端点」抽象：它把底层 IP 网络收发包的细节封装成一个像文件一样的对象，让你用 `connect / send / recv / bind / listen / accept` 这类调用就能让两台机器的程序对话。

## 它解决什么问题 / 为什么存在
- 没有 socket，你就得自己构造、拆解 IP 包，还要处理路由、分片、重传——那不是应用层程序员该干的活。
- socket 把「跨网络的字节流/数据报」抽象成和读写文件类似的接口，让 Python 程序能像操作本地文件一样操作网络（POSIX 里 socket 本质就是文件描述符，能用 `read()/write()`，也能 `fileno()` 暴露给 `select`）。
- Python 没有发明自己的网络 API，而是直接暴露了 POSIX 的标准 socket 调用（见 ch02  critique：这反而是「英明」的，因为底层网络程序员设计的接口通常比语言设计者重造的更好用）。

## 核心原理（大二能懂的水平）
- 一个 socket 的「名字」= （IP 地址, 端口号）。服务器要先 `bind()` 占住一个端口，客户端通常由系统随机分配一个「临时端口」。
- 两类核心形态：
  - **数据报 socket**（`SOCK_DGRAM`，用于 UDP）：无连接，`sendto(数据, 地址)` / `recvfrom()` 一次发一个包，包可能丢、乱序。
  - **流式 socket**（`SOCK_STREAM`，用于 TCP）：面向连接，`connect()` 建立连接后，`send()/recv()` 操作的是「字节流」，没有包边界。
- 服务端套路（TCP）：`socket()` → `bind()` → `listen()` → 循环 `accept()`（每次返回一个「已连接 socket」专门服务这个客户端）。
- 端口三档（IANA）：0–1023 知名端口（如 53=DNS、80=HTTP，普通用户常无权占用）；1024–49151 注册端口；49152–65535 临时端口（客户端自动取用）。
- Python 3 注意：`socket.send/recv` 收发的都是 **bytes**，不是 str；发字符串要先 `.encode()`，收回来要 `.decode()`（这正是 Python 3 与书里 Python 2 示例的最大差别）。

## 关键参数 / 易错点
- **地址已被占用**：服务器重启报 `Address already in use`。原因：旧 TCP 连接处于 TIME-WAIT 状态（约 4 分钟）。解决办法：绑定前 `s.setsockopt(SOL_SOCKET, SO_REUSEADDR, 1)`。几乎每个服务端都该默认带上。
- **TCP 不是「发一条消息收一条消息」**：`send()` 可能只发出部分数据（返回已发字节数），要用 `sendall()` 保证发完；`recv(n)` 也可能只返回不足 n 字节，要自己写循环读到足够长度（`recv_all`）。
- **UDP `connect()` 不是真连接**：它只是给本 socket 设了「默认收件人」并过滤掉非该服务器的回包，不发任何网络包；且只能连一个对端，再 `connect()` 会覆盖前一个。
- **`bind()` 的 IP 决定谁能连你**：`'127.0.0.1'` 只接收本机；`''`(0.0.0.0) 接收任意网卡。
- 阻塞调用（如 `recv`）会暂停程序直到有数据；需要并发时要配合 [[select与poll与epoll]] 或 [[并发编程]]（多线程/asyncio）。

## 类比（帮助理解）
- socket 就像公司的总机分机号：（IP=大楼地址，端口=分机号）。客户端拨号 `connect`，服务器 `listen` 等铃响，`accept` 接起分给一个新坐席（已连接 socket）专门服务你，主总机继续等下一个来电。

## 设计时怎么用（反推思维）
> 做任何「两个程序要跨网络说话」的系统时，我会先判断用 [[TCP协议]]（要可靠、像管道）还是 [[UDP协议]]（要广播/自己实现协议）；然后照上面的服务端/客户端套路搭骨架，记得 `SO_REUSEADDR`、用 `sendall`、自己拼 `recv_all`，并想清楚「什么时候用阻塞、什么时候上 [[select与poll与epoll]]/[[异步网络编程]]」。业务层若只是调 HTTP 接口，直接用 [[requests库]]/[[urllib]]，别手写 socket。

## 典型应用 / 我在哪见过
- 手写聊天室、游戏对战同步、自定义二进制协议、RPC、以及所有高层协议的底座（HTTP、邮件、FTP 最终都跑在 socket 上）。

## 关联
- 前置知识：[[网络协议栈]] [[TCP协议]] [[UDP协议]]
- 相关：[[HTTP客户端]] [[select与poll与epoll]] [[异步网络编程]] [[并发编程]]
- 上层库（他人所有，仅链接）：[[requests库]] [[urllib]]

## 来源
- 《Foundations of Python 3 Network Programming, 2nd》第1章（裸 socket 对话 Google Maps）、第2章（UDP socket）、第3章（TCP socket）
