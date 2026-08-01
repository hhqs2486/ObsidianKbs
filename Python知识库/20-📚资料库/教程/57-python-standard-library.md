---
tags: [Python, 教程]
---

# Python Standard Library（O'Reilly, Fredrik Lundh）· 教程笔记

> 角色：LINK（标准库与工程集群）｜缓存质量：TEXT（ch02 目录 + 14 章正文完整）

## 定位
按「模块分组 + 范例」逐一带读 Python 标准库，覆盖约 130 个模块。早期经典（基于 Python 1.5/2.x，2001 年），以「例子驱动」讲清每个模块的常用 API，是「看到模块名就能上手」的速查式读本。

## 适合谁
- 已掌握 [[Python]] 基础、想系统认识「标准库里有哪些现成轮子」的工程师；
- 习惯看范例、需要快速知道某模块怎么用的读者；
- 不适合零基础入门（不讲解语言本身）。

## 章节脉络（按模块主题分组）
1. **Core Modules（核心）**：`__builtin__`、`exceptions`、`[[os模块]]` 与 os.path、`stat`、`string`、`re`（见 [[正则表达式]]）、`[[math模块]]`、`operator`、`copy`、`sys`、`atexit`、`time`（见 [[日期时间]]）、`types`、`gc`
2. **More Standard Modules**：`fileinput`、`[[shutil模块]]`、`tempfile`、`StringIO`/`cStringIO`、`mmap`、`UserDict`/`UserList`/`UserString`、`traceback`、`errno`、`getopt`、`getpass`、`glob`/`fnmatch`、`[[random模块]]`、`md5`/`sha`、`crypt`、`[[zlib模块]]`、`code`
3. **Threads and Processes**：`[[threading模块]]`、`Queue`、`thread`、`commands`/`pipes`/`popen2`、`signal` —— 关联 [[并发编程]]
4. **Data Representation**：`array`、`struct`、`xdrlib`、`marshal`、`pickle`/`cPickle`（见 [[序列化(json与pickle)]]）、`copy_reg`、`pprint`、`base64`/`binhex`/`quopri`/`uu`/`binascii`
5. **File Formats**：`xmllib`/`expat`、`sgmllib`/`htmllib`、`[[configparser模块]]`、`netrc`、`shlex`、`[[gzip模块]]`/`zipfile`
6. **Mail and News Message**：`rfc822`、`mimetools`、`MimeWriter`、`mailbox`、`mimetypes` …
7. **Network Protocols**：`socket`、`select`、`asyncore`/`asynchat`、`[[urllib模块]]`/`urlparse`、`ftplib`/`httplib`/`poplib`/`imaplib`/`smtplib`/`telnetlib`/`nntplib`、`SocketServer`、`cgi`、`webbrowser`（网络层详见 网络编程 集群）
8. **Internationalization**：`locale`、`unicodedata`
9. **Multimedia**：`imghdr`/`sndhdr`、`wave`/`aifc`、`winsound`、`colorsys`
10. **Data Storage**：`anydbm`/`shelve`/`dbm` 系列 —— 现代更推荐 [[sqlite3模块]]
11. **Tools and Utilities**：`dis`、`[[调试(pdb)|pdb]]`/`bdb`、`[[性能优化|profile]]`/`pstats`、`tabnanny`
12. **Platform-Specific**：`fcntl`、`pwd`/`grp`、`curses`、`resource`、`msvcrt`/`_winreg`、`posix`/`nt`
13. **Implementation Support**：`imp`、`py_compile`/`compileall`、`tokenize`/`parser`、`keyword` …
14. **Other Modules**：`filecmp`/`dircmp`、`cmd`、`readline`、`[[calendar模块]]`、`bisect`、`sched` …

## 关键知识点（链接既有锚点卡）
- 标准库与工程：[[os模块]] [[math模块]] [[random模块]] [[shutil模块]] [[gzip模块]] [[zlib模块]] [[threading模块]] [[configparser模块]] [[sqlite3模块]] [[urllib模块]] [[calendar模块]]
- 语言核心：[[标准库]] [[模块与包]] [[正则表达式]] [[序列化(json与pickle)]] [[日期时间]] [[文件IO]] [[并发编程]] [[调试(pdb)]] [[性能优化]]

## 与库中其他书的互补关系
- 与 **088（同书中文翻译）** 互为中英对照；
- 与 **037（官方 Python Library Reference 2.3）** 互补：本书重「范例」，官方参考重「完整 API 字典」；
- 与 **021（Python 3 标准库 by Example，Doug Hellmann）** 形成 Py2→Py3 演进对照（注意 `string`/`UserDict` 等在 Py3 已被 [[数据类型]] 内置类型取代，`print`/`pickle` 用法不同）；
- 与 **030（Python 3.6.5 标准库文档，本集群 anchor）** 互补：本书是精选导读，官方文档是权威全集。

## 来源
*Python Standard Library*（Fredrik Lundh, O'Reilly, 2001）。缓存 quality=TEXT（目录 ch02_Table of content.txt + 14 章分章正文齐全）。
