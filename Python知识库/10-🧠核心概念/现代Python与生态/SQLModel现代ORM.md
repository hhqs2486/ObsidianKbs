---
类型: 概念
主题: SQLModel（ORM + 校验）
tags: [Python, 现代Python与生态, 概念]
创建: 2026-07-21
复习:
状态: 种子
---

# SQLModel（ORM + 校验）

## 一句话定义
> FastAPI 作者出品，把 SQLAlchemy(ORM) 与 Pydantic(校验) 合二为一：一个模型同时用于数据库和 API。

## 它解决什么问题 / 为什么存在
- 以前 ORM 模型与 API 模型写两遍、易漂移。

## 核心原理（大二能懂的水平）
- `class User(SQLModel, table=True): id: int = Field(default=None, primary_key=True)`；类型标注即 schema。

## 关键参数 / 易错点
- `table=True` 才建表模型；与纯 SQLAlchemy 混用需注意会话。

## 类比（帮助理解）
- 像 ORM 和校验模型「合体技」。

## 设计时怎么用（反推思维）
> 做带数据库的 Web 服务时，用 SQLModel 减少重复模型。

## 关联
- 前置知识：[[pydantic数据校验]]
- 相关：[[sqlite3模块]]

## 来源
- SQLModel 官方文档
