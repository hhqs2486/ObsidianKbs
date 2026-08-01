---
类型: 概念
主题: FastAPI（现代 Web API）
tags: [Python, 现代Python与生态, 概念]
创建: 2026-07-21
复习:
状态: 种子
---

# FastAPI（现代 Web API）

## 一句话定义
> 基于类型提示的现代 Web API 框架，自动校验请求、自动生成 OpenAPI 文档、原生 async。

## 它解决什么问题 / 为什么存在
- Flask 写校验/文档要手写；FastAPI 用类型提示「白嫖」校验与文档。

## 核心原理（大二能懂的水平）
- `@app.get("/x")` + 类型标注参数；依赖注入；与 [[pydantic数据校验]] 深度集成；性能高(asyncio)。

## 关键参数 / 易错点
- 异步路径函数要 `async def`；校验失败返回 422 而非 500。

## 类比（帮助理解）
- 像 Flask 和 pydantic 生了个「自动化」孩子。

## 设计时怎么用（反推思维）
> 写新 Web API 时优先 FastAPI 而非裸 Flask。

## 关联
- 前置知识：[[Flask]]
- 相关：[[类型标注]] [[pydantic数据校验]]

## 来源
- FastAPI 官方文档
