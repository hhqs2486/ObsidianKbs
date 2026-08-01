---

类型: 概念
主题: Web与框架
创建: 2026-07-21
复习: 
状态: 种子
tags: [Python, Web与框架, 概念]
---
---

# 数据库集成Flask

## 一句话定义
> 数据库集成指用 **Flask-SQLAlchemy**（包装 SQLAlchemy）在 Flask 里用"Python 类"操作数据库，免去手写 SQL。

## 它解决什么问题 / 为什么存在
- 网站要存用户、文章、留言等数据，直接拼 SQL 字符串既难维护又容易 SQL 注入。ORM（对象关系映射）让你把数据库表当成 Python 类、行当成对象来增删改查。

## 核心原理（大二能懂的水平）
- 定义模型 `class Message(db.Model): id=db.Column(Integer, primary_key=True); body=db.Column(Text)`——类对应表、类属性对应列。`db` 是 `SQLAlchemy(app)` 实例。
- 增：`db.session.add(obj); db.session.commit()`。
- 查：`Message.query.filter_by(name=...).all()`。
- 迁移用 **Flask-Migrate**（基于 Alembic）：`flask db migrate` / `flask db upgrade` 同步表结构变更。

## 关键参数 / 易错点
- 每个模型必须有 `primary_key`。
- 改了模型字段要 `flask db migrate` 生成迁移脚本再 `upgrade`，直接改类不自动改库。
- `db.session.commit()` 别忘了否则改动不落库。
- `db.create_all()` 只建一次、不更新已有表。
- 连接串 `SQLALCHEMY_DATABASE_URI` 按 DBMS 不同（SQLite 文件 / MySQL / PostgreSQL）。
- 易错：在请求外操作 session 没推送应用上下文。

## 类比（帮助理解）
- 像用 Excel：每一行数据是一个对象，你不用写"SELECT"黑话，直接 `sheet.query(...)` 查、`.save()` 存；SQLAlchemy 是翻译官，把你的 Python 操作翻成数据库懂的 SQL。

## 设计时怎么用（反推思维）
> 做留言板时，我会用 `db.Model` 定义 Message（body/name/timestamp），视图里 `form 提交 → new Message(...) → db.session.add+commit`，首页 `Message.query.order_by(...).all()` 查出来交给模板渲染——数据持久化全自动。

## 典型应用 / 我在哪见过
- 用户表、文章/评论、订单、任何需要持久化的业务数据。
- 本书留言板：`Message(db.Model)` 含 id/body/name/timestamp；用 Faker 造虚拟数据、Flask-Moment 本地化时间。

## 关联
- 前置知识：[[类与对象]]
- 相关：[[Flask]] [[模板引擎Jinja2]]
- 反例/误区：手写字符串拼 SQL（注入风险、难维护）。

## 来源
- 《Flask Web开发实战》第5、7章；本地文本 `.cache\Flask实战\ch10`、`.cache\Flask实战\ch12`
