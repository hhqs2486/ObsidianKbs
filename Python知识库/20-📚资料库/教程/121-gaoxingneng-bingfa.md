---

类型: 教程
来源: Python高性能编程（High Performance Python, Gorelick & Ozsvald）
创建: 2026-07-21
状态: 已读待消化
tags: [Python, 教程]
---
---

# 《Python高性能编程》教程笔记

## 这条教程在解决什么
一本把“Python 为什么慢、怎么让它快”讲透的实战书。它不堆术语,而是用 Julia 集、HTTP 爬虫、素数计算等可量化例子,带读者从**计算机架构 → 性能剖析 → 容器选择 → 编译成 C → 并发/并行 → 省内存**走一遍完整的优化链路。本卷作为「高性能与并发」集群的 anchor,负责该集群的概念卡。

## 关键内容(按 PDF 章节提纲)
- **第1章 理解高性能Python**:计算机系统三要素(计算/存储/通信),阿姆达尔定律,以及核心障碍——**GIL**(见 [[GIL影响]] / [[全局解释器锁代价]])。
- **第2章 通过性能分析找到瓶颈**:`cProfile` → `line_profiler` → `memory_profiler` → `heapy`/`dowser` → `dis` 的剖析链;强调“先剖析再优化 + 单测守护”。(见 [[性能剖析cProfile]]、[[内存优化]])
- **第3–5章 列表/元组、字典/集合、迭代器/生成器**:数据结构的内存与速度取舍(为第11章省内存铺垫)。
- **第6章 矩阵和矢量计算**:`numpy` 的连续内存 + 矢量化为何快;`perf` 看 CPU 缓存利用率。
- **第7章 编译成C**:`Cython`(AOT、类型注解、`nogil`+OpenMP 并行)、`Shed Skin`、`Numba`(JIT)、`Pythran`、`PyPy`,以及 ctypes/cffi/f2py 外部函数接口。(见 [[Cython]])
- **第8章 并发**:I/O 等待的本质、**事件循环**、回调 vs 协程、**gevent / tornado / asyncio** 三套异步方案对比,以及信号量节流(~100 并发最优)。(见 [[并发模型]]、[[异步编程asyncio]]、[[事件循环]]、[[协程]])
- **第9章 multiprocessing 模块**:用多进程绕 GIL 真并行(估算 π、素数),进程间通信、锁与共享内存。(见 [[multiprocessing模块]]、[[threading模块]]、[[并发编程]])
- **第10章 集群和工作队列**:Parallel Python / IPython Parallel / NSQ 把计算扩到多机。
- **第11章 使用更少的RAM**:Python 对象开销、`array`/`numpy` 连续内存、trie/DAWG 压缩文本、概率数据结构(HyperLogLog / Bloom Filter / Morris 计数器)。(见 [[内存优化]])
- **第12章 现场教训**:多家公司的真实高性能部署复盘(SoMA、Radim Řehůřek、Lyst、PyPy 等)。

## 我卡住/没懂的地方
- `cffi`/`ctypes`/`f2py`/CPython API 几种外部函数接口的差异与取舍较细,初次接触容易混;书里建议按需查、不必全记。
- OpenMP 的 `prange` + `schedule`(static/dynamic/guided)在不同负载下的选择需要实测,理论不好直接拍板。
- 概率数据结构的误差率公式(标准差定义)偏数学,理解“以精度换空间”的思想比记公式更重要。

## 它背后的原理(别只记操作)
- **优化顺序**:先选好算法/减少数据量 → 再剖析定位热点 → 最后才编译/C 扩展。编译器收益随投入边际递减,别一上来就 Cython。
- **I/O 密集用并发(异步/多线程),CPU 密集用并行(多进程/C 扩展)**,根因都是 GIL:纯 Python 字节码受 GIL 锁死单核,而 I/O 阻塞会释放 GIL、C 扩展可绕开 GIL。
- **内存即速度**:更紧凑的数据结构 → 更多进 CPU 缓存、在总线跑更快。

## 我能复用/改编的点
> - 遇到“慢”先跑 `python -m cProfile -s cumulative`,再 `line_profiler` 定位到行,再决定走 [[Cython]] 还是 [[异步编程asyncio]]。
> - 抓大量网页/批量写库:用 `asyncio`+`aiohttp` + `Semaphore(100)`;若夹带本地重算,把重算丢进程池。
> - 海量数字/文本:数字换 `numpy`/`array`,文本用 trie/DAWG,只需近似答案用 HyperLogLog/Bloom Filter。
> - CPU 重算且可拆分:直接 `multiprocessing.Pool` 或 [[Cython]] 的 `nogil`+`prange` 吃满多核。

## 关联
- 概念:[[并发模型]]、[[异步编程asyncio]]、[[事件循环]]、[[Cython]]、[[性能剖析cProfile]]、[[内存优化]]、[[GIL影响]]、[[全局解释器锁代价]]
- 已有(链接不重建):[[并发编程]]、[[协程]]、[[threading模块]]、[[multiprocessing模块]]
- 项目:Python并行编程手册(同集群,互补的并行实践)

## 来源
- 《Python高性能编程》(Gorelick & Ozsvald),key `077_Python高性能编程.pdf`,351 页,17 章,缓存 `.cache/077_Python高性能编程.pdf/`(TEXT 质量,以章节文本为准)。
