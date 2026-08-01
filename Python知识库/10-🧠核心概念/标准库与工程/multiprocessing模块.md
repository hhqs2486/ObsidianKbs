---

类型: 概念
主题: multiprocessing
创建: 2026-07-21
状态: 种子
tags: [Python, 标准库与工程, 概念]
---
---

# multiprocessing 模块

## 一句话定义
> multiprocessing 用「多个进程」真正并行执行，绕过 [[GIL影响]]，适合 CPU 密集型计算。

## 它解决什么问题 / 为什么存在
- threading 受 GIL 限制，多核计算用不上。多进程每个有独立解释器和内存，能占满多核。
- 代价：进程间不共享内存，通信要靠队列/管道/共享内存。

## 核心原理（大二能懂的水平）
- **类比**：threading 是一个厨房多个厨师（抢一个灶台）；multiprocessing 是开多个厨房，每个厨房独立灶台，真正同时炒菜，但厨师之间传菜要走专门通道（队列）。
- `Process(target=func).start()`；`Pool(4).map(func, items)` 把任务分到 4 个进程。

## 关键参数 / 易错点
- `Pool(n).map(func, data)` 最常用，自动分发和回收结果。
- 进程间传数据用 `multiprocessing.Queue` / `Pipe`；`args` 必须可 pickle。
- 易错：Windows 上必须把多进程代码放在 `if __name__ == '__main__':` 下，否则递归 spawn 崩溃。
- 开销比线程大（建进程、拷数据），小任务不划算。

## 设计时怎么用（反推思维）
> 做「图像处理/数值计算」这种吃 CPU 的任务时，我会用 `multiprocessing.Pool` 把数据分块并行，吃满多核。

## 典型应用 / 我在哪见过
- 批量图片缩放/转码。
- 大规模参数搜索。

## 关联
- 前置知识：[[并发编程]] [[GIL影响]] [[标准库]] [[序列化(json与pickle)]]
- 相关：[[threading模块]] [[subprocess模块]]
- 反例/误区：[[GIL影响]]（想并行算就用 multiprocessing，不是 threading）

## 来源
- Python 3.6.5 标准库文档（完整中文版）§17.2 multiprocessing — 基于过程的并行
