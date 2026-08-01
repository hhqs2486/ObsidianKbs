---
类型: 教程
来源: 本书（PDF 为图片混排版，结合实验结构整理）
tags: [教程]
创建: 2026-07-21
状态: 已读待消化
---

# 轻松玩转 Kubernetes 实验指导

## 这条教程在解决什么
- 这是一本"在华为云 CCE 上把课本 K8s 命令真正跑通"的动手实验手册（华为云微认证系列 V2.0，2021）。
- 三个递进实验：① 在公有云上搭好 [[Kubernetes]] 集群并配好 kubectl 操作通道；② 逐个把核心 K8s 对象（Pod / Deployment / StatefulSet / DaemonSet / Job / Service / Namespace）亲手建一遍；③ 用 CCE 控制台一键部署 flappybird 网页游戏，验证"容器真的能对外服务"。
- 主线能力：把"声明式 YAML + kubectl"从本地虚拟机搬到真实公有云，体会每个对象到底解决什么问题——这正是"从需求反推架构/部署"的工程师思维起点。

## 关键内容（按实验提纲）

### 实验一：Kubernetes 环境搭建和基础管理（§1）
> 在云上把"集群 + 操作通道"这套水电煤先通上，后面所有实验都靠它。

#### 1.1 在华为云 CCE 上搭建集群
- 区域固定选 **北京四**；先建虚拟私有云 VPC（名称 `vpc-K8s`）。
- 购买 [[云容器引擎CCE]] 的 Kubernetes 集群 `k8s-demo`：版本 `v1.15.11`、管理规模 50 节点、控制节点数 **3（高可用）**、网络模型"容器隧道网络"、鉴权方式 **RBAC**。
- 现在添加 2 个节点（虚拟机，CentOS 7.6，通用型 2C4G，自动创建 5M 弹性公网 IP，密码 `Huawei@123!`）。
- 等 6–10 分钟，集群状态变"正常"、可用节点数为 2，环境搭建完成。

#### 1.2 基础管理：配好 kubectl 操作通道（§1.2）
- **1.2.1** 在 CCE 控制台"命令行工具 → kubectl"里下载 kubectl 二进制 + kubeconfig 配置文件（**版本必须与集群 v1.15.11 一致**）。
- **1.2.2** 另购一台 [[弹性云服务器ECS]]（`ecs-k8s`，1C1G，CentOS 7.5）当作 kubectl 客户端跳板机；在 [[虚拟私有云VPC]] 的安全组放通 SSH 22。
- **1.2.3** 用 WinSCP 把 kubectl 和 kubeconfig 传到 ECS 的 `/home`，Putty 登录后：
  ```bash
  cd /home
  chmod +x kubectl
  mv -f kubectl /usr/local/bin
  mkdir -p $HOME/.kube
  mv -f kubeconfig.json $HOME/.kube/config
  kubectl config use-context internal   # VPC 内接入
  kubectl cluster-info
  kubectl get nodes
  ```

### 实验二：Kubernetes 核心概念实践（§2）
> 每个对象一组 YAML，WinSCP 上传后 `kubectl apply`，再用 `get -o wide` / 进节点 `docker container ls` 验证。逐个对象体会"它解决什么问题"。

- **2.1 Pod 实践**
  - 2.1.1 创建 **1Pod1容器**（`POD-1Container.yml`，nginx）：`kubectl apply -f POD-1Container.yml` → `kubectl get pod` 看 Running → `kubectl get pod -o wide` 看落在哪台节点 → ssh 进节点 `docker container ls | grep nginx`（会发现除了 nginx 容器还有个 `cce-pause` 沙箱容器）→ 删 Pod 验证。
  - 2.1.2 **把 Pod 钉到指定 Node**：`kubectl label nodes <节点IP> node=test` → 上传 `POD-NodeSelector.yml`（含 `nodeSelector`）→ `kubectl get pod -o wide` 确认只调度到带标签节点。练的是节点亲和（[[Label与Selector]]）。
  - 2.1.3 创建 **1Pod2容器**（`POD-2Container.yml`，`two-containers`）：一个 Pod 内多容器共享网络/存储命名空间。
- **2.2 Deployment 实践**：创建后 `kubectl delete pod <某副本>` → 立刻 `kubectl get pod` 看到新 Pod 被拉起（自愈）；`kubectl scale deployment.v1.apps/nginx-deployment --replicas=4` 扩到 4 副本。
- **2.3 StatefulSet 实践**：删 `web-0` 再 `kubectl describe pod web-0`，名字/IP/所在节点**不变** → 有状态应用要稳定标识。
- **2.4 DaemonSet 实践**：先看 `kubectl get ds -n kube-system`；创建后实例数=节点数；**再买 1 个节点**，等可用后 `kubectl get ds -n kube-system` 实例数变 3（每节点自动多出一个）。
- **2.5 Job 实践**：跑计算 π 的 Job（`Job.yml`）；`kubectl get job` → `kubectl get pod`（名 `pi-xxx`）→ `kubectl logs pi-xxx` 看结果。一次性批处理。
- **2.6 Service 实践**：先 `kubectl apply -f deployment.yml`；`kubectl expose deployment nginx-deployment --type=NodePort` → `kubectl get service` 拿到 NodePort（如 32465）→ `curl <任意节点IP>:32465` 验证，或浏览器开节点公网 IP + NodePort。
- **2.7 Namespace + ResourceQuota 实践**
  - 2.7.1 默认命名空间：`kubectl get namespace`、`kubectl create namespace test`、`kubectl apply -f POD-1Container.yml --namespace=test`、`kubectl get pod -n test`。
  - 2.7.2 建 `quota-mem-cpu-example` 命名空间，apply `ns-cpu-mem.yml` 创建 ResourceQuota，限制该空间总 CPU/内存。
  - 2.7.3 在该空间建 Pod 必须带 requests/limits；建第二个 Pod 时因超出内存请求配额**创建失败**——直观看到配额生效。

### 实验三：CCE 控制台一键部署 flappybird（§3）
- 控制台"创建无状态工作负载"，名称 `flappybird`，选集群 `k8s-demo`，实例数 1。
- 添加容器，用第三方镜像 `swr.cn-north-1.myhuaweicloud.com/hc_cce/flappybird:latest`。
- 访问设置选**负载均衡**（[[负载均衡]]），容器端口/访问端口都 80。
- 工作负载状态"运行中"后，点外部访问地址，游戏页面出来即部署成功。

### 实验四：资源释放（§4）
- 删集群（勾选全部 → 输入 `DELETE` 确认）→ 删 `ecs-k8s` → 删安全组/子网/VPC（删 VPC 前先删子网）。
- 提醒：云资源按量计费，**实验完必须释放**，这是和本地虚拟机最大的不同。

## 我卡住/没懂的地方
- 书是图片混排 OCR，命令多处有错字/格式问题，照抄会失败，已逐一校正：
  - `kubectl apply –f`（短横是 en-dash `–` 不是连字符 `-`）、`kubetcl`、`kubbectl` 拼写错；
  - 2.7.2 的 `ns-cpu-men.yml` 漏字母（应为 `ns-cpu-mem.yml`）；
  - 2.7.1 步骤 3 里混进了无关的 `ll` 命令。
- 1.2.3 的 `kubectl config use-context internal` 只适用于 **VPC 内接入**；若要公网接入应是 `external`，书未展开，初学时容易连不上。
- 2.1.2 用节点 IP 当 node 名打标签（`kubectl label nodes 192.168.0.103 node=test`），生产中更常用节点 hostname/真实节点名而非临时私网 IP。

## 它背后的原理（别只记操作）
- [[云容器引擎CCE]] 是华为云托管的 [[Kubernetes]]（基于 K8s + Docker 的企业级容器服务）：控制面由云厂商维护，我们只买节点、发 YAML。
- [[kubectl]] 是 K8s 的命令行客户端；本地 kubeconfig 里的 **context** 决定连哪个集群、走内网（internal）还是公网（external）。
- 一切对象都是 [[声明式API]] 下的资源：你写"期望状态"，控制循环（各 controller）不断把"实际状态"拉回期望状态——所以删 Pod 会重建、扩副本会新增、StatefulSet 保标识。
- [[Pod]] 是最小调度/共享单位；[[Deployment]] 管无状态多副本与自愈；[[StatefulSet]] 给有状态应用稳定网络标识；[[DaemonSet]] 每节点一个守护进程；[[Job与CronJob]] 跑一次性/定时批处理。
- [[Service]] 给一组 Pod 一个稳定访问入口，NodePort 把端口暴露到每个节点 IP；更正式的对外暴露还有 ClusterIP / [[Ingress入门]] / 云厂商 [[负载均衡]]。
- [[Namespace]] 做资源与权限隔离；ResourceQuota 在命名空间层面限资源（见 [[资源限制与QoS]]）。
- 节点调度靠 Label 与选择器（[[Label与Selector]]）；集群鉴权模型是 RBAC（[[RBAC]]）。

## 我能复用/改编的点
> 换个需求，这套做法还能怎么用？
- **上云通用水电煤流程**：VPC → 托管 K8s 集群 → 跳板 ECS 跑 kubectl，可直接套到任何云厂商托管 K8s（阿里 ACK / 腾讯 TKE / AWS EKS）。
- **验证循环**：上传 YAML → `kubectl apply` → `get -o wide` 验证 → `exec`/ssh 进节点看容器，是验证任何工作负载的万能套路。
- **钉节点**：用 NodeSelector / 亲和性把延迟敏感或需特殊硬件的服务钉到特定规格节点；ResourceQuota 给团队/环境限用资源，避免互相挤占。
- **暴露服务**：NodePort 适合临时验证；要稳定域名/七层路由用 [[Ingress入门]]；要公网高可用入口用云厂商 [[负载均衡]]。
- **成本意识**：云上实验结束务必释放资源——这是和本地虚拟机最大的区别（持续计费）。

## 关联
- 概念：[[kubectl]] [[Kubernetes]] [[Pod]] [[Deployment]] [[StatefulSet]] [[DaemonSet]] [[Job与CronJob]] [[Service]] [[Namespace]] [[资源限制与QoS]] [[Label与Selector]] [[RBAC]] [[声明式API]] [[云原生]] [[容器编排]] [[华为云]] [[云容器引擎CCE]] [[虚拟私有云VPC]] [[弹性云服务器ECS]] [[负载均衡]] [[集群搭建kubeadm]]
- 项目：（无，本手册为纯实验指导，未关联项目实战）

## 来源
- 本书（PDF 为图片混排版，结合实验结构整理）《轻松玩转 Kubernetes 实验指导 V2.0（华为云微认证系列）2021》，华为技术有限公司
- 书内软件包/实验 YAML：华为云 OBS `https://weirenzhengnew.obs.myhuaweicloud.com:443/Kubernetes/kubernetes%20software%26yaml.rar`
