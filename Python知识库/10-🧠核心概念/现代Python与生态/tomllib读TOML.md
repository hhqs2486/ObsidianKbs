---
类型: 概念
主题: tomllib（标准库读 TOML）
tags: [Python, 现代Python与生态, 概念]
创建: 2026-07-21
复习:
状态: 种子
---

# tomllib（标准库读 TOML）

## 一句话定义
> 标准库 `tomllib` 读 `.toml` 配置（Python 3.11 起，只读）。

## 它解决什么问题 / 为什么存在
- 解析 pyproject.toml 等配置不再需要装第三方 toml 库。

## 核心原理（大二能懂的水平）
- `tomllib.load(f)` / `tomllib.loads(s)` 返回 dict；文件须以二进制 `'rb'` 打开。

## 关键参数 / 易错点
- 只能读不能写；文件要 `'rb'` 打开；写 TOML 仍需第三方(tomli_w 等)。

## 类比（帮助理解）
- 像 json 模块的「只读版」。

## 设计时怎么用（反推思维）
> 读项目配置 / 工具配置时直接用 tomllib，少一个依赖。

## 关联
- 前置知识：[[序列化(json与pickle)]]

## 来源
- Python 3.11 (PEP 680)
