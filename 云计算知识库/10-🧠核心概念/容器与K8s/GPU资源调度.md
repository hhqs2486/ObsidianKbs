---
类型: 概念
tags: [云计算知识库, 容器与K8s]
主题: 容器与K8s
创建: 2026-07-22
状态: 种子
---

# GPU资源调度

> 从"给我 2 个 GPU"到"给我 2 个 80GB H100、NVLink 互联、不要和别人的任务挤同一张卡"——K8s 动态资源分配（DRA）给 GPU 调度带来的范式转变。

## 一句话定义
Kubernetes 的 **Dynamic Resource Allocation (DRA)** 是替代传统设备插件（Device Plugin）的新框架，让 workload 按**属性**（GPU 型号、显存、拓扑、性能等级）而非按"个数"请求加速器。DRA 核心 API 在 K8s 1.34 GA，1.35 起默认锁定开启。

## 它解决什么问题
旧模型（Device Plugin）把 GPU 当成不透明整数——`nvidia.com/gpu: 1`——调度器不知道这是 A100 还是 H100、显存多少、NVLink 拓扑怎么连、能不能分时共享。后果：
- **刚性分配**：一张卡即使只用 10% 也只能整卡分配，MIG 碎片化严重
- **弱拓扑感知**：分布式训练的 8 个 Pod 可能分散在不同交换机下，通信带宽暴跌
- **预配置瓶颈**：加速器必须节点上手动装好驱动和配置，Pod 才能调上去

## 核心原理
DRA 引入四类资源对象（都在 `resource.k8s.io/v1` API 组）：

| 对象 | 谁创建 | 作用 |
|------|--------|------|
| **ResourceSlice** | DRA Driver（节点 kubelet 插件） | 发布节点上可用设备清单及属性（型号/显存/拓扑） |
| **DeviceClass** | 集群管理员 | 定义"符合什么条件的设备算一类"（CEL 表达式筛选） |
| **ResourceClaim** | 用户/workload | "我需要满足 X 条件的设备"——声明性申请 |
| **ResourceClaimTemplate** | 平台/控制器 | 类似 PVC Template，控制器自动为每个 Pod 生成 Claim |

**调度流程**：
1. Driver → 发布 ResourceSlice（每节点一张，含设备属性）
2. Pod 引用 ResourceClaim → Scheduler 的 `DynamicResources` 插件暂挂 Pod
3. Scheduler 拿 Claim 的属性和所有 ResourceSlice 做匹配，找到后写入 Claim status + 绑定 Pod
4. Kubelet → Driver gRPC `NodePrepareResources` → 生成 CDI spec 文件
5. Kubelet → CRI → containerd/CRI-O 依据 CDI 注入设备到容器

## 成熟度时间线
| K8s 版本 | DRA 状态 |
|-----------|---------|
| 1.30-1.33 | Alpha → Beta，API 组 v1alpha/v1beta1/v1beta2 |
| **1.34** | **DRA 核心 GA**（resource.k8s.io/v1），默认启用 |
| 1.35 | Feature gate 锁定开启，不可关闭 |
| 1.36 | AdminAccess GA、Prioritized Alternatives GA、Partitionable Devices/Consumable Capacity/Device Taints Beta |

## v1.36 DRA 重点增强
- **Prioritized Alternatives（GA）**：一个 Claim 可列多个"优选 → 次选"设备，调度器按优先级尝试
- **AdminAccess（GA）**：集群管理员无需与 workload 名字空间绑定即可管理硬件
- **Partitionable Devices（Beta）**：设备可按子资源粒度分配（GPU 分时/MIG 切片）
- **Consumable Capacity（Beta）**：设备有"消耗性容量"概念，用完即释放
- **Device Taints/Tolerations（Beta）**：设备可带污点，故障设备自动驱逐 Pod

## CDI（Container Device Interface）——关键基础设施
DRA 不直接操作设备，而是生成 **CDI spec 文件**（`/var/run/cdi`）。CDI 是一个 CNCF 子项目，定义了如何描述设备注入到容器的标准格式。containerd 和 CRI-O 原生支持，kubelet 通过 CDI 把 GPU 设备文件、驱动库、环境变量注入容器。

## 设计时怎么用
- AI 训练平台：用 ResourceClaimTemplate 为每个训练 Job 自动申请特定型号 GPU（如 `memory >= 80Gi` + `driver == "nvidia.com/gpu"`）
- 推理服务：用 Consumable Capacity 做 GPU 分时，多个推理 Pod 共享一张 H100
- 混合加速器集群：同一 K8s 集群有 GPU/FPGA/NPU，DRA 统一管理，DeviceClass 分类

## 局限（2026-07）
- **不等同于 GPU 虚拟化**：DRA 管分配，不管 MIG/vGPU——分区/共享仍靠厂商驱动
- **驱动成熟度不齐**：API 已稳定，但各家 GPU DRA 驱动生产就绪度不一致
- **Autoscaler 集成进行中**：Cluster Autoscaler / Karpenter 需能理解 ResourceClaim 来决定扩容
- **抢占/健康检测仍在演进**：v1.36 设备健康报告仍为 Alpha

## 关联
- 前置：[[Kubernetes]] [[Scheduler]] [[kubelet]] [[Pod]]
- 相关：[[容器编排]] [[资源限制与QoS]] [[CRD与Operator]] [[Kubernetes v1.36]]
- AI/ML：GPU 调度、GPU 共享（待补充）
- WG Device Management：https://www.kubernetes.dev/blog/2026/06/24/wg-device-management-spotlight-2026

## 类比
旧模型是把 GPU 当超市货架上的整箱可乐——只能按箱卖。DRA 是自动售货机——"H100 80G、冰的（型号 + 容量）、A6 货道（拓扑位置）、只买半罐（分时/MIG）"都能精确定位。

## 来源
- Kubernetes v1.34 DRA GA 发布说明
- ScaleOps: Kubernetes Dynamic Resource Allocation for GPUs（2026）
- K8s 官方文档：Set Up DRA in a Cluster
- WG Device Management Spotlight 2026（kubernetes.dev）
