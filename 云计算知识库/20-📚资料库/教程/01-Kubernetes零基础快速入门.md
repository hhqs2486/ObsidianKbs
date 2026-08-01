---
类型: 教程
来源: 《Kubernetes零基础快速入门 2021.3》
tags: [教程]
创建: 2026-07-21
状态: 已读待消化
---

# 01-Kubernetes零基础快速入门

## 这条教程在解决什么
- 帮零基础读者从"知道有容器"进阶到"能独立在 Kubernetes 上部署、访问、运维一个应用"，并建立"从需求反推架构/部署"的工程师思维。
- 它不是讲某一个组件深挖，而是把 K8s 的入门全链路（概念→安装→命令行→跑应用→暴露服务→存储→包管理→网络→Dashboard→集群管理→两个实战）串成一条线。

## 关键内容（按 PDF 章节提纲）
- **第1章 Kubernetes初步入门**：K8s 是什么（自动化容器运维平台，书里比喻"Docker 是飞机、K8s 是飞机场"）；发展历史（Google Borg → 开源 K8s）；为什么用（自修复、可扩展、可移植）；核心概念 Cluster / Master / Node / [[Pod]] / 服务 / 卷 / [[Namespace]]；以及 Master 上的 [[APIServer]]、[[ControllerManager]]、[[Scheduler]]、[[Etcd]] 与 Node 上的 [[kubelet]]、[[kube-proxy]]、Docker。
- **第2章 安装Kubernetes**：三种安装方式——yum 软件包管理 / 二进制 / 源码编译。yum 方式下配置 etcd 集群、Master（kube-apiserver 等）、Node（kubelet/kube-proxy）、[[CNI网络|Flannel]] 网络；二进制方式目录布局（/k8s/...）；源码编译需 Go 且耗时。
- **第3章 kubectl命令行工具**：[[kubectl]] 语法 `command/type/name/flags`、常用子命令（create/get/describe/exec/run/delete/apply/scale/label）、资源类型与输出格式（-o wide/yaml/json）；[[集群搭建kubeadm]]（init/join/reset）一键拉起集群。
- **第4章 运行应用**：[[Deployment]]（声明期望状态、管理 [[ReplicaSet]] → [[Pod]]、扩容缩容、故障转移、用 [[Label与Selector]] 控制 Pod 落点、删除）；[[DaemonSet]]（每节点一个，如日志采集）；[[Job与CronJob]]（批处理/定时）；[[YAML]] 配置结构（apiVersion/kind/metadata/spec）。
- **第5章 通过服务访问应用**：[[Service]] 解决 Pod IP 易变问题，实现服务发现与负载均衡；ClusterIP / NodePort / LoadBalancer 三种类型与 port/targetPort 区别；[[DNS与服务发现]]（CoreDNS）用服务名代替 IP。
- **第6章 存储管理**：[[Volume]]（emptyDir/hostPath/NFS/[[Secret]] 等约 30 种）；[[PV与PVC]]（静态/动态绑定、StorageClass、回收策略 Retain/Recycle/Delete）。
- **第7章 软件包管理(Helm)**：[[Helm]] 的 Helm/Tiller/Chart/Repository/Release 概念；安装；Chart 目录结构；helm install/search/repo/ls/delete。
- **第8章 网络管理**：K8s [[网络模型]]（IP-per-Pod、扁平不 NAT）；Linux 网络基础（命名空间/veth/netfilter/iptables/网桥/路由）；容器间、Pod 间、Service→Pod 的通信原理；Flannel 跨主机通信（[[CNI网络]]）。
- **第9章 Dashboard**：基于 Web 的 GUI；[[RBAC]]（User/[[ServiceAccount]]/Role/ClusterRole/RoleBinding）与官方 yaml 的 6 部分（Secret/SA/Role/Binding/Deployment/Service）；安装与基本使用。
- **第10章 集群管理**：节点隔离与恢复（cordon/drain）、扩容（kubeadm join）、Label 管理、Namespace/Context 隔离、资源 requests/limits、LimitRange、ResourceQuota、[[资源限制与QoS]]（Guaranteed/Burstable/BestEffort）、Pod 驱逐（软/硬）、[[高可用集群]]（keepalived 虚拟IP + HAProxy + Calico + 堆叠 etcd）。
- **第11章 实战1：部署 Spring Boot 应用**：部署 MySQL（[[StatefulSet]] + Service + NodePort）、打 jar、写 Dockerfile 构建镜像、Deployment + NodePort Service 对外暴露。
- **第12章 实战2：安装 KubeSphere**：All-in-one（KubeKey）与已有集群安装两种方式；KubeSphere 作为"以 K8s 为内核的云原生分布式操作系统"提供图形化管理（项目=Namespace、工作负载、服务、CRD 等）。

## 我卡住/没懂的地方
- 第2章 yum 安装方式（直接改 `/etc/kubernetes/config`、`/etc/kubernetes/apiserver` 等）与第3章 kubeadm 思路差异很大，初学者容易把"两套体系"混为一谈。建议入门直接学 kubeadm，yum 方式只当历史了解。
- 第8章网络底层（iptables 规则、veth 对、Flannel 封包解包）第一次看很晕，必须结合图（书里图8-3/8-4/8-6）和 `ip route`/`iptables-save` 实际输出才懂。
- 第10章 QoS 与资源配额一起出现时，容易分不清"单个容器 limits"和"命名空间总量 ResourceQuota"两件事。

## 它背后的原理（别只记操作）
- K8s 是**声明式**的：你写"期望状态"（想要 3 个副本），控制平面（kubectl→[[APIServer]]→[[Scheduler]]→[[kubelet]]→[[ControllerManager]]）不断把"实际状态"往"期望状态"拉，偏差自动修复。这是和"我手动敲命令"最大的思维差异。
- Pod IP 会随重建变化 → 所以必须有一个稳定虚拟入口 [[Service]]，再用 [[Label与Selector]] 把后端 Pod 解耦出来。
- 网络要"扁平、跨节点不 NAT"才能直通 → 所以需要 Flannel/[[CNI网络]] 给每个节点分配独立子网，再靠 [[kube-proxy]] 写 iptables 规则转发。
- 有状态（数据库）和无状态（Web）要区别对待：无状态用 [[Deployment]]，有状态用 [[StatefulSet]]，配置/密钥外置到 [[ConfigMap]]/[[Secret]]。

## 我能复用/改编的点
> 换个需求，这套做法还能怎么用？
- 要部署"Redis + 后端 API"？同样套路：[[StatefulSet]] 跑有状态 Redis、[[Deployment]] 跑无状态 API、[[Service]] 暴露、[[Namespace]] 隔离环境、用 [[Label与Selector]] 绑定。
- 高可用思路（keepalived 虚拟IP + HAProxy 负载 + 多 Master）可类比到其他需要主节点冗余的系统（见 [[高可用集群]]）。
- "声明式 YAML 进 Git + `kubectl apply`"就是基础设施即代码，可接 [[CI-CD]] 做自动发布。
- [[Helm]] 把"一堆 YAML"打包成 Chart，多环境复用一套模板、只换参数——适合把上面的 YAML 治理起来。

## 关联
- 概念：[[Pod]] [[容器]] [[Docker]] [[Deployment]] [[Service]] [[Namespace]] [[kubectl]] [[ReplicaSet]] [[Label与Selector]] [[Ingress入门]] [[云原生]] [[YAML]]；以及别人拥有的 [[集群搭建kubeadm]] [[Etcd]] [[APIServer]] [[ControllerManager]] [[Scheduler]] [[kubelet]] [[kube-proxy]] [[CNI网络]] [[网络模型]] [[DaemonSet]] [[Job与CronJob]] [[StatefulSet]] [[滚动更新与回滚]] [[PV与PVC]] [[Volume]] [[Secret]] [[ConfigMap]] [[Helm]] [[DNS与服务发现]] [[微服务]] [[RBAC]] [[ServiceAccount]] [[资源限制与QoS]] [[高可用集群]] [[容器编排]] [[声明式API]] [[负载均衡]] [[探针LivenessReadiness]] [[CRD与Operator]] [[多租户]] [[CI-CD]]
- 项目：（本书第11/12章为实战，由"项目实战"流程负责，此处不建链接）

## 来源
- 《Kubernetes零基础快速入门 2021.3》第1–12章（本地章节文本见 `.cache/k8s-intro/ch07~ch18_*.txt`）。本章抽取文本较完整，内容主要来自原书；其中 [[Ingress入门]] 原书未专设章节，相关说明结合 Kubernetes 通用知识整理。
