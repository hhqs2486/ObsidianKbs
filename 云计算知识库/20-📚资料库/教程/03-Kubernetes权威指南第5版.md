---
类型: 教程
来源: 《Kubernetes权威指南 第5版》（基于 Kubernetes ~1.19/1.20）
tags: [教程, Kubernetes, 权威指南]
创建: 2026-07-21
状态: 已读待消化
---

# Kubernetes权威指南 第5版

> 读者定位：大二水平、想建立"从需求反推架构/部署"工程师思维的同学。
> 本书定位：K8s 权威大部头，偏**集群级原理、运行机制、安全、网络、运维、排错**与**源码/配置级深度**。
> 配套概念卡：见 `10-🧠核心概念/容器与K8s/` 下本 agent 拥有的 19 张卡（组件、扩展、安全、网络、运维类）。

## 这条教程在解决什么
- 把"会用 kubectl 跑 Pod"提升为"懂 K8s 为什么这么设计、控制平面每个组件在干什么、集群怎么搭才高可用、出了事怎么从底层原理排查"。
- 回答三个递进问题：**组件怎么协同**（第 5 章）、**集群怎么安全可控**（第 6 章）、**网络/存储/扩展怎么落地**（第 7/8/9 章）、**生产怎么运维排错**（第 10/11 章）。

## 关键内容（按 PDF 章节提纲）

### 第 1 章 Kubernetes 入门
- 容器编排的由来：单机 `docker run` 管少量容器够用，但跨机器、要扩缩容/自愈/服务发现时，必须靠编排器（[[容器编排]]）。
- K8s 架构总览：Master（控制平面） + Node（工作节点）；核心对象族——[[Pod]]、[[Service]]、[[Deployment]]、[[Namespace]]、[[kubectl]]。
- 关键认知：K8s 的 API 是**声明式**的（[[声明式API]]）——你描述期望状态，系统负责收敛。

### 第 2 章 Kubernetes 安装配置指南
- 两条路线：**kubeadm 快速部署**（一条 init + 一条 join，适合实验/中小集群，见 [[集群搭建kubeadm]]）vs **二进制 + 高可用部署**（手动发证书、静态 Pod、etcd 集群）。
- 二进制 HA 拓扑：`HAProxy` + `Keepalived` 提供 VIP（8443）→ 多个 Master（6443）→ 堆叠或独立 `etcd` 集群（见 [[高可用集群]] [[Etcd]] [[HAProxy]] [[Keepalived]]）。
- 配置要点：kubeconfig、PKI 证书体系、各组件 manifest 与参数。

### 第 3 章 深入掌握 Pod
- Pod 是调度最小单位：一个 Pod 内可含多个容器（main + sidecar + init）。
- 生命周期与状态机、重启策略、[[探针LivenessReadiness]]（liveness 失败重启、readiness 失败摘流量）。
- 存储与配置注入：[[Volume]]、[[PV与PVC]]、[[ConfigMap]]、[[Secret]]（后三者归"修炼手册"书建卡，本书给出集群级用法）。
- 底层实现：Pod 真正跑起来由节点上的 [[kubelet]] 经 CRI 拉起。

### 第 4 章 深入掌握 Service
- Service 解决"Pod IP 会变"的问题，提供稳定 ClusterIP + 后端 Endpoint 列表。
- 三种对外暴露：ClusterIP / NodePort / LoadBalancer；Headless Service（无 ClusterIP，直接返回 Pod IP）用于有状态寻址。
- 流量转发由节点上的 [[kube-proxy]]（iptables/IPVS）完成；服务发现靠 [[DNS与服务发现]]；七层路由走 [[Ingress入门]]。
- 本质是一种集群内 [[负载均衡]]。

### 第 5 章 核心组件的运行机制（本书灵魂章）
- **APIServer**：统一入口，请求链 = 认证→授权→准入→写 etcd；提供 [[RESTfulAPI]] 与 List-Watch（见 [[APIServer]]）。
- **Etcd**：唯一事实来源，Raft 强一致 KV，只有 APIServer 能直连（见 [[Etcd]]）。
- **ControllerManager**：一堆控制器，持续"对账"让现实逼近 spec（见 [[ControllerManager]]）。
- **Scheduler**：两阶段调度（预选→优选），新版用 Scheduling Framework 扩展点（见 [[Scheduler]]）。
- **kubelet**：节点管家，拉容器、查探针、报状态、静态 Pod（见 [[kubelet]]）。
- **kube-proxy**：Service→Pod 转发（userspace→iptables→IPVS 三代，见 [[kube-proxy]]）。

### 第 6 章 深入分析集群安全机制
- 三道防线串在 APIServer 同一请求链：**认证**（X509 证书/SA token/OIDC/Webhook）→ **授权**（RBAC：Role/ClusterRole + Binding，见 [[RBAC]]）→ **准入控制**（Mutating/Validating + 动态 Webhook，见 [[准入控制]]）。
- 工作负载身份：[[ServiceAccount]]（Pod 内 JWT token 调 API）。
- 整体即 [[安全与认证]]；多租户场景还需配合隔离策略（见 [[多租户]]）。
- 注：本章 PDF 为图片版，部分命令/字段细节据此结合章节结构整理，实操以 `kubectl` + 官方文档印证。

### 第 7 章 网络原理
- K8s 网络模型三约定：IP-per-Pod、同节点互通无 NAT、Pod 与 Node 互通无 NAT。
- **CNI** 是"可插拔网络标准"：ADD/DEL/CHECK/VERSION + CNI Plugin + IPAM（见 [[CNI网络]]）。
- 主流实现对比：Flannel（Overlay VXLAN，简单）/ Calico（BGP + Network Policy）/ Cilium（eBPF）。
- Service 转发与 Pod 直连是两层不同机制（[[kube-proxy]] vs CNI），排错时要分清。
- 网络模型总览见 [[网络模型]]。

### 第 8 章 存储原理和应用
- 存储抽象分层：[[Volume]]（临时/共享）→ [[PV与PVC]]（持久化，解耦"用存储"与"管存储"）→ StorageClass（动态供给）。
- CSI（容器存储接口）让任意存储后端以插件接入；支持动态供给、快照、克隆。
- 设计要点：有状态应用（[[StatefulSet]]）用 PVC 模板 + 稳定的网络标识。

### 第 9 章 Kubernetes 开发指南
- 扩展 K8s 的两条路：**CRD**（声明新资源类型，零代码即可有 API+存储，见 [[自定义资源]] [[CRD与Operator]]）与 **API 聚合层**（自带存储的扩展 API）。
- Operator 模式：把 SRE 运维知识写成控制器，让有状态应用也能声明式自愈（见 [[CRD与Operator]]）。
- 客户端：client-go / controller-runtime；核心套路是 informer + 调谐循环，复用 [[声明式API]] 思想。

### 第 10 章 Kubernetes 运维管理
- Node 管理、Label/Selector、[[Namespace]] 作为隔离边界。
- 资源治理：[[资源限制与QoS]]（request/limit、QoS 三档）、ResourceQuota、LimitRange——是多租户防抢夺的基础（见 [[多租户]]）。
- 弹性：HPA（按指标扩缩）、[[滚动更新与回滚]]。
- 集群升级、证书续期、etcd 备份（高可用与运维见 [[高可用集群]]）。

### 第 11 章 Trouble Shooting 指南
- 方法论：从"现象"反推"哪一层"——是调度不掉（[[Scheduler]]/资源）、起不来（[[kubelet]]/CRI/镜像）、进不去（[[CNI网络]]/DNS）、还是改不动（[[APIServer]]/RBAC/证书）。
- 常用抓手：`kubectl describe`/`logs`、`kubectl get --raw` 探 API、节点上看 kubelet 日志、查 iptables/ipvs 规则、查 etcd 健康。
- 抓"控制平面组件"而不是只看 Pod——这是本书区别于入门书的视角。

### 第 12 章 Kubernetes 开发中的新功能
- Windows 节点容器、GPU 通过 Device Plugin 接入、VPA（VerticalPodAutoscaler，自定义资源形态）。
- CSI 快照/克隆、Scheduling Framework 插件化（呼应 [[Scheduler]] [[CRD与Operator]]）。
- 方向感：K8s 正把更多能力"CRD/插件化"，把控制平面做得更可扩展。

### 附录 A 核心服务配置详解
- 各核心组件（[[APIServer]] [[Etcd]] [[ControllerManager]] [[Scheduler]] [[kubelet]]）的启动参数、证书、kubeconfig、监听端口逐条说明——是排错和二进制部署的字典。

## 我卡住/没懂的地方
- 第 6 章安全机制 PDF 为图片版，认证/准入的**具体插件参数与报错样例**需要配合真实集群 `kubectl` 实操才能固化，光看结构容易"懂概念、不会排"。
- Scheduling Framework 的扩展点顺序（Filter/Score/Reserve/Permit/Bind）第一次看容易和"预选/优选"老模型混淆，需对照第 5 章理解它是老模型的插件化演进。
- etcd 的 compact/defrag 时机与"慢磁盘导致频繁选主"的链路，书上偏原理，需在一次真实 etcd 调优里验证。

## 它背后的原理（别只记操作）
- **一切皆声明式调谐**：用户写 spec → APIServer 存 etcd → 各控制器 List-Watch 后无限循环对账 → 现实收敛到 spec。这就是 K8s 自愈与弹性的根（[[声明式API]] [[ControllerManager]]）。
- **唯一入口 + 唯一真相**：所有写都过 APIServer（认证/授权/准入），所有状态只在 etcd。组件间不直接耦合，靠 API + watch 解耦（[[APIServer]] [[Etcd]]）。
- **可插拔分层**：网络靠 CNI、存储靠 CSI、运行时靠 CRI、调度靠 Framework、API 靠 CRD/聚合——每层定义接口、各家实现，K8s 自身不被具体方案绑架（[[CNI网络]] [[CRD与Operator]]）。
- **高可用来自"无状态 + 选举 + 多数派"**：APIServer 多实例靠 LB，etcd/控制器靠多数派/leader election（[[高可用集群]]）。

## 我能复用/改编的点
> 换个需求，这套做法还能怎么用？
- 想让"一类中间件自动托管运维" → 用 CRD + Operator 沉淀运维逻辑（不写一次性脚本）。
- 想"一个集群多团队共用不互扰" → Namespace + ResourceQuota + RBAC + Network Policy（[[多租户]]）。
- 想"抗节点故障" → 多 Master + 多 etcd + VIP + 多副本 + 反亲和（[[高可用集群]]）。
- 想"服务高并发高可用" → 多副本 + Service 内部 LB + Ingress + 外部 LB（[[负载均衡]]）。
- 想"对外暴露能力且易扩展" → 设计 RESTful、无状态、资源 URL 化的接口（[[RESTfulAPI]]）。

## 关联
- 概念（本 agent 拥有，已建卡）：[[集群搭建kubeadm]] [[Etcd]] [[APIServer]] [[ControllerManager]] [[Scheduler]] [[kubelet]] [[kube-proxy]] [[CNI网络]] [[CRD与Operator]] [[自定义资源]] [[准入控制]] [[ServiceAccount]] [[安全与认证]] [[多租户]] [[高可用集群]] [[容器编排]] [[声明式API]] [[负载均衡]] [[RESTfulAPI]]
- 概念（其他书拥有，仅链接）：[[Pod]] [[容器]] [[Docker]] [[Deployment]] [[Service]] [[Namespace]] [[kubectl]] [[ReplicaSet]] [[Label与Selector]] [[Ingress入门]] [[ConfigMap]] [[Secret]] [[Volume]] [[PV与PVC]] [[StatefulSet]] [[DaemonSet]] [[Job与CronJob]] [[RBAC]] [[资源限制与QoS]] [[滚动更新与回滚]] [[网络模型]] [[DNS与服务发现]] [[探针LivenessReadiness]] [[云原生]] [[微服务]] [[YAML]] [[HAProxy]] [[Keepalived]] [[高可用HA]]
- 项目：[[ ]]（项目实战由对应 agent 维护，本书不做项目卡）

## 来源
- 《Kubernetes权威指南 第5版》（基于 Kubernetes ~1.19/1.20）：第 1~12 章 + 附录 A。
- 第 6 章安全机制因 PDF 为图片版，相关细节结合章节结构与命令行实践整理。
- 配套章节文本缓存：`云计算知识库/.cache/k8s-bible/ch06_第1章.txt` … `ch18_附录A.txt`。
