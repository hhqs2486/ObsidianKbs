---
类型: 教程
来源: 5 本 K8s 进阶书（Kubernetes指南 / Kubernetes实践指南 / Kubernetes PaaS冲击波 / 有关Kubernetes部署的10个注意事项 / 从Docker→kubernetes三架马车）
tags: [教程]
创建: 2026-07-21
状态: 已读待消化
---

# Kubernetes 进阶指南

> 进阶主线：**从“会用 K8s”到“会用在生产”**——无状态/有状态区分、部署清单与回滚、资源与配额、PaaS 化封装。本教程把 5 本进阶书的精华，按“架构与实战要点 / 生产部署注意事项 / PaaS 化思考 / 从 Docker 到 K8s 的演进”四条线串起来，面向想建立生产级认知的大二读者。

## 这条教程在解决什么
- 基础书教会你 `kubectl` 跑起来一个 Pod；进阶要解决的是：**当这个应用要 7×24 扛真实流量、要多人协作、要上生产，该怎么设计、怎么部署、怎么不出事**。
- 5 本书各自的侧重点：Kubernetes指南（架构与原理全貌）、Kubernetes 实践指南（生产运维最佳实践）、Kubernetes PaaS 冲击波（PaaS 化平台思维）、部署 10 注意（选型决策清单）、从 Docker→K8s 三驾马车（演进脉络与核心对象实战）。

## 关键内容（按 PDF 章节提纲）

### 一、K8s 架构与实战要点（主要来自 Kubernetes指南 / 从 Docker→K8s 三驾马车）
- 核心组件职责：[[APIServer]]（唯一入口、唯一写 etcd）、controller-manager（维护状态、滚动更新）、scheduler（调度 Pod）、kubelet（管容器生命周期）、kube-proxy（Service 转发）、etcd（集群数据库）。
- 一切皆资源对象，用声明式 YAML 描述“期望状态”，控制器持续调谐到实际状态——这是云原生的命门。
- 关键对象链：[[Pod]]（最小调度单元）→ [[Deployment]]（管副本数+滚动更新+回滚）→ [[Service]]（负载均衡+服务发现，屏蔽 Pod IP 变化）→ [[Ingress入门]]（对外暴露）。
- [[Namespace]] 做多租户/多环境隔离；[[ConfigMap]] / [[Secret]] 把配置与镜像解耦；[[RBAC]] / [[安全与认证]] 控制“人”和“应用”的权限。

### 二、生产部署注意事项（主要来自 Kubernetes 实践指南 / 部署 10 注意）
- **无状态 vs 有状态先分清**（见 [[无状态应用]] / [[有状态应用]]）：Web/API 做成无状态、状态外置；数据库/队列用 [[StatefulSet]] + PVC。这是生产设计的第一个分叉口。
- **高可用不是多副本就完事**：`replicas>1` 且用 `podAntiAffinity` 把副本打散到不同节点；用 `PodDisruptionBudget`（PDB）防止驱逐/升级时所有副本同时下线。
- **平滑更新不丢连接**：给容器加 `readinessProbe`（就绪才进转发），加 `preStop: sleep 30` 留时间给 Endpoint/kube-proxy 异步更新，避免滚动更新期间连接被拒。
- **长连接陷阱**：长连接会导致 HPA 自动扩容失效（新 Pod 接不到连接）；解法参考 nginx keepalive，把长连接按请求数转成短连接。
- **资源与配额**（见 [[资源限制与QoS]]）：必须给容器设 requests/limits，否则节点资源会被某个 Pod 吃光，调度器也无法合理排布；QoS 决定了节点内存紧张时谁先被驱逐。
- **DNS 5 秒延时**：UDP 并发 A/AAAA 请求触发 conntrack 冲突，生产建议每个节点部署本地 DNS 缓存（DaemonSet + hostNetwork）。
- **大规模集群优化**：单集群官方上限约 5000 节点 / 15 万 Pod；etcd 对磁盘 IO 敏感（用 SSD、调 `--quota-backend-bytes`、events 单独存 etcd）；内核参数（conntrack、inotify、arp）需调优。
- **部署 10 注意（决策清单）**：容器基于 Linux；K8s 不只是平台一部分（还需网络/存储/日志/监控/CI-CD）；DIY 要自己背升级维护；统一的 K8s 实施保证跨云可移植；决策同时影响开发和运维；让开发简单用起来；K8s 仍在快速演进，选受支持/认证的发行版。

### 三、PaaS 化思考（主要来自 Kubernetes PaaS 冲击波）
- **容器 + K8s 正成为“第四代 PaaS”**：前三代 PaaS（Heroku / Cloud Foundry）受限运行时、阉割 API；第四代以 K8s 为底座，关注“应用的打包与分发”，不干涉运行时，给开发更大空间。
- **K8s 是新的“可移植层”**：就像容器领域里的 “Amazon”，应用可在不同云、不同发行版间自由迁移，避免厂商锁定。
- **PaaS 封装什么**：应用聚合（一键起 Redis）、服务发现/伸缩/状态管理、监控/恢复/容灾、费用统计、安全管控、快速部署——把运维能力上升为“应用级”平台（见 [[PaaS平台]] / [[容器云平台]]）。
- **业界都在做 PaaS**：公有云（GKE/AKS/腾讯云 CCS/华为云 CCE）、私有云（京东 JDOS 2.0 从 OpenStack 迁 K8s、资源利用率 +30%）、传统企业（博云 BeyondBOC 用 K8s + DevOps 做微服务化改造）。
- **Serverless 是 PaaS 的延伸**：托管的是“代码碎片”而非整个应用，按需运行、成本更低（如 Azure Functions、华为云 CCI/FuncStage）。
- **用 K8s 管 K8s**：腾讯云用 K8s 托管用户集群的 Master，健康检查即 HA、升级即滚动、备份 namespace 即快速回滚——平台自身的生产级实践范例。
- **多集群**：跨地域/混合云用 [[多集群管理]]（如 KubeFed），华为主导了联邦级无状态应用与跨集群调度。

### 四、从 Docker 到 K8s 的演进（主要来自 从 Docker→K8s 三驾马车）
- 演进链路：Docker 基础（镜像/容器/[[Dockerfile]]/数据卷/网络）→ Docker Compose（单机多容器编排）→ Docker Swarm（原生集群编排）→ [[Kubernetes]]（事实标准）。
- 为什么是 K8s 胜出：出身 Google Borg、社区最活跃、声明式 API + 标签(Label)的灵活设计、对微服务天然友好、能很好支持有状态服务。
- 上手路径（书里推荐）：minikube/Rancher 体验 → [[kubectl]] 跑 Pod → [[集群搭建kubeadm]] 自建测试集群 → 二进制手动搭建（生产）。
- 核心对象实战：Pod（共享网络/存储的基本单元）→ ReplicaSet（副本抽象）→ [[Deployment]]（推荐控制器，支持滚动更新与回滚，`kubectl rollout` / `rollback`）→ [[Service]]（三种 IP：NodeIP/PodIP/ClusterIP；类型 ClusterIP/NodePort/LoadBalancer/ExternalName）→ [[StatefulSet]]（有状态，稳定标识+有序部署）→ [[RBAC]]（User/ServiceAccount 权限）。

## 我卡住/没懂的地方
- Kubernetes指南 是图片版（MIXED），部分原理章节（核心原理/插件扩展）只有图、文字提取不全；本笔记按章节结构 + 自己的 K8s 知识做了补全，细节以另两本 TEXT 书为准。
- PDB、本地 DNS 缓存、etcd 调优这类“生产运维细节”，第一次看容易晕——关键是记住它们都在解决同一件事：**让 K8s 在大规模、高并发、节点会挂的真实环境下依然稳**。
- 长连接导致 HPA 失效的机制比较反直觉，需要结合 kube-proxy 转发规则更新的异步性来理解。

## 它背后的原理（别只记操作）
- **声明式 API + 控制器模式**：你描述“我要 3 个副本”，而不是“去启动 3 个”。控制器不断比对实际/期望，自动纠错——这是自愈、滚动更新、扩缩容的统一底层逻辑。
- **异步解耦导致更新抖动**：Pod 创建/销毁 → Endpoint 更新 → kube-proxy 改 iptables/ipvs 转发规则，三步异步。所以必须靠 readinessProbe + preStop 来“等一等”，否则流量会打到没起来/已销毁的 Pod。
- **有状态为什么特殊**：Pod IP 会变、可被随意重建，所以 StatefulSet 用稳定 DNS + PVC 跟随 + 有序启停，把“身份”和“数据”从“实例生命周期”里解耦出来。
- **PaaS 的本质**：把“分布式系统的能力”（多层级架构、服务化供给、自动化运维）封装成对开发者友好的平台，这正是 Cloud Native 的目标落地形态。

## 我能复用/改编的点
> 换个需求，这套做法还能怎么用？

- **做毕业设计/小项目上云**：先判断哪些是无状态（敢用 [[Deployment]] + HPA 随便扩）、哪些必须有状态（用 [[StatefulSet]] + PVC），再决定要不要引入 [[PaaS平台]] 省掉运维。
- **写部署清单模板**：把“反亲和性 + readinessProbe + preStop + resources 限制 + PDB”固化成一个标准 Deployment 模板，任何无状态服务套用即可达到生产水位。
- **技术选型答辩**：用“部署 10 注意”做选型 checklist——DIY 还是买发行版、要不要跨云可移植、开发体验怎么保证。
- **平台化思维迁移**：哪怕不做 PaaS，也可以把“配置管理（[[ConfigMap]]/[[Secret]] 多版本可回滚）+ 应用模板 + 服务组”这套思路用到自己的 CI/CD 里。

## 关联
- 概念：[[无状态应用]]、[[有状态应用]]、[[云原生应用]]、[[Kubernetes]]、[[Deployment]]、[[Service]]、[[Pod]]、[[StatefulSet]]、[[Namespace]]、[[ConfigMap]]、[[Secret]]、[[Ingress入门]]、[[RBAC]]、[[安全与认证]]、[[滚动更新与回滚]]、[[资源限制与QoS]]、[[高可用集群]]、[[kubectl]]、[[集群搭建kubeadm]]、[[容器云平台]]、[[PaaS平台]]、[[多集群管理]]、[[Helm]]、[[Istio]]、[[微服务]]、[[云原生]]、[[CI-CD]]
- 项目：（本批为进阶概念整理，无新建项目实战笔记）

## 来源
- Kubernetes指南（k8s-zhinan，图片版，结合章节结构整理）——架构与核心原理
- Kubernetes 实践指南（k8s-practice，TEXT）——生产最佳实践、集群方案、证书/配置管理
- Kubernetes PaaS 冲击波（k8s-paas，图片混排，结合章节结构整理）——PaaS 化与平台思维
- 有关 Kubernetes 部署的 10 个注意事项（k8s-deploy-10，TEXT）——部署决策清单
- 从Docker→kubernetes(三驾马车)（docker-k8s-sanjia，TEXT）——Docker→K8s 演进与核心对象实战
