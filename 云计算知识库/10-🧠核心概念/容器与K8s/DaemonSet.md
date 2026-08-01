---
类型: 概念
主题: DaemonSet
tags: [概念]
创建: 2026-07-21
复习: 
状态: 种子
---

# DaemonSet

## 一句话定义
DaemonSet 是 Kubernetes 里保证**集群每个（或按选择器筛选的）节点上都运行一个 Pod 副本**的控制器。

## 它解决什么问题 / 为什么存在
有些工作「每台机器都要有一份」：日志采集 agent、节点监控、网络插件（kube-router/Calico）、安全代理……你不想、也不该手动数节点去部署。DaemonSet 让 Kubernetes 自动在**新加入的节点**上也起一份，节点下线就回收，永远保持「每节点一副本」。

## 核心原理（大二能懂的水平）
- 控制器监听节点变化：每出现一个匹配节点（可用 nodeSelector / affinity 限制），就调度一个 Pod 上去；节点删除，对应 Pod 也删。
- 和 [[Deployment]] 不同，DaemonSet 不靠副本数，而靠「节点数」决定 Pod 数。
- Pod 通常设 `tolerate` 某些 taint（如 master 的 NoSchedule），否则连控制节点都不会跑；默认也会覆盖到 master，除非你显式排除。
- 可配合 `priorityClassName`、资源限制避免抢占业务 Pod 资源。

## 关键参数 / 易错点
- `nodeSelector` / `affinity`：只想在「带 gpu 标签」的节点跑，而不是全集群。
- **易错**：不加以 tolerate，DaemonSet 可能往 master 节点也塞 Pod，挤占控制平面资源——生产要规划 tolerate/affinity。
- **易错**：DaemonSet 默认没有「滚动回滚」那么顺手，更新策略用 `RollingUpdate` 时也要关注节点级影响。

## 类比（帮助理解）
DaemonSet 像「每层楼都装一个消防栓/灭火器」：不管楼加建几层（新节点加入），物业（控制器）都自动补装一个；拆了一层就撤掉，保证「每层必有、且只一个」。

## 设计时怎么用（反推思维）
> 做 XX 系统时，我会用它能解决 YY。
做「集群级基础设施 Agent」（日志采集、监控探针、网络/安全插件）时，我会用 DaemonSet 保证每节点一份、自动跟随节点扩缩，而不用 [[Deployment]] 去手算副本数。

## 典型应用 / 我在哪见过
- 第2章：明确说「DaemonSet 在集群的每个工作节点中都运行相应服务的实例」。
- 第3章：初始化 Pod 网络时 `kubectl apply` 的就是一个 `daemonset.apps/kube-router`（CNI 插件）。
- 第11章：建议用 DaemonSet 在所有节点部署日志 agent，收集日志发往中心库做审计/不可抵赖。

## 关联
- 前置知识：[[Pod]] [[Deployment]] [[kubelet]] [[Namespace]]
- 相关：[[StatefulSet]] [[Job与CronJob]]（都是特殊控制器）、[[Label与Selector]]、[[资源限制与QoS]]
- 反例/误区：用 Deployment 硬凑「每节点一份」（节点变了就漏，应改 DaemonSet）

## 来源
- 本书第2章、第3章、第11章提及 DaemonSet 用途，但无独立章节。结合通用 Kubernetes 知识补全（PDF 为图片版，结合章节结构整理）。
