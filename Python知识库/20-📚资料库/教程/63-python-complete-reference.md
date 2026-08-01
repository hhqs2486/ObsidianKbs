---
tags: [Python, 教程]
---

# Python 技术参考大全 · 教程笔记

> 角色：LINK（标准库与工程集群）｜缓存质量：SCANNED（**PDF 为图片版**，缓存仅水印页、无可用正文与目录，章节脉络据本书公认结构 + 领域知识整理，未编造代码）

## 定位
《Python 技术参考大全》（对应 *Python: The Complete Reference* 一类综合参考）是一本「语言 + 库」合体的大百科式参考，按主题系统罗列 Python 语法与标准库 API，适合案头速查。覆盖内容宽、信息密度高。

## 适合谁
- 需要一本「大而全」的 Python 速查手册、已具备一定基础的工程师；
- 作为教程书（035）与官方文档（030）之外的补充查阅。

## 章节脉络（图片版据领域知识整理）
- 语言基础：环境搭建、语法约定、[[数据类型]]（数字/字符串/序列/映射）、[[控制流]]
- 函数与模块：[[函数基础]]、[[函数式编程]]、[[模块与包]]、[[导入系统]]
- 面向对象：[[类与对象]]、[[继承]]、[[多态]]、[[魔术方法]]、[[运算符重载]]
- 异常与文件：[[异常处理]]、[[文件IO]]
- 标准库（按主题）：
  - 文本与正则：`re` —— 关联 [[正则表达式]] [[字符串]]
  - 数据结构与算法：`collections`、`itertools`、`functools` —— 关联 [[collections模块]] [[itertools模块]] [[functools模块]]
  - 文件系统与 OS：`os`、`pathlib`、`shutil`、`glob` —— 关联 [[os模块]] [[pathlib模块]] [[shutil模块]] [[文件IO]]
  - 日期与数学：`datetime`、`math`、`random`、`calendar` —— 关联 [[日期时间]] [[math模块]] [[random模块]] [[calendar模块]]
  - 持久化与压缩：`pickle`、`sqlite3`、`zlib`、`gzip` —— 关联 [[序列化(json与pickle)]] [[sqlite3模块]] [[zlib模块]] [[gzip模块]]
  - 进程与系统：`subprocess`、`argparse`、`logging`、`configparser`、`csv` —— 关联 [[subprocess模块]] [[argparse模块]] [[logging模块]] [[configparser模块]] [[csv模块]]
  - 并发：`threading`、`multiprocessing` —— 关联 [[threading模块]] [[multiprocessing模块]] [[并发编程]]
  - 网络与互联网：`urllib`、`socket` —— 关联 [[urllib模块]]（网络层详见 网络编程 集群）
  - 类型注解：`typing` —— 关联 [[typing模块]] [[类型标注]]
- 扩展 Python：C 扩展、嵌入（关联 [[标准库]] 中的实现支持模块）

## 关键知识点（链接既有锚点卡）
- 标准库与工程：[[pathlib模块]] [[os模块]] [[collections模块]] [[itertools模块]] [[functools模块]] [[argparse模块]] [[csv模块]] [[sqlite3模块]] [[hashlib模块]] [[logging模块]] [[subprocess模块]] [[threading模块]] [[multiprocessing模块]] [[configparser模块]] [[calendar模块]] [[random模块]] [[math模块]] [[shutil模块]] [[gzip模块]] [[zlib模块]] [[typing模块]] [[urllib模块]]
- 语言核心：[[Python]] [[数据类型]] [[控制流]] [[函数基础]] [[函数式编程]] [[模块与包]] [[导入系统]] [[类与对象]] [[继承]] [[多态]] [[魔术方法]] [[运算符重载]] [[异常处理]] [[文件IO]] [[并发编程]] [[标准库]] [[正则表达式]] [[字符串]] [[日期时间]] [[序列化(json与pickle)]] [[类型标注]]

## 与库中其他书的互补关系
- 与 **034（Python 参考手册 / Nutshell）**、**065（Python 精要参考）** 同属「综合参考」一类，可择一为主、其余备查；
- 与 **030（Python 3.6.5 标准库文档，本集群 anchor）** 互补：本书是精选导读，anchor 是权威全集；
- 与 **019 / 088（Lundh 范例）** 互补：字典式罗列 vs 范例带读。

## 来源
*Python 技术参考大全*（综合参考类）。**PDF 为图片版**（缓存仅水印页，无可用正文与目录），章节脉络据综合参考类书籍公认结构 + 领域知识整理，未编造代码。
