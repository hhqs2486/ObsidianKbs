---
类型: 概念
主题: 软件
tags: [概念]
创建: 2026-07-23
复习: 
状态: 种子
---

# 网络Socket编程

## 一句话定义
> Socket（套接字）是 Linux/Unix 下网络通信的编程接口，封装了 TCP/IP 协议栈的系统调用（socket/bind/listen/accept/connect/send/recv），让开发者像操作文件描述符一样进行网络通信。

## 它解决什么问题 / 为什么存在
- 底层网络协议（IP/TCP/UDP）细节复杂，Socket API 提供了一个统一的"打开→读写→关闭"接口，屏蔽了 TCP 握手、重传、拥塞控制等细节。
- 在嵌入式系统中，Socket 是实现设备间网络通信（数据上报、远程控制、OTA 下载）的标准方式。

## 核心原理（大二能懂的水平）
- **TCP 服务端流程**：`socket() → bind() → listen() → accept() → recv()/send() → close()`
- **TCP 客户端流程**：`socket() → connect() → send()/recv() → close()`
- **UDP 流程**：`socket() → bind()`（服务端）/ 直接 `sendto()/recvfrom()`
- Socket 返回一个文件描述符（int fd），后续操作用 `read/write` 或 `send/recv` — 和文件 IO 完全一样。
- `select()/poll()/epoll()` 实现 IO 多路复用：一个线程管理多个连接。

## 关键参数 / 易错点
- **地址结构**：`struct sockaddr_in` 填充 IP 和端口，注意 `htons(port)` 转换为网络字节序。
- **阻塞 vs 非阻塞**：默认 `recv()` 阻塞等待数据；设 `fcntl(fd, F_SETFL, O_NONBLOCK)` 变为非阻塞模式。
- **粘包/半包**：TCP 是流式协议，`send()` 100 字节不一定对端一次 `recv()` 收到 100 字节。需要应用层定义消息边界（定长头+变长体、分隔符、长度前缀）。
- **端口复用**：服务器重启后端口可能处于 TIME_WAIT 状态（2MSL），设 `SO_REUSEADDR` 可立即复用。
- **字节序**：网络字节序是 Big-Endian，ARM/x86 通常是 Little-Endian，必须转换。

## 类比（帮助理解）
- Socket 就像打电话：`socket()` 是买手机，`bind()` 是插 SIM 卡获得号码，`listen()` 是开机等电话，`accept()` 是接听，`send()/recv()` 是双方说话。

## 设计时怎么用（反推思维）
> 做嵌入式设备数据上报功能时，设备做 TCP Client 连接云端服务器的 IP:Port，用长度前缀协议（2字节长度 + JSON/Protobuf 数据体）避免粘包，心跳包维持连接。

## 典型应用 / 我在哪见过
- 树莓派 Socket 多线程聊天室（TCP Server + pthread 每连接一线程）
- 嵌入式 OTA 升级 — HTTP/TCP Socket 下载固件
- FTP 客户端/服务器（树莓派 FTP 云盘项目）
- IoT 设备 MQTT 底层 — Socket connect 到 broker:1883
- Modbus TCP — 嵌入式工控设备通信

## 关联
- 前置知识：[[C语言]]、[[指针与内存]]、[[TCP三次握手与四次挥手]]、[[Linux文件IO与系统调用]]
- 相关：[[通信协议设计]]、[[嵌入式数据库SQLite]]、[[大小端字节序]]、[[进程与线程(Linux)]]
- 反例/误区：Socket 不是"无线"的 — TCP 连接断线需自行实现重连和心跳；多线程 Socket 服务注意 accept 后的 fd 泄漏

## 来源
- Knowledge-Notes: 从0实现基于Socket聊天室、FTP客户端与服务器
- Beej's Guide to Network Programming
