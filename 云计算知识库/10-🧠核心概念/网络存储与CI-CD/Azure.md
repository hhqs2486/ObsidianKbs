---
类型: 概念
主题: 
tags: [概念]
创建: 2026-07-21
复习: 
状态: 种子
---

# Azure

## 一句话定义
> Azure 是微软公有云，提供计算 / 存储 / 网络 / 数据库 / AI 等托管服务；Azure DevOps 是其上的研发协作 SaaS。

## 它解决什么问题 / 为什么存在
- 企业不想自己买服务器、建机房、养运维，要按需弹性拿算力。云把数据中心能力做成「按用量付费」的服务（IaaS / PaaS / SaaS）。

## 核心原理（大二能懂的水平）
- 你不用拥有硬件，向云「租」能力：开一台虚拟机、建一个数据库、跑一个容器集群，按表付费。
- Azure DevOps Services 即跑在 Azure 上的 SaaS；它与 Azure 云资源（部署到 VM / [[Kubernetes]] / [[容器]]）天然打通——Pipelines 构建的产物可直接落到 Azure 计算上运行。

## 关键参数 / 易错点
- 关键概念：订阅(subscription)、资源组、区域(region)、SLA。
- 易错：Azure DevOps Services 与 Azure 订阅是两套计费 / 账号体系（DevOps 用「组织 + 访问级别」，Azure 用「订阅」）；二者可集成但概念分开，别混淆。

## 类比（帮助理解）
- 像「水电公司」：你不用自己建电厂，插上插头按表付费就能用电；要用更多算力就调高档位。

## 设计时怎么用（反推思维）
> 做 XX 系统时，我会用它能解决 YY：做系统时，我会把 [[CI-CD]] 产出的镜像 / 包部署到 Azure 的 compute 上，用云的弹性扛流量，配合 [[负载均衡]] 与 [[高可用]] 抗故障。

## 典型应用 / 我在哪见过
- 本书「Azure 云托管服务」：Azure 服务提供应用全生命周期所需的基础设施与平台支持，并与 Azure DevOps 组合出涵盖源码管理、CI/CD 的集成体验。
- DevOps 部署目标常是 Azure 上的 VM / 容器 / AKS([[Kubernetes]])。

## 关联
- 前置知识：[[Azure DevOps]]、[[CI-CD]]
- 相关：[[Kubernetes]]、[[容器]]、[[高可用]]、[[负载均衡]]
- 反例/误区：Azure DevOps 不等于 Azure 订阅（前者是研发 SaaS，后者是云资源计费主体）

## 来源
- 本书（PDF 为图片混排版，结合章节结构整理）；ch11_DevOps 资源中心.txt「Azure 云托管服务」「Azure DevOps Services 与 Server 比较」。
