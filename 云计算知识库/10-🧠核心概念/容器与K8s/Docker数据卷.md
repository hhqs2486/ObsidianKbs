---
类型: 概念
主题: 容器与K8s
tags: [概念]
创建: 2026-07-21
复习: 
状态: 种子
---

# Docker数据卷

## 一句话定义
> Docker 数据卷（Volume）是宿主机上由 Docker 管理的一块专门目录，绕过容器可写层，用来**持久化**容器产生的数据；容器删了，卷还在。

## 它解决什么问题 / 为什么存在
- 容器存储层（UpperDir）生命周期和容器绑定，容器一删数据全没——跑 MySQL 不做卷就会「MySQL 丢数据」（《Docker实战(图解)》ch03 原话）。
- 卷让「数据」和「容器」解耦：容器随便删重建，数据库文件、日志、配置留在卷里。

## 核心原理（大二能懂的水平）
- 三种挂载方式：
  1. **Volumes（卷）**：Docker 自己管，存 `/var/lib/docker/volumes/`，最推荐，非 Docker 进程别动。
  2. **Bind mounts（绑定挂载）**：挂宿主机任意绝对路径，宿主机和容器都能改，危险——空目录挂载会遮掉容器内原内容导致启动失败。
  3. **tmpfs mounts**：只进内存，不落盘。
- 写法判断：`-v` 里**以 `/` 开头**的是 bind mount，**不以 `/` 开头**的是具名卷（如 `-v nginxhtml:/usr/share/nginx/html`）。
- 卷可共享、可重用、修改即时生效、不影响镜像；`docker volume create/ls/inspect/prune` 管理；删容器想连卷一起删用 `docker rm -v`。

## 关键参数 / 易错点
- 新用户用 `--mount source=my-vol,target=/webapp`（比 `-v` 清晰）；`-v /src:/opt:ro` 可只读。
- bind mount 空目录会「遮盖」容器内原目录内容 → 启动失败，务必先在宿主机备好内容。
- 卷默认 RW；需要只读加 `:ro`。
- 无主卷会占空间，`docker volume prune` 清理。
- 与 [[Kubernetes]] 区别：Docker 卷是单机本地概念；K8s 用 [[PV与PVC]] / [[Volume]] 做跨节点持久化（概念相关但不同）。

## 类比（帮助理解）
- 卷像「可插拔的移动硬盘」：容器是电脑，电脑报废了硬盘还能插到下一台电脑继续用。bind mount 像「直接把宿主机文件夹共享进容器」。

## 设计时怎么用（反推思维）
> 做「有状态服务（数据库、文件服务）」时，我会把数据目录挂成 Volume，绝不写进容器层；这样升级镜像、重建容器，用户数据不丢。上生产配合 [[Kubernetes]] 的 [[PV与PVC]] 做跨节点持久化。

## 典型应用 / 我在哪见过
- MySQL / Redis 数据目录、nginx 的 html 与配置、日志收集。
- 见过：《Docker实战(图解)》ch03 容器挂载；《Docker从入门到实践》ch10 数据管理；《Docker经典实例》`VOLUME /var/lib/mysql`、wordpress + mysql 栈。

## 关联
- 前置：[[容器]]、[[Docker]]
- 相关：[[容器镜像]]、[[PV与PVC]]、[[Volume]]、[[Kubernetes]]
- 反例：把数据库文件写进容器存储层（删容器即丢）。

## 来源
- 《Docker实战(图解)》（docker-tujie，TEXT 真实文本）ch03 网络和存储原理
- 《Docker从入门到实践》（docker-rumen，MIXED 图片混排）ch10 数据管理
- 《Docker经典实例》（docker-jingdian，TEXT 真实文本）卷相关实例（VOLUME /var/lib/mysql 等）
- 补充：本书（PDF 为图片版，结合章节结构整理）——Docker书 / Docker实战 文本极少，以知识补全
