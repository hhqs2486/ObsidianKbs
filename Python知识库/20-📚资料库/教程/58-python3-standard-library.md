---
tags: [Python, 教程]
---

# Python 3 标准库（Doug Hellmann）· 教程笔记

> 角色：LINK（标准库与工程集群）｜缓存质量：SCANNED（**PDF 为图片版**，全文 ~0KB 文本，章节脉络据本书公认结构 + 领域知识整理，未编造代码）

## 定位
Doug Hellmann《The Python 3 Standard Library by Example》的中文版，是**面向 Python 3、按主题分卷、每个模块配可运行范例**的标准库大全。相比 Lundh 旧版（019/088，基于 Py2），本书覆盖 Py3 新模块（`pathlib`、`enum`、`concurrent`、`venv` 等），是最贴近现行开发的「标准库范例百科」。

## 适合谁
- 使用 Python 3、需要「按任务找模块 + 看范例」的工程师；
- 从 019/088（Py2）迁移过来的读者的最佳升级读本；
- 与官方文档（030）配合：本书有范例，官方有完整 API。

## 章节脉络（按主题分卷，图片版据结构整理）
- 文本处理：`string`、`textwrap`、`re`（见 [[正则表达式]]）、`difflib` —— 关联 [[字符串]] [[数据类型]]
- 数据结构：`enum`（见 [[枚举]]）、`collections`（见 [[collections模块]]）、`array`、`heapq`、`bisect`、`queue`、`struct`
- 算法：`functools`（见 [[functools模块]]）、`itertools`（见 [[itertools模块]]）
- 日期与时间：`time`、`datetime`、`calendar`（见 [[calendar模块]]） —— 关联 [[日期时间]]
- 数学：`decimal`、`fractions`、`random`（见 [[random模块]]）、`math`（见 [[math模块]]）、`statistics`
- 文件系统：`pathlib`（见 [[pathlib模块]]）、`os.path`、`glob`/`fnmatch`、`tempfile`、`shutil`（见 [[shutil模块]]）、`filecmp` —— 关联 [[os模块]] [[文件IO]]
- 数据持久化：`pickle`（见 [[序列化(json与pickle)]]）、`sqlite3`（见 [[sqlite3模块]]）、`shelve`、`dbm`
- 压缩与归档：`zlib`（见 [[zlib模块]]）、`gzip`（见 [[gzip模块]]）、`bz2`、`tarfile`、`zipfile`
- 加密：`hashlib`（见 [[hashlib模块]]）、`hmac`、`secrets`
- 通用操作系统服务：`os`（见 [[os模块]]）、`argparse`（见 [[argparse模块]]）、`logging`（见 [[logging模块]]）、`subprocess`（见 [[subprocess模块]]）、`contextlib`（见 [[contextlib模块]]）、`configparser`（见 [[configparser模块]]）、`csv`（见 [[csv模块]]）
- 可选操作系统服务：`select`、`signal`、`mmap`
- 并发：`threading`（见 [[threading模块]]）、`multiprocessing`（见 [[multiprocessing模块]]）、`concurrent.futures` —— 关联 [[并发编程]]
- 网络与互联网：`socket`、`urllib`（见 [[urllib模块]]）、`smtplib`、`http` 系列（网络层详见 网络编程 集群）
- 类型注解：`typing`（见 [[typing模块]]） —— 关联 [[类型标注]]

## 关键知识点（链接既有锚点卡）
- 标准库与工程：[[pathlib模块]] [[os模块]] [[collections模块]] [[itertools模块]] [[functools模块]] [[argparse模块]] [[csv模块]] [[sqlite3模块]] [[hashlib模块]] [[logging模块]] [[subprocess模块]] [[threading模块]] [[multiprocessing模块]] [[contextlib模块]] [[configparser模块]] [[calendar模块]] [[random模块]] [[math模块]] [[shutil模块]] [[gzip模块]] [[zlib模块]] [[typing模块]] [[urllib模块]]
- 语言核心：[[标准库]] [[文件IO]] [[序列化(json与pickle)]] [[日期时间]] [[正则表达式]] [[数据类型]] [[字符串]] [[枚举]] [[集合]] [[并发编程]] [[类型标注]]

## 与库中其他书的互补关系
- 与 **019 / 088（Lundh，Py2 范例）** 互补：Py2→Py3 演进，本书新增 `pathlib`/`enum`/`typing` 等；
- 与 **037（官方库参考 2.3）** 互补：新版范例 vs 旧版字典；
- 与 **030（Python 3.6.5 标准库文档，本集群 anchor）** 互补：本书是精选范例导读，anchor 是权威全集，二者是「上手 vs 备查」组合。

## 来源
*The Python 3 Standard Library by Example*（Doug Hellmann）。**PDF 为图片版**（缓存无可用文本），章节脉络据本书公认结构 + 领域知识整理，未编造代码。
