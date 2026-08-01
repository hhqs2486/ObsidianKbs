---

类型: 概念
主题: collections
创建: 2026-07-21
状态: 种子
tags: [Python, 标准库与工程, 概念]
---
---

# collections 模块

## 一句话定义
> collections 是「加强版容器」：在 [[列表]]/[[字典]]/[[元组]]/[[集合]] 之上提供 deque、defaultdict、Counter、OrderedDict、namedtuple 等实用类型。

## 它解决什么问题 / 为什么存在
- 内置容器有些活干得不顺：字典缺省值要 `if key not in d`；计数要手写；队列左边插入慢。
- collections 把这些常见模式做成高效、好读的类型。

## 核心原理（大二能懂的水平）
- **类比**：内置容器是「基础餐具」；collections 是「专用厨具」——`defaultdict` 像自带备胎的字典（查不到自动给默认值），`Counter` 像自动点数的计数器，`deque` 像两头都能进出的排队通道。
- `deque` 两端增删 O(1)；`defaultdict(int)` 缺键返回 0；`Counter('aab')` → `{'a':2,'b':1}`。

## 关键参数 / 易错点
- `defaultdict(list)`：访问不存在的键自动建空列表，省去初始化。
- `Counter` 支持 `most_common(n)`、`+`/`-` 运算。
- `namedtuple('Point', ['x','y'])` 让元组能用 `.x` 访问，比下标可读。
- `OrderedDict` 记住插入顺序（3.7+ 普通 dict 也已保序，但 OrderedDict 还支持 `move_to_end`）。
- 易错：`defaultdict` 任意缺键都会自动创建，遍历时可能多出意外键。

## 设计时怎么用（反推思维）
> 做「词频统计/分组聚合/固定长度历史窗口」时，我会优先用 Counter、defaultdict、deque，而非手写循环和判断。

## 典型应用 / 我在哪见过
- 日志级别计数：`Counter(level for ...)`。
- 按用户分组：`defaultdict(list)`。

## 关联
- 前置知识：[[数据类型]] [[字典]] [[元组]] [[列表]] [[迭代器与生成器]]
- 相关：[[itertools模块]] [[functools模块]] [[标准库]]
- 反例/误区：[[数据类型]]（别再用普通 dict 手搓计数）

## 来源
- Python 3.6.5 标准库文档（完整中文版）§8.3 collections — 容器数据类型
