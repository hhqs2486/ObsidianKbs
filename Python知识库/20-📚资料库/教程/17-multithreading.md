---

类型: 教程
来源: Multitreading（课程作业：用进程池并行实现埃拉托色尼筛）
创建: 2026-07-21
状态: 已读待消化
tags: [Python, 教程]
---
---

# Multitreading（课程作业：用多进程实现埃拉托色尼筛）

## 这条教程在解决什么
- 一份课程 assignment：用 Python 的一个**进程池（pool of processes）**并行实现「埃拉托色尼筛法」求素数，并通过不同 poolsize/chunksize 测试运行时间、解释结果。

> 注意：文件名拼写为 Multitreading，但正文实际讲的是 **multiprocessing（多进程）**，不是多线程。

## 定位 / 适合谁
- 定位：并发编程的课程实验说明（assignment spec），不是教程。
- 适合：已会 Python 基础、想理解「多进程并行 + 共享内存」并动手做性能实验的读者。
- 不适合：想系统学 threading/asyncio 的人（本作业不涉及）。

## 关键内容（按 PDF 章节提纲）
- 任务：实现 Sieve of Eratosthenes，用进程池并行「划掉倍数」。
- 共享数据：因各进程要共同修改同一张 sieve 数组，必须用 `multiprocessing.sharedctypes.RawArray` 创建跨进程共享数组（最小单位是带符号/无符号字符）。
- 并行粒度：`do_sieve(k, chunksize)` 一次划掉 k..k+chunksize-1 的倍数；以 0, chunksize, 2*chunksize… 为起始 k 并行执行。
  - chunksize=1：尽量多进程；chunksize=筛大小：退化为顺序执行。
- 接口：`main(poolsize=, chunksize=)` 返回素数列表并打印耗时(ms)。
- 对比：矩阵乘法示例各进程结果可独立回收；而筛法必须共享中间结果（引出共享内存需求）。

## 我卡住/没懂的地方
- 为什么筛法必须用共享内存、而矩阵乘不用——本质是「是否有中间结果需跨进程合并」。
- RawArray 只用字符类型，如何编码 true/false 需自行约定。

## 它背后的原理（别只记操作）
- 多进程绕开 GIL，能真正利用多核做 CPU 密集型并行（见 [[并发编程]] 中多进程部分）；这与多线程的适用场景不同。
- 进程间不共享地址空间，故需 `multiprocessing` 提供的共享机制（RawArray / Manager）或进程间通信。
- `multiprocessing` 属标准库（见 [[标准库]]）。

## 我能复用/改编的点
- 「把大任务按 chunksize 切片 → 进程池 map → 合并」是 CPU 密集型并行的通用模板。
- 用 Pool + 共享数组做参数扫描（poolsize × chunksize 网格）来测性能，可套到任意可并行算法。

## 关联
- 概念：[[并发编程]] [[标准库]]
- 项目：无

## 互补关系
- 与 高性能与并发 类书（《Python高性能编程》《Python并行编程手册》）互补：本作业是「最小可运行的多进程实验」，系统原理与剖析见那些书。
- 与《python核心笔记》(089/tut40) 第18章「多线程编程/GIL」互补：理解为何 CPU 密集型要选多进程而非多线程。

## 来源
- Multitreading（assignment：Sieve of Eratosthenes with a pool of processes）；缓存 `012_Multitreading.pdf`（TEXT，full.txt 约 3KB，仅 2 页，内容完整；注意文件名拼写错误，实指 multiprocessing）。
