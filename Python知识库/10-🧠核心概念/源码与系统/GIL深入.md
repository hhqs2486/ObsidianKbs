---

类型: 概念
主题: GIL深入
创建: 2026-07-21
复习: 
状态: 种子
tags: [Python, 源码与系统, 概念]
---
---

# GIL深入（全局解释器锁）

## 一句话定义
GIL（Global Interpreter Lock）是 CPython 的一把进程级互斥锁：任意时刻**只有一个线程**能拿着它进入字节码解释器。它是 CPython 多线程机制的地基，用来保护内部对象（尤其是引用计数）不被并发破坏。

## 它解决什么问题 / 为什么存在
- CPython 内部大量操作（增删引用、改对象）不是线程安全的，给每个对象加细粒度锁代价极高。GIL 用「一把大锁把守字节码解释器大门」的简单方案，保证同一进程内解释器串行执行，兼顾正确性与（当年单核下的）效率。
- 书里提到：Greg Stein 曾在 Python 1.5 上做过「去 GIL、改用细粒度锁」的实验，结果单处理器效率只有带 GIL 版本的一半左右——加解锁太重，所以 GIL 被保留。

## 核心原理（大二能懂的水平）
- 底层就是一个锁变量 `static PyThread_type_lock interpreter_lock = 0; /* This is the GIL */`。在 Win32 上它本质是一个内核 Event 对象（`hevent`）+ 记录持锁线程 id 的 `thread_id`。
- 线程想进解释器，必须先 `PyThread_acquire_lock` 抢到 GIL；用完（或时间片到点）通过 `PyThread_release_lock` 释放，并 `SetEvent` 唤醒等待者。
- **释放时机**：不是「用完整个解释器才放」，而是解释器每执行若干字节码指令（一个「tick」/时间片）就可能主动释放，让别的线程有机会抢。所以多线程是「交替执行」而非真正并行。
- 只有用到 `threading` 时才会建 GIL：`PyEval_InitThreads` 里才真正创建 GIL；纯单线程程序连线程环境都不建。
- 多核上 GIL 的代价：多个 CPU 核心只能有一个在跑 Python 字节码，多核退化为「抢一把锁的单核」，CPU 密集型多线程反而可能更慢。

## 关键参数 / 易错点
- GIL 保护的是「解释器 + 对象内部状态（含引用计数）」；它**不是**一把解决所有并发问题的锁——I/O 等待时会释放 GIL，所以 I/O 密集型多线程仍有益。
- CPU 密集 → 用 `multiprocessing`（多进程，各自独立 GIL）或 C 扩展释放 GIL；I/O 密集 → `threading`/`asyncio` 即可。
- 死锁风险：子线程在申请 GIL 之前，必须先通知主线程「我这边准备好了」（如 `obj.done` 事件），否则会死锁——书里专门分析了这个顺序。
- GIL 是 CPython 实现细节，Jython/PyPy/IronPython 没有这把锁；Python 3 后续版本（3.2+ 的 GIL 重写、3.12+ 的 per-interpreter GIL）在不断改进，但「单解释器单 GIL」的基本事实未变。

## 类比（帮助理解）
GIL 像一间只有一个座位的「解释器操作间」，门外排着多个线程。谁抢到门禁（GIL）谁进去操作，干一小会儿（一个时间片）就被请出来，下一个进去。多个 CPU 核心就像多个排队区，但门只有一个，所以再多核心也只有一个在里面干活。

## 设计时怎么用（反推思维）
> 做并发程序时，我会先判断瓶颈类型：CPU 密集就上 `multiprocessing` 或把热点放进释放 GIL 的 C 扩展（如 NumPy）；I/O 密集用 `threading`/`asyncio`。绝不会指望 `threading` 让纯 Python 计算在多核上并行加速。

## 典型应用 / 我在哪见过
- `threading` 模块底层依赖 GIL；`concurrent.futures`、`queue.Queue` 的线程安全建立在 GIL 之上。
- 性能调优、为什么「Python 多线程跑不满多核」。
- 与 [[引用计数]] 强相关（GIL 保护计数操作）；与 [[并发编程]]（语言核心视角）互补；是 [[解释器启动流程]] 中线程环境初始化的一部分。

## 关联
- 前置知识：[[引用计数]] [[并发编程]]
- 相关：[[解释器启动流程]] [[垃圾回收GC]]
- 反例/误区：以为「多线程 = 多核并行」——GIL 下 CPU 密集任务并不并行

## 来源
- 《Python源码剖析：深度探索动态语言核心技术》陈儒，第3部分 第15章 15.1 GIL 与线程调度（ch13_第3部分 Python 高级话题.txt：`interpreter_lock`、线程调度、`PyEval_InitThreads`）
