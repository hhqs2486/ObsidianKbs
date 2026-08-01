---
类型: 概念
主题: loguru（简洁日志）
tags: [Python, 现代Python与生态, 概念]
创建: 2026-07-21
复习:
状态: 种子
---

# loguru（简洁日志）

## 一句话定义
> 一行配置搞定日志：彩色输出、自动轮转、异常捕获。

## 它解决什么问题 / 为什么存在
- 标准 logging 配置啰嗦。

## 核心原理（大二能懂的水平）
- `from loguru import logger; logger.add("app.log", rotation="10 MB")`；`logger.info/error`；异常自动带堆栈。

## 关键参数 / 易错点
- 与标准 logging 混用需注意 handler；生产注意轮转防爆盘。

## 类比（帮助理解）
- 像给 logging 装了「傻瓜模式」。

## 设计时怎么用（反推思维）
> 项目里用 loguru 替代手写 logging 配置。

## 关联
- 前置知识：[[调试(pdb)]]

## 来源
- loguru 官方文档
