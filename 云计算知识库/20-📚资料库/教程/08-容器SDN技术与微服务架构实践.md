---
类型: 教程
来源: 《容器 SDN 技术与微服务架构实践》
tags: [教程]
创建: 2026-07-21
状态: 已读待消化
---

# 08-容器SDN技术与微服务架构实践

## 这条教程在解决什么
- 本书把"容器为什么需要专门的网络"和"微服务怎么落地"串到一起：先用 SDN 视角讲清容器网络（Docker Bridge → Flannel/Calico/Weave），再落到七牛的真实微服务案例（FOP/UFOP），演示一个系统如何从"端口映射 + 粗暴隔离"演化为"天然 Discovery/LoadBalance + 安全组"的微服务架构。
- 它帮读者建立一条关键脉络：**K8s 基础网络(CNI) → 容器 SDN(Calico/Flannel) → 微服务拆分 → Service Mesh(Istio) 解决服务间通信/观测/安全**。

## 关键内容（按「容器网络 → SDN → 微服务架构 → Service Mesh」提纲）
- **一、容器网络（为什么容器不能套传统网络）**
  - 书里点明容器相比虚机四点差异：每个容器职能更少、容器间关系更复杂、网络端点数量上升、生命周期更短 → 传统"一虚机一 IP"模型崩。
  - Docker Bridge 原理：Linux bridge 二层交换 + iptables NAT + ip_forward 路由；其局限（重启 IP 变、IP 不能跨主机迁移、NAT 隐藏地址、NAT 性能损耗、Bridge 内难隔离、端口冲突）。
  - 跨主机互通的两条路：Overlay 隧道（[[Flannel]] VXLAN）vs 路由直路（[[Calico]] BGP）。这层由 [[CNI网络]] 插件落地，满足 [[网络模型]] 的 IP-per-Pod / 不 NAT 约定。
- **二、SDN（软件定义网络：转控分离）**
  - 核心思想：控制平面集中（算规则）+ 转发平面（按规则搬包）分离。
  - OpenFlow：流表匹配能力强（Header Fields 几乎匹配任意字段），流表淘汰有被动（Idle/Hard Timeout）与主动（FlowDelete）；支持多控制器一组做负载均衡 + 高可用、分区域管辖。
  - 各方案控制/转发平面对比（书里大表）：Docker Bridge（子网分配 / Bridge+NAT）、Flannel（etcd / udp·vxlan 隧道）、Weave（TCP Full-Mesh 自主学习 / udp·vxlan、pcap 差 odp 好）、Calico（BGP RR / BGP mesh / Linux 协议栈路由）。
  - 业务需求清单：端点可迁移保持 IP、服务发现/负载均衡、L4/L7 精细均衡、对业务无侵入、端到端流量精细 ACL → 这些正是后来 [[Service Mesh]] 要补的能力。
- **三、微服务架构（七牛案例实战）**
  - 微服务拆分的动机与原则（见 [[微服务架构]]）：按业务域拆、数据自治。
  - 案例一 七牛文件处理 FOP：架构从 Stage1（简单）→ Stage2（加 Discovery 做 LB、业务 Agent 上报）→ Stage3（去掉 Discovery、Agent 退化、FopGate 取消 LB）→ Stage4（分离有状态 Agent / 无状态 worker，调度调配）。演示"治理组件逐步下沉/简化"的演化。
  - 案例二 用户自定义文件处理 UFOP：Before（端口映射麻烦、隔离粗暴、容器间一律禁止）→ After（天然 Discovery/LoadBalance、安全组灵活、完整端口空间）。
  - 服务发现/负载均衡：DNS Server 监听 docker0，容器 DNS 指向它，从 Router 查地址——这是服务发现的早期形态，对应后来的 [[DNS与服务发现]]。
  - 安全组：支持 Pod/Service/SecurityGroup 互访 ACL，支持 ICMP/TCP/UDP——对应 [[Calico]] NetworkPolicy / Mesh mTLS 的思路。
- **四、Service Mesh（从"连通"到"治理"，本书脉络的延伸落点）**
  - 当容器网络只解决"Pod 通不通"，微服务拆细后大量 [[东西向流量]] 需要重试/超时/熔断/加密/灰度/观测——这些"脏活"不该写进每个业务，于是下沉到 [[Service Mesh]]。
  - [[Istio]] 用 [[Envoy]] 作 [[Sidecar]] 数据平面、istiod 作控制平面，经 xDS 下发规则；注入方式（Namespace 打 `istio-injection=enabled` 自动注入）。
  - [[南北向流量]]（外部→网关）与东西向（服务间）分层：网关收口认证/限流，网格管内部 mTLS/灰度。
  - 验收脉络：CNI(Calico/Flannel) 管连通 → Service Mesh(Istio) 管治理，两层合起来支撑 [[微服务架构]]。

## 我卡住/没懂的地方
- 书里 OpenFlow 流表、Weave 的 pcap/odp 转发平面偏底层，第一次看容易陷进协议细节；先抓"转控分离"主干，细节当扩展即可。
- 七牛 FOP 四个 Stage 的"Discovery 加加减减"初看反直觉——本质是"治理下沉到基础设施（网络/Mesh）后，业务层就不需要自己搞 Discovery/LB 了"，和后来 Istio 思路一致。
- 书本身聚焦于容器网络/SDN 与七牛案例，Service Mesh(Istio/Envoy/Sidecar) 是书名"微服务架构实践"的必然延伸、结合通用知识补全，不是书里逐页内容。

## 它背后的原理（别只记操作）
- **网络分层认知**：物理网络（IP 可达）→ 容器网络（CNI 给 Pod 稳定 IP、跨主机互通）→ 服务治理（Service Mesh 管服务间调用）。一层管"通不通"，一层管"怎么聪明/安全地通"。
- **Overlay vs 路由**：Overlay（VXLAN/IPIP）对底层网络无侵入但封装有损；路由（BGP/host-gw）性能好但要求底层可达——选型本质是"侵入小 vs 性能好"的权衡（书里"转发平面"节）。
- **对业务无侵入**：无论是 Calico/Flannel 的网络能力，还是 Istio Sidecar，都不改业务代码——这是云原生网络/治理的共同追求（书里"业务需求-对业务无侵入性"）。
- **控制平面演进**：从 etcd 集中分配（Flannel）、BGP 路由通告（Calico）、到 Mesh 的 xDS 动态下发（Istio），控制平面越来越"会算"。

## 我能复用/改编的点
- 给一个新系统选型网络：要性能 + Pod 隔离 → [[Calico]]（BGP + NetworkPolicy）；要快速起步 → [[Flannel]]（VXLAN）；再上层要灰度/加密/观测 → [[Istio]]。
- 七牛"从端口映射 → Discovery/LB → 安全组"的演化，可套到任何"先糙快猛、再逐步下沉治理"的系统改造：先让服务通，再把 Discovery/LB/安全交给基础设施。
- "对有状态/无状态分离、用调度调配 worker 数"（FOP Stage4）可直接用于自己的任务处理系统：有状态 Agent 稳定跑、无状态 Worker 按需扩缩。
- 南北向只暴露一个网关、东西向靠 Mesh 加密——这套分层可直接抄到生产架构。

## 关联
- 概念（我拥有）：[[SDN]] [[容器网络]] [[Calico]] [[Flannel]] [[Service Mesh]] [[Istio]] [[Envoy]] [[Sidecar]] [[东西向流量]] [[南北向流量]] [[微服务架构]]
- 概念（他人拥有，只链接）：[[微服务]] [[网络模型]] [[CNI网络]] [[DNS与服务发现]] [[Kubernetes]] [[Pod]] [[Deployment]] [[Ingress入门]] [[负载均衡]] [[云原生]] [[容器编排]] [[Service]] [[ConfigMap]] [[容器]] [[探针LivenessReadiness]]
- 项目：（本书七牛案例为实战，由"项目实战"流程负责，此处不建链接）

## 来源
- 《容器 SDN 技术与微服务架构实践》全书（大纲：SDN / 容器与网络 / 开源容器网络方案 / Flannel / Calico / Weave / 七牛实践与案例分析；关键文本见 `.cache/sdn-microservice/full.txt`）。
- 说明：本书 PDF 为图片扫描版，抽取文本极少；SDN/容器网络/Flannel/Calico/Weave/七牛案例部分结合原书大纲与章节结构整理，Service Mesh(Istio/Envoy/Sidecar) 部分为书名"微服务架构实践"主题的通用知识延伸补充。
