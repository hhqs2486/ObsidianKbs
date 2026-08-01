---
类型: 概念
tags: [Python知识库, 现代Python与生态]
主题: 现代Python与生态
创建: 2026-07-22
状态: 种子
---

# Tachyon 采样 Profiler（PEP 799）

## 一句话定义
> Python 3.15 新增 `profiling.sampling` 模块（代号 Tachyon），以极低开销对运行中进程进行统计采样分析，最高 1,000,000 Hz 采样率。

## 它解决什么问题 / 为什么存在
- `cProfile` 是确定性的（每个函数调用都记录），开销大（2-10× 慢），不适合生产环境
- 采样 profiler 定期抓取调用栈，几乎零开销，适合生产/线上诊断
- py-spy/austin 等第三方工具需要额外安装且权限受限

## 核心原理（大二能懂的水平）
- 不记录每次函数调用，而是定时（如每 1ms）抓取当前线程的调用栈
- 统计各函数在栈中出现频率 → 得到 CPU 热点分布
- 采样频率可达 1,000,000 Hz（1μs 间隔），Python 生态最快
- 无需修改代码、无需重启进程

```python
from profiling import sampling

profiler = sampling.Profiler(frequency=1000)  # 1000 Hz
profiler.start()
# ... 运行目标代码 ...
profiler.stop()
stats = profiler.get_stats()
print(stats.top(10))
```

## 关键参数 / 易错点
- 统计采样（非确定性）：不保证捕获每个函数调用，短函数可能被漏掉
- 不适合分析极短代码路径，适合找长期 CPU 热点
- `profiling.tracing`（原 cProfile）仍在，确定性 + 采样互补

## 类比（帮助理解）
- cProfile 像每个人的一举一动都录像（全量），Tachyon 像每 1ms 拍一张照片（采样），看谁在照片中出现最多。

## 设计时怎么用（反推思维）
> 生产环境性能诊断：用 Tachyon 零侵入获取 CPU 热点，替代 cProfile 的离线分析。

## 关联
- 前置知识：[[性能优化]] [[更快的CPython]]
- 相关：[[并发编程]]

## 来源
- Python 3.15 What's New (PEP 799)
