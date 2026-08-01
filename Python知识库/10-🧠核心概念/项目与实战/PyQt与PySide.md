---

类型: 概念
主题: PyQt与PySide
创建: 2026-07-21
复习: 
状态: 种子
tags: [Python, 项目与实战, 概念]
---
---

# PyQt与PySide

## 一句话定义
PyQt 与 PySide 是把 C++ 的 Qt 图形界面框架「 wrapp（绑定）」成 Python 能直接调用的两套库，让你用 Python 写跨平台的桌面 GUI 程序。

## 它解决什么问题 / 为什么存在
- 原生 Qt 是 C++ 写的，直接用 C++ 开发 GUI 成本高、迭代慢。
- Python 上手快、生态丰富，但标准库没有「画窗口、按钮、菜单」的能力。
- PyQt / PySide 充当「翻译层」：把 Qt 的成千上万个 C++ 类（QWidget、QApplication…）暴露成 Python 类，于是你能用 Python 语法操作同一套 Qt 引擎，享受跨平台（Windows / macOS / Linux 一套代码）和原生外观。

## 核心原理（大二能懂的水平）
- Qt 本身是「用 C++ 写好的界面引擎」。绑定库做的事 = 在 Python 对象和 C++ 对象之间做**自动转换**：你在 Python 里 `QLabel("hi")`，底层其实 new 了一个 C++ 的 QLabel。
- 两套绑定都基于同一个 Qt，所以 API 长得几乎一样（类名、方法名一致），区别主要在「出身 + 授权 + 细节语法」：
  - **PyQt**：Riverbank Computing 出品，经典老牌；早期授权是 GPL / 商业双授权（商业闭源要买 licence）。书里用的就是 PyQt4。
  - **PySide**：Qt 官方（Qt Company）出品，授权是 LGPL，对闭源商业软件更友好；现代叫 PySide6（对应 Qt6）。
- 安装用 pip：`pip install pyqt6` 或 `pip install pyside6`（见 [[包管理pip]]）。

## 关键参数 / 易错点
- **版本要配套**：PyQt5/PySide2 ↔ Qt5；PyQt6/PySide6 ↔ Qt6。混用会出奇怪报错。
- **导入路径不同**：PyQt 用 `from PyQt6.QtWidgets import *`，PySide 用 `from PySide6.QtWidgets import *`。同一份代码换绑定要改 import。
- **信号槽语法差异**：PyQt 早期用 `SIGNAL()/SLOT()` 字符串宏（如本书 PyQt4 示例），现代 PyQt6/PySide6 统一用「对象式」`signal.connect(slot)`（见 [[信号与槽]]）。
- **不要在主线程外碰界面**：GUI 控件只能在 Qt 事件循环所在线程操作，耗时任务要丢到子线程（见 [[并发编程]]）。
- 书里是 PyQt4 老语法，现代开发以 PyQt6 / PySide6 为准；老书的 `SIGNAL("valueChanged(int)")` 写法在新版已不推荐。

## 类比（帮助理解）
把 Qt 想成一台「造房子（界面）的工厂」，C++ 是工厂原生工人。PyQt / PySide 是「会讲 Python 话的工头」——你和工头说 Python，工头翻译成工厂指令。两个工头（PyQt、PySide）管的是同一座工厂，只是工牌（授权）和口头禅（语法细节）不同。

## 设计时怎么用（反推思维）
> 做「需要图形界面、且要跨平台跑」的桌面工具（配置器、小工具箱、数据看板、嵌入式触屏前端）时，我会选 PySide6（LGPL、官方维护、闭源无忧）；若团队历史项目全是 PyQt，则沿用 PyQt6 保持统一。

## 典型应用 / 我在哪见过
- 本书《Rapid GUI Programming with Python and Qt》全部示例基于 PyQt4，从弹窗、计算器到数据库、网络、多线程客户端。
- 实际项目：内部运维小工具、仪器控制面板、标注工具、PyQtGraph 绘图界面。

## 关联
- 前置知识：[[Python]]、[[包管理pip]]
- 相关：[[信号与槽]]、[[Qt控件]]、[[界面布局]]、[[Qt事件循环]]
- 反例/误区：[[并发编程]]（别在子线程直接改控件）

## 来源
- Mark Summerfield, *Rapid GUI Programming with Python and Qt*（PyQt4），第 1、4 章及全书示例
- 领域补充：PyQt6 / PySide6 现代版本对照
