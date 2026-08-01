---
类型: 教程
来源: 联网调研（Python 官方 What's New 3.10–3.13 + 2024–2025 现代库生态）
tags: [Python, 教程]
创建: 2026-07-21
状态: 已读待消化
---

# 现代 Python 与生态前沿（3.10–3.13 新特性 + 必学库）

## 这条教程在解决什么
书里的内容大多停留在 Python 3.6–3.9。本笔记从官方文档与 2024–2025 生态调研中补齐「当前 Python 长什么样、该学哪些库」，让知识库不落后于现实。

## 关键内容（按主题提纲）
### 一、语言新特性（3.10–3.13）
- 结构模式匹配 match/case → [[结构模式匹配(match)]]
- 标准库读 TOML → [[tomllib读TOML]]
- 异常组与 except* → [[异常组与except星]]
- 更清晰的错误信息 → [[更清晰的错误信息]]
- 类型参数语法 PEP 695 → [[类型参数语法(PEP695)]]
- f-string 放开 → [[f-string改进(PEP701)]]
- typing 增强 Self/TypeIs → [[typing增强(Self与TypeIs)]]
- 自由线程(无 GIL) → [[自由线程CPython(无GIL)]]
- 实验 JIT → [[JIT编译器(实验)]]
- 更快的 CPython → [[更快的CPython]]

### 二、现代必学库
- 数据校验 pydantic v2 → [[pydantic数据校验]]
- CLI typer → [[typer命令行]]
- 终端美化 rich → [[rich终端美化]]
- 高性能 DataFrame polars → [[polars数据框]]
- 异步 HTTP httpx → [[httpx异步HTTP]]
- 现代 Web API FastAPI → [[FastAPI现代Web]]
- ORM+校验 SQLModel → [[SQLModel现代ORM]]
- 包/环境管理 uv → [[uv包管理]]
- 极速 Linter ruff → [[ruff代码检查]]
- 简洁日志 loguru → [[loguru日志]]

## 我卡住/没懂的地方
- free-threaded 与 JIT 仍是实验，生产落地需等后续版本验证。
- pydantic v1→v2 破坏性变更较多，老教程代码可能跑不通。

## 它背后的原理（别只记操作）
性能提升来自「Faster CPython」专项（自适应专门化解释器）；生态工具（pydantic/polars/ruff/uv）普遍用 Rust 重写关键路径，所以又快又稳。

## 我能复用/改编的点
> 换新项目时：环境用 [[uv包管理]]、lint 用 [[ruff代码检查]]、CLI 用 [[typer命令行]]、Web 用 [[FastAPI现代Web]]、数据校验用 [[pydantic数据校验]]、大数据用 [[polars数据框]]。

## 关联
- 概念：[[结构模式匹配(match)]] [[tomllib读TOML]] [[异常组与except星]] [[更清晰的错误信息]] [[类型参数语法(PEP695)]] [[f-string改进(PEP701)]] [[typing增强(Self与TypeIs)]] [[自由线程CPython(无GIL)]] [[JIT编译器(实验)]] [[更快的CPython]] [[pydantic数据校验]] [[typer命令行]] [[rich终端美化]] [[polars数据框]] [[httpx异步HTTP]] [[FastAPI现代Web]] [[SQLModel现代ORM]] [[uv包管理]] [[ruff代码检查]] [[loguru日志]]
- 项目：（暂无）

## 来源
- Python 官方 What's New: 3.11 / 3.12 / 3.13
- 2024–2025 现代 Python 工具生态调研（pydantic/typer/rich/polars/httpx/FastAPI/SQLModel/uv/ruff/loguru 官方文档）
