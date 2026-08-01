---
tags: [Python, 教程]
---

# Python 技术手册（第2版 / Mark Lutz）· 教程笔记

> 角色：LINK（标准库与工程集群）｜缓存质量：SCANNED（**PDF 为图片版**，缓存仅水印页、无可用正文，章节脉络据本书公认结构 + 领域知识整理，未编造代码）

## 定位
Mark Lutz《Python Pocket Reference》第 2 版——一本**口袋速查卡**：把语言语法、内建函数/异常、标准库模块按主题压缩成可随手翻的薄册子。基于 Python 2.x 时代，是「写代码时放在键盘边」的极简参考。

## 适合谁
- 已学过 Python、需要随时翻语法/API 清单的工程师；
- 不适合系统学习（本身就是「清单」，无讲解）。

## 章节脉络（公认结构，图片版据领域知识整理）
- 核心语法速查：[[数据类型]]（数字/字符串/序列/映射）、[[控制流]]、[[运算符重载]] 速查表
- 函数与模块：[[函数基础]]、[[函数式编程]]、[[模块与包]]、[[导入系统]]
- 类与 OOP：[[类与对象]]、[[继承]]、[[多态]]、[[魔术方法]]
- 内建对象清单：内建函数、内建异常、内建类型（关联 [[异常处理]] [[标准库]]）
- 标准库模块速查（按主题）：
  - 文本/正则：`re` —— 关联 [[正则表达式]] [[字符串]]
  - 数据结构与算法：`collections`、`itertools`、`functools` —— 关联 [[collections模块]] [[itertools模块]] [[functools模块]]
  - 文件系统与 OS：`os`、`os.path`、`shutil`、`glob` —— 关联 [[os模块]] [[shutil模块]] [[文件IO]]
  - 日期与数学：`time`、`datetime`、`math`、`random`、`calendar` —— 关联 [[日期时间]] [[math模块]] [[random模块]] [[calendar模块]]
  - 持久化与压缩：`pickle`、`shelve`、`zlib`、`gzip` —— 关联 [[序列化(json与pickle)]] [[zlib模块]] [[gzip模块]]
  - 进程与系统：`subprocess`、`commands`、`getopt`、` commands` —— 关联 [[subprocess模块]]
  - 并发：`threading`、`Queue` —— 关联 [[threading模块]] [[并发编程]]
  - 网络与互联网：`socket`、`urllib`、`httplib`、`smtplib` —— 关联 [[urllib模块]]（网络层详见 网络编程 集群）
  - 类型注解：`typing`（新版增补） —— 关联 [[typing模块]] [[类型标注]]

## 关键知识点（链接既有锚点卡）
- 标准库与工程：[[os模块]] [[collections模块]] [[itertools模块]] [[functools模块]] [[shutil模块]] [[calendar模块]] [[random模块]] [[math模块]] [[zlib模块]] [[gzip模块]] [[subprocess模块]] [[threading模块]] [[typing模块]] [[urllib模块]]
- 语言核心：[[Python]] [[数据类型]] [[控制流]] [[函数基础]] [[函数式编程]] [[模块与包]] [[导入系统]] [[类与对象]] [[继承]] [[多态]] [[魔术方法]] [[运算符重载]] [[异常处理]] [[文件IO]] [[并发编程]] [[标准库]] [[正则表达式]] [[字符串]] [[日期时间]] [[序列化(json与pickle)]] [[类型标注]]

## 与库中其他书的互补关系
- 与 **035（Learning Python，同作者 Lutz）** 互补：本书是「清单」，Learning Python 是「教材」，同作者体系一致；
- 与 **065（Python 精要参考）**、**034（Python 参考手册）** 同属参考类，本书最薄最简；
- 与 **030（Python 3.6.5 标准库文档，本集群 anchor）** 互补：本书偏 Py2 速查，查现行 Py3 API 以 anchor 为准。

## 来源
*Python Pocket Reference* 第 2 版（Mark Lutz, O'Reilly）。**PDF 为图片版**（缓存仅水印页，无可用正文），章节脉络据本书公认结构 + 领域知识整理，未编造代码。
