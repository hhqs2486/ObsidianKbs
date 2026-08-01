---
tags: [Python, 教程]
---

# Python 参考手册（第4版 / Alex Martelli 等）· 教程笔记

> 角色：LINK（标准库与工程集群）｜缓存质量：SCANNED（**PDF 为图片版**，缓存仅含水印页、无可用正文，章节脉络据本书公认结构 + 领域知识整理，未编造代码）

## 定位
Alex Martelli 等著《Python in a Nutshell》第 4 版（中文名《Python 参考手册》）—— 一本「桌面级全能参考」：前半讲语言机制，后半按主题讲标准库，信息密度极高，适合做案头速查。覆盖 Python 3。

## 适合谁
- 已具备一定基础、需要一本「语言 + 库」合体的权威速查手册的工程师；
- 与教程书（如 035）互补：教程讲懂，本书查细。

## 章节脉络（公认结构，图片版据领域知识整理）
- Part I 语言：
  - 内建类型与对象模型 —— 关联 [[数据类型]] [[Python对象模型]] [[数字类型]] [[字符串]] [[列表]] [[字典]] [[元组]] [[集合]]
  - 运算符与表达式 —— 关联 [[运算符重载]]
  - 语句与控制流 —— 关联 [[控制流]] [[异常处理]]
  - 函数：参数、作用域、[[装饰器]]、[[闭包]] —— 关联 [[函数基础]] [[函数式编程]] [[作用域与命名空间(LEGB)]]
  - 类与 OOP：继承、多态、特殊方法、[[描述符]]、[[元类]] —— 关联 [[类与对象]] [[继承]] [[多态]] [[魔术方法]] [[属性管理]] [[抽象基类]]
  - 模块与包 —— 关联 [[模块与包]] [[导入系统]]
  - 异常与上下文管理 —— 关联 [[上下文管理器]]
  - 并发：线程/进程/asyncio —— 关联 [[并发编程]] [[协程]]
- Part II 标准库（按主题）：
  - 文本与正则：`string`、`re` —— 关联 [[正则表达式]] [[字符串]]
  - 文件与 IO —— 关联 [[文件IO]] [[os模块]] [[pathlib模块]]
  - 持久化与数据库：`pickle`、`sqlite3` —— 关联 [[序列化(json与pickle)]] [[sqlite3模块]]
  - 数据结构与算法：`collections`、`itertools`、`functools`、`heapq` —— 关联 [[collections模块]] [[itertools模块]] [[functools模块]]
  - 日期时间：`datetime`、`calendar` —— 关联 [[日期时间]] [[calendar模块]]
  - 数学与随机：`math`、`random`、`decimal` —— 关联 [[math模块]] [[random模块]]
  - 压缩与归档：`zlib`、`gzip` —— 关联 [[zlib模块]] [[gzip模块]]
  - 进程与系统：`subprocess`、`os`、`shutil`、`argparse`、`logging`、`configparser` —— 关联 [[subprocess模块]] [[os模块]] [[shutil模块]] [[argparse模块]] [[logging模块]] [[configparser模块]]
  - 加密：`hashlib` —— 关联 [[hashlib模块]]
  - 网络与互联网：`socket`、`urllib` —— 关联 [[urllib模块]]（网络层详见 网络编程 集群）
  - 类型注解：`typing` —— 关联 [[typing模块]] [[类型标注]]

## 关键知识点（链接既有锚点卡）
- 标准库与工程：[[pathlib模块]] [[os模块]] [[collections模块]] [[itertools模块]] [[functools模块]] [[argparse模块]] [[csv模块]] [[sqlite3模块]] [[hashlib模块]] [[logging模块]] [[subprocess模块]] [[threading模块]] [[multiprocessing模块]] [[contextlib模块]] [[configparser模块]] [[calendar模块]] [[random模块]] [[math模块]] [[shutil模块]] [[gzip模块]] [[zlib模块]] [[typing模块]] [[urllib模块]]
- 语言核心：[[Python]] [[Python对象模型]] [[数据类型]] [[数字类型]] [[字符串]] [[列表]] [[字典]] [[元组]] [[集合]] [[控制流]] [[异常处理]] [[函数基础]] [[函数式编程]] [[装饰器]] [[闭包]] [[作用域与命名空间(LEGB)]] [[类与对象]] [[继承]] [[多态]] [[魔术方法]] [[运算符重载]] [[属性管理]] [[抽象基类]] [[模块与包]] [[导入系统]] [[上下文管理器]] [[描述符]] [[元类]] [[并发编程]] [[协程]] [[文件IO]] [[序列化(json与pickle)]] [[日期时间]] [[正则表达式]] [[标准库]] [[类型标注]]

## 与库中其他书的互补关系
- 与 **035（Learning Python）** 互补：本书「查细」、教程「讲懂」；
- 与 **065（Python 精要参考，Beazley）** 互补：同为精炼参考，本书更全更权威；
- 与 **030（Python 3.6.5 标准库文档，本集群 anchor）** 互补：本书是精选导读，anchor 是权威全集。

## 来源
*Python in a Nutshell* 第 4 版（Alex Martelli, Anna Ravenscroft, Steve Holden）。**PDF 为图片版**（缓存仅水印页，无可用正文），章节脉络据本书公认结构 + 领域知识整理，未编造代码。
