---
类型: 概念
主题: ruff（极速 Linter）
tags: [Python, 现代Python与生态, 概念]
创建: 2026-07-21
复习:
状态: 种子
---

# ruff（极速 Linter）

## 一句话定义
> Rust 写的极速 Linter/Formatter，10–100× 快于 flake8/black，一条命令替代多个工具。

## 它解决什么问题 / 为什么存在
- lint/format 慢、工具多(black+isort+flake8+pyupgrade)。

## 核心原理（大二能懂的水平）
- `ruff check .` 检查、`ruff check --fix` 自动修、`ruff format` 格式化。

## 关键参数 / 易错点
- 规则集合需在 pyproject 配置；与 black 格式化风格略有差异。

## 类比（帮助理解）
- 像把多个管家合并成一个超速管家。

## 设计时怎么用（反推思维）
> 项目里用 ruff 统一 lint+format，省时间。

## 关联
- 前置知识：[[包管理pip]]

## 来源
- ruff (astral) 官方文档
