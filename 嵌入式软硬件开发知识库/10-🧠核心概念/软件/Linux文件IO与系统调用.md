---
类型: 概念
tags: [概念]
主题: Linux文件IO与系统调用
创建: 2026-07-21
状态: 已完成
---
# Linux 文件 IO 与系统调用

## 一句话定义
应用程序通过 **系统调用**（open / read / write / close / ioctl 等）访问文件的 POSIX 接口。Linux 哲学：**"一切皆文件"**——普通文件、设备、管道、socket 都是文件描述符。

## 它解决什么问题 / 为什么存在
内核态才有权限碰硬件；用户程序不能直接读网卡/硬盘。系统调用是"用户程序 → 内核"的安全大门，统一了所有 I/O 的访问方式。

## 核心原理（大二能懂的水平）
- **文件描述符 fd**：open 成功返回的小整数（0=stdin, 1=stdout, 2=stderr），后续 read/write/close 都靠它。
- `open(path, flags, mode)` 的 flag：
  - 权限：`O_RDONLY` / `O_WRONLY` / `O_RDWR`
  - 存在文件：`O_APPEND`（追加）、`O_TRUNC`（清空）
  - 不存在：`O_CREAT`、`O_EXCL`
  - 其他：`O_NONBLOCK`（非阻塞）、`O_SYNC`
- `read`/`write` 返回**实际**读写字节数（可能 < 请求值），必须按返回值循环处理。
- **文件共享**：多个 fd 指向同一文件；`dup`/`dup2` 复制 fd（重定向 stdout 到文件就是 `dup2`）。
- **标准 IO vs 文件 IO**：`fopen/fread`(标准 IO) 带用户缓冲区、效率高；`open/read`(文件 IO) 无缓冲、直接进内核。二者**不要混用同一文件**（缓冲会错乱）。
- 底层：`inode`（磁盘上的文件元信息）、`vnode`（内存中打开的文件）、`lseek` 移动偏移、`stat` 取属性。

## 关键参数 / 易错点
- `O_APPEND` 是**原子**追加，多进程写日志用它而非自己 lseek 到末尾。
- `read` 返回 0 = 读到 EOF；返回 -1 = 出错（查 `errno`/`perror`）。
- 标准 IO 与文件 IO 混用同一文件 → 数据错位。
- `write` 到 fd 不一定立刻落盘（有页缓存），重要数据 `fsync`/`O_SYNC`。

## 类比（帮助理解）
fd 像图书馆借书时的"取书号"；系统调用像你递条子给管理员（内核），他进去帮你拿书，再递出来。

## 设计时怎么用（反推思维）
- 反推"怎么读写设备"→ 设备也是 fd，`open("/dev/xxx")` 后用 read/write 收发。
- 网络编程里 socket 也是 fd，`read/write` 同样适用（见 [[通信协议设计]]、[[物联网终端]]）。

## 典型应用
配置文件读写、设备节点操作、日志、socket 通信。

## 关联
- 前置知识：[[C语言]]、[[指针与内存]]
- 相关：[[嵌入式Linux]]、[[通信协议设计]]、[[物联网终端]]、[[Linux驱动与内核模块]]（驱动实现这些 file_operations）
- 反例/误区：假设 `read` 一次读完；忽略返回值。
- 驱动中文件操作接口与 [[Linux驱动与内核模块]] 的 file_operations 对应

## 来源
`大佬学习笔记/4.Linux应用编程和网络编程.docx`（文件 IO / fd / open flag / 标准 IO / lseek / dup）。
- GitHub: zc110747/build_embed_linux_system (108章, 2026-07-22)
