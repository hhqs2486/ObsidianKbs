---
类型: 概念
主题: RBAC
tags: [概念]
创建: 2026-07-21
复习: 
状态: 种子
---

# RBAC

## 一句话定义
RBAC（Role-Based Access Control，基于角色的访问控制）是 Kubernetes 的**授权模型**：规定「哪个身份（用户/[[ServiceAccount]]）能对哪些 API 资源做哪些操作」，默认拒绝、按需开通，实现最小权限。

## 它解决什么问题 / 为什么存在
所有操作都经 [[APIServer]]，但「谁能创建 Pod、谁能删别人命名空间的 Secret」必须管起来。RBAC 把权限从「账号」抽象成「角色」，再绑给人/服务账号——避免一个高权限账号泄露就全线失守，也便于和 AD/LDAP 等 IAM 集成。

## 核心原理（大二能懂的水平）
- 四个核心对象：**Role**（某 namespace 内的权限规则）、**ClusterRole**（集群级/跨 namespace 的权限）、**RoleBinding**（把 Role 绑到用户/组/SA）、**ClusterRoleBinding**（集群级绑定）。
- 规则形如：对 `pods` 资源，允许 `get/list/create/delete`（用 `verbs`），可限定 `resourceNames`。
- 认证（Authentication）回答「你是谁」，授权（RBAC）回答「你能不能做」——两者分离。建议同时启用 RBAC + Node 授权。
- 第12章：Kubernetes 1.8 起 RBAC 达 GA，可对接 AD/LDAP；员工入职/离职自动同步权限。

## 关键参数 / 易错点
- **易错**：给 SA 绑 `cluster-admin`（全集群万能）当偷懒——严重违反最小权限，应细粒度授权。
- **易错**：Role 只在本 namespace 生效，要跨 namespace 或集群级请用 ClusterRole + 对应 Binding。
- **易错**：`verbs: ["*"]` 和 `resources: ["*"]` 等于放行一切，生产要避免。
- 与镜像库、节点 SSH 的 RBAC 是不同层（第12章镜像晋升流程也强调对 repo 配 RBAC）。

## 类比（帮助理解）
RBAC 像公司门禁+工牌：Role 是「你能进哪层楼、用哪台设备」的规则，Binding 是把这张规则卡发给你的动作。你只有被授权区域的卡，没卡的地方门禁（APIServer）直接拒——而且默认「没卡=不能进」。

## 设计时怎么用（反推思维）
> 做 XX 系统时，我会用它能解决 YY。
做多团队共享集群的系统时，我会给每个团队建独立的 Namespace + 专属 Role（只允许管自己 ns 的 Pod/Deployment/[[ConfigMap]]），再用 ClusterRoleBinding 给平台组集群级权限；CI 流水线用的 SA 只给「部署所需」的最小 verbs。

## 典型应用 / 我在哪见过
- 第3章：`kubeadm init` 输出里出现 `Authorization modes: [Node RBAC]`。
- 第11章 11.7：把 RBAC 作为防「提权」的核心授权机制，推荐默认拒绝+最小权限。
- 第12章：RBAC 与 AD/LDAP 集成做 IAM；镜像库 repo 配 RBAC 控制 push/pull。

## 关联
- 前置知识：[[APIServer]] [[ServiceAccount]] [[Namespace]] [[安全与认证]]
- 相关：[[准入控制]]（授权之后的另一道防线）、[[多租户]]（RBAC 是多租户隔离手段之一）、[[声明式API]]
- 反例/误区：给 CI SA 绑 cluster-admin（应最小权限）

## 来源
- 本书第3章（kubeadm 输出）、第11章 11.7（提升权限/RBAC）、第12章 12.3（IAM/RBAC）。结合通用知识补全 Role/ClusterRole/Binding 结构。
