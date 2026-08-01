---

类型: 教程
来源: Developing MeeGo apps with Python and QML (Thomas Perl)
创建: 2026-07-21
状态: 已读待消化
tags: [Python, 教程]
---
---

# 131 · Developing MeeGo apps with Python and QML

## 这条教程在解决什么
教你用 **PySide + QML** 在 MeeGo（上网本 / 手持设备）上写 Python GUI 应用：从环境搭建、Hello World、WebView 混合 HTML/JS，到给已有 gPodder 程序套一个触摸友好的 QML 界面，最后打包成 RPM。本质是一份「**Qt 声明式 UI（QML）+ Python 后端**」的实战入门。

> 提示：本书是可读 TEXT 版（非图片版），内容以 `.cache` 全文为准。注意它基于 **Qt 4.7 / 旧 PySide（`QtDeclarative`、`QDeclarativeView`）**，现代开发已演进到 PySide6 + QtQuick（QML 2），模块名有变化，但「声明式 UI + Python 后端桥接」的思想完全通用。

## 关键内容（按 PDF 章节提纲）
> 全书 5 节，约 28 页，轻量实战手册。

- **环境搭建（Setting up the environment）**：在 MeeGo 上用 buildscripts 从源码编译 PySide，安装进 `$HOME`，`source environment.sh` 设环境变量；验证 `from PySide import QtGui` 与 `QtDeclarative` 可用。
- **Basic QML 示例**：
  - *Hello World*：Python 子类化 `QObject`、用 `Property` 暴露 `greeting`，`setContextProperty` 注入 QML；.qml 里 `Text { text: hello.greeting }` 显示。
  - *WebView 混合 HTML/JS*：Python 与 WebView 用 **JSON + `alert()`** 双向通信（Python `evaluateJavaScript` 发、监听 WebView 的 alert 信号收）；用 `QPropertyAnimation` 给组件做旋转动画——演示 Python/HTML/JS/QML 四方联动。
- **真实案例：给 gPodder 写 QML UI**（本书重点）：
  - Python 胶水层用 `gpodder.api` 取数据；`EpisodeWrapper`/`PodcastWrapper` 包成 `QObject` 暴露属性（带 `notify=changed` 以便 UI 刷新）。
  - `PodcastListModel`/`EpisodeListModel` 继承 `QAbstractListModel`，供 QML `ListView` 显示列表。
  - `Controller` 类用 `@QtCore.Slot` 接收 QML 的点击（`podcastSelected`/`episodeSelected`），切换界面状态。
  - QML 侧用 `states` + `transitions` 做 Podcasts↔Episodes 的切换动画；`ListView`+`delegate` 画列表行；`MouseArea` 捕获点击触发 `contr.podcastSelected(...)`。
- **打包（Packaging）**：写 `.desktop` 入口、应用图标、`Spectacle` YAML、`setup.py`（distutils），用 `rpmbuild` 生成 `noarch` RPM，再 `zypper install` 安装测试。

## 我卡住/没懂的地方
- 老 API 名称迁移：本书 `QtDeclarative` / `QDeclarativeView` / `Qt 4.7` 在现代 PySide6 里是 `QtCore.QUrl` + `QQuickView`（或 `QQmlApplicationEngine`）+ `import QtQuick`，学思路、改 import 即可。
- `ListView` 不能直接吃 Python list，必须来自 `QAbstractListModel`——这是 QML 列表数据最常见的坑。
- 想让 QML 反映数据变化，属性必须标 `notify=changed` 信号，否则 UI「不刷新」却没报错。

## 它背后的原理（别只记操作）
- 整体仍是标准 Qt 套路：建 `QApplication` → `QDeclarativeView` 加载 `.qml` → `app.exec_()` 跑 [[Qt事件循环]]。
- [[QML]] 是一棵「声明式界面对象树」，Python 通过 **rootContext 属性**把后端对象喂进去，通过 [[信号与槽]]（`Slot`/`Signal`）把界面事件接回 Python——UI 与逻辑解耦。
- QML 的 `ListView`+`model` 是 [[Qt控件]] 里「模型/视图」思想在声明式体系下的对应物。

## 我能复用/改编的点
> 换个需求，这套做法还能怎么用？
- 做**触摸/移动/嵌入式前端**（仪器面板、车载屏、树莓派触屏、数据看板）时，直接套「QML 写界面 + Python 写业务逻辑」：数据/网络/算法在 Python，界面与动画在 QML。
- 用 **WebView 混合 HTML/JS** 做富内容展示（报表、图表页），Python 当后端桥。
- 给**已有 Python 程序套 QML 外壳**而不动核心逻辑（本书 gPodder 就是范例：旧 PyGTK 不动，只加一层 QML 前端）。

## 关联
- 概念：[[QML]]、[[PyQt与PySide]]、[[信号与槽]]、[[Qt事件循环]]、[[界面布局]]、[[Qt控件]]
- 跨簇互补：[[标准库]]（json 模块做 Python↔WebView 数据通信）、[[包管理pip]]（distutils/`setup.py` 是打包基础，RPM 只是再封装一层）

## 来源
- Thomas Perl, *Developing MeeGo apps with Python and QML*，2010（PDF 28 页，TEXT 版，本库 KEY `004_Developing MeeGo apps with Python and QML(1).pdf`）
- 缓存：`.cache/004_Developing MeeGo apps with Python and QML(1).pdf/full.txt`
