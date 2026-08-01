---
类型: 概念
tags: [概念,嵌入式Linux,工具链]
主题: CMake构建系统
创建: 2026-07-24
状态: 已完成
---
# CMake构建系统

## 一句话定义
CMake 是跨平台构建系统生成器，通过 CMakeLists.txt 描述项目结构，自动生成 Makefile 或其他构建文件。

## 它解决什么问题 / 为什么存在
直接写 Makefile 在项目变大、跨平台、需要管理依赖库时维护困难。CMake 用更高级的语法描述「编译什么、怎么链接、依赖什么」，然后生成对应平台的 Makefile/Ninja/VS 工程。

## 核心原理（大二能懂的水平）
核心语法：
cmake_minimum_required(VERSION 3.10)
project(MyApp C CXX)
aux_source_directory(src SRC_LIST)
add_executable(app ${SRC_LIST})
target_include_directories(app PRIVATE include)
target_link_libraries(app pthread)

交叉编译：写一个 toolchain.cmake 定义编译器路径和目标平台，然后 cmake -DCMAKE_TOOLCHAIN_FILE=toolchain.cmake ..

常用命令：add_library()（生成库）、install()（安装规则）、find_package()（查找依赖）

## 关键参数 / 易错点
- CMake 不编译代码，它生成 Makefile，编译还是 make 做
- mkdir build && cd build && cmake .. && make 是标准流程（外部构建，不污染源码目录）
- 嵌入式交叉编译用 toolchain.cmake 文件
- target_* 系列比全局 include_directories 等更精确
- CMake 和 Makefile 不冲突：CMake 是 Makefile 的上层

## 类比（帮助理解）
CMake 像建筑设计图：描述「要什么」，CMake 生成施工方案(Makefile)，make 按方案施工(编译)。

## 设计时怎么用（反推思维）
反推：项目有多种编译配置/跨平台 -> 写 CMakeLists.txt -> 定义编译器和选项 -> cmake 生成 Makefile -> make 编译。

## 典型应用
C/C++ 跨平台项目、嵌入式交叉编译工程、需要管理第三方依赖的项目。

## 关联
- 前置知识：[[Makefile构建系统]]、[[编译工具链]]
- 相关：[[交叉编译与根文件系统]]
- 扩展阅读：项目中 ch04-x3.基于 cmake 构建软件项目

## 来源
GitHub: zc110747/build_embed_linux_system (108章, 2026-07-22) ch04-x3; CMake official docs
