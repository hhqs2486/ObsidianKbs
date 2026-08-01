---
类型: 概念
主题: 虚拟化
tags: [概念]
创建: 2026-07-21
复习: 
状态: 种子
---

# vSphere

## 一句话定义
> vSphere 是 VMware 的服务器虚拟化套件（核心是 ESXi Hypervisor + [[vCenter]] 管理），用来把一台物理服务器抽象成多台互相隔离的 [[虚拟机]]。

## 它解决什么问题 / 为什么存在
- 传统部署直接把应用跑在物理机上：资源被单系统独占、浪费大、难扩展、故障影响面宽。
- 企业需要稳定的虚拟化底座来跑关键业务，同时逐步拥抱 [[云原生]] 容器工作负载——vSphere 要既能管老 VM，也能管新容器。

## 核心原理（大二能懂的水平）
- **ESXi** 是裸金属 Hypervisor，直接在硬件上跑，做资源抽象；每台 VM 有独立 OS 与资源配额，彼此隔离。
- 提供经典可用性能力：**vMotion**（热迁移）、**DRS**（动态资源调度）、**HA**（高可用），对传统负载优势巨大。
- **vSphere with Kubernetes（Project Pacific）**：把 Kubernetes 控制平面嵌入 ESXi——通过 Spherelet（类 Kubelet）和 CRX 容器运行时，让 ESXi 直接作为原生节点跑容器（叫 **vSphere Pod**），无需单独 Linux 实例；vSphere Client 也能直接看/管 K8s 对象。
- 两种 K8s 集群并存：① vSphere Pod Service（主管集群，ESXi 当 worker，非标准上游 K8s）；② Tanzu Kubernetes 集群（跑在 VM 上的标准上游 [[Kubernetes]]，用 Cluster API 管理）。

## 关键参数 / 易错点
- ESXi 是 Hypervisor，不是装在 OS 之上的普通软件；它是 vSphere 的"计算内核"。
- 易错 1：以为 vSphere with Kubernetes = "vSphere 变成了 K8s 发行版"。其实它是用 [[Kubernetes]] 增强 vSphere，Tanzu 集群才是标准 K8s。
- 易错 2：把 vSphere Pod 当成标准 K8s 节点——它用的是 ESXi 当 worker，更偏"紧密集成、强隔离"，与上游 K8s 有差异。
- 存储：容器文件系统临时（重启即丢），持久数据要走持久卷；vSAN/CNS 为 K8s 持久卷提供原生支撑。

## 类比（帮助理解）
- 像一栋楼（物理机）被隔成许多独立公寓（VM），每套水电门禁独立；vSphere with Kubernetes 是给这栋楼加装了一套"现代公寓智能中控"（K8s API）——既管老公寓，也能直接管新来的集装箱房（容器），业主（管理员）和住户（开发者）各用各的入口但共用一栋楼。

## 设计时怎么用（反推思维）
> 做需要兼容存量虚拟机、又要跑云原生容器的混合系统时，我会用 vSphere 做虚拟化底座，再用 vSphere with Kubernetes 把 K8s 能力直接带进虚拟化层，避免另起一套独立 K8s 集群——即"传统负载 + 云原生"一体化托管。

## 典型应用 / 我在哪见过
- 企业私有云、关键业务虚拟化；VMware Cloud Foundation（VCF）是其完整交付形态。
- 现代混合云：同一套基础架构同时托管传统 VM 与 [[容器云平台]] 上的云原生应用。

## 关联
- 前置知识：[[虚拟机]]、[[虚拟化KVM]]
- 相关：[[vCenter]]、[[软件定义数据中心]]、[[超融合]]、[[Kubernetes]]、[[容器云平台]]、[[云原生]]
- 反例/误区：认为 vSphere Pod 等同标准 K8s 节点——见 [[Kubernetes]]（标准节点是 Linux，这里是 ESXi）。

## 来源
- 《VMware vSphere with Kubernetes 基础知识》白皮书（vmware-vsphere，ch03~ch11：传统/虚拟化/容器化部署、vSphere with Kubernetes 原理、vSphere Pod 与 Tanzu 区别）
