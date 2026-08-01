---
类型: 概念
主题: Kubernetes工作负载身份
tags: [概念, Kubernetes, 安全, 身份]
创建: 2026-07-21
复习: 
状态: 种子
---

# ServiceAccount

## 一句话定义
> ServiceAccount（服务账号，SA）是"给 Pod 里运行的程序用的身份"——区别于给人用的 User 账号，SA 是工作负载在集群内的身份证。

## 它解决什么问题 / 为什么存在
- Pod 内的进程（如一个要查其他服务的控制器）调 APIServer 时需要身份；SA 让每个工作负载有独立的、可绑 RBAC 的凭据，而不是共用管理员证书。

## 核心原理（大二能懂的水平）
- 每个命名空间有默认的 `default` SA；Pod 不指定时自动挂载它。
- APIServer 的 SA 控制器自动为每个 SA 签发/轮换 JWT token；早期存为 [[Secret]]，新版用 `TokenRequest` 投影卷（有过期时间的短期令牌）。
- Pod 内 token 挂在 `/var/run/secrets/kubernetes.io/serviceaccount/token`，进程用它作为 Bearer token 调 APIServer。
- 通过 RoleBinding/ClusterRoleBinding 把权限绑给 SA；权限范围是"这个 SA 能在哪些资源上做什么"。
- 用 `automountServiceAccountToken: false` 可禁止不必要的挂载，减少攻击面。

## 关键参数 / 易错点
- 默认 SA 几乎没权限（RBAC 默认拒绝），需要显式绑 RoleBinding 才能干活。
- 不要给 SA 绑 cluster-admin（除非真需要且清楚后果）。
- 旧式 Secret 里的是不过期的长期令牌，建议改用投影卷的短期 bound token（默认 1h 可配）。
- SA 是命名空间级资源，跨 ns 复用要重新建。

## 类比（帮助理解）
- 像公司给"后台机器人程序"发的工牌：人用自己工牌（User），机器人用专属工牌（SA），权限按岗分配，回收即失效。

## 设计时怎么用（反推思维）
> 每个需要访问 API 的工作负载，我都建独立 SA 并只授最小权限（如某控制器只能 get/list 自己的 CR），避免共用 default 或管理员身份。

## 典型应用 / 我在哪见过
- 控制器/Operator 访问 API、CI 机器人、需要读 ConfigMap 的 sidecar。

## 关联
- 前置知识：[[安全与认证]] [[RBAC]] [[APIServer]]
- 相关：[[Secret]] [[准入控制]]
- 反例/误区：给所有 Pod 用同一个 cluster-admin SA（权限过大，一旦被入侵全盘失守）。

## 来源
- 本书第 5 章 核心组件的运行机制（ServiceAccount 控制器）。
- 本书第 6 章 深入分析集群安全机制（SA 作为工作负载身份；PDF 为图片版，结合章节结构整理）。
