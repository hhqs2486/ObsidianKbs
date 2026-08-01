---
类型: 概念
主题: 容器与K8s
tags: [概念]
创建: 2026-07-21
复习: 
状态: 种子
---

# Dockerfile

## 一句话定义
> Dockerfile 是一个用声明式指令写成的文本文件，描述「如何一步步把应用及其依赖打包成 [[容器镜像]]」，是镜像构建的「菜谱」。

## 它解决什么问题 / 为什么存在
- 没有 Dockerfile 时，有人用 `docker commit` 把正在跑的容器「拍快照」成镜像——生成的镜像是黑盒、不可复现、别人看不出里面装了啥。
- Dockerfile 把「镜像怎么来的」变成**可读、可版本化、可复现**的文本：谁拿到这份文件都能 `docker build` 出完全一样的镜像（Build Once, Run Anywhere）。
- 它让镜像构建从「人工操作」变成「代码」，可以直接接进 [[CI-CD]] 流水线自动构建。

## 核心原理（大二能懂的水平）
- Dockerfile 由一行行指令组成、从上到下执行；每条「会改动文件系统」的指令（RUN / COPY / ADD）都会在镜像上叠加一个新**层（layer）**，最终镜像就是一层层叠起来的。
- 基础镜像用 `FROM` 指定，例如 `FROM openjdk:8-jre-alpine` 表示在「装好 JRE 的最小 Linux」之上继续加工；`scratch` 是空镜像，常用于 [[多阶段构建]]。
- `RUN` 在**构建时**执行命令并固化成新层；`CMD` / `ENTRYPOINT` 指定「容器启动时默认跑什么」，不在构建期执行。
- 关键区分：`CMD` 是「默认命令/默认参数」，容易被 `docker run` 后面跟的命令覆盖；`ENTRYPOINT` 是「固定入口」，`docker run` 传的参数是追加给它。两者配合 = ENTRYPOINT 定死程序、CMD 给默认参数。
- `COPY` 只复制本地文件；`ADD` 还能下载 URL 并自动解压 tar——日常优先用 COPY，少踩坑。
- `ARG` 只在**构建期**有效（`--build-arg` 传入，可用 `docker history` 看到，别塞密码）；`ENV` 会被固化进镜像，容器运行时也生效（`docker run -e` 可覆盖）。
- `WORKDIR` 设定后续指令工作目录；`EXPOSE` 只是「声明监听端口」的文档，真正对外要 `-p`；`VOLUME` 声明挂载点。

## 关键参数 / 易错点
- 一条 Dockerfile 里**只能有一个 CMD** 生效（多个则最后一个胜出）；ENTRYPOINT 通常也只一个。
- shell 形式（`RUN echo $msg`）经 `/bin/sh -c`，能解析变量；exec 形式（`RUN ["echo","$msg"]`）**不会**做变量替换，原样输出 `$msg`。
- `VOLUME` 声明之后的同目录写操作会被丢弃——要改内容必须在 `VOLUME` 之前做。
- `COPY`/`ADD` 的源路径**必须在构建上下文内**，不能用 `../` 逃出上下文（docker 第一步会把上下文发给守护进程）。
- 层越多越臃肿：安装与清理要写在**同一个 RUN** 里，例如 `RUN apt-get update && apt-get install -y xxx && rm -rf /var/lib/apt/lists/*`，否则清理那层并不会真删掉上一层的包。

## 类比（帮助理解）
- Dockerfile 像「蛋糕配方」：FROM 是底胚（基础镜像），每条 RUN/COPY 是「加一层奶油/水果」，CMD 是「端上桌时插的蜡烛」。别人拿配方就能复刻同一个蛋糕，而不是你偷偷拍张照片给他。
- 或：Dockerfile 是「源代码」，[[容器镜像]] 是「编译产物」，`docker run` 是「运行程序」。

## 设计时怎么用（反推思维）
> 做「把一个 Spring Boot 应用交付给 [[Kubernetes]] 跑」时，我会先写一份 Dockerfile：选 `openjdk:8-jre-alpine` 这类小底包、`COPY` 打好的 jar、用 ENTRYPOINT 固定 `java -jar`，再配合 [[多阶段构建]] 让最终镜像只剩 JRE+jar，而不是把整个 Maven 构建环境也塞进去。

## 典型应用 / 我在哪见过
- 《Docker实战(图解)》第4章「深入 Dockerfile」：完整指令表 + CMD/ENTRYPOINT 组合矩阵 + ARG/ENV 固化实验。
- 《Docker从入门到实践》「使用镜像 / Dockerfile 指令」：分层存储、每条指令成一层。
- 《Docker经典实例》：2.3「编写你的第一个 Dockerfile」、1.14「使用 Dockerfile 构建镜像」（FROM busybox / ubuntu 起手）。
- 实战：Java 应用、前端静态站、Python 服务几乎都用 Dockerfile 固化构建。

## 关联
- 前置知识：[[Docker]]、[[容器镜像]]、[[容器]]
- 相关：[[多阶段构建]]、[[CI-CD]]、[[YAML]]、[[云原生]]
- 反例/误区：别用 `docker commit` 当正规构建方式（黑盒、不可复现）；别把密钥写进 ARG。

## 来源
- 《Docker实战(图解)》（docker-tujie，TEXT 真实文本）ch04 深入Dockerfile
- 《Docker从入门到实践》（docker-rumen，MIXED 图片混排）ch05 基本概念、ch07 使用镜像
- 《Docker经典实例》（docker-jingdian，TEXT 真实文本）第1章、第2章
- 补充：本书（PDF 为图片版，结合章节结构整理）——Docker书 / Docker实战 文本极少，相关 Dockerfile 用法以通用 Docker 知识补全
