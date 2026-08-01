---
类型: 概念
主题: 探针LivenessReadiness
tags: [概念]
创建: 2026-07-21
复习: 
状态: 种子
---

# 探针LivenessReadiness

## 一句话定义
探针（Probe）是 Kubernetes 在 **Pod 运行期**对容器做健康检查的机制，主要有三种：**liveness（存活）**、**readiness（就绪）**、**startup（启动）**。它们决定「容器挂了要不要重启」「容器好了能不能接流量」「启动慢要不要等」。

## 它解决什么问题 / 为什么存在
[[Deployment]] 能给自愈和扩缩容，但「怎么算健康」它自己不知道。应用可能进程活着却死锁（该重启）、可能还没加载完缓存就被放进 [[Service]] 接流量（返回 500）。探针把「健康的标准」交给你定义，让 Kubernetes 真正读懂应用状态。

## 核心原理（大二能懂的水平）
- **livenessProbe**：失败 → kubelet 重启该容器。用于「卡死但进程还在」的场景（死锁、死循环）。
- **readinessProbe**：失败 → 把 Pod 从 Service 的 Endpoint 里摘掉，**不接流量也不重启**。用于「启动中/临时超载」场景。
- **startupProbe**（1.16+）：启动阶段用，成功前不执行 liveness，避免慢启动应用被误杀。
- 探测方式：`exec`（容器内执行命令看退出码）、`httpGet`（访问 HTTP 路径看状态码）、`tcpSocket`（端口能连上）。
- 关键参数：`initialDelaySeconds`（首次探测前等几秒）、`periodSeconds`（间隔）、`failureThreshold`/`successThreshold`（连续失败/成功几次才判定）。

## 关键参数 / 易错点
- **易错**：把「能否接流量」误配成 liveness——应用一瞬超载就被重启，雪上加霜；临时不可用应配 readiness。
- **易错**：`initialDelaySeconds` 太短，应用还没起来就被判失败狂重启（启动风暴）；慢应用加 startupProbe 更安全。
- **易错**：readiness 失败只是摘流量，不会重启——别指望它来修复死锁，那种要 liveness。

## 类比（帮助理解）
- liveness 像「心跳监测」：没心跳（探测失败）就做心肺复苏（重启容器）。
- readiness 像「上岗牌」：员工在但还在背手册（加载中），先别派客给他（摘出 Service），背完再挂牌接客。
- startup 像「试用期保护」：新人头一分钟手忙脚乱不算错，过了试用期才用正式考核。

## 设计时怎么用（反推思维）
> 做 XX 系统时，我会用它能解决 YY。
做对外提供服务的系统时，我会给每个容器配 **readiness（能接流量才进 Service）+ liveness（真挂了才重启）**，慢启动服务再加 startupProbe，避免「僵尸 Pod 接流量」和「启动即重启」两类经典事故。

## 典型应用 / 我在哪见过
- 第5章：在讲 [[滚动更新与回滚]] 时明确指出，Deployment 会配合 startup probe、readiness probe、liveness probe 监控 Pod 健康，支撑平滑滚动升级。

## 关联
- 前置知识：[[Pod]] [[Deployment]] [[Service]] [[kubelet]]
- 相关：[[滚动更新与回滚]]（探针是平滑更新的前提）、[[资源限制与QoS]]（健康与资源都影响稳定性）
- 反例/误区：只用 liveness 不用 readiness（启动中接流量报 500）

## 来源
- 本书第5章（Deployment/滚动升级处点名三种探针）。探针的详细参数与 exec/httpGet/tcpSocket 方式结合通用 Kubernetes 知识补全（PDF 为图片版，结合章节结构整理）。
