---
类型: 概念
主题: 容器与K8s
tags: [概念]
创建: 2026-07-21
复习: 
状态: 种子
---

# Deployment

## 一句话定义
> Deployment 是 K8s 中"声明应用期望状态"的工作负载：你说要几个副本、用哪个镜像，它就保证集群里一直有这么多健康的 Pod 在跑。

## 它解决什么问题 / 为什么存在
- 手动管 Pod 太累且不可靠：Pod 挂了要人重启、要扩容要一个个建。
- 需要滚动更新、回滚、扩缩容等高级能力，Pod 自身不具备。
- Deployment 是"升级版 Replication Controller"，支持版本记录、回滚、暂停/继续、多种升级策略。

## 核心原理（大二能懂的水平）
- 你写 YAML 描述期望（replicas=3、image=nginx:1.7.9）。
- Deployment 自动创建并掌管一个 [[ReplicaSet]]，ReplicaSet 再真正创建/维持 Pod 副本数。
- 三者关系：Deployment → ReplicaSet → [[Pod]]（第4章图4-1）。
- 升级时：Deployment 新建一个 ReplicaSet，逐步用新 Pod 替换旧 Pod（[[滚动更新与回滚]]），旧 ReplicaSet 保留以便回退。
- 故障转移：Node 挂了，控制器在别的节点重建 Pod，维持副本数。

## 关键参数 / 易错点
- `spec.replicas`：期望副本数（可用 `kubectl scale` 快速改）。
- `spec.selector.matchLabels`：必须匹配 `template.metadata.labels`，否则报错。
- `spec.template`：Pod 模板（含容器 image/name，二者必填）。
- 易错：手动改/删 Deployment 创建的 ReplicaSet 或 Pod——"篡越"了 Deployment 职责，会被它纠正回来。
- 易错：replicas 可为 0（Deployment 还在，只是 0 副本）。

## 类比（帮助理解）
- Deployment 像"餐厅店长"：你告诉他"始终保持 3 个厨师(Pod)在岗"。有厨师请假，他立刻补一个；要加人气就改成 5 个；换菜谱(新镜像)时他会一桌桌慢慢换，不影响营业。

## 设计时怎么用（反推思维）
> 做 XX 系统时，我会用它能解决 YY。
- 任何无状态服务（Web、API、前端）都优先用 Deployment + 副本数保证高可用；有状态（数据库）才考虑 [[StatefulSet]]。
- 需要把某类 Pod 固定到特定规格节点，用 `nodeSelector` + [[Label与Selector]]（第4章按 mem=large 调度）。

## 典型应用 / 我在哪见过
- 第4章 nginx-deployment（replicas=3，扩容到5，故障转移演示）；第11章 demo-deployment 跑 Spring Boot；第7章 helm 装 mysql 本质也是建 Deployment。

## 关联
- 前置知识：[[Pod]] [[ReplicaSet]] [[YAML]] [[kubectl]]
- 相关：[[滚动更新与回滚]] [[StatefulSet]] [[DaemonSet]] [[Label与Selector]] [[Namespace]] [[资源限制与QoS]]
- 反例/误区：把 Deployment 当一次性脚本（它是长期维持状态的控制器）

## 来源
- 《Kubernetes零基础快速入门 2021.3》第4章 4.1
