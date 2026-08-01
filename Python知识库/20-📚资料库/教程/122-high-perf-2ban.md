---

类型: 教程
来源: 《Python高性能（第2版）》(High Performance Python, 2nd Ed., Gabrielle Lanaro 著, 杨培文等译)
创建: 2026-07-21
状态: 已读待消化
tags: [Python, 教程]
---
---

# 122 · Python高性能（第2版）

> 编号 122 ｜ slug: high-perf-2ban ｜ KEY: `096_《Python高性能（第2版）》_杨培文等.pdf` ｜ 质量：TEXT（全文可读）
> 与《Python并行编程手册》(教程 120) 互补：本书偏“先度量、再优化、讲清楚为什么”，是原理 + 工程视角的总纲。

## 这条教程在解决什么
- 系统回答“**我的 Python 为什么慢，怎么让它快**”：从基准测试与剖析起步，依次走 纯 Python 优化 → NumPy/Pandas → Cython → 编译器 → 并发 → 并行 → 分布式 → 高性能设计。
- 适合：想真正搞懂性能瓶颈、做科学计算 / 数据工程 / 数值模拟的工程师。全书贯穿一个 “粒子模拟器” 示例和一道 “蒙特卡洛估算 π” 题，串起所有优化手段。

## 关键内容（按 PDF 章节提纲）

### 第 1 章 · 基准测试与剖析（先度量，再动手）
- 通用原则：**过早优化是万恶之源**——先让它跑对，再重构，最后提速。
- 编写测试与基准测试：`time`、`timeit`、`pytest-benchmark`。
- 剖析：`cProfile`（函数级，看 `tottime` 找瓶颈）、`line_profiler`（逐行）、`memory_profiler`（内存）、KCachegrind 图形化、`dis` 反汇编看字节码。→ 见 [[性能剖析cProfile]]。

### 第 2 章 · 纯粹的 Python 优化（[[性能优化]] [[内存优化]]）
- 算法改进最划算：换数学公式（用半径+角度代替逐步累位移位）、减少指令数、交换循环顺序、减少属性访问/中间赋值。
- 内存：`__slots__` 避免实例 `__dict__`，省约 10MiB/10万对象；`memory_profiler` 量化。→ 见 [[对象内存布局]]。

### 第 3 章 · 使用 NumPy 和 Pandas 快速执行数组操作（[[NumPy]] [[Pandas]] [[数据科学]]）
- 用向量化替代 Python 循环；连续内存、广播规则；NumPy 把热点从解释器移到 C 层。→ 见 [[内存优化]]。

### 第 4 章 · 使用 Cython 获得 C 语言性能（[[Cython]]）
- 给循环变量加 `cdef` 类型、消除 Python 对象调用；`cython -a` 看黄白行；`prange` + `with nogil:` 多核并行。→ 见 [[GIL影响]]。

### 第 5 章 · 探索编译器（[[Cython]] [[性能优化]]）
- AOT（Cython 提前编译）vs JIT（Numba / PyPy）；Numba `@vectorize` 把 ufunc 编译到 CPU/GPU；选编译器要看“冷启动”与适用面。

### 第 6 章 · 实现并发性（[[并发模型]] [[事件循环]] [[异步编程asyncio]] [[协程]]）
- 存储器层次结构（寄存器→缓存→内存→外存，差几个数量级）→ 为何不能让 CPU 干等 I/O。
- 并发 vs 阻塞：回调函数（好莱坞原则）、`future`（跟踪异步结果）、**事件循环**调度。
- `asyncio`：`async/await` 协程、`run_until_complete`、把阻塞代码转非阻塞（`loop.run_in_executor` 丢给线程池）、`asyncio.gather` 并行发请求。
- 响应式编程 RxPy：observable / 运算符（map、group_by、merge_all、concat_all）、hot/cold、打造 CPU 监视器。

### 第 7 章 · 并行处理（[[multiprocessing模块]] [[并发编程]] [[并发模型]] [[Cython]] [[全局解释器锁代价]] [[GPU加速Python]]）
- 原理：高度并行问题 vs 需共享数据的并行；共享内存 vs 分布式内存；线程共享内存但受 [[GIL影响]]（纯 Python 指令无法并行），进程绕开 GIL 但有启动/内存/IPC 成本。
- `multiprocessing`：`Process` / `Pool`（map / map_async / apply_async）、`ProcessPoolExecutor`（`concurrent.futures`）、`wait` / `as_completed`、`asyncio.run_in_executor` 同时拿并发+并行。
- 蒙特卡洛估算 π：直接并行反而变慢（任务太碎、通信开销大），**分块（chunk）**后才提速一倍多——教训是“开销要 ≪ 计算”。
- 同步与锁：`Value`/`Array` 共享内存 + `Lock` 防竞态（无锁时计数器结果随机）。
- OpenMP + Cython：`prange(nogil=True)` 多线程并行循环，约 2 倍提速。
- 并行自动化：Theano / Tensorflow / Numba 把数组表达式自动编译并行；**在 GPU 中运行**（矩阵乘法 GPU 比 CPU 快约 7 倍、Numba CUDA ufunc 快约 3 倍）。→ 见 [[GPU加速Python]]（新卡）。

### 第 8 章 · 分布式处理（[[分布式计算]]，新卡）
- 分布式计算简介：大数据、集群、节点故障与容错；网络远慢于 CPU → 优先本地处理。
- MapReduce 模型：Map（变换成键值对）+ Reduce（按键聚合），shuffle 是主要通信。
- **Dask**：DAG（用普通 dict 表示）、`dask.array`（分块 chunk，类 NumPy）、`dask.bag`（MapReduce 式，`foldby`）、`dask.dataframe`（分布式 Pandas）、`dask.distributed`（Client + 调度器 + 工作进程，结果可缓存容错）。
- **PySpark**：RDD（弹性分布式数据集）、`map`/`reduceByKey`/`groupBy`、`DataFrame`/`SparkSQL`（走 Scala 执行省序列化）；Py4J 在 Python↔JVM 间通信。
- **mpi4py**：学术超算主流；`COMM_WORLD`、`Get_rank`/`Get_size`、点对点 `Send/Recv`、聚合 `reduce`。

### 第 9 章 · 高性能设计（综合原则）
- 一条主线：**剖析 → 算法 → 向量化(NumPy) → 编译(Cython/Numba) → 并发(asyncio) → 并行(multiprocessing/GPU) → 分布式(Dask/Spark)**，每一步都先度量再决定，做权衡（延时 vs 吞吐、通信 vs 计算）。

## 我卡住/没懂的地方
- 第 5 章编译器部分（Numba/PyPy 细节）只读了要点，未实际对比 AOT/JIT 在不同负载下的取舍。
- Theano / Tensorflow 现已不主流，书里示例偏教学，实际项目多直接用 Numba / JAX；作为“自动并行”思路参考即可。
- 第 8 章 Dask distributed / PySpark 集群部署、mpi4py 在超算排队系统（TORQUE）上的运行，仅理解原理，未实操。

## 它背后的原理（别只记操作）
- **性能优化是“先找瓶颈再对症下药”**：[[性能剖析cProfile]] 先行；绝大多数慢代码集中在少数函数（阿姆达尔定律约束了并行上限）。
- **路线选择取决于任务性质**：I/O 密集 → [[并发模型]]/异步；CPU 密集 → [[Cython]]/[[multiprocessing模块]]/GPU；数据超内存 → [[分布式计算]]。
- **GIL 是铁律**：纯 Python 计算别指望多线程；[[全局解释器锁代价]] 决定了多进程/编译/分布式的必要性。

## 我能复用/改编的点
> 换个需求，这套做法还能怎么用？
- 任何“慢函数”先 `cProfile` + `line_profiler` 定位，再决定优化层级（算法→向量化→Cython），不盲目编译。
- 批量网络/文件 I/O：用 [[异步编程asyncio]] + `gather`，别串行 `requests`。
- 本地数值重活：`ProcessPoolExecutor` 或 OpenMP+Cython（[[Cython]]）吃满多核。
- 超大数据/多机：Dask/PySpark（[[分布式计算]]）；数据并行数值核：Numba CUDA（[[GPU加速Python]]）。

## 关联
- 概念：[[性能剖析cProfile]] [[性能优化]] [[内存优化]] [[对象内存布局]] [[NumPy]] [[Pandas]] [[数据科学]] [[Cython]] [[GIL影响]] [[全局解释器锁代价]] [[并发模型]] [[事件循环]] [[异步编程asyncio]] [[协程]] [[并发编程]] [[threading模块]] [[multiprocessing模块]] [[分布式计算]] [[GPU加速Python]]
- 项目：[[ ]]

## 来源
- 《Python高性能（第2版）》(High Performance Python, 2nd Ed.)，Gabrielle Lanaro 著，杨培文等译（KEY `096_《Python高性能（第2版）》_杨培文等.pdf`，`.cache` 含 `full.txt` 与各章 `chNN_*.txt`，为 TEXT 质量，全文可读）
- 互补阅读：教程 120《Python并行编程手册》（菜谱式 How，本书是原理式 Why/Measure）。
