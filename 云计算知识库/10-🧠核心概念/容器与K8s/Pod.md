---
类型: 概念
主题: 容器与K8s
tags: [概念]
创建: 2026-07-21
复习: 
状态: 种子
---

# Pod

## 一句话定义
> Pod 是 Kubernetes 里最小、最基本的调度与运行单元，里面可以跑一个或多个紧密相关的容器，它们共享网络和存储。

## 它解决什么问题 / 为什么存在
- 单个容器太"碎"：一组要一起协作、共享数据的进程（比如"主程序 + 日志采集 sidecar"）需要一个统一的管理和调度单位。
- K8s 不直接调度容器，而是调度 Pod，这样一组容器能作为一个整体被调度到某个节点、一起启动/销毁。

## 核心原理（大二能懂的水平）
- 一个 Pod 里的多个容器共享同一个"网络命名空间"：它们用 localhost 就能互相访问，对外共用一个 IP。
- 每个 Pod 里有一个特殊的 Pause 根容器，负责"占住"这个网络和存储底座；业务容器挂了重启也不影响底座。
- Pod 是调度单位：[[APIServer]] 收到你的期望后，[[Scheduler]] 把 Pod 整体绑到某个 Node，该节点上的 [[kubelet]] 负责拉起容器。
- Pod 本身不是"常驻"的：被删就消失，IP 也跟着变——所以真正对外服务要靠 [[Service]]。

## 关键参数 / 易错点
- `containers[].image`：必填，容器镜像；`name` 也必填。
- `restartPolicy`：Pod 级重启策略（Always/OnFailure/Never）。
- 易错：把"强相关"和"弱相关"的容器塞同一 Pod。只有必须共享网络/存储、一起扩缩的才放一起。
- 易错：以为 Pod IP 是稳定的。Pod 重建 IP 就变，对外请走 Service。
- 一个 Node 上可以跑同一个 Pod 的多个副本（它们是不同 Pod 实例）。

## 类比（帮助理解）
- Pod 像一个"合租公寓"：公寓有唯一门牌号（IP），里面住的人（容器）共用客厅和 Wi-Fi（网络/存储），用房间号（localhost+端口）互相串门。公寓拆了门牌号就作废，外人找你得来前台（Service）。

## 设计时怎么用（反推思维）
> 做 XX 系统时，我会用它能解决 YY。
- 要做"一个主服务 + 一个日志采集 sidecar"这类必须同生死、共享磁盘的搭配时，把它们放进同一个 Pod；而彼此可独立扩缩的服务，拆成不同 Pod（甚至不同 [[Deployment]]）。

## 典型应用 / 我在哪见过
- 第4章用 nginx [[Deployment]] 跑出多个 Pod 副本；第11章 MySQL 用 [[StatefulSet]] 跑出有稳定标识的 Pod；第8章用同一 Pod 内 centos 容器访问 nginx/mysql 容器验证 localhost 互通。

## 关联
- 前置知识：[[容器]] [[Docker]]
- 相关：[[Deployment]] [[ReplicaSet]] [[Service]] [[Namespace]] [[Label与Selector]] [[DaemonSet]] [[StatefulSet]] [[kubelet]] [[容器编排]]
- 反例/误区：把 Pod 当"虚拟机"长期当主机用（Pod 是临时调度单元，有状态数据要用 [[PV与PVC]]）

## 来源
- 《Kubernetes零基础快速入门 2021.3》第1章 1.2.4、第4章、第8章
