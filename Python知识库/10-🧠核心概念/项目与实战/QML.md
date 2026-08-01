---

类型: 概念
主题: QML
创建: 2026-07-21
复习: 
状态: 种子
tags: [Python, 项目与实战, 概念]
---
---

# QML

## 一句话定义
QML 是 Qt 的**声明式 UI 标记语言**，用类似 JSON/JavaScript 的语法描述界面「长什么样、怎么布局、怎么动、怎么响应」，配合 Python（PySide）后端把数据和逻辑喂给它——UI 与逻辑彻底分离。

## 它解决什么问题 / 为什么存在
- 传统 QWidget 用 Python/C++ **命令式**地「创建控件→设属性→调布局」，界面和逻辑混在一份代码里，改个样式要改程序、还不方便非程序员协作。
- QML 把界面变成一份独立的 `.qml` 描述文件（结构 + 样式 + 动画 + 状态），UI 设计者能单独改它，Python 只管数据与业务。
- 它在 Qt 4.7 叫 `Qt 4.7` 模块，现代叫 **QtQuick 1.0 / QML 2**；本书（MeeGo）用的是旧的 `QtDeclarative` 加载方式。

## 核心原理（大二能懂的水平）
- **对象树**：.qml 文件是一棵嵌套对象，根对象 `Rectangle`/`WebView`，子对象 `Text`/`Image`/`ListView` 一层层套，属性（`color`/`width`/`anchors`）描述外观与布局，很像写 HTML+CSS。
- **加载**：Python 端用 `QDeclarativeView`（PySide 的 QtDeclarative 模块）把 .qml 读进来并渲染进窗口，整件事跑在 [[Qt事件循环]]（`app.exec_()`）里。
- **Python → QML（喂数据）**：通过 `view.rootContext().setContextProperty('hello', obj)` 把 Python 对象暴露给 QML；QML 里直接写 `hello.greeting` 访问。注意**只有 QObject 子类能被暴露**，且要访问的属性必须用 `QtCore.Property(...)` 声明。
- **QML → Python（调行为）**：QML 想调用 Python 方法，方法要标 `@QtCore.Slot(参数类型)`；Python 对象想让 QML 监听变化，要定义 `@QtCore.Signal` 并配合 `notify=changed` 的 property（见 [[信号与槽]]）。
- **列表数据**：QML 的 `ListView` 不能直接吃 Python list，必须来自 `QAbstractListModel` 子类（行模型，实现 `rowCount`/`data`），delegate 负责画每一行。

## 关键参数 / 易错点
- 只有 `QObject` 子类能被 QML 访问；普通 Python 对象、lambda 都不行。
- 属性必须用 `QtCore.Property(type, getter, notify=changed)` 声明成「可通知」的，否则值变了 UI 不刷新。
- `@QtCore.Slot` 的参数类型要写对，如 `@QtCore.Slot(QtCore.QObject)`，否则 QML 调用报类型错。
- `ListView` 的 `model` 必须是 QAbstractListModel（或 `ListModel`），不能直接传 list / dict。
- 老书模块名 `QtDeclarative`/`QDeclarativeView` 在现代 PySide6 已拆成 `QtCore.QUrl` + `QQuickView`/`Qml` 模块，学思路、改 import 即可迁移。

## 类比（帮助理解）
把 QML 想成「网页的 HTML+CSS」——只描述结构与样式；Python 后端像「服务端/JS 逻辑」提供数据与行为。`.qml` 是模板，`setContextProperty` 就是「后端注入模板变量」，`Signal/Slot` 是「模板按钮点了调后端函数」。

## 设计时怎么用（反推思维）
> 做「触屏/移动/嵌入式前端（仪器面板、车载屏、树莓派触屏）」或「需要状态切换+动画的界面」时，我会用 QML 写界面、Python 写业务逻辑（数据/网络/算法），通过 contextProperty + Signal/Slot 桥接——比纯 QWidget 更适合触摸和动态效果。

## 典型应用 / 我在哪见过
- 本书《Developing MeeGo apps with Python and QML》：Hello World、WebView 混合 HTML/JS、给 gPodder 套触摸友好 QML 界面。
- 现代：PySide6 + QtQuick 做跨平台桌面/嵌入式 UI，UI 与逻辑分离、热重载快。

## 关联
- 前置知识：[[PyQt与PySide]]（PySide 提供 QtDeclarative/QtQuick 绑定）、[[Qt事件循环]]（QDeclarativeView 在事件循环里跑）
- 相关：[[信号与槽]]（Slot/Signal 桥接 Python↔QML）、[[界面布局]]（QML 用 anchors 声明式布局）、[[Qt控件]]（QML 的 Rectangle/Text/ListView 是声明式控件）
- 反例/误区：[[Qt控件]]（QML 与 QWidget 控件体系不同，不能混用同一套布局 API）

## 来源
- Thomas Perl, *Developing MeeGo apps with Python and QML*（KEY `004_Developing MeeGo apps with Python and QML(1).pdf`），第 3–4 章
- 领域补充：PySide6 / QtQuick 现代写法对照
