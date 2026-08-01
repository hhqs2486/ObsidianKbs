---
类型: 概念
主题: Kubernetes安装部署
tags: [概念, Kubernetes, 安装部署]
创建: 2026-07-21
复习: 
状态: 种子
---

# 集群搭建kubeadm

## 一句话定义
> kubeadm 是 Kubernetes 官方提供的"一键式"集群引导工具——一条 `kubeadm init` 加一条 `kubeadm join`，就能拉起一个符合生产规范的集群。

## 它解决什么问题 / 为什么存在
- 手动二进制部署要自己生成 CA 证书、签发各组件证书、写 kubeconfig、部署 etcd、为每个控制平面组件准备静态 Pod manifest，流程长、易错、难复现。
- kubeadm 把这套流程**标准化、幂等化、可脚本化**，让"搭集群"从"考古"变成"拼装"。

## 核心原理（大二能懂的水平）
- `kubeadm init`（在 Master 上）主要做几步：
  1. **preflight 检查**：内核版本、cgroup、端口、容器运行时是否就绪。
  2. **生成 PKI**：自签 CA，再为 APIServer、etcd、前端代理等签发证书。
  3. **生成 kubeconfig**：`admin.conf`/`controller-manager.conf`/`scheduler.conf` 等，组件靠它们连 APIServer。
  4. **用静态 Pod 拉起控制平面**：把 APIServer、etcd、ControllerManager、Scheduler 的 manifest 写到 `/etc/kubernetes/manifests/`，本机 kubelet 会自动把它们当静态 Pod 跑起来。
  5. **安装 addon**：kube-proxy 和 CoreDNS（集群 DNS）。
  6. **生成 join 凭据**：一个 token + CA 指纹（discovery），供节点加入。
- `kubeadm join`（在 Node 上）：用 token 连到 APIServer，自动向集群注册自己（kubelet 发 CSR，ControllerManager 签客户端证书），之后该节点出现在 `kubectl get node`。
- 还支持：`kubeadm token create`（补发令牌，默认 24h 过期）、`kubeadm reset`（清理）、`kubeadm init phase`（分阶段执行，方便排错）、`kubeadm init --config`（用配置文件声明式部署）。

## 关键参数 / 易错点
- `--pod-network-cidr`：必须和你随后要装的 CNI 网络插件网段一致，否则 Pod 永远拿不到 IP、一直 `ContainerCreating`。
- `--control-plane-endpoint`：多 Master 高可用时必须指向 VIP/域名（如 [[HAProxy]]+[[Keepalived]]），否则后续加 Master 很麻烦。
- init 输出的 `kubeadm join` 命令**默认 24 小时有效**；过期用 `kubeadm token create --print-join-command` 重新生成。
- kubeadm **不**自动帮你装网络插件和负载均衡器，这两件事要另行处理。
- init 成功后，把 `/etc/kubernetes/admin.conf` 复制到 `~/.kube/config` 才能用 kubectl 管理集群。

## 类比（帮助理解）
- 像买宜家家具：kubeadm 把"板材/螺丝/说明书"标准化成一套，照着拼就能成；二进制部署则像从原木自己锯板做家具——可控但极费劲。

## 设计时怎么用（反推思维）
> 做"快速搭一套可演示的 K8s"需求时，我用 kubeadm 在 10 分钟内拉起 1 Master + N Node；若要做生产级多 Master 高可用，则配合 [[HAProxy]]+[[Keepalived]] 与 `--control-plane-endpoint`，把控制平面和 etcd 都做成奇数节点。

## 典型应用 / 我在哪见过
- 本地实验、CI 临时集群、中小团队生产集群的基线；本书第 2 章完整演示了 kubeadm 与二进制两种部署路线。

## 关联
- 前置知识：[[容器编排]]
- 相关：[[Etcd]] [[APIServer]] [[kubelet]] [[高可用集群]] [[CNI网络]]
- 反例/误区：以为 kubeadm 会自动装好网络插件（它只装 kube-proxy 和 CoreDNS，CNI 插件要自己装）。

## 来源
- 本书第 2 章 Kubernetes 安装配置指南（kubeadm 快速部署 + 二进制+HA 部署对比）。
- kubeadm 官方文档（init/join/phase/token 子命令）。
