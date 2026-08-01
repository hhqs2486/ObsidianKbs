---

类型: 概念
主题: argparse
创建: 2026-07-21
状态: 种子
tags: [Python, 标准库与工程, 概念]
---
---

# argparse 模块

## 一句话定义
> argparse 帮你解析命令行参数：`python train.py --epochs 10 --gpu`，自动生成帮助信息、类型校验、报错。

## 它解决什么问题 / 为什么存在
- 手写 `sys.argv` 解析又臭又长，还要自己校验类型、写 `--help`。
- argparse 声明式地定义参数，框架替你解析、校验、生成帮助。

## 核心原理（大二能懂的水平）
- **类比**：像填表。你先告诉 argparse「这张表有『epochs』一栏，填整数、默认 10」，运行时用户填的表（命令行）就被自动读成结构化数据。
- `add_argument('--epochs', type=int, default=10)` 注册一个参数；`parser.parse_args()` 返回带属性的对象。

## 关键参数 / 易错点
- 位置参数：`add_argument('src')`；可选参数：`add_argument('--out')`。
- `type=int/float` 自动转换；`choices=[...]` 限制取值；`action='store_true'` 做开关标志。
- `required=True` 强制必填；`help='...'` 写说明。
- 易错：取参数是 `args.epochs`（属性名，去掉 `--`）；忘记 `type=int` 会得到字符串。
- 子命令：`add_subparsers()` 实现 `git commit` 那种多级命令。

## 设计时怎么用（反推思维）
> 做「可复用 CLI 工具」时，我会先用 argparse 定义所有开关和默认值，再用 `args.xxx` 驱动逻辑，自动获得 `--help`。

## 典型应用 / 我在哪见过
- 训练脚本的 `--lr` `--batch-size`。
- 数据处理流水线的输入输出路径参数。

## 关联
- 前置知识：[[模块与包]] [[函数基础]]
- 相关：[[标准库]] [[subprocess模块]]
- 反例/误区：[[标准库]]（别再手写 sys.argv 切片）

## 来源
- Python 3.6.5 标准库文档（完整中文版）§16.4 argparse — 用于命令行选项、参数和子命令的解析器
