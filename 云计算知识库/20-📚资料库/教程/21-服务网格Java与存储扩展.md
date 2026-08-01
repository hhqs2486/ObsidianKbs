---
类型: 教程
来源: ENVOY 官方文档 / Istio1.6 官方文档中文版 / Spring的IoC容器 / ceph详细中文文档
tags: [教程]
创建: 2026-07-21
状态: 已读待消化
---

# 服务网格 / Java / 存储扩展 4 本合订教程笔记

> 本笔记消化 4 本书，串起三条互相独立的线：
> 1. **服务网格线**：[[Istio]] 用 [[Envoy]] 做 [[Sidecar]] 代理实现服务间流量治理（数据面 + 控制面）。
> 2. **Java 线**：[[Spring IoC]] / [[依赖注入]] 解耦对象创建，[[Spring Boot]] 在其上做自动装配。
> 3. **存储扩展线**：[[Ceph RGW]] 在 [[Ceph存储]] 上提供 S3 对象接口。
> 三条线通过 [[服务网格]] 和 [[Ceph架构]] 两套已有卡片打通。

## 这条教程在解决什么
- Envoy / Istio：把「微服务之间怎么通信、怎么做流量治理（负载均衡、灰度、熔断、加密）」从业务代码里剥离，下沉到基础设施层。
- Spring IoC / Boot：把「对象怎么创建、依赖怎么组装」从业务代码里剥离，下沉到容器层。
- Ceph RGW：把「自建集群怎么对外提供对象存储」用标准 S3/Swift API 暴露出来。
- 共同点：**把横切关注点从业务代码里抽走，交给专门的一层去管**——这是「从需求反推架构」的关键思维。

## 关键内容（按 PDF 章节提纲）

### 一、Envoy（数据面代理）— 图片混排，结合章节结构整理
- [[Envoy]] 是 C++ 写的高性能 L4/L7 代理，是 [[Istio]] 的**数据面**基石。
- 核心抽象：**Listener（监听器）→ Filter Chain（过滤器链）→ Route（路由）→ Cluster（上游集群）→ Endpoint（实例）**。HTTP 过滤器、网络过滤器、监听器过滤器层层处理流量。
- 动态配置靠 **xDS API**（LDS/RDS/CDS/EDS/SDS）从控制面拉取，无需重启即可热更新。
- 以 **Sidecar** 模式注入每个 [[Pod]]，拦截进出流量；天然产生丰富指标，是 [[可观测性]] 的数据源。
- 注：官方文档为图片混排（MIXED），上述为结合章节结构整理。

### 二、Istio 1.6（控制面 + 流量治理）— 真实文本，可引用
- 开源 [[服务网格]]，透明接入分布式应用；名言「连接、保护、控制、观察」服务。（ch02_概念.txt:19-23）
- **架构两平面**：
  - **数据面**：每个服务旁跑一个 [[Envoy]] [[Sidecar]]，拦截服务间所有 HTTP/gRPC/WebSocket/TCP 流量。（ch02_概念.txt:87-88）
  - **控制面**：[[Istio]]（1.6 后为单体 `istiod`）负责服务发现、配置下发、证书签发，把规则翻译成 Envoy 配置。
- **流量管理 API**（均为 CRD，YAML 声明）：
  - [[VirtualService]]：把「请求怎么路由」与「真实目标」解耦，支持按 header/权重分流、重试、超时、故障注入。默认轮询负载均衡。（ch02_概念.txt:111-133）
  - [[DestinationRule]]：定义服务**子集**（按 label 分版本）与连接池/熔断/TLS 策略，在 VS 路由之后生效。（ch02_概念.txt:298-345）
  - [[Gateway]]（Istio 自己的 CRD，注意与 [[Gateway API]] 区分）：跑在网格边界的独立 Envoy，管入站/出站，再绑 VirtualService 做 L7 路由。（ch02_概念.txt:358-394）
  - ServiceEntry：把网格外服务注册进服务发现。Sidecar：限制代理可达的服务集合，省内存。
- **安全**：mTLS（Peer/Request 认证）、[[AuthorizationPolicy]]、基于 [[Kubernetes]] Service Account 的身份；`istio-agent` 通过 SDS 轮换证书。（ch02_概念.txt:688-844）
- **可观察性**：Envoy 产生指标（延迟/流量/错误/饱和）、分布式追踪 span、访问日志，导出到 Prometheus/Jaeger 等。（ch02_概念.txt:1369-1465）
- **扩展**：Proxy-Wasm 取代 Mixer 成为主要扩展机制（1.6），在 Envoy 里跑沙盒插件做策略/遥测。（ch02_概念.txt:626-642）

### 三、Spring 的 IoC 容器 — 真实文本，可引用
- **IoC 基本概念**（第 2 章）：IoC = 控制反转，别名 [[依赖注入]]；好莱坞原则「Don't call us, we will call you」。原来自己 `new` 依赖（紧耦合），反转成「需要什么让容器送过来」。FXNewsProvider 例：换新闻源（DowJones→MarketWin24）零改业务代码，只换注入的 Listener。（ch05）
- **三种注入方式**（第 2.2 节）：构造方法注入、setter 方法注入、接口注入（已退役）。构造器注入对象就绪即可用；setter 更灵活可继承。（ch05:172-300）
- **IoC 附加值**：解耦、可测试（注入 Mock）、可复用、可扩展。（ch05:303-441）
- **BeanFactory vs ApplicationContext**（第 4/5 章）：BeanFactory 基础容器、lazy-load、启动快；ApplicationContext 在其上构建、eager、额外提供事件/国际化/统一资源加载。（ch07:18-34，ch08:10-13）
- **Spring Boot**（本批归属概念，结合知识补全）：Starter 依赖 + 自动配置 + 内嵌服务器 + Actuator，建立于 [[Spring IoC]] 之上，是快速起 Java 后端/[[微服务]] 的脚手架。

### 四、Ceph 对象存储网关 RGW — 图片混排，结合章节结构整理
- [[Ceph RGW]]（radosgw）构建在 [[RADOS]] 之上的对象存储接口，提供 REST 风格网关。（ch85）
- 双接口：**S3 兼容**（大子集：Bucket/Object 增删改查、Multipart、Versioning、ACLs）+ **Swift 兼容**；共用同一命名空间，可交叉读写。（ch85, ch92）
- 实现：基于 libfcgi 的 FastCGI 模块，配合 Web 服务器；用 librados 与 [[Ceph OSD]] 交互。**不使用 [[CephFS]] 的 MDS**。（ch85 注, ch96）
- 自有用户体系（radosgw-admin），与 [[Ceph MON]] 的 cephx 是两套认证。（ch96）
- 体系结构定位：[[Ceph存储]] 用统一系统同时提供对象([[Ceph RGW]])、块([[RBD]])、文件([[CephFS]]) 三种接口，底层都跑在 [[RADOS]] + [[BlueStore]] 上。（ch99）

## 我卡住/没懂的地方
- Envoy 官方文档是图片混排，xDS 各协议（LDS/RDS/CDS/EDS/SDS）的细节只能从章节结构推断，未逐字核对。
- Ceph RGW 的联邦（realm/zone）配置较复杂，本笔记只到「概念层」，实操需看 ch88 联盟网关配置。
- Istio 1.6 文档中 Mixer 仍被提及，但 1.6 已在向 Proxy-Wasm 迁移，二者并存是过渡期现象，注意版本差异。

## 它背后的原理（别只记操作）
- **抽层思维**：服务网格把「通信治理」抽成 Sidecar 层；Spring 把「对象装配」抽成 IoC 容器层；Ceph 把「对象接口」抽成 RGW 层。三者都是「关注点分离」。
- **声明式 API**：Istio 用 CRD 声明「想要什么流量行为」，Envoy 负责落实；Spring 用配置声明「要哪些 Bean」，容器负责装配——都符合 [[声明式API]] 思想。
- **数据面/控制面分离**：Istio 的 Envoy（数据面）只转发+执行，istiod（控制面）只决策+下发，和 Ceph 的 MON（决策/地图）与 OSD（执行/存数据）异曲同工。

## 我能复用/改编的点
> 换个需求，这套做法还能怎么用？
- 做「多团队共享集群的入口治理」：用 [[Gateway API]] 取代厂商私有入口 CRD，把基础设施/平台/应用三方职责拆开（见 [[Gateway API]] 卡）。
- 做「需要灰度发布的 Java 服务」：Spring 侧用 [[依赖注入]] 解耦，Istio 侧用 [[VirtualService]] 按权重切流，两条线配合实现零停机发布。
- 做「私有云对象存储」：在 [[Ceph集群]] 前置 [[Ceph RGW]]，业务直接用 AWS SDK，无需关心底层是 [[RADOS]] 还是 [[BlueStore]]。

## 关联
- 概念：[[Gateway API]] [[Spring IoC]] [[Spring Boot]] [[依赖注入]] [[Ceph RGW]]
- 已存在（只链接）：[[Istio]] [[Envoy]] [[Service Mesh]] [[Sidecar]] [[Gateway]] [[VirtualService]] [[DestinationRule]] [[Kubernetes]] [[容器]] [[微服务]]；[[Ceph存储]] [[Ceph架构]] [[Ceph OSD]] [[Ceph MON]] [[RBD]] [[CephFS]] [[RADOS]] [[对象存储]] [[BlueStore]] [[Ceph集群]]
- 项目：（本批无项目实战，留待后续）

## 来源
- ENVOY 官方文档（envoy-doc，图片混排，结合章节结构整理）
- Istio1.6 官方文档中文版（istio-doc，真实文本，ch02 概念 / ch07 参考）
- Spring的IoC容器（spring-ioc，真实文本，第 2/4/5 章）
- ceph详细中文文档（ceph-doc-zh，图片混排，ch85/92/96/99）
