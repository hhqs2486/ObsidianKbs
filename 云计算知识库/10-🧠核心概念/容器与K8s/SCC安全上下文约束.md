---
类型: 概念
主题: 
tags: [概念]
创建: 2026-07-21
复习: 
状态: 种子
---

# SCC安全上下文约束

## 一句话定义
> SCC（Security Context Constraint，安全上下文约束）是 [[OpenShift]] 用来限制"一个容器能做什么"的安全机制：控制容器内运行用户 UID 范围、能否用特权、能用哪些卷类型、是否能访问宿主机 PID/网络等（第12章 12.5）。

## 它解决什么问题 / 为什么存在
- 很多 Docker Hub 镜像默认用 root 启动，有安全隐患。直接 `docker run` 能跑，但在 OpenShift 里受 SCC 约束可能起不来——比如 httpd 想监听 80 端口（需 root），被默认 restricted 策略挡住，Pod 一直 CrashLoopBackOff（第12章 12.5 示例）。
- 权限系统（[[RBAC]]）管"用户对资源能做什么"，SCC 管"容器运行时能做什么"，两者互补。

## 核心原理（大二能懂的水平）
- OpenShift 默认给普通用户及其 Service Account 分配 restricted SCC：RUNASUSER=MustRunAsRange（必须用限定范围内的 UID 跑，不能是任意 root）。所以即使 Dockerfile 写了 `USER root`，平台也会用一个分配的普通 UID 启动（第12章）。
- 系统内置多档 SCC：privileged（最大）> hostaccess / hostmount-anyuid / hostnetwork / nonroot / anyuid / restricted（最小）。每个 SCC 有优先级，多个 SCC 命中时高优先级生效（第12章 表12-1）。
- 提权方法（不想改全局）：把项目的 default Service Account 加入 anyuid SCC 组（`oc adm policy add-scc-to-user anyuid -z default`），即可用任意 UID 启动（第12章 12.5）。

## 关键参数 / 易错点
- 关键字段：PRIV（是否特权）、CAPS（Linux capabilities）、SELINUX、RUNASUSER、FSGROUP、SUPGROUP、READONLYROOTFS、VOLUMES（允许挂载的卷类型）。
- 易错：镜像需要 root/特权却没调整 SCC → Pod 反复重启（看 `oc logs` 报 permission denied 监听端口）。
- 易错：直接把全局 restricted 改成 RunAsAny 会影响所有用户，应只给特定 Service Account 加 anyuid。

## 类比（帮助理解）
- SCC 像"门禁权限等级"：普通员工（restricted）只能进办公区、不能碰机房；运维（privileged）能进机房。你要进机房，得被加到对应权限组，而不是把整栋楼门禁拆了。

## 设计时怎么用（反推思维）
> 做"多团队共享集群且要求镜像非 root"时，我会保留默认 restricted SCC 强制非 root；对确需要特权的遗留镜像，只把它的 Service Account 加入 anyuid，而不是放开全局。

## 典型应用 / 我在哪见过
- OpenShift 默认所有容器受 SCC 约束；Router 组件用专属 Service Account + token（Secret）获取读集群信息的权限（第12章 12.6）。
- 原生 K8s 里类似能力是 Pod Security Standards / Pod Security Admission（书里未涉及，通用知识补全）。

## 关联
- 前置知识：[[安全与认证]] [[RBAC]] [[容器]]
- 相关：[[OpenShift]] [[Secret]] [[ServiceAccount]] [[镜像仓库]]
- 反例/误区：直接 `docker run`（不受 SCC 约束，所以"本地能跑、平台上跑不起来"）

## 来源
- 开源容器云 OpenShift（第12章 12.5 安全上下文；12.6 Service Account 与 Secret；表12-1 系统默认 SCC 组）。
- 通用知识补全：Kubernetes Pod Security Standards 作为原生对等物。
