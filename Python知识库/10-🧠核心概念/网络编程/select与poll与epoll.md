---

类型: 概念
主题: 网络编程
创建: 2026-07-21
复习: 
状态: 种子
tags: [Python, 网络编程, 概念]
---
---

# select与poll与epoll

## 一句话定义
> 三者都是「I/O 多路复用」机制：让一个进程同时监视成百上千个 socket 文件描述符，只等「有事件发生的那几个」返回，从而用单线程撑起高并发。区别在底层实现与可扩展性：`select` 最老最通用，`poll` 稍干净，`epoll`(Linux)/`kqueue`(BSD) 最高效。

## 它解决什么问题 / 为什么存在
- 朴素做法「一个连接一个线程」在数千连接时成本爆炸（线程栈、切换、fd 耗尽）。
- 即使「每连接一个进程/线程 + 阻塞 recv」，操作系统也得在它们之间反复切换。多路复用让一个线程用一次系统调用就知道「现在哪些 socket 可以读/写了」，只处理就绪的——这是 [[异步网络编程]] 的发动机。

## 核心原理（大二能懂的水平）
- 流程（以 `poll` 为例，书 ch07）：`poll = select.poll()` → `poll.register(listen_sock, POLLIN)` → 主循环 `for fd, event in poll.poll():` 处理就绪事件。`poll()` 本身是阻塞调用（等事件发生），但它让「单个连接」不必各自阻塞。
- `select()`：最古老、跨平台最广，但每次调用要把整个 fd 集合在用户态/内核态拷贝，且内核返回后还要遍历所有 fd 找就绪的，fd 多了就慢；fd 数量还受 `FD_SETSIZE` 限制。
- `poll()`：接口比 select 干净（事件掩码 `POLLIN/POLLOUT/POLLHUP/...`），去掉了 select 的硬上限，但「每次全量遍历」的复杂度没变。书选它写示例正是因为它代码更清晰。
- `epoll()`(Linux) / `kqueue()`(BSD/macOS)：内核用回调「只把就绪的 fd 给你」，复杂度从 O(n) 降到 O(就绪数)，且监视列表在内核里长期持有、不用每次重传——十万级连接也不慌。
- Python 标准库统一入口：`select` 模块同时提供 `select()`、`poll()`、`epoll()`；更高层还有 `selectors` 模块自动挑选当前平台最优者。

## 关键参数 / 易错点
- **书的态度**：除非你要写新的事件驱动框架，否则别手搓 `select/poll/epoll`——直接用现成框架（现代即 asyncio/uvloop）。手写极易踩边缘情况（POLLHUP/POLLERR/POLLNVAL 等）。
- 用 poll 写服务器时，要把每个新接受的连接也 `register` 进 poll，并根据「该读还是该写」用 `modify` 在 `POLLIN`↔`POLLOUT` 间切换；连接结束要 `unregister`。
- 非阻塞配套：多路复用通常配合 `setblocking(False)`，否则某次 `recv` 仍可能卡住整个循环。
- 跨平台：epoll 仅 Linux；写可移植代码用 `selectors` 模块（自动选 epoll/kqueue/select）。
- 注意「电平触发 vs 边沿触发」（epoll 的 `EPOLLLT`/`EPOLLET`）——边沿触发更易漏事件，新手用默认电平触发更安全。

## 类比（帮助理解）
- 像宿管阿姨查寝：`select/poll` 是「挨个敲每间房门问『有事吗』」（人多了跑断腿）；`epoll/kqueue` 是「谁有事自己举手，阿姨只去举手的房间」。都是一个阿姨（单线程）管整层楼（上千连接）。

## 设计时怎么用（反推思维）
> 做高并发网络服务、又不想无脑堆线程时，我会用多路复用扛连接：现代直接上 `asyncio`（底层自动用 epoll/kqueue）；只有要极致控制或维护老代码才碰裸 `select/poll/epoll`，并务必配合非阻塞 socket 与事件循环（见 [[异步网络编程]]）。连接数小、逻辑简单则线程池（[[并发编程]]）更划算。

## 典型应用 / 我在哪见过
- Nginx/Redis 等高性能服务的底层、即时通讯网关、爬虫调度器、任何「C10K/C100K」场景。

## 关联
- 前置知识：[[socket编程]] [[TCP协议]]
- 相关：[[异步网络编程]] [[并发编程]]
- 底层依赖：[[网络协议栈]]

## 来源
- 《Foundations of Python 3 Network Programming, 2nd》第7章 Server Architecture（server_poll.py、select/poll/epoll/kqueue 对比、non-blocking 语义）
