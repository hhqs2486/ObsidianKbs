---
类型: 概念
主题: Helm仓库
tags: [概念]
创建: 2026-07-21
复习: 
状态: 种子
---

# Helm仓库

## 一句话定义
> Helm 仓库（chart repository）是一个极简的 HTTP(S) 静态 Web 服务，用 index.yaml 列出所有可用 chart 及其下载地址，供用户查找、拉取和安装。

## 它解决什么问题 / 为什么存在
- 软件包管理必须能"分发 / 共享"：没有仓库，chart 只能靠本地目录传来传去。
- 仓库让"发布 chart"和"找 chart 安装"有了一个统一约定，类比操作系统的软件源。

## 核心原理（大二能懂的水平）
- 仓库核心就是 index.yaml：顶层 apiVersion（恒为 v1）、generated 时间戳，entries 下每个 chart 列出所有版本，每版本含 urls（.tgz 下载地址，可跨域）、digest（SHA-256 校验和）。
- 客户端命令：`helm repo add NAME URL`（拉取并缓存 index）、`helm repo list`、`helm repo update`（刷新缓存）、`helm repo remove`。
- 查找/下载：`helm search` 搜索、`helm pull` 下载 .tgz、`helm install repo/chart` 直接装。Helm3 没有默认仓库，先用 Artifact Hub 找再 add。
- 下一代：实验性的 OCI 支持（`helm chart save/push/pull`、`helm registry login`），把 chart 存在容器登记站，解决"无命名空间、无细粒度权限、索引过大"等问题（第7章）。

## 关键参数 / 易错点
- `helm repo add NAME <URL>`，URL 指向能提供 `GET /index.yaml` 的服务。
- index.yaml 的 digest 是 SHA-256；改动 chart 后要重新生成索引（可 `--merge` 增量合并，但需避免多端并发冲突）。
- 仓库本身无命名空间、无细粒度访问控制（要么全有要么全无）——这正是 OCI 想解决的。
- 安全：支持 basic auth（建议配 HTTPS）和 mTLS 客户端证书。
- 真实托管示例：GitHub Pages 静态站、ChartMuseum、Harbor、对象存储（S3/GCS）。

## 类比（帮助理解）
- 像 apt 的软件源 / PyPI：本质就是一个静态文件服务器 + 一份索引清单。

## 设计时怎么用（反推思维）
> 做 XX 系统时，我会把内部 chart 推到私有仓库（ChartMuseum / Harbor / GitHub Pages），让团队成员 `helm repo add` 后就能像装软件一样统一安装，而不是互相传目录。

## 典型应用 / 我在哪见过
- 本书第2章（添加 bitnami 仓库）、第7章（自建仓库、GitHub Pages 实战、OCI）。
- Artifact Hub（https://artifacthub.io）聚合了数千个公开 chart。

## 关联
- 前置知识：[[Helm Chart]] [[Helm]]
- 相关：[[应用包管理]] [[CI-CD]] [[Helm Release]]
- 反例/误区：Helm 仓库 ≠ 容器镜像仓库（虽然 OCI 下可共用一个登记站）；仓库只分发 chart，不存运行的 Pod。
- 教程笔记：[[06-Helm学习指南]]

## 来源
- 本书第2章（2.2/2.3）、第7章（chart 存储库）、附录B（chart 存储库 API）；结合 Helm v3 知识整理。
