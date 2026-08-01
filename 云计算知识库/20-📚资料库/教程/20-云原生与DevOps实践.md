---
类型: 教程
来源: 云原生趋势/实践 + 微服务与DevOps内参 + DevOps智能云 + VMware vSphere白皮书（共 5 本）
tags: [教程]
创建: 2026-07-21
状态: 已读待消化
---

# 云原生与DevOps实践

## 这条教程在解决什么
- 把"云原生理念 + DevOps 文化 + 虚拟化底座"三条线索拧成一条认知线，建立从需求反推架构的工程师视角。
- 五本书共同回答：**为什么企业要上云原生、DevOps 怎么把代码变成可交付物、微服务如何治理、传统虚拟化（vSphere）如何与 Kubernetes 融合**。
- 一条必须讲清的主线：
  > **云原生 = 微服务 + 容器 + DevOps + 不可变基础设施**；
  > **DevOps 用 [[CI-CD|CI/CD]]（[[持续集成]] + [[持续部署]]）把代码变成可交付物**；
  > **vSphere 是传统虚拟化底座，vSphere with Kubernetes 把 [[Kubernetes]] 带入虚拟化层**。

## 关键内容（按 5 本书提纲）

### 一、云原生理念与趋势（cloudnative-trend / cloudnative-practice）
- **云原生是什么**：CNCF 定义 = 容器化封装 + 自动化管理 + 面向微服务 + 服务网格 + [[声明式API]]。本质是"一套指导软件架构设计的思想，让应用生于云、长于云，最大程度利用云能力"（cloudnative-practice）。
- **前世今生**：PaaS 概念普及 → Docker（2013）重新定义 PaaS、解决应用打包 → CNCF（2015）把重心从容器转移到以 [[Kubernetes]] 为核心的编排 → K8s 逐渐成为"云时代的底层操作系统"，向下封装资源、向上支撑应用（[[微服务]]、Serverless、Service Mesh）。
- **价值链**：云原生是云计算价值链的延伸——把非业务逻辑（服务治理、网络、存储）从应用剥离下沉到基础设施，Kubernetes 成为整个生态的底层标准与关键价值节点。
- **容器云平台**：以容器+编排+服务网格+无服务器构建的轻量 PaaS，融合 IaaS 与 [[PaaS平台]]，提供应用全生命周期管理（ALM）。平台自下面上分：交互层 / 接口层（Open API、RESTful）/ PaaS 服务层（业务应用、数据应用、治理、市场、DevOps）/ 基础层（K8s 为核心，含容器编排、[[容器]]网络 CNI、Service Mesh、镜像仓库、监控日志安全）。
- **数据印证**：Sysdig 2019 报告显示 77% 用户已在用 Kubernetes；中国信通院 2020 调查 60%+ 云原生用户为互联网企业。

### 二、DevOps 文化与交付（devops-cloud / microservice-devops）
- **历史**：DevOps 概念 2008（Agile Infrastructure）提出，2009 DevOpsDays 走红；其普及依赖三股成熟力量——云计算、Docker（2013）、[[微服务]]（Martin Fowler，2014）。
- **本质**：DevOps = 整合软件开发与 IT 运营的流程与文化，通过自动化与更紧密协作降低上线难度、让软件贴合业务目标。内参一针见血："DevOps 是制造与维护处理数据的工具的工具"。
- **七环节生命周期**：代码 → 构建 → 测试 → 打包 → 发布 → 配置 → 监控（这正是 [[持续集成]] 与 [[持续部署]] 串起来的流水线）。
- **DORA 四大指标**：变更前置时间、部署频率、故障恢复时间(MTTR)、变更失败率。数据：部署效率↑46×、变更速度↑2500×、故障恢复↑2600×、失败率↓7×（devops-cloud）。
- **平台三层**（基于容器云的 DevOps 平台）：基础设施层（IaaS/CaaS，基于 K8s+[[容器]]）→ 基础服务层（注册中心、编排、伸缩漂移）→ DevOps 层（需求到发布串接、看板文化）。具备统一工作台、打通工具链、研发度量、多环境支持、运行期高可靠。
- **落地原则**：① 寻找痛点从痛点入手；② 把重复无价值的事尽快自动化；③ 从"持续发布"开始，再逐步建量身定制的 DevOps 平台。
- **AI 时代**：Jez Humble 指出，AI 加持下 DevOps 提高开发效率/安全性/延展性，"轻运维/NoOps/自助式运维"成为主流，Serverless 成为 DevOps 的思想导向之一。

### 三、微服务治理（microservice-devops + trend 平台层）
- **为什么微服务**：单体"巨石应用"难扩展难维护，微服务把"巨石"拆成独立开发运营的单元；代价是系统整体复杂度激增，需要服务治理。
- **服务发现**：各微服务启动时把网络地址注册到服务发现组件，消费者查询地址并调用，靠心跳保活、地址变更自动重注册——这是 [[微服务]] 能被动态调度的前提（trend 2.4 节）。
- **治理下沉**：服务治理、限流、配置、链路等"非业务逻辑"从应用剥离，下沉到 [[PaaS平台]]/网格层，正是云原生价值链的核心动作。
- **与 DevOps 的关系**：微服务让部署单元变多，倒逼自动化发布（[[持续部署]]）和容器化（[[容器]]）成为刚需。

### 四、VMware 虚拟化底座与 K8s 的关系（vmware-vsphere 白皮书，14 页）
- **三种部署演进**：传统部署（物理机，缺灵活）→ 虚拟化部署（ESXi Hypervisor，VM 隔离+ vMotion/DRS/HA）→ 容器化部署（轻量、持续集成友好）。
- **vSphere 是什么**：VMware 服务器虚拟化套件（ESXi + [[vCenter]]），企业传统负载的稳态底座。
- **vSphere with Kubernetes（Project Pacific）**：把 K8s 控制平面嵌入 ESXi——Spherelet（类 Kubelet）+ CRX 运行时让 ESXi 直接以原生节点跑容器（vSphere Pod），无需单独 Linux；vSphere Client 同时能看/管 K8s 对象和 VM。对开发者它是 K8s，对管理员它还是 vSphere。
- **两种 K8s 集群**：① vSphere Pod Service（主管集群，ESXi 当 worker，非标准上游 K8s，强安全强隔离）；② Tanzu Kubernetes 集群（跑在 VM 上的标准上游 [[Kubernetes]]，用 Cluster API 管理，更灵活、可加装 [[Helm]] 等生态工具）。
- **配套服务**：镜像仓库（Harbor）、存储服务（vCenter 存储策略→K8s StorageClass）、网络服务（NSX，按 Namespace 的上下文感知安全）、虚拟机服务（用 K8s 管 VM）。
- **SDDC 收口**：VMware Cloud Foundation（VCF）是 [[软件定义数据中心]] 完整套件，SDDC Manager 自动部署/补丁/升级整个堆栈（含 [[超融合]] vSAN 与 NSX-T），并能编排 vSphere Pod Service——这是传统虚拟化平滑走向云原生的"最佳入门方式"。

## 我卡住/没懂的地方
- vSphere Pod Service 与标准 K8s 节点的边界：白皮书明确说 vSphere Pod 用 ESXi 当 worker、不是标准上游 K8s，这点容易和"vSphere 跑 K8s"混淆，需结合 [[Kubernetes]] 节点模型理解。
- microservice-devops 是 MIXED 图片混排本，部分架构图缺失，本文按章节结构 + 知识补全整理（图片版，结合章节结构整理）。
- cloudnative-trend 文本存在编码乱码段，已依据可读段落提炼；趋势数据以 Sysdig/信通院口径为准。

## 它背后的原理（别只记操作）
- **为什么是这四件套**：微服务解决"拆得开"，[[容器]]解决"打包便携一致"，DevOps 解决"改得快且稳"，不可变基础设施（发布即替换、不原地改）解决"环境漂移"。四者咬合才叫云原生。
- **为什么 K8s 能当底层操作系统**：它用 [[声明式API]] 描述"期望状态"，靠控制器不断把实际态对齐期望态（声明式闭环），天然适合自动化；向下抽象计算/网络/存储，向上承载各种工作负载。
- **为什么虚拟化底座要和 K8s 融合**：企业存量大量 VM 与合规/人员/流程投资，vSphere with Kubernetes 不颠覆旧世界，而是给旧世界加一套 K8s 中控，让"传统负载 + 云原生"在同一套物理资源上共存。

## 我能复用/改编的点
> 换个需求：如果要给一家传统制造企业做"稳态 VM + 敏态容器"双模平台，我会用 VCF/[[vSphere]] 做底座（保住存量投资），在其上开 vSphere with Kubernetes，让新业务走 [[Kubernetes]]+[[持续部署]] 快速迭代，老 ERP 继续跑 VM——用 Namespace 做团队/安全边界，用 [[CI-CD|CI/CD]] 流水线统一交付。

## 关联
- 概念：[[DevOps]]、[[持续集成]]、[[持续部署]]、[[vSphere]]、[[vCenter]]、[[软件定义数据中心]]、[[超融合]]（以上为本批新建）
- 链接（别人拥有，不建）：[[云原生]]、[[微服务]]、[[容器]]、[[Kubernetes]]、[[容器云平台]]、[[PaaS平台]]、[[CI-CD]]、[[声明式API]]、[[虚拟机]]、[[虚拟化KVM]]、[[高可用集群]]、[[多集群管理]]、[[Helm]]、[[Istio]]、[[Deployment]]、[[Service]]、[[Pod]]、[[OpenStack]]

## 来源
- 云原生时代容器云的技术发展趋势（cloudnative-trend，TEXT）
- 云原生的技术探索与落地实践（cloudnative-practice，TEXT，InfoQ 研究院报告）
- 微服务与DevOps技术内参（microservice-devops，MIXED 图片混排，按章节结构补全）
- DevOps在智能云时代的开发与交付（devops-cloud，TEXT，华为云 BU）
- 《VMware vSphere with Kubernetes 基础知识》白皮书（vmware-vsphere，TEXT，14 页短白皮书）
