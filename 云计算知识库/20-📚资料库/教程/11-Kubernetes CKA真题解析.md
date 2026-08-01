---
类型: 教程
来源: 《Kubernetes CKA 真题解析》(cka-jiexi)
tags: [教程]
创建: 2026-07-21
状态: 已读待消化
---

# Kubernetes CKA真题解析

## 这条教程在解决什么
- 一句话主线：**CKA 是实操认证，考的是排错 / 部署 / 运维的真功夫，不是背概念**。这本书把真题按考点分类讲实操，等于给你一份"最小可用的 K8s 运维能力清单"。
- 目标读者（大二、准备 CKA）：别只记命令，要能**从需求反推"我该用哪个 K8s 能力"**。所以我把 24 道题重排成一张"能力地图"——看到题先判断它在考五大能力里的哪一块，再套对应套路。
- 全 24 题通读于 `.cache/cka-jiexi/full.txt`，下面每个题号都对应原文一道真题及解析。

## 关键内容（按能力地图提纲）

> 能力地图（对应 CKA 考纲权重，约）：① 集群架构/安装配置 ~25% ② 工作负载与调度 ~15% ③ 服务与网络 ~20% ④ 存储 ~10% ⑤ 故障排查 ~30%。**排错占最大头**，再次印证"考真功夫"。

### ① 集群架构 / 安装与配置（Cluster Architecture）
考的是：你会不会搭集群、备份、排节点/控制面故障——这是"运维的运维"。

- **Q18 etcd 快照备份**：`export ETCDCTL_API=3` 后 `etcdctl --endpoints=https://127.0.0.1:2379 --cert=... --cacert=... --key=... snapshot save /data/backup/etcd-snapshot.db`，再用 `snapshot status` 校验。→ 关联 [[Etcd]]（集群的"数据库"，挂了全完）。
- **Q21 静态 Pod + kubelet 配置**：题目要在节点上让 kubelet 自动起一个 nginx Pod。把 Pod YAML 放进 `/etc/kubernetes/manifests`，并确认 kubelet 配置里有 `staticPodPath: /etc/kubernetes/manifests`（`/var/lib/kubelet/config.yaml`），然后 `systemctl restart kubelet`。静态 Pod 不由 [[APIServer]] 调度，是 kubelet 直接看目录拉起的——属于节点侧能力。
- **Q22 用 kubeadm 在两节点建集群**：装 kubelet/kubeadm/kubectl → `kubeadm init --config /etc/kubeadm.conf`（忽略预检错误）→ `kubectl apply -f calico.yaml` 装网络 → 验证 node Ready、kube-system Pod Running。→ 关联 [[集群搭建kubeadm]]、[[网络模型]]。
- **Q23 apiserver 故障恢复**：集群"半死"，`kubectl get po` 卡住 → 推断 APIServer 挂了 → ssh 到 master 查 `/etc/kubernetes/manifests` 发现 apiserver 是静态 Pod 但 kubelet 没配 `staticPodPath` → 配好重启 kubelet，apiserver 自起。→ 关联 [[APIServer]]、kubelet 静态 Pod 机制。
- **Q19 排空节点（drain）**：`kubectl cordon <node>` 先禁止再调度，`kubectl drain <node> --ignore-daemonsets` 把 Pod 迁走并把节点标为不可调度。→ 关联 [[Scheduler]]（调度/驱逐逻辑）。
- **Q20 节点 NotReady 修复**：`kubectl get nodes` 发现 NotReady → `ssh` 节点 → `systemctl status kubelet` 没起 → `systemctl start/enable kubelet`，要 `enable` 才"永久"。→ 关联 [[kubelet]]。
- **Q15 统计 Ready 节点数（排除 NoSchedule 污点）**：`kubectl get nodes` 数 Ready 的 M，`kubectl describe nodes | grep Taints` 数含 `NoSchedule` 的 N，结果写 `M-N` 到文件。→ 关联 [[Scheduler]]（污点 Taint）。

### ② 工作负载与调度（Workloads & Scheduling）
考的是：Pod / Deployment / DaemonSet 怎么写、怎么调度到指定节点、怎么更新回滚。

- **Q3 DaemonSet + 不覆盖污点**：每个节点跑一个 nginx 实例，用 DaemonSet（`ds.kusc00612`），题目说"不要覆盖现有污点"→ 不写 tolerations，于是有污点的节点自然不会跑 Pod。检查：`kubectl describe nodes | grep Taints` 对照。→ 关联 [[DaemonSet]]、[[Pod]]、[[Scheduler]]。
- **Q4 给已有 Pod 加 init 容器**：在现成 YAML 里加 `initContainers`（busybox，`touch /workdir/calm.txt`），`/workdir` 用 `emptyDir` 卷挂进去，再加 liveness 探针确保文件在。init 容器先于主容器跑、跑完才起主容器。→ 关联 [[Pod]]、[[Volume]]、[[探针LivenessReadiness]]。
- **Q5 一个 Pod 多容器**：一个 Pod 里并列 4 个容器（nginx/redis/memcached/consul），共享网络/存储命名空间。说明"Pod 是调度最小单位，里面能塞多个协同容器"。→ 关联 [[Pod]]。
- **Q6 nodeSelector 调度到指定节点**：Pod 里写 `nodeSelector: {disktype: ssd}`，只调度到有该 Label 的节点。→ 关联 [[Pod]]、[[Scheduler]]。
- **Q7 Deployment 滚动更新与回滚**：建 `nginxapp`（3 副本，镜像 1.11.9-alpine）→ `kubectl set image deployment/nginxapp nginx=nginx:1.12.0-alpine --record` 触发滚动更新 → `kubectl rollout history` 看历史 → `kubectl rollout undo deployment/nginxapp` 回滚。→ 关联 [[Deployment]]、[[滚动更新与回滚]]。
- **Q10 Deployment 7 副本 + 存 YAML + 清理**：写 7 副本 redis 的 Deployment，`kubectl apply` 验证后 `kubectl delete -f` 清理，并把 YAML `cat` 存到 `/opt/KUAL00612/deploy_spec.yaml`。考"交付文件 + 不污染集群"的意识。→ 关联 [[Deployment]]。
- **Q14 扩缩容**：`kubectl scale deployment/webserver --replicas=6`（不会就 `kubectl scale --help`）。→ 关联 [[Deployment]]。

### ③ 服务与网络（Services & Networking）
考的是：Service 怎么把流量导到 Pod、DNS 怎么解析、网络模型怎么通。

- **Q8 Service 暴露已有 Pod（NodePort）**：先 `kubectl get po` 看 front-end 的 Label，写 Service 时 `selector` 必须和 Pod 的 Label 一致，`type: NodePort`，`nodePort: 30080`。`selector` 对不上就接不到流量。→ 关联 [[Service]]、[[Pod]]、[[网络模型]]。
- **Q11 列出某 Service 背后的 Pod**：`kubectl get svc -n production -o yaml | grep selector` 拿**选择器**的 Label（不是 Service 自己的 Label），再 `kubectl get po -n production -l app=blog | awk '{print $1}'` 写文件。→ 关联 [[Service]]、[[Pod]]。
- **Q17 Service/Pod 的 DNS 解析**：建 Deployment + Service（nginx-dns），再用 busybox:1.28 跑 `nslookup nginx-dns` / `nslookup <pod>` 把结果存文件。注意 busybox 用 1.28（新版 nslookup 有 bug）。→ 关联 [[Service]]、[[DNS与服务发现]]、[[Deployment]]。

### ④ 存储（Storage）
考的是：PV/PVC、卷挂载、Secret 怎么喂进 Pod。

- **Q2 列出按容量排序的所有 PV**：`kubectl get pv -A --sort-by={.spec.capacity.storage} > /opt/KUCC0006/my_volumes`，要求用 kubectl 自带排序、不二次加工。→ 关联 [[PV与PVC]]。
- **Q12 Secret 以卷/环境变量注入 Pod**：先 `echo -n 'blob' | base64` 编码再写进 Secret（`type: Opaque`）；PodA 用 `volumeMounts` 把 Secret 挂到 `/secrets`，PodB 用 `env.valueFrom.secretKeyRef` 导出。→ 关联 [[Secret]]、[[Pod]]、[[Volume]]。
- **Q13 非持久卷 emptyDir**：Pod 挂 `emptyDir: {}` 到 `/data/redis`，"MUST NOT be persistent" 就是空目录卷（Pod 删了数据没）。→ 关联 [[Volume]]、[[Pod]]。
- **Q24 hostPath 的 PV（ReadWriteMany）**：建 `PersistentVolume` `appconfig`，`capacity: 1Gi`，`accessModes: [ReadWriteMany]`，`hostPath.path: /srv/app-config`。→ 关联 [[PV与PVC]]。

### ⑤ 故障排查（Troubleshooting，占比最大）
考的是：日志、资源占用、节点/Pod 为什么不正常——这是 CKA 的灵魂。

- **Q1 筛查 Pod 日志中的报错**：`kubectl config use-context k8s` → `kubectl logs foobar | grep 'unable-to-access-website' > /opt/KULM00612/foobar`。考"从日志里捞有用行"。→ 关联 [[kubectl]]、[[Pod]]。
- **Q16 找出 CPU 最高的 Pod**：`kubectl top pod -l name=cpu-utilizer` 看各 Pod CPU，取最高那个写进 `/opt/cpu.txt`。考指标查看（需要 metrics-server）。→ 关联 [[Pod]]、[[kubectl]]。
- **Q20 / Q23** 已归入架构类，但本质也是排错——节点 NotReady、APIServer 起不来，都是"先观察症状、定位组件、永久修复"。

## 我卡住/没懂的地方
- **静态 Pod 与 kubelet 配置耦合**（Q21/Q23）：一开始容易以为 Pod 都是 APIServer 管的，忘了还有"kubelet 直接看 manifests 目录拉起"的静态 Pod 这条路；而 `staticPodPath` 默认空、必须在 kubelet 配置里显式写，这是排控制面故障的关键。
- **selector 的 Label 到底看谁的**（Q8/Q11）：Service 的 `selector` 必须匹配**后端 Pod 的 Label**，不是 Service 自己的 Label；考的是"流量怎么路由"的本质，容易想当然。
- **`--record` 与回滚的关系**（Q7）：滚动更新靠 `set image` 触发，回滚靠 `rollout undo`；`--record` 只是把命令写进历史方便追溯，不是回滚的必要条件，但考试常要求加上。
- **污点/容忍 vs nodeSelector**（Q3/Q6/Q15）：nodeSelector 是"硬选节点"，污点 Taint 是"节点拒绝 Pod 除非有容忍"，两套机制混着考时容易搞混调度语义。

## 它背后的原理（别只记操作）
- **声明式 + 控制器调谐**：你写 YAML 描述期望状态，各控制器（Deployment/DaemonSet/Scheduler）不断把现实对齐到期望。所以 CKA 几乎所有题都是"改 YAML / apply / 等控制器收敛 / 验证"。理解这点，命令就不再是死记，而是"让哪个控制器去干活"。
- **静态 Pod 是控制面组件的托底机制**：kube-apiserver、etcd 等核心组件自己就是静态 Pod，所以 kubelet 一启动它们就起来，不依赖 APIServer 先活着——这正是 Q23 能"自我修复"的原理。
- **Service 是稳定的虚拟 IP + 选择器**：Pod 会死会漂，IP 变；Service 用 `selector` 动态圈住一组 Pod，给一个不变的稳定入口，再靠 [[DNS与服务发现]] 解析名字。网络模型（[[网络模型]]）保证 Pod 间、Node 间能通。
- **Secret 与 ConfigMap 解决"配置与镜像解耦"**：Secret 存敏感值（base64 不是加密，是编码），可以挂卷或注入环境变量，让同一个镜像在不同环境用不同凭证。

## 我能复用/改编的点
> 换个需求，这套做法还能怎么用？
- **能力地图反推架构**：接一个新系统，先按"架构→工作负载→网络→存储→排错"五块过一遍，缺哪块补哪块，而不是堆功能。
- **生成 YAML 别手敲**：任何资源都用 `kubectl create <kind> ... --dry-run=client -o yaml > x.yaml` 出骨架再改（书里多题是纯手写，实战更推荐生成）。
- **每步都验收**：书里几乎每题都有"检查"步骤，养成 `kubectl get -o wide` / `exec -- ls` / `top` 的习惯，部署即验证。
- **先切 context 再动手**：多集群环境下，`kubectl config use-context` 是铁律，避免动错集群。
- **排错套路通用**：观察症状（NotReady / 卡住 / 无流量）→ 定位组件（kubelet / apiserver / selector）→ 永久修复（`enable` / 改配置 / 对齐 Label）。

## 关联
- 概念：[[CKA认证]]（本库唯一由本书建卡的概念）
- 项目：[[Kubernetes]]、[[容器编排]]、[[kubectl]]、[[Pod]]、[[Deployment]]、[[DaemonSet]]、[[Service]]、[[Namespace]]、[[PV与PVC]]、[[Secret]]、[[Volume]]、[[Scheduler]]、[[网络模型]]、[[DNS与服务发现]]、[[滚动更新与回滚]]、[[探针LivenessReadiness]]、[[集群搭建kubeadm]]、[[Etcd]]、[[APIServer]]、[[kubelet]]、[[安全与认证]]、[[RBAC]]
- （init 容器、静态 Pod、nodeSelector、污点 Taint 等子概念本书不建卡，按约定只在此笔记中说明，不单独建链接。）

## 来源
- 《Kubernetes CKA 真题解析》(cka-jiexi)，通读 `.cache/cka-jiexi/full.txt` 全部 24 道真题及解析（题号 Q1–Q24 均对应原文逐题）。
- 真题附带的官方文档参考（kubernetes.io 各考点页面）作为原理补充。
