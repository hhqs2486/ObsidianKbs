---
类型: 概念
主题: Kubernetes节点代理
tags: [概念, Kubernetes, 节点, 运行时]
创建: 2026-07-21
复习: 
状态: 种子
---

# kubelet

## 一句话定义
> kubelet 是"跑在每个节点上的管家"，负责把调度到本节点的 Pod 真正变成运行的容器，并持续上报健康与状态。

## 它解决什么问题 / 为什么存在
- 调度器只决定了"去哪台机器"，但真正**拉镜像、起容器、查死活、挂存储、配网络、上报状态**的是节点上的 kubelet。它是节点与控制平面的桥梁。

## 核心原理（大二能懂的水平）
- 通过 List-Watch 监听 APIServer 上 `nodeName=本节点` 的 Pod。
- 用 **CRI（容器运行时接口）**对接底层运行时（Docker/containerd/CRI-O）；用 [[CNI网络]] 配网络、用 CSI 挂存储。
- 通过 **cAdvisor** 采集本机容器资源用量，上报给 APIServer / metrics 接口。
- 执行 **探针（[[探针LivenessReadiness]]）**：liveness 失败就重启容器，readiness 失败就把 Pod 从 Service 后端摘掉。
- **静态 Pod**：写在 `/etc/kubernetes/manifests/` 的 Pod 由 kubelet 直接管理（APIServer 里只是镜像对象），Master 上的控制平面组件就是这样被拉起的。
- 节点状态（Ready/NotReady）、**驱逐（eviction）**、镜像 GC 也由它处理。

## 关键参数 / 易错点
- `--kubeconfig` 或 TLS bootstrap 决定它怎么连 APIServer；证书失效节点会 `NotReady`。
- `--register-node` 决定是否自动向集群注册自己。
- **CRI 运行时变了要对应改配置**（如 1.24+ 默认弃用 dockershim 改用 containerd），否则节点起不来。
- kubelet 的 **cgroup 驱动要和运行时一致**（systemd vs cgroupfs），不一致会启动失败。
- kubelet 挂了，它上面的 Pod 不会自动漂移，要靠控制器在别的节点重建。

## 类比（帮助理解）
- 像**楼栋管家**：总台（APIServer）告诉他"这层要住这几户"（Pod），他找施工队（CRI）装修、通水电（CNI/CSI）、每天查每户是否安全（探针），并向总台汇报。

## 设计时怎么用（反推思维）
> 排查"Pod 一直 ContainerCreating / 调度到了却不跑"时，我先 ssh 到节点看 kubelet 日志和 CRI 状态——绝大多数节点级问题都出在 kubelet 或它的插件上。

## 典型应用 / 我在哪见过
- 所有节点必备；Master 上的 kubelet 还负责用静态 Pod 拉起控制平面；TLS bootstrap 让新节点自动领证。

## 关联
- 前置知识：[[容器]] [[CNI网络]]
- 相关：[[Scheduler]] [[kube-proxy]] [[探针LivenessReadiness]]
- 反例/误区：以为 kubelet 挂了 Pod 会自动漂移（默认不会，靠控制器重建）。

## 来源
- 本书第 5 章 核心组件的运行机制（kubelet 架构、CRI、cAdvisor、健康检查）。
- 本书第 3 章 深入掌握 Pod（Pod 生命周期与节点上的实现）。
