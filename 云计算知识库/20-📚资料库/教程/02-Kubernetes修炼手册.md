---
类型: 教程
来源: Nigel Poulton《Kubernetes修炼手册》（k8s-handbook），第1–12章
tags: [教程]
创建: 2026-07-21
状态: 已读待消化
---

# Kubernetes修炼手册

## 这条教程在解决什么
帮已经懂一点 [[容器]]/[[Docker]] 的人，把「怎么把一个微服务应用可靠地跑在生产集群上」这件事讲透：从「应用怎么打包进 [[Pod]]」→「怎么自愈、扩缩容、滚动升级」→「怎么给 Pod 稳定网络（[[Service]]、[[DNS与服务发现]]）」→「怎么存数据（[[PV与PVC]]、[[Volume]]）」→「怎么管配置（[[ConfigMap]]、[[Secret]]）」→「有状态应用怎么办（[[StatefulSet]]）」→「怎么在生产里保证安全（[[RBAC]]）」。一句话：从「会敲命令」进阶到「懂编排器为什么这么设计」。

## 关键内容（按 PDF 章节提纲）
- **第1章 初识Kubernetes**：[[Kubernetes]] 是「编排器」，专门调度 [[云原生]] [[微服务]] 应用；脱胎于 Google 的 Borg/Omega；把 Kubernetes 类比成「云上的操作系统」，对底层云/数据中心做抽象，从而实现混合云。容器运行时通过 [[CRI]]（CRI）抽象解耦，[[Docker]] 不再是唯一选择，containerd 更常用。
- **第2章 操作概览**：集群 = 控制平面（master）+ 工作节点（node）。[[APIServer]] 是「中央车站」，所有通信都走它（[[RESTfulAPI]] + 443）。核心心智模型：**声明式 + 期望状态 + 调谐循环**（[[声明式API]]）。[[Pod]] 是最小调度单位，[[Deployment]] 在 Pod 上加自愈/扩缩容/滚动更新，[[Service]] 给一组 Pod 提供稳定网络。
- **第3章 安装Kubernetes**：三类获取方式——练习环境（Play with Kubernetes、桌面版 Docker）、托管集群（GKE/EKS/AKS）、自定义（[[集群搭建kubeadm]]/kops）。kubectl 把友好命令翻译成 API Server 的 JSON，靠 `$HOME/.kube/config` 里的 clusters/contexts/users 决定连哪个集群。
- **第4章 Pod的使用**：Pod 是「Kubernetes 里被调度的最小原子单位」，一个 Pod 里可以跑一个或多个容器，多容器 Pod 共享同一个网络命名空间（同一 IP、localhost 互通）。Pod 本质是 pause 容器 + 共享的内核命名空间；资源靠 [[CGroup]] 限制；Pod 部署是原子操作，生命周期 pending→running→succeeded/failed。重点警告：**裸 Pod（单例）没有自愈能力**，生产要用 [[Deployment]]/[[DaemonSet]] 等高层控制器。
- **第5章 Deployment**：Deployment 在 Pod 之上提供自愈、扩缩容、[[滚动更新与回滚]]。关系是 **Deployment → [[ReplicaSet]] → Pod**（ReplicaSet 在后台干活，只跟 Deployment 打交道）。声明式更新：改 YAML 里镜像 tag 再 `kubectl apply`，Kubernetes 新建一个 ReplicaSet 逐步替换旧的，零停机；旧 ReplicaSet 保留配置，所以 `kubectl rollout undo` 能回滚。
- **第6章 Service**：Pod 的 IP 不可靠（扩容/缩容/重启都变）。[[Service]] 给一组 Pod 提供固定的 VIP + DNS 名 + 端口，并对后端 Pod 做负载均衡。类型：ClusterIP（仅集群内）、NodePort（集群外经节点端口）、LoadBalancer（接云厂商 LB）、ExternalName（指向集群外）。Service 用 [[Label与Selector]] 选 Pod，靠 **Endpoint 对象**动态维护健康 Pod 列表。
- **第7章 服务发现**：集群内部用 **CoreDNS** 做「服务注册中心」，每个 [[Service]] 创建时自动注册 DNS。客户端容器里 `/etc/resolv.conf` 带搜索域（如 `default.svc.cluster.local`），把短名 `ent` 拼成 FQDN。ClusterIP 在「服务网络」上无路由可达，靠每个节点的 **[[kube-proxy]]** 用 IPVS 规则把发往 ClusterIP 的流量「捕获」并转发到某 Pod。跨 [[Namespace]] 通信必须用 FQDN。
- **第8章 Kubernetes存储**：持久化卷子系统 = PV + PVC + StorageClass。[[PV与PVC]]：PV 是集群里的存储资源，PVC 像「许可证」让 Pod 用它；StorageClass 提供**动态置备**（出现引用它的 PVC 就自动建 PV）。CSI 是存储插件标准接口。accessModes：RWO/RWM/ROM；reclaimPolicy：Delete（危险，可能丢数据）/Retain。
- **第9章 ConfigMap**：核心思想是**配置与镜像解耦**——同一份应用镜像跑 dev/test/prod，只换配置。[[ConfigMap]] 存非敏感键值/配置文件，注入容器的三种方式：环境变量、启动命令参数、卷（卷方式能热更新，最灵活）。敏感数据（密码、密钥）用 [[Secret]]（与 ConfigMap 类似，但值会被混淆/编码）。
- **第10章 StatefulSet**：为**有状态应用**（数据库等）设计。保证三个「稳定」：Pod 名（`<名>-<序号>`）、DNS 主机名、绑定的卷。Pod 有序创建/删除（OrderedReady），配合 **headless Service（clusterIP: None）** 作为 governing Service 给每个 Pod 生成可预测的 DNS SRV。用 `volumeClaimTemplates` 给每个 Pod 自动建独立 PVC；缩容删 Pod 但**保留 PVC**，再扩容会重连旧卷——避免数据丢失。滚动升级从最高索引开始。
- **第11章 安全模型分析**：用 **STRIDE** 模型分析 6 类威胁。防御要点：组件间用 mTLS + CA 互认；每个 Pod 挂 [[ServiceAccount]] 令牌访问 API；用只读根文件系统、丢弃 capabilities、seccomp、禁止权限提升来防「提权」；用 [[RBAC]] 做最小权限（默认拒绝）；用 ResourceQuota/PodPidsLimit 防 DoS；保护 [[Etcd]]（集群配置的唯一真相源）；开启 API 审计。
- **第12章 现实中Kubernetes的安全性**：从「总体架构」视角讲 4 块——① [[CI-CD]] 流水线：用已验证基础镜像、私有镜像库、漏洞扫描、镜像签名、配置即代码（审查 YAML/Dockerfile）；② 负载隔离：[[Namespace]] **不是安全边界**（只能做软多租户），硬多租户要用独立集群，节点级用 taint/affinity，运行时级可用 gVisor/Kata（[[容器编排]] 通过 CRI 接入）；③ 网络隔离：[[CNI网络]] 分 Overlay（VXLAN 封装，对防火墙不友好）与 BGP（不封装，友好）两类；④ IAM/[[RBAC]]/MFA + 审计监控（kube-bench 跑 CIS 基线）。

## 我卡住/没懂的地方
- 第7章「服务网络上的 ClusterIP 没有路由，靠 kube-proxy 捕获转发」这段网络「黑科技」第一次看很绕，需要用「默认网关→节点内核拦截」的比喻反复想。
- 第10章 StatefulSet 的 `volumeClaimTemplates` 与 Pod 名、PVC 名三者映射关系（`<模板名>-<sts名>-<序号>`）容易记混，动手敲一遍才理顺。
- 第11章 SecurityContext / PodSecurityPolicy 字段很多（capabilities、seccomp、runAsUser…），初学时分不清「Pod 级」和「容器级」覆盖关系。

## 它背后的原理（别只记操作）
- **声明式 + 调谐循环**是整本书的底层逻辑：你只告诉 Kubernetes「期望状态」（副本数、镜像、端口），它用 controller 不断比对「当前状态」并消除差异——自愈、扩缩容、滚动更新全靠这个。这就是为什么书里反复劝你「用 YAML 声明式，别用命令式」。
- **Pod 是牲畜不是宠物**：IP、ID 都不可依赖，所以才需要 Service 给稳定入口、StatefulSet 给稳定身份。这是「从需求反推架构」的关键——无状态就交给 Deployment+Service，有状态才上 StatefulSet。
- **解耦**是贯穿全书的设计哲学：配置与镜像解耦（ConfigMap/Secret）、存储与 Pod 解耦（PV/PVC）、身份与 Pod 解耦（ServiceAccount）。

## 我能复用/改编的点
> 换个需求，这套做法还能怎么用？
- 要做一个「订单服务」：无状态 → [[Deployment]]（多副本）+ [[Service]]（ClusterIP）+ [[滚动更新与回滚]] 做金丝雀；需要会话/缓存这类有状态部分 → [[StatefulSet]] + [[PV与PVC]]。
- 要管理「日志采集 Agent」：每个节点都要跑一份 → [[DaemonSet]]（不用手动算节点数）。
- 要跑「每天凌晨的报表批处理」：一次性/定时任务 → [[Job与CronJob]]，别用常驻 Deployment。
- 要把「数据库密码」从镜像里摘出来：→ [[Secret]]；把「开关配置」摘出来 → [[ConfigMap]]；一套镜像多环境靠它们区分。
- 要给成百上千的微服务统一发版、回滚、参数化：→ [[Helm]]（把 YAML 模板化）。

## 关联
- 概念（本库我建的卡）：[[ConfigMap]] [[Secret]] [[Volume]] [[PV与PVC]] [[StatefulSet]] [[DaemonSet]] [[Job与CronJob]] [[Helm]] [[探针LivenessReadiness]] [[RBAC]] [[资源限制与QoS]] [[滚动更新与回滚]] [[网络模型]] [[DNS与服务发现]] [[微服务]] [[CI-CD]]
- 别人拥有的概念（只链接）：[[Pod]] [[容器]] [[Docker]] [[Deployment]] [[Service]] [[Namespace]] [[kubectl]] [[ReplicaSet]] [[Label与Selector]] [[云原生]] [[YAML]] [[Etcd]] [[APIServer]] [[ControllerManager]] [[Scheduler]] [[kubelet]] [[kube-proxy]] [[CNI网络]] [[CRD与Operator]] [[自定义资源]] [[准入控制]] [[ServiceAccount]] [[安全与认证]] [[多租户]] [[高可用集群]] [[容器编排]] [[声明式API]] [[负载均衡]] [[RESTfulAPI]] [[集群搭建kubeadm]] [[Ingress入门]]
- 项目：（无）

## 来源
- Nigel Poulton《Kubernetes修炼手册》（k8s-handbook）第1–12章，章节文本来自 `.cache/k8s-handbook/ch09~ch20_*.txt`。
- 补充：第3章、第11–12章部分安全/CI-CD 细节结合章节结构用通用 Kubernetes 知识补全，未编造命令或字段。
