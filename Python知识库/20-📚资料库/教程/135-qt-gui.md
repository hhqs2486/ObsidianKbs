---

类型: 教程
来源: Rapid GUI Programming with Python and Qt (Mark Summerfield)
创建: 2026-07-21
状态: 已读待消化
tags: [Python, 教程]
---
---

# 135 · Rapid GUI Programming with Python and Qt

## 这条教程在解决什么
教你用 Python 把 Qt 这套跨平台 GUI 框架用起来，从「25 行弹窗」一路写到带数据库、网络、多线程的完整桌面程序。本书是 PyQt 的权威入门书（作者 Mark Summerfield，PyQt 核心贡献者），示例基于 **PyQt4**（较老），但讲清的概念（信号槽、布局、事件循环、自定义控件、Model/View）在 PyQt6 / PySide6 里完全通用。

> 提示：本书是可读 TEXT 版（非图片版），内容以 `.cache` 全文为准。注意书中 PyQt4 的 `SIGNAL()/SLOT()` 字符串宏写法在现代 PyQt6/PySide6 已改为 `signal.connect(slot)` 对象式写法，学概念、改语法即可迁移。

## 关键内容（按 PDF 章节提纲）
全书 19 章 + 3 附录，分四部分：

**Part I · Python 编程基础（第 1–3 章）**
- 数据类型与结构、控制流、类与模块——给没 Python 底子的人补语言。

**Part II · 基础 GUI（第 4–8 章）**
- 第 4 章 Introduction to GUI Programming：首个弹窗、计算器、货币换算器；引出 [[信号与槽]] 与 [[Qt事件循环]]。
- 第 5 章 Dialogs：模态/非模态、智能对话框。
- 第 6 章 Main Windows：QMainWindow、动作与快捷键、状态保存。
- 第 7 章 Using Qt Designer：用可视化设计器拖界面（`.ui` 文件）。
- 第 8 章 Data Handling：二进制 / 文本 / XML 文件读写（QDataStream、pickle、QTextStream、DOM/SAX）。

**Part III · 中级 GUI（第 9–15 章）**
- 第 9 章 Layouts and Multiple Documents：[[界面布局]] 的尺寸策略/拉伸因子、Tab/Stacked、SDI/MDI。
- 第 10 章 Events, Clipboard, Drag&Drop：低层事件处理、事件过滤器。
- 第 11 章 Custom Widgets：样式表、组合控件、子类化 QWidget。
- 第 12 章 Item-Based Graphics：交互图形项、动画。
- 第 13 章 Rich Text and Printing：富文本、打印。
- 第 14 章 Model/View Programming：数据-视图分离、自定义模型与委托。
- 第 15 章 Databases：Qt SQL、表单视图、表格视图。

**Part IV · 高级 GUI（第 16–19 章）**
- 第 16 章 Advanced Model/View：自定义视图、通用委托。
- 第 17 章 Online Help and Internationalization：在线帮助、国际化（i18n）。
- 第 18 章 Networking：TCP 客户端 / 服务端。
- 第 19 章 Multithreading：子线程服务、线程管理与 [[Qt事件循环]] 配合防卡 UI。

## 我卡住/没懂的地方
- PyQt4 的 `self.connect(w, SIGNAL("valueChanged(int)"), slot)` 字符串签名容易拼错、且新版不推荐——直接用 `w.valueChanged.connect(slot)` 更稳。
- 事件循环「单线程顺序处理」这一点是后续网络/多线程章节的地基，第一次读容易忽略，建议结合 [[并发编程]] 一起理解「为什么重活不能放主线程」。

## 它背后的原理（别只记操作）
- 所有 GUI 程序 = 建 `QApplication` → 建控件并 `show()`（只入队重绘事件）→ `app.exec_()` 启动 [[Qt事件循环]] 不断取事件分发。
- 用户交互走两条路：高层用 [[信号与槽]]（关心「发生了什么」），低层重写事件处理函数（关心「怎么发生的」，做自定义控件时用）。
- [[Qt控件]] 统一继承 QWidget→QObject，因此信号槽、布局、父子内存管理一脉相通。

## 我能复用/改编的点
> 换需求：要做「内部小工具 / 仪器面板 / 数据标注器 / 配置器」这类桌面 GUI 时，直接套本书骨架——选 PyQt6 或 PySide6，用 Qt Designer 拖出 `.ui`，用布局摆控件，用 connect 把按钮接到业务函数，重活在子线程算完用信号回主线程刷新。数据库/网络/打印章节按需取用。

## 关联
- 概念：[[PyQt与PySide]]、[[信号与槽]]、[[界面布局]]、[[Qt事件循环]]、[[Qt控件]]
- 项目：本库「项目与实战」集群其他实战书（游戏、OpenCV、爬虫等可借 GUI 做前端）
- 跨簇互补：[[并发编程]]（多线程章节的理论底座）、[[序列化(json与pickle)]]（第 8 章文件存取）、[[包管理pip]]（安装 PyQt/PySide）

## 来源
- Mark Summerfield, *Rapid GUI Programming with Python and Qt: The Definitive Guide to PyQt Programming*, Prentice Hall, 2008（PDF 643 页，TEXT 版，本库 KEY `080_Rapid+GUI+Programming+with+Python+and+Qt(1).pdf`）
- 缓存：`.cache/080_Rapid+GUI+Programming+with+Python+and+Qt(1).pdf/full.txt`
