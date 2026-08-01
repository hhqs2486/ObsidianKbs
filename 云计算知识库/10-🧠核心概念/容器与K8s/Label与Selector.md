---
类型: 概念
主题: 容器与K8s
tags: [概念]
创建: 2026-07-21
复习: 
状态: 种子
---

# Label与Selector

## 一句话定义
> Label（标签）是贴在资源上的"键-值对"小纸条；Selector（选择器）是按标签"筛出一群资源"的查询条件。二者配合实现分组与关联。

## 它解决什么问题 / 为什么存在
- 集群里资源成百上千，需要一种轻量方式给它们分组、归类、建立关系（比如"哪些 Pod 属于这个服务"）。
- [[Service]] 靠 selector 找到后端 Pod；[[Deployment]]/[[ReplicaSet]] 靠 selector 管理 Pod；调度也能按节点标签。

## 核心原理（大二能懂的水平）
- Label：`env=prod`、`app=nginx`、`mem=large` 这种 key=value，可自由定义，一个资源可贴多个。
- Selector：在 Service/Deployment 里写 `matchLabels: {app: nginx}`，就把带这个标签的 Pod 选进来。
- 节点标签 + Pod 的 `nodeSelector`：可把 Pod 调度到特定节点（第4章把 Pod 钉在 mem=large 节点）。
- 命令行：`kubectl label node <节点> mem=large`、`kubectl label pods --all status=unhealthy`、`kubectl get pods -l app=nginx`。

## 关键参数 / 易错点
- 删除标签：`kubectl label node node1 role-`（键后跟减号，别留空格）。
- 改标签值要 `--overwrite`，否则报错。
- 易错：Deployment 的 selector 与 Pod 模板 labels 不匹配 → 创建失败或选不到 Pod。
- 易错：label 只用于"分组筛选"，不含语义顺序；不要拿它当数据库字段用。

## 类比（帮助理解）
- Label 像"行李牌"：每件行李贴 `目的地=北京`、`易碎=是`；Selector 像"安检分拣机"按牌把同目的地的行李归到一条传送带(Service/Pod组)。

## 设计时怎么用（反推思维）
> 做 XX 系统时，我会用它能解决 YY。
- 给所有资源打 `app`/`env`/`tier` 等标签，Service 用 selector 绑定后端；需要"数据库类 Pod 跑在大内存节点"就用节点标签 + nodeSelector 反推调度。

## 典型应用 / 我在哪见过
- 第4章 4.1.7 标签控制 Pod 位置（mem=large）；第5章 Service selector 选 Pod；第10章 10.2 标签查看/增删改、按标签筛选；第11章 mysql 标签。

## 关联
- 前置知识：[[Pod]] [[Service]] [[Deployment]]
- 相关：[[ReplicaSet]] [[Namespace]] [[node_exporter]]（监控常按标签） [[DNS与服务发现]]
- 反例/误区：用标签表达层级关系（标签是扁平的，层级用 [[Namespace]]）

## 来源
- 《Kubernetes零基础快速入门 2021.3》第4章 4.1.7、第5章、第10章 10.2
