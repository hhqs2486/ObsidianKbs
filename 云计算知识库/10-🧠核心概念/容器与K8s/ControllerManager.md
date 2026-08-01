---
类型: 概念
主题: Kubernetes控制循环
tags: [概念, Kubernetes, 控制平面, 控制器]
创建: 2026-07-21
复习: 
状态: 种子
---

# ControllerManager

## 一句话定义
> kube-controller-manager 是"一堆控制器的集合"，负责把集群的**实际状态自动收敛到声明（spec）期望的状态**——Kubernetes "自愈"能力的来源。

## 它解决什么问题 / 为什么存在
- 你声明"要 3 个副本"，但节点挂了只剩 1 个——得有人不停"对账（reconcile）"把现实拉回期望。各类控制器就是干这个的，ControllerManager 把它们统一打包运行。

## 核心原理（大二能懂的水平）
- 每种资源有对应控制器：ReplicaSet 控制器管副本数、Deployment 控制器管 [[滚动更新与回滚]]、Node 控制器管节点上下线、Endpoint 控制器维护 Service 后端、Namespace 控制器管回收、ServiceAccount 控制器管令牌、垃圾回收控制器管级联删除等。
- **统一模式**：通过 List-Watch 监听 APIServer 上自己关心的对象 → 对比 期望状态(spec) 与 实际状态(status) → 调 APIServer 下发修正动作（如新建 Pod）。这就是"声明式 + 调谐循环"。
- `--controllers` 可指定启用哪些控制器；`--leader-election` 保证多个实例中只有一个活跃（其余待命），实现高可用。
- 另有 **cloud-controller-manager** 处理云厂商相关逻辑（节点、路由、云负载均衡器）。

## 关键参数 / 易错点
- 控制器是**最终一致**，不是实时；网络抖动时会有短暂偏差，这是正常现象不是 bug。
- `--node-monitor-grace-period` 决定节点被判 NotReady 前的宽限时间，调太小会误驱逐 Pod。
- 多个控制器可能并发改同一对象，靠 `resourceVersion` 乐观锁重试解决冲突。
- 控制器只负责"让现实贴合 spec"，不会去读你手动改的 status 字段当指令。

## 类比（帮助理解）
- 像**物业管理中心**：墙上贴着每家"应住几人"（spec），保安不停巡查现实（status），发现哪家少了人就补、多了就劝走，直到和墙上一致。

## 设计时怎么用（反推思维）
> 理解"声明式 + 控制器调谐"后，做自定义自动化时我优先用 [[CRD与Operator]] 写自己的控制器，而不是写一次性脚本——这样系统能持续自愈、抗干扰。

## 典型应用 / 我在哪见过
- 自愈（节点挂了重建 Pod）、滚动更新、节点失效接管、Endpoint 自动维护、级联删除。

## 关联
- 前置知识：[[声明式API]] [[容器编排]]
- 相关：[[APIServer]] [[Scheduler]] [[CRD与Operator]]
- 反例/误区：手动改 status 以为控制器会照做（控制器只看 spec，不看你手改的 status）。

## 来源
- 本书第 5 章 核心组件的运行机制（ControllerManager 与各内置控制器）。
- 本书第 9 章 Kubernetes 开发指南（控制器的"声明—调谐"模式是写 Operator 的基础）。
