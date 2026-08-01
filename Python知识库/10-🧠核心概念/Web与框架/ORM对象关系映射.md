---

类型: 概念
主题: Web与框架
创建: 2026-07-21
复习: 
状态: 种子
tags: [Python, Web与框架, 概念]
---
---

# ORM对象关系映射

## 一句话定义
> ORM（Object Relational Mapping，对象关系映射）把数据库表映射成 Python 类、行映射成对象，让你用"操作对象"的方式完成增删改查，而不用手写 SQL。

## 它解决什么问题 / 为什么存在
- 纯手写 SQL：容易拼错、有注入风险、换数据库（SQLite→MySQL→PostgreSQL）要改语法、和 Python 代码割裂难维护。ORM 用类与对象表达数据，自动生成参数化 SQL，跨库可迁移。

## 核心原理（大二能懂的水平）
- **类 = 表**，**类的属性 = 列**，**对象 = 一行记录**。
- 调用 `obj.save()` → 生成 INSERT/UPDATE；`Model.objects.filter(...)` → 生成 SELECT 并返回对象集合。
- 主流实现：[[Django框架]] 自带 ORM、`SQLAlchemy`（常与 [[Flask]] 搭配，见 [[数据库集成Flask]]）。

## 关键参数 / 易错点
- **N+1 查询**：循环里逐个查关联对象，会打出 N+1 条 SQL，巨慢；用 `select_related`/`prefetch_related`/join 解决。
- 懒加载：QuerySet 是惰性求值的，真正遍历才发 SQL——别误以为"写了就执行"。
- 复杂聚合/报表还是要 raw SQL，别硬拗 ORM。
- 迁移（migration）要随模型变更提交，否则线上线下表结构不一致。

## 类比（帮助理解）
- 像"翻译官"：你对数据库说中文（Python 对象 `user.name="Tom"; user.save()`），它翻译成英文（SQL `UPDATE ...`）交给数据库执行。

## 设计时怎么用（反推思维）
> 做带数据库的 Web 系统时，我会先用 ORM 定义模型（表结构即类），业务代码只跟对象打交道——既防 SQL 注入，又方便以后换数据库。

## 典型应用 / 我在哪见过
- 几乎所有 Python Web 框架的数据库层（[[Django框架]] ORM、[[Flask]]+SQLAlchemy、[[数据库集成Flask]]）。

## 关联
- 前置知识：[[Python]] [[Web开发]]
- 相关：[[Django框架]] [[数据库集成Flask]] [[Flask]] [[会话Session与Cookie]]
- 反例/误区：认为 ORM 万能——超复杂查询性能不如手写 SQL。

## 来源
- 《Python高效开发实战 Django Tornado Flask Twisted》（刘长龙，2016）Django/Flask 数据库章节；PDF 为图片版，结合章节结构整理。
