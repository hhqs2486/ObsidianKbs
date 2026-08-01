---
类型: 概念
主题: 资源限制与QoS
tags: [概念]
创建: 2026-07-21
复习: 
状态: 种子
---

# 资源限制与QoS

## 一句话定义
**资源限制**是在 Pod/容器上声明 CPU、内存的 `requests`（调度保证的最小值）和 `limits`（硬上限）；**QoS（服务质量）** 是 Kubernetes 据此给 Pod 分的「优待等级」，决定资源紧张时谁先被驱逐。

## 它解决什么问题 / 为什么存在
不给限制，一个 Pod 可能吃光节点 CPU/内存，拖垮同节点所有 [[Pod]]（「吵闹的邻居」）。限制让调度器能按「节点还剩多少」合理放 Pod；QoS 让 Kubernetes 在内存压力下**先杀最不重要的 Pod**，保住核心业务。

## 核心原理（大二能懂的水平）
- `requests.cpu/memory`：调度依据——节点剩余资源 ≥ requests 才放得下；也影响 CGroup（Linux 控制组）的保证值。
- `limits.cpu/memory`：硬上限，CPU 超限被节流（throttle），内存超了容器会被 OOMKill。
- QoS 三档由 requests/limits 的「设没设、相不相等」决定：
  - **Guaranteed**：requests==limits（且两资源都设）→ 最高优待，最后被驱逐。
  - **Burstable**：至少设了 requests，但不等/只设部分 → 中间。
  - **BestEffort**：啥都没设 → 最低，资源紧张第一个被杀。
- 还可配 ResourceQuota（namespace 级总配额）和 LimitRange（默认/最大限制），以及 PodPidsLimit 防 fork 炸弹（第11章）。

## 关键参数 / 易错点
- **易错**：只设 limits 不设 requests，调度器不知道该放哪，且 QoS 退化；重要服务务必 requests==limits 拿 Guaranteed。
- **易错**：内存 limit 设太低，流量一高就 OOMKill 重启；CPU 是节流不杀，内存才是杀。
- **易错**：BestEffort Pod 在节点内存压力下必死，别把重要服务设成这样。
- **易错**：limits 不能动态改（需重建 Pod），requests 改了会触发重调度判断。

## 类比（帮助理解）
资源像餐厅座位：requests 是你「订的位」（保证有），limits 是「最多让你占几张椅」。QoS 是会员等级——Guaranteed 是金卡（饭店满座也保你位），BestEffort 是散客（一满座先请你走）。

## 设计时怎么用（反推思维）
> 做 XX 系统时，我会用它能解决 YY。
做混部多服务的系统时，我会给核心服务（网关、数据库）设 `requests==limits`（Guaranteed）保证不被驱逐；给批处理/临时任务设 Burstable 或 BestEffort，并在 namespace 用 ResourceQuota 兜底，防止单一服务吃垮节点、也防 DoS 耗尽资源（第11章）。

## 典型应用 / 我在哪见过
- 第4章：Pod 内每个容器有独立 CGroup 限额（如文件同步容器比 Web 容器限额低）。
- 第11章 11.6：给内存/CPU/存储/K8s 对象设限制防 DoS；PodPidsLimit 防 fork 炸弹；ResourceQuota 限制 namespace 内 Pod 数。

## 关联
- 前置知识：[[Pod]] [[容器]] CGroup（Linux 控制组）[[Namespace]]
- 相关：[[DaemonSet]] [[Deployment]]（都要配资源）、[[RBAC]]（配额也属资源治理）
- 反例/误区：不给任何限制（吵闹邻居拖垮全节点）

## 来源
- 本书第4章（CGroup 限额）、第11章 11.6（资源限制/配额/防 DoS）。QoS 三档（Guaranteed/Burstable/BestEffort）结合通用 Kubernetes 知识补全（PDF 为图片版，结合章节结构整理）。
