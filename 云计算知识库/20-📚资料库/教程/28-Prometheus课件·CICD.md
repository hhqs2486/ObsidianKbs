---
类型: 教程
资料: Prometheus课件笔记（云原生大礼包#9）
tags: [教程]
创建: 2026-07-21
---

# Prometheus 课件·CICD（Jenkins / GitLab CI 与容器镜像构建）

> 源：V2.0 `chap08 CICD/第七章 CICD.ppt`。**注意**：该源是旧版 `.ppt`（OLE2 格式），python-pptx 无法解析，以下为从二进制中提取的字符串关键词（不完整），仅作线索，建议以 [[CI-CD]] 等现有卡为准。

## 概述
本章主题为 **CI/CD 流水线 + 容器镜像构建 + 推送到 K8s 部署**。从二进制里救回的关键词显示它覆盖了 Jenkins、GitLab CI 的常用组件与"代码→镜像→集群"的发布链路。

## 核心要点（来自字符串恢复，非完整正文）
- **CI 工具**：Jenkins（含 Jenkinsfile、BlueOcean、Jenkins Credentials）、GitLab CI。
- **构建不同语言镜像**：Java（Maven/Gradle，缓存 `~/.m2`）、NodeJS（npm，`node_modules`）、Go、`/PHP`（含 `vendor`）、SpringCloud（Dockerfile）、Google Jib（Java 镜像构建工具，免 Dockerfile）。
- **部署目标**：Kubernetes Pod、`KUBECONFIG`（CI 里用 kubeconfig 凭据对接集群）。
- **链路本质**：push 代码 → 构建镜像 → 推镜像库 → 部署 K8s，即 [[CI-CD]] 中 CI（构建测试）+ CD（发布部署）的落地。

## 关联概念卡
- 主线：[[CI-CD]] [[持续集成]] [[持续交付]] [[持续部署]] [[流水线即代码]]
- 构建/部署：[[Docker]] [[容器镜像]] [[Kubernetes]] [[镜像仓库]] [[Helm]]
- 凭据/权限：[[RBAC]] [[Secret]]

## 来源
- V2 章08：`.cache/V2章08CICD/full.txt`（源为旧版 .ppt，仅字符串恢复，内容残缺）
