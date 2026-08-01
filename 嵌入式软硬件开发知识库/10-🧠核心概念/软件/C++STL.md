---
类型: 概念
主题: 软件
tags: [概念]
创建: 2026-07-23
复习: 
状态: 种子
---

# C++STL

## 一句话定义
> C++ 标准模板库（Standard Template Library, STL）是 C++ 标准库的核心，提供一组基于模板的容器（vector/map/set）、算法（sort/find/transform）和迭代器，让数据结构和算法在编译期泛型化，性能接近手写 C 代码。

## 它解决什么问题 / 为什么存在
- C 语言中每次需要动态数组都要手动 `malloc/free` + 扩容逻辑，容易内存泄漏。
- STL 的 `vector` 自动管理内存（RAII），`map` 用红黑树实现 O(log n) 查找，`sort()` 是优化过的快速排序。
- 在嵌入式 C++（如 STM32CubeIDE C++ 项目）中，选合适的 STL 组件可以大幅减少手写容器代码。

## 核心原理（大二能懂的水平）
- **模板（Template）**：`vector<int>` 编译时生成一份 int 专属代码，`vector<float>` 生成另一份，零运行时开销（与虚函数不同）。
- **六大组件**：容器、算法、迭代器、仿函数、适配器、分配器。
- 最常用的容器：
  - `vector` — 动态数组，支持随机访问 O(1)，尾部插入 O(1) 均摊
  - `map` / `unordered_map` — 键值对，前者红黑树 O(log n)，后者哈希表 O(1)
  - `set` — 去重集合
  - `string` — 字符串类，比 C 风格 char 数组安全
  - `queue` / `stack` / `priority_queue` — 适配器容器

## 关键参数 / 易错点
- **容器内存**：STL 容器默认在堆上分配内存。在 FreeRTOS 中若用默认 new，会走系统堆而非 FreeRTOS 堆，需配自定义 allocator。
- **vector 扩容**：`push_back()` 超过 capacity 时会重新分配并拷贝全部元素，迭代器会失效。
- **嵌入式适用性**：`std::vector` 在 MCU 上可用（需注意堆碎片），`std::map` 有红黑树开销较大，优先用 `std::array`（固定大小，栈分配）或 `etl::vector`（Embedded Template Library 的固定容量版）。
- **异常**：大部分 STL 操作可能抛异常（如 `vector::at()` 越界）。嵌入式项目通常禁用异常（`-fno-exceptions`），需用 `operator[]` 或无抛版本。

## 类比（帮助理解）
- STL 之于 C++ 就像 Python 的 list/dict/set 内置数据结构 — 不用自己写链表、哈希表，直接拿来用。

## 设计时怎么用（反推思维）
> 做嵌入式算法项目（如滤波、协议解析）时，用 `std::vector` 暂存采样数据，用 `std::sort` + `std::binary_search` 做快速查找；注意配置自定义 allocator 防止堆碎片化。

## 典型应用 / 我在哪见过
- 嵌入式 C++ 项目：`std::array<uint8_t, 256>` 替代 C 数组做缓冲，带边界检查
- QT 框架：QVector/QMap 是 STL 的 QT 实现版本
- 算法竞赛/刷题：`vector`, `map`, `priority_queue`, `algorithm` 库是标配
- ROS 节点：大量使用 STL 容器传递消息数据

## 关联
- 前置知识：[[C++类与对象]]、[[C语言]]、[[指针与内存]]
- 相关：[[C++与C语言的关系]]、[[哈希表]]、[[排序与查找]]、[[链表]]
- 反例/误区：不要在 ISR 中使用 STL 容器（涉及堆分配，不确定时间）；MCU 项目建议用 ETL（Embedded Template Library）替代完整 STL

## 来源
- Knowledge-Notes: STL 笔记
- C++ Reference: https://en.cppreference.com/w/
