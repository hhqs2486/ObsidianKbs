---
类型: 概念
主题: CRI
tags: [概念]
创建: 2026-07-21
状态: 种子
---

# CRI

## 一句话定义
> CRI（Container Runtime Interface，容器运行时接口）是 K8s 与底层容器运行时之间的**标准 gRPC 接口**，让运行时可插拔。

## 它解决什么问题 / 为什么存在
K8s 不想被某个特定运行时（如早期的 Docker）绑定。定义统一接口后，运行时可以替换，K8s 代码不必为每种运行时改一遍。

## 核心原理（大二能懂的水平）
- kubelet 通过 CRI 调用来创建/启动/停止/删除容器，以及管理镜像和容器状态。
- 常见实现：**containerd**（轻量，现主流）、**CRI-O**（专为 K8s 设计）。
- Kubernetes 1.20+ 弃用 dockershim，直接跑 Docker 不再被原生支持，需换 containerd/CRI-O。

## 关键参数 / 易错点
- kubelet 的 `--container-runtime-endpoint` 要指向正确的 CRI socket（如 `unix:///run/containerd/containerd.sock`）。
- 运行时版本与 K8s 版本有兼容矩阵，升 K8s 前先确认。

## 类比（帮助理解）
像**手机充电口统一标准**：不同品牌充电器都通过同一接口给手机充电，手机厂不用为每家充电器改设计。

## 设计时怎么用（反推思维）
搭建新集群时，我会默认选 **containerd** 作为运行时（轻、符合 CRI、资源占用小），而非已被弃用的 Docker。

## 典型应用 / 我在哪见过
所有 K8s 集群的节点运行时选择；[[集群搭建kubeadm]] 时需指定运行时。

## 关联
- 前置知识：[[容器]] [[Docker]] [[kubelet]]
- 相关：[[集群搭建kubeadm]] [[容器编排]]
- 反例/误区：以为"K8s 还在用 Docker 跑容器"——现在多经 containerd，Docker 只是早期历史

## 来源
02-Kubernetes修炼手册 提及运行时；Kubernetes 通用知识（PDF 为图片版，结合章节结构整理）
