---

类型: 概念
主题: import机制深入
创建: 2026-07-21
复习: 
状态: 种子
tags: [Python, 源码与系统, 概念]
---
---

# import机制深入

## 一句话定义
import 机制是 Python 把「模块/包名」变成「内存中 module 对象」并挂进 `sys.modules`、再绑定到当前名字空间的一整套底层流程；它在字节码层由 `IMPORT_NAME` / `IMPORT_FROM` 等指令驱动，最终落到 `import_module_level` / `import_submodule` 等 C 函数。

## 它解决什么问题 / 为什么存在
- 没有 import，所有代码只能写在一个文件里。import 让代码可拆分、可复用、可缓存，并避免重复执行（同一个模块只初始化一次）。

## 核心原理（大二能懂的水平）
- 字节码层：`import a.b.c` 对应虚拟机指令 `IMPORT_NAME`（带包路径参数）+ `IMPORT_FROM` / `STORE_NAME` 等。虚拟机执行 `IMPORT_NAME` 时调用 Python 层的 `__import__` → 最终进入 C 函数 `import_module_level`。
- `import_module_level(name, globals, locals, ...)`：按「点号树」逐层解析 module/package 结构；对每层先查 `sys.modules` 缓存，没有再去找文件加载。
- 加载分两层（书第14章）：
  1. **解析 module/package 树状结构**：`import a.b.c` 要先确保 `a`、`a.b` 都已存在（已在 `sys.modules` 或已加载），再处理最末端的 `c`；嵌套 import（`import A` 里又 `import A.B`）靠 `sys.modules` 避免重复。
  2. **加载 module/package**：`import_submodule` 在搜索路径（`sys.path`，来自 [[解释器启动流程]]）里找 `.py`/`.pyc`/扩展模块，编译执行得到 module 对象，注册进 `sys.modules`。
- `from x import y`：先 import 整个 `x`（同样走上述流程），再从 `x` 的属性里取 `y` 绑到当前名字空间——所以 `from` 也会「引入整个模块」，只是少建一个名字。
- package 的 `__path__` 元信息限制了对子模块的搜索范围；`import a.b.c` 是默认的完整动作。

## 关键参数 / 易错点
- **`sys.modules` 是总表也是缓存**：模块一旦导入就留在表里，之后 import 直接返回，不会重跑。想强制重加载要用 `importlib.reload()`（书里称「符号的销毁与重载」）。
- `from x import *` 受 `__all__` 约束，且会污染当前名字空间，谨慎用。
- 循环 import（`a` 导入 `b`，`b` 又导入 `a`）不一定报错，但可能拿到「半成品模块」，是常见坑。
- 导入失败的常见根因是启动时的 `sys.path` 没包含目标目录（回看 [[解释器启动流程]]）。

## 类比（帮助理解）
import 像「图书馆借书」：先查馆藏总目录 `sys.modules`（借过就不重复借），没有就按索书号（`sys.path` 搜索路径）去书架找、登记入册、再把书递到你手上（绑定名字）。`from x import y` 是「整本书借来，只撕下 y 这一页给你」。

## 设计时怎么用（反推思维）
> 做大型项目/插件系统时，我会用包结构 + 显式 `__init__.py` 控制导出，避免循环 import，必要时用 `importlib` 动态加载插件；排错时第一反应是「看 `sys.path` 和 `sys.modules`」。

## 典型应用 / 我在哪见过
- `import` / `from ... import`、相对导入、动态加载（`importlib`）、延迟导入优化启动。
- 插件化架构、`__all__`、`if __name__ == '__main__'`。
- 与 [[导入系统]]（语言核心视角）、[[模块与包]]、[[解释器启动流程]]、[[CPython字节码]]（IMPORT_NAME 指令）深度关联。

## 关联
- 前置知识：[[导入系统]] [[模块与包]]
- 相关：[[解释器启动流程]] [[CPython字节码]]
- 反例/误区：以为 `from x import y` 比 `import x` 更省——`x` 照样被整体导入

## 来源
- 《Python源码剖析：深度探索动态语言核心技术》陈儒，第3部分 第14章 import 机制（ch13_第3部分 Python 高级话题.txt：`IMPORT_NAME`、`import_module_level`、`import_submodule`、`sys.modules`）
