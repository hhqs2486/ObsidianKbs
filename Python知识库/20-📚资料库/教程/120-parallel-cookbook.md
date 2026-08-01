---

类型: 教程
来源: 《Python并行编程手册》(Python Parallel Programming Cookbook, Giancarlo Zaccone 著, 张龙/宋秉金译, 电子工业出版社 2018)
创建: 2026-07-21
状态: 已读待消化
tags: [Python, 教程]
---
---

# 120 · Python并行编程手册（菜谱手册）

> 编号 120 ｜ slug: parallel-cookbook ｜ KEY: `036_Python并行编程手册.pdf` ｜ 质量：MIXED（部分图片版）
> 说明：PDF 为图片版/部分图片版，部分章节为图片页（无文本）。本笔记结合 `manifest.json` 的真实章节结构整理，**不编造命令与代码**；图片页已在章节脉络中标注。

## 这条教程在解决什么
- 把“并行编程”从概念到落地，用**可运行的 Python 菜谱**覆盖四大路线：线程并行、进程并行、异步编程、分布式与 GPU，让你手边有一本“随查随用”的并行手册。
- 适合：已会 Python、想把程序跑满多核/多机、**但没系统学过并行**的开发者。本书偏“怎么做（How）”，是《Python高性能（第2版）》的互补面（那本偏“为什么/怎么度量”）。

## 关键内容（按 PDF 章节提纲）
全书 6 大部分，模块化“攻略”组织（准备工作 → 具体操作 → 实例精解 → 知识扩展 → 参考）。

### 第 1 部分 · 并行计算与 Python 起步（原理地基）
- 并行计算内存架构：**Flynn 分类** SISD / SIMD / MISD / MIMD；GPU 让 SIMD 重获生命力。
- 内存组织：共享内存（UMA / NUMA / NORMA / COMA）vs 分布式内存；缓存一致性问题。
- 并行编程模型：共享内存模型 / 多线程模型 / 分布式内存-消息传递模型 / 数据并行模型。→ 对应 [[并发模型]] 的总览。
- 如何设计并行程序：任务分解（领域/功能）、任务分配、聚集、映射；负载均衡（管理者-执行者 / 层次化 / 去中心化）。
- 如何评估并行程序的性能：**加速、效率、可伸缩性**；**阿姆达尔定律 vs 古斯塔夫定律**。
- 并行世界中的 Python：CPython 把代码编成字节码；解释器慢但有 C 扩展 / PyPy 等出路；引出 [[GIL影响]]。
- 进程与线程介绍、开始在 Python 中使用进程 / 线程。

> 📷 图片页（仅结构，无文本）：并行计算内存架构、内存组织、进程与线程介绍、开始在 Python 中使用进程。

### 第 2 部分 · 基于线程的并行（[[threading模块]]）
- 使用 `threading` 模块：线程对象、Lock / RLock / 信号量 / 条件 / 事件对象。
- 如何定义线程、确定当前线程、在子类中使用线程。
- 线程同步：Lock 与 RLock、信号量、条件、事件；`with` 语句（上下文管理器）包裹同步原语。
- 使用 `Queue` 实现线程通信（比裸锁更安全、更整洁）。
- 评估多线程应用的性能：**实测验证 GIL**——多线程在 CPU 密集任务上并不能提速，正是 [[全局解释器锁代价]] 的体现。

> 📷 图片页（仅结构）：第 2 部分标题与“使用 Python 的线程模块”整节。

### 第 3 部分 · 基于进程的并行（[[multiprocessing模块]]）
- 生成/命名/后台运行/杀死进程；在子类中使用进程。
- 进程间交换对象、同步进程、管理进程间状态、使用**进程池**。
- `mpi4py` 模块：点对点通信；聚合通信 **broadcast / scatter / gather / Alltoall / reduce**；避免死锁；如何优化通信。

> 📷 图片页（仅结构）：如何生成进程、介绍（第 3 部分开头）。

### 第 4 部分 · 异步编程（[[异步编程asyncio]]）
- 使用 `concurrent.futures` 模块（线程/进程池执行器，提交任务拿 Future）。
- 使用 Asyncio 实现**事件循环管理**（[[事件循环]]）；处理**协程**（[[协程]]）；管理任务；与 Futures 协作。

> 📷 图片页（仅结构，无文本）：第 4 部分标题、使用 Python 的 concurrent.futures 模块。

### 第 5 部分 · 分布式 Python（[[分布式计算]]，新卡）
- 使用 Celery 分发任务、创建任务（面向工作者的任务队列）。
- 使用 SCOOP 进行科学计算、处理映射函数。
- 使用 Pyro4 远程调用方法、链接对象、开发客户端-服务器应用（RPC）。
- 使用 PyCSP 实现顺序进程通信；在 Disco 中使用 MapReduce；使用 RPyC 调用远程过程。

> 📷 图片页（仅结构）：使用 Celery 分发任务、第 5 部分标题（分布式 Python 开头）。

### 第 6 部分 · 使用 Python 进行 GPU 编程（[[GPU加速Python]]，新卡）
- 使用 PyCUDA 模块、构建 PyCUDA 应用、通过矩阵操作理解 PyCUDA 内存模型、用 GPUArray 调用内核、逐元素表达式求值、MapReduce。
- 使用 NumbaPro 进行 GPU 编程、通过 NumbaPro 使用 GPU 加速的库。
- 使用 PyOpenCL 模块、构建 PyOpenCL 应用、逐元素表达式求值、测试 GPU 应用。

> 📷 图片页（仅结构）：第 6 部分标题（使用 Python 进行 GUI 编程，原文如此，实为 GPU 编程章节）。

## 我卡住/没懂的地方
- 书中 MPI（mpi4py）的聚合通信细节（broadcast/scatter/gather/Alltoall/reduce）多为图片页，需配合 `mpi4py` 官方文档补齐示例。
- Celery / SCOOP / Pyro4 / Disco 的部署与Broker 配置是图片页，只在本地跑过最小 demo，集群部署待补。
- GPU 部分（PyCUDA/PyOpenCL/NumbaPro）需要真实 NVIDIA 驱动 + CUDA Toolkit，文本页有结构但代码页多为图片，实际编译步骤需另行验证。

## 它背后的原理（别只记操作）
- 四大并行路线对应不同“共享什么”：线程共享内存（要锁）、进程各有内存（要 IPC）、异步单线程让出控制权（[[事件循环]] 调度）、分布式跨机器（消息/共享存储）。选型要看任务是 **CPU 密集还是 I/O 密集**，以及要不要跨机器。
- [[GIL影响]] 是分水岭：纯 Python 计算别指望多线程，CPU 密集上 [[multiprocessing模块]] / [[Cython]]（nogil）/ GPU；I/O 密集用异步或线程即可。
- 并行不是免费午餐：通信、序列化、传输（尤其跨网络/跨 GPU 设备）常是瓶颈，任务分片要够大。

## 我能复用/改编的点
> 换个需求，这套做法还能怎么用？
- 写爬虫/批量 HTTP：用异步（[[异步编程asyncio]]）而非线程，避免 GIL 与线程切换开销。
- 本地数值重活：用 `concurrent.futures.ProcessPoolExecutor` 把函数并行化（见 [[multiprocessing模块]]）。
- 超大数据/多机：用 [[分布式计算]]（Dask/PySpark），别一上来就手搓 mpi4py。
- 数据并行数值核：上 [[GPU加速Python]]（Numba `@vectorize(target='cuda')` 最省事）。

## 关联
- 概念：[[并发模型]] [[并发编程]] [[GIL影响]] [[全局解释器锁代价]] [[事件循环]] [[异步编程asyncio]] [[协程]] [[threading模块]] [[multiprocessing模块]] [[Cython]] [[分布式计算]] [[GPU加速Python]]
- 项目：[[ ]]

## 来源
- 《Python并行编程手册》(Python Parallel Programming Cookbook)，Giancarlo Zaccone 著，张龙/宋秉金译，电子工业出版社 2018（KEY `036_Python并行编程手册.pdf`，`.cache` 含 `full.txt` 与按章 `chNN_*.txt` + `manifest.json`）
- PDF 为图片版/部分图片版：文本页以 `full.txt` 为准；图片页（并行计算内存架构、内存组织、进程与线程介绍、基于线程的并行开头、concurrent.futures、Celery、分布式 Python 开头、GPU 部分标题等）按 `manifest.json` 的 TOC 章节结构整理，未编造命令与代码。
