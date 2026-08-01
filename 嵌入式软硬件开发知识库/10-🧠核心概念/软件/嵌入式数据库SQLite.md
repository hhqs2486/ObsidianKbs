---
类型: 概念
主题: 软件
tags: [概念]
创建: 2026-07-23
复习: 
状态: 种子
---

# 嵌入式数据库SQLite

## 一句话定义
> SQLite 是一个嵌入式关系数据库引擎，所有数据存储在单个 `.db` 文件中，不需要独立服务器进程。它通过 C 库嵌入在应用程序进程中，支持标准 SQL 查询，是嵌入式 Linux / Android / iOS 设备上最广泛使用的本地数据库。

## 它解决什么问题 / 为什么存在
- 嵌入式设备需要可靠地存储结构化数据（传感器日志、配置参数、用户信息），但运行不了 MySQL/PostgreSQL 那样的独立数据库服务。
- SQLite 是"自包含、无服务器、零配置"的数据库：只需链接一个 C 库（~600KB），无需安装、无需 DBA 管理。
- 事务支持（ACID）保证断电也不会损坏数据，这对嵌入式设备至关重要。

## 核心原理（大二能懂的水平）
- SQLite 将整个数据库（表结构 + 索引 + 数据）存在一个跨平台的 `.db` 或 `.sqlite` 文件中。
- 提供 C API：`sqlite3_open()` 打开/创建数据库 → `sqlite3_exec(sql, callback, ...)` 执行 SQL → `sqlite3_close()` 关闭。
- 支持：CREATE TABLE、INSERT、SELECT、UPDATE、DELETE、JOIN、索引、事务（BEGIN/COMMIT/ROLLBACK）。
- 内部使用 B-tree 索引，单表千万级数据仍可高效查询。

## 关键参数 / 易错点
- **线程安全模式**：SQLite 有三种线程模式（单线程/多线程/串行），嵌入式默认串行模式，多线程需用 `sqlite3_config(SQLITE_CONFIG_MULTITHREAD)`。
- **WAL 模式**：默认 journal 模式写时阻塞读；开启 WAL（Write-Ahead Logging）后读写可并发，性能提升明显：`PRAGMA journal_mode=WAL;`
- **数据类型宽松**：SQLite 是动态类型，`INT` 列可以存文本。建议启用严格模式或使用 STRICT 表（3.37+）。
- **嵌入体积**：完整 SQLite 约 600KB，开启 `SQLITE_OMIT_DEPRECATED` 等编译选项可瘦身到 ~300KB。

## 类比（帮助理解）
- SQLite 就像把 Excel 的表格功能做成了 C 库文件 — 不用装 Office 软件，你的程序直接调函数读/写/查询表格数据。

## 设计时怎么用（反推思维）
> 做树莓派智能家居网关时，用 SQLite 存储传感器历史数据（温湿度、开关记录），配 WAL 模式让数据采集线程和 Web 查询线程并发访问不阻塞。数据量大时定期 `VACUUM` 整理文件。

## 典型应用 / 我在哪见过
- 树莓派 Socket 聊天室 — 用户信息、聊天记录存 SQLite
- Android App — SQLite 是 Android 默认本地数据库（ContentProvider 底层）
- 嵌入式 Linux 设备 — 配置文件、运行日志、OTA 下载状态
- 浏览器 — Chrome/Firefox 用 SQLite 存书签、历史记录

## 关联
- 前置知识：[[C语言]]、[[数据结构]]、[[链表]]
- 相关：[[交叉编译与根文件系统]]、[[嵌入式Linux]]、[[网络Socket编程]]、[[哈希表]]
- 反例/误区：SQLite 不适合高并发写入场景（单写锁）；不要用 SQLite 替代 redis/时序数据库做高频流数据

## 来源
- Knowledge-Notes: 嵌入式数据库 sqlite3
- SQLite 官方文档：https://www.sqlite.org/docs.html
