---
类型: 概念
主题: 异常组（ExceptionGroup 与 except*）
tags: [Python, 现代Python与生态, 概念]
创建: 2026-07-21
复习:
状态: 种子
---

# 异常组（ExceptionGroup 与 except*）

## 一句话定义
> `ExceptionGroup` 把多个异常打包；`except*` 分别捕获组内某一类。

## 它解决什么问题 / 为什么存在
- 并发/批量任务「部分失败」时，既要收集所有错误、又想按类型分别处理。

## 核心原理（大二能懂的水平）
- `raise ExceptionGroup("msg", [e1, e2])`；`except* ValueError:` 捕获组内所有 ValueError 并组成新的子组。

## 关键参数 / 易错点
- `except*` 不是 `except`；它可能产生「子组」而非单个异常。

## 类比（帮助理解）
- 像一筐鸡蛋里挑出所有臭蛋，筐还在。

## 设计时怎么用（反推思维）
> 写并发/批量处理时，用异常组保留全部失败原因，便于统一上报。

## 关联
- 前置知识：[[自定义异常]]

## 来源
- Python 3.11 (PEP 654)
