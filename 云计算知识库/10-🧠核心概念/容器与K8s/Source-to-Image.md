---
类型: 概念
主题: 
tags: [概念]
创建: 2026-07-21
复习: 
状态: 种子
---

# Source-to-Image

## 一句话定义
> Source-to-Image（S2I）是 [[OpenShift]] 内置的"源码 → 镜像"自动化构建流程：给一个源码仓库地址 + 一个 Builder（基础）镜像，它就把代码注入、编译、打包成标准应用镜像并推送到内部 [[镜像仓库]]。

## 它解决什么问题 / 为什么存在
- 企业自研应用没有现成镜像可下载，必须自己容器化。手工写 Dockerfile、build、push 在频繁迭代下又慢又易错。
- S2I 把"构建逻辑"从 Dockerfile 抽出来，变成 Builder 镜像里的一组脚本（assemble / run），让"只交源码"就能产出可运行镜像，且与具体构建系统解耦。

## 核心原理（大二能懂的水平）
- 步骤（第3/5章）：① 用户给源码地址 + 选 Builder 镜像（含 OS/语言/框架，如 WildFly、PHP、Python）；② 触发构建，平台起一个 S2I 执行器；③ 下载源码注入 Builder 容器；④ Builder 按脚本编译/构建；⑤ 把结果 commit 成新 Docker 镜像；⑥ 推送到内部 Registry；⑦ 更新 Image Stream。
- Image Stream 是 OpenShift 对"一组镜像 tag"的抽象；S2I 推完镜像后更新 Image Stream 的 latest，进而自动触发部署（Deployment Config）。
- 输入输出：除了源码，S2I 还接受 Dockerfile、二进制文件；Builder 镜像本质就是普通 Docker 镜像 + 约定脚本（assemble 负责构建、run 作为容器启动命令）。

## 关键参数 / 易错点
- Builder 镜像指向的是 Image Stream Tag，不是固定镜像地址（第5章 BuildConfig 里的 from 是 ImageStreamTag）。
- 触发器：BuildConfig 支持 ConfigChange / ImageChange / GitHub WebHook / Generic WebHook。Generic WebHook 只要能发 HTTP POST 就能触发，适合对接任意 [[CI-CD]] 系统（第5/14章）。
- 易错：项目设置了 ResourceQuota 却没给容器配 requests/limits，S2I / 部署会因拿不到资源而 Pending（第12章）。
- 语言无关：脚本型（PHP/Python/Ruby）和编译型（Java/Go/C++）都支持；Java 默认调 Maven package（第5章）。

## 类比（帮助理解）
- S2I 像"全自动咖啡机"：你投入咖啡豆（源码）+ 选好机型（Builder 镜像），它自动磨豆、萃取、出杯（镜像），你不用自己煮。

## 设计时怎么用（反推思维）
> 做"多语言团队的持续交付"时，我会用 S2I 让各团队只提交源码、平台自动出镜像并滚动更新；需要接既有 Jenkins/GitLab 时，用 Generic WebHook 把"提交代码 → S2I → 部署"串起来。

## 典型应用 / 我在哪见过
- OpenShift 官方 Builder：Java/WildFly、PHP、Ruby、Python、Perl；也可自制定制 Builder（第14章 14.3 以 Tomcat 为例）。
- 对比原生方案：用 Kaniko / Buildah 在集群内构建，或用 [[Helm]] + CI 脚本构建，但 S2I 把"语言构建逻辑"标准化了。

## 关联
- 前置知识：[[Kubernetes]] [[容器]] [[镜像仓库]]
- 相关：[[OpenShift]] [[Route]] [[Deployment]] [[CI-CD]] [[Helm]]
- 反例/误区：手工 Dockerfile 构建（S2I 是其自动化升级版）

## 来源
- 开源容器云 OpenShift（第3章 3.2.9 Source to Image；第5章 容器应用的构建与部署自动化；第14章 14.3 S2I 镜像定制）。
