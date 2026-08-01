---
tags: [Python, 教程]
---

# Python 标准库（Python 江湖群 译 / Fredrik Lundh）· 教程笔记

> 角色：LINK（标准库与工程集群）｜缓存质量：TEXT（目录 + 14 章正文完整，中文翻译版）

## 定位
Fredrik Lundh《Python Standard Library》的**中文翻译版**，内容与 **57（英文原版）** 完全一致：按「模块分组 + 范例」带读标准库，覆盖约 130 个模块。基于 Python 1.5/2.x（2001 年），是范例驱动的标准库速查读本。

## 适合谁
- 偏好中文、已掌握 [[Python]] 基础、想系统认识标准库「现成轮子」的工程师；
- 与 57 配合使用：英文原版查 API 细节，本版读中文讲解。

## 章节脉络（与 57 同构，中文目录）
1. 核心模块：`__builtin__`、`exceptions`、`[[os模块]]`、`stat`、`string`、`re`（见 [[正则表达式]]）、`[[math模块]]`、`operator`、`copy`、`sys`、`atexit`、`time`（见 [[日期时间]]）、`types`、`gc`
2. 更多标准模块：`fileinput`、`[[shutil模块]]`、`tempfile`、`StringIO`、`mmap`、`UserDict`/`UserList`/`UserString`、`traceback`、`[[random模块]]`、`[[zlib模块]]`、`code`
3. 线程和进程：`[[threading模块]]`、`Queue`、`thread`、`signal` —— 关联 [[并发编程]]
4. 数据表示：`array`、`struct`、`marshal`、`pickle`（见 [[序列化(json与pickle)]]）、`pprint`、`base64`
5. 文件格式：`xmllib`、`sgmllib`、`[[configparser模块]]`、`shlex`、`[[gzip模块]]`/`zipfile`
6. 邮件和新闻消息处理：`rfc822`、`mimetools`、`mailbox`、`mimetypes` …
7. 网络协议：`socket`、`select`、`[[urllib模块]]`/`urlparse`、`ftplib`/`httplib`/`smtplib`/`telnetlib`、`SocketServer`、`cgi`（网络层详见 网络编程 集群）
8. 国际化：`locale`、`unicodedata`
9. 多媒体：`imghdr`、`wave`、`winsound`、`colorsys`
10. 数据存储：`anydbm`/`shelve`/`dbm` 系列 —— 现代更推荐 [[sqlite3模块]]
11. 工具和实用程序：`dis`、`[[调试(pdb)|pdb]]`、`[[性能优化|profile]]`、`tabnanny`
12. 平台相关模块：`fcntl`、`pwd`/`grp`、`curses`、`msvcrt`/`_winreg`、`posix`/`nt`
13. 实现支持模块：`imp`、`py_compile`/`compileall`、`tokenize`/`parser`
14. 其他模块：`filecmp`、`cmd`、`[[calendar模块]]`、`bisect`、`sched` …

## 关键知识点（链接既有锚点卡）
- 标准库与工程：[[os模块]] [[math模块]] [[random模块]] [[shutil模块]] [[gzip模块]] [[zlib模块]] [[threading模块]] [[configparser模块]] [[sqlite3模块]] [[urllib模块]] [[calendar模块]]
- 语言核心：[[标准库]] [[模块与包]] [[正则表达式]] [[序列化(json与pickle)]] [[日期时间]] [[文件IO]] [[并发编程]] [[调试(pdb)]] [[性能优化]]

## 与库中其他书的互补关系
- 与 **57（英文原版）** 是同一本书的中英版本，二选一即可，建议对照读；
- 与 **037（官方 Python Library Reference 2.3）** 互补：范例 vs 完整 API 字典；
- 与 **021（Python 3 标准库 by Example）** 形成 Py2→Py3 对照（部分模块在 Py3 改名/废弃）。

## 来源
*Python 标准库*（Fredrik Lundh 著，Python 江湖群 译）。缓存 quality=TEXT（中文目录 + 14 章正文齐全），为 57 的中文译本。
