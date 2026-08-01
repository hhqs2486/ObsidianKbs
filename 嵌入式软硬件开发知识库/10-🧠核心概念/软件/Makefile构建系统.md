---
类型: 概念
tags: [概念,嵌入式Linux]
主题: Makefile构建系统
创建: 2026-07-24
状态: 已完成
---
# Makefile构建系统

## 一句话定义
Makefile 是管理多文件 C/C++ 项目编译链接的脚本文件，定义目标、依赖和规则，让 make 工具自动完成增量编译。

## 它解决什么问题 / 为什么存在
手工 gcc 逐文件编译在项目变大后不可维护。Makefile 解决：只重编译改动的文件（增量编译）；一条命令完成全部编译链接；管理编译选项、头文件路径、库依赖。

## 核心原理（大二能懂的水平）
核心三要素：
1. 目标(target)：要生成的东西（如 app: main.o utils.o）
2. 依赖(prerequisites)：生成目标需要的文件
3. 规则(recipe)：怎么从依赖生成目标（Tab 缩进的 shell 命令）

变量：CC = gcc，引用 $(CC)
自动变量：$@(目标名) $<(第一个依赖) $^(所有依赖)
通配规则：%.o: %.c 匹配所有 .c 到 .o
伪目标：.PHONY: clean 防止与同名文件冲突
函数：$(wildcard *.c)、$(patsubst %.c,%.o,$(SRC))

## 关键参数 / 易错点
- 必须用 Tab 缩进规则行，空格会报错
- 嵌入式交叉编译需指定 CROSS_COMPILE = arm-linux-gnueabihf-
- Kbuild（Linux 内核/驱动构建）是 Makefile 的扩展层，用 obj-m += mydriver.o 声明模块
- Makefile 和 CMake 不冲突：CMake 生成 Makefile，Makefile 执行编译

## 类比（帮助理解）
Makefile 像菜谱：目标=成品菜，依赖=食材，规则=烹饪步骤。改了一样食材只需重做那一步，不用从头来。

## 设计时怎么用（反推思维）
反推：项目有多个 .c 文件 -> 写 Makefile 管理编译；驱动模块 -> 用 Kbuild 语法 obj-m；需要跨平台 -> 用 CMake 生成不同平台的 Makefile。

## 典型应用
所有 C/C++ 项目编译、Linux 内核/模块构建、嵌入式交叉编译工程。

## 关联
- 前置知识：[[C语言]]、[[编译工具链]]
- 相关：[[Menuconfig与Kconfig]]、[[CMake构建系统]]、[[交叉编译与根文件系统]]
- 扩展阅读：项目中 ch02-01.Makefile 脚本语法、ch04-x3.CMake 构建

## 来源
GitHub: zc110747/build_embed_linux_system (108章, 2026-07-22) ch02-01; GNU Make Manual
