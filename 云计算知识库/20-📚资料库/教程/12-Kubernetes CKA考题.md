---
类型: 教程
来源: 《Kubernetes CKA 考题》（cka-kaoti）题集 + CKA 通用知识补全
tags: [教程]
创建: 2026-07-21
状态: 已读待消化
---

# 12-Kubernetes CKA考题

> 本题集是 CKA 认证的**考题清单 + 速答**，与 [[11-Kubernetes CKA真题解析]]（逐题详细解析）互补：这里偏「题目在考什么、怎么秒答」，想看原理点进去。整体服务于 [[CKA认证]] 备考。

## 这条教程在解决什么
- 把 CKA 上机考试的常见题型按题号整理成「考什么 / 关键答案要点 / 关联知识点 / 来源」四段式，方便大二同学刷题速记、上机不慌。
- 纯操作题集合：每个题都是一条可执行任务，重点是把正确命令/清单背熟、路径与名字别打错。

## 关键内容（按题集编排：考什么 / 关键答案要点 / 关联知识点 / 来源）

### 第1题 RBAC：ClusterRole + ServiceAccount + RoleBinding
- **考什么**：创建最小权限的 ClusterRole，并把它绑定到某 Namespace 里的 ServiceAccount（RBAC 授权链路）。
- **关键答案要点**：
  - 切换集群上下文：`kubectl config use-context ck8s`
  - 建 ClusterRole（只允许 create 三类工作负载）：
    `kubectl create clusterrole deployment-clusterrole --verb=create --resource=deployments,statefulsets,daemonsets`
  - 建 SA：`kubectl create sa cicd-token -n app-team1`
  - 建 RoleBinding 把 ClusterRole 绑到该 SA，且**限定在 app-team1**：
    `kubectl create rolebinding cicd-token-rolebinding --clusterrole=deployment-clusterrole --serviceaccount=app-team1:cicd-token -n app-team1`
- **关联知识点**：[[RBAC]] [[ServiceAccount]] [[Namespace]] [[kubectl]]
- **来源**：本题（PDF 为图片混排版，结合题集结构整理）

### 第2题 drain 节点：把节点设为不可调度并驱逐 Pod
- **考什么**：维护节点前的安全操作——cordon（禁止调度）+ drain（驱逐已有 Pod）。
- **关键答案要点**：
  `kubectl drain k8s-worker1 --ignore-daemonsets --delete-emptydir-data`
  - `--ignore-daemonsets`：DaemonSet 管理的 Pod 不驱逐；`--delete-emptydir-data`：连带删 emptyDir 数据。
- **关联知识点**：[[kubectl]] [[Pod]] [[Kubernetes]]
- **来源**：本题（PDF 为图片混排版，结合题集结构整理）

### 第3题 升级控制平面节点（kubeadm upgrade）
- **考什么**：用 kubeadm 把单节点（主节点）从 1.24.1 升级到 1.24.2，且**只升控制平面 + kubelet/kubectl，不动 worker/etcd/CNI/DNS**。
- **关键答案要点**（先 drain，升级完 uncordon）：
  ```bash
  ssh k8s-master; sudo -i
  kubectl drain k8s-master --ignore-daemonsets
  apt-mark unhold kubeadm kubelet kubectl
  apt-cache show kubeadm | grep 1.24.2
  apt-get update && apt-get install -y kubeadm=1.24.2-00
  apt-get install -y kubectl=1.24.2-00
  apt-get install -y kubelet=1.24.2-00
  apt-mark hold kubeadm kubelet kubectl
  kubeadm upgrade plan
  kubeadm upgrade apply v1.24.2 --etcd-upgrade=false   # 明确不升 etcd
  systemctl daemon-reload && systemctl restart kubelet.service
  kubectl uncordon k8s-master
  ```
- **关联知识点**：[[集群搭建kubeadm]] [[kubectl]] [[Kubernetes]] [[Etcd]]
- **来源**：本题（PDF 为图片混排版，结合题集结构整理）

### 第4题 etcd 快照备份与还原
- **考什么**：用 `etcdctl`（API v3）对 etcd 做 snapshot save / snapshot restore，考试会给定 TLS 证书路径与快照名。
- **关键答案要点**（证书路径以题目为准，这里用题集示例 `/opt/KUIN00601/`）：
  ```bash
  # 备份（路径与文件名以考试题目给定为准，如 /srv/backup/etcd-snapshot.db）
  ETCDCTL_API=3 etcdctl \
    --endpoints 127.0.0.1:2379 \
    --cacert=/opt/KUIN00601/ca.crt \
    --cert=/opt/KUIN00601/etcd-client.crt \
    --key=/opt/KUIN00601/etcd-client.key \
    snapshot save /srv/backup/etcd-snapshot.db
  # 还原（源快照以题目给定为准，如 /srv/data/etcd-snapshot-previous.db）
  ETCDCTL_API=3 etcdctl \
    --endpoints 127.0.0.1:2379 \
    --cacert=/opt/KUIN00601/ca.crt \
    --cert=/opt/KUIN00601/etcd-client.crt \
    --key=/opt/KUIN00601/etcd-client.key \
    snapshot restore /srv/data/etcd-snapshot-previous.db
  ```
  - 若命令长时间无响应，多半参数错了，CTRL+C 重来；考试里备份只需几秒。
- **关联知识点**：[[Etcd]] [[Kubernetes]] [[kubectl]]
- **来源**：本题（PDF 为图片混排版，结合题集结构整理）

### 第5题 NetworkPolicy：同 Namespace 内限制端口访问
- **考什么**：写 NetworkPolicy，只允许 `internal` Namespace 内的 Pod 访问同 Namespace 其他 Pod 的 8080 端口（入站白名单）。
- **关键答案要点**（`5.yaml`）：
  ```yaml
  apiVersion: networking.k8s.io/v1
  kind: NetworkPolicy
  metadata:
    name: allow-port-from-namespace
    namespace: internal
  spec:
    podSelector: {}          # 选中 internal 下所有 Pod
    policyTypes:
      - Ingress
    ingress:
      - from:
          - podSelector: {}  # 来源也限定为 internal 内 Pod
        ports:
          - protocol: TCP
            port: 8080
  ```
  `kubectl apply -f 5.yaml`。（NetworkPolicy 即 K8s 网络策略，底层依赖 [[网络模型]] 与 CNI 插件；本题集不单独建卡。）
- **关联知识点**：[[Namespace]] [[Pod]] [[网络模型]] [[kubectl]]
- **来源**：本题（PDF 为图片混排版，结合题集结构整理）

### 第6题 创建 Service（NodePort）
- **考什么**：给已有 Deployment 暴露端口，并建一个 NodePort 类型的 Service 对外暴露。
- **关键答案要点**：
  - 改 Deployment 给容器加 named port：`kubectl edit deployments.apps front-end`（加 `ports: - containerPort: 80 name: http`）
  - 建 Service：`kubectl expose deployment front-end --port=80 --target-port=80 --name=front-end-svc --type=NodePort`
  - 验证：`kubectl get svc front-end-svc`；`curl <CLUSTER-IP>`；`curl 127.0.0.1:<NODEPORT>`
- **关联知识点**：[[Service]] [[Deployment]] [[Pod]] [[kubectl]]
- **来源**：本题（PDF 为图片混排版，结合题集结构整理）

### 第7题 创建 Ingress
- **考什么**：写 Ingress 把 `/hi` 路径转发到 Service `hi` 的 5678 端口。
- **关键答案要点**（`7.yaml`）：
  ```yaml
  apiVersion: networking.k8s.io/v1
  kind: Ingress
  metadata:
    name: ping
    namespace: ing-internal
    annotations:
      nginx.ingress.kubernetes.io/rewrite-target: /
  spec:
    ingressClassName: nginx
    rules:
      - http:
          paths:
            - path: /hi
              pathType: Prefix
              backend:
                service:
                  name: hi
                  port:
                    number: 5678
  ```
  `kubectl apply -f 7.yaml`；验证 `kubectl get ingress -n ing-internal -o wide`。
- **关联知识点**：[[Ingress入门]] [[Service]] [[Namespace]] [[kubectl]]
- **来源**：本题（PDF 为图片混排版，结合题集结构整理）

### 第8题 扩缩容 Deployment
- **考什么**：手动把 Deployment 副本数改到指定值。
- **关键答案要点**：`kubectl scale deploy webserver --replicas 6`
- **关联知识点**：[[Deployment]] [[kubectl]] [[Pod]]
- **来源**：本题（PDF 为图片混排版，结合题集结构整理）

### 第9题 用 nodeSelector 把 Pod 调度到指定节点
- **考什么**：通过节点标签 + Pod 的 `nodeSelector` 做简单调度。
- **关键答案要点**（`9.yaml`）：
  ```yaml
  apiVersion: v1
  kind: Pod
  metadata:
    name: nginx-kusc00401
  spec:
    containers:
      - image: nginx
        name: nginx
    nodeSelector:
      disk: spinning     # 只落到带 disk=spinning 标签的节点
  ```
  生成骨架可用 `kubectl run nginx-kusc00401 --image=nginx --dry-run=client -o yaml > 9.yaml`；验证 `kubectl get pod -o wide`、`kubectl get node -l disk=spinning`。
- **关联知识点**：[[Pod]] [[Label与Selector]] [[kubectl]]
- **来源**：本题（PDF 为图片混排版，结合题集结构整理）

### 第10题 统计健康（Ready 且非 NoSchedule）节点数
- **考什么**：过滤 Taint 为 `NoSchedule` 的节点后，统计 Ready 节点数量并写文件。
- **关键答案要点**：
  ```bash
  kubectl get node                       # 看 STATUS（SchedulingDisabled 不算 Ready）
  kubectl describe node | grep -i taints # 找出带 NoSchedule 的节点并排除
  echo 1 > /opt/KUSC00402/kusc00402.txt  # 把统计出的数字写进去
  ```
  - 题集中示例：master 有 `control-plane:NoSchedule`、worker1 是 `SchedulingDisabled`、worker2 才 Ready → 答案为 1。
- **关联知识点**：[[kubectl]] [[Pod]] [[Kubernetes]]
- **来源**：本题（PDF 为图片混排版，结合题集结构整理）

### 第11题 多容器 Pod
- **考什么**：一个 Pod 里跑多个容器（每个镜像一个容器）。
- **关键答案要点**（`11.yaml`）：在 `spec.containers` 下并列写 nginx / redis / memcached / consul 四个容器即可；生成骨架 `kubectl run kucc1 --image=nginx --dry-run=client -o yaml > 11.yaml` 再补。
- **关联知识点**：[[Pod]] [[kubectl]] [[Kubernetes]]
- **来源**：本题（PDF 为图片混排版，结合题集结构整理）

### 第12题 创建 PersistentVolume
- **考什么**：定义集群级存储 PV（hostPath 类型，ReadWriteMany）。
- **关键答案要点**（`12.yaml`）：
  ```yaml
  apiVersion: v1
  kind: PersistentVolume
  metadata:
    name: app-data
  spec:
    capacity:
      storage: 1Gi
    accessModes:
      - ReadWriteMany
    hostPath:
      path: /srv/app-data
      type: DirectoryOrCreate
  ```
  `kubectl apply -f 12.yaml`；`kubectl get pv`（状态应为 Available）。
- **关联知识点**：[[PV与PVC]] [[kubectl]] [[Kubernetes]]
- **来源**：本题（PDF 为图片混排版，结合题集结构整理）

### 第13题 创建 PVC 并挂载、再扩容
- **考什么**：建 PVC（指定 storageClass、容量、访问模式）→ 建 Pod 挂载它 → 用 edit/patch 把 PVC 扩容到 70Mi 并 `--record` 记录变更。
- **关键答案要点**：
  - PVC（`13.yaml`）：`accessModes: [ReadWriteOnce]`、`resources.requests.storage: 10Mi`、`storageClassName: csi-hostpath-sc`，`kubectl apply -f 13.yaml`
  - Pod（`13pod.yaml`）：容器 nginx 挂 `volumeMounts: - mountPath: /usr/share/nginx/html`，用 `persistentVolumeClaim.claimName: pv-volume`
  - 扩容：`kubectl edit pvc pv-volume --record`（改 `storage` 为 70Mi）
- **关联知识点**：[[PV与PVC]] [[Pod]] [[kubectl]]
- **来源**：本题（PDF 为图片混排版，结合题集结构整理）

### 第14题 监控 Pod 日志并提取错误行
- **考什么**：用 `kubectl logs` + `grep` 把指定错误日志落盘。
- **关键答案要点**：
  `kubectl logs bar | grep 'unable-to-access-website' > /opt/KUTR00101/bar`
  - 多容器 Pod 要加 `-c <容器名>`；想持续跟踪用 `-f`。
- **关联知识点**：[[kubectl]] [[Pod]] [[Kubernetes]]
- **来源**：本题（PDF 为图片混排版，结合题集结构整理）

### 第15题 给已有 Pod 加 sidecar 容器
- **考什么**：不改原容器，给 Pod 加一个 busybox sidecar，通过共享 emptyDir 卷接入 K8s 日志体系（`kubectl logs` 能看到）。
- **关键答案要点**：
  - 导出再改：`kubectl get pod big-corp-app -o yaml > 15.yaml`
  - 原容器加 `volumeMounts: - name: logs mountPath: /var/log`（两容器都挂同一个 `logs` 卷，路径保持 `/var/log`）
  - 新增 sidecar：
    ```yaml
    - name: sidecar
      image: busybox
      args: [/bin/sh, -c, 'tail -f /var/log/legacy-app.log']
      volumeMounts:
        - name: logs
          mountPath: /var/log
    volumes:
      - name: logs
        emptyDir: {}
    ```
- **关联知识点**：[[Sidecar]] [[Pod]] [[Volume]] [[kubectl]]
- **来源**：本题（PDF 为图片混排版，结合题集结构整理）

### 第16题 找出 CPU 占用最高的 Pod
- **考什么**：用 `kubectl top` 按标签筛选并按 CPU 排序，把第一名写文件。
- **关键答案要点**：
  `kubectl top pod -A -l name=cpu-loader --sort-by='cpu'`
  - 取输出第一行（CPU 最高）的 Pod 名，写入 `/opt/KUTR00401/KUTR00401.txt`。需先装好 metrics-server 才有 top 数据。
- **关联知识点**：[[kubectl]] [[Pod]] [[资源限制与QoS]] [[Kubernetes]]
- **来源**：本题（PDF 为图片混排版，结合题集结构整理）

## 我卡住/没懂的地方
- 第3题升级步骤多、顺序易错：牢记「drain → 解 hold → 装指定版本 → plan → apply（--etcd-upgrade=false）→ 重启 kubelet → uncordon」这条链。
- 第4题 etcd 备份的证书路径与快照名每次考试都不同，必须照题目给的填，不要背死路径。
- 第10题「排除 NoSchedule」容易漏看控制面节点的 `control-plane:NoSchedule` taint。

## 它背后的原理（别只记操作）
- RBAC 三件套：ClusterRole/Role 定义「能干什么」，ServiceAccount 是 Pod 的身份，RoleBinding/ClusterRoleBinding 把身份和权限绑起来——权限 = 身份 + 规则。
- drain 本质是「先 cordon 禁止新调度，再 evict 已有 Pod」，保证节点上的工作负载被安全迁走。
- etcd 是 [[Kubernetes]] 的唯一事实数据源，snapshot 就是给这棵树做全量备份；restore 会生成新数据目录，需配合静态 Pod 清单指向它。
- NetworkPolicy 是「白名单」模型：不写就默认放行（取决于 CNI），写了 `Ingress` 就只放行列出的来源/端口。

## 我能复用/改编的点
> 换个需求，这套做法还能怎么用？
- 把第1题的 RoleBinding 改成 ClusterRoleBinding，就能跨 Namespace 授权；把 `--verb` 换成 `get,list,watch` 就变成只读权限。
- 第15题 sidecar + emptyDir 的模式可套到「日志采集、配置文件热加载、旁路代理」等场景。
- 第13题「PVC 挂载 + 扩容」是 stateful 应用上 K8s 的标准姿势，把 nginx 换成数据库即可复用。

## 关联
- 概念：[[CKA认证]] [[Kubernetes]] [[kubectl]] [[Pod]] [[Deployment]] [[Service]] [[Namespace]] [[RBAC]] [[Etcd]] [[集群搭建kubeadm]] [[PV与PVC]] [[Sidecar]] [[Ingress入门]] [[ServiceAccount]] [[Label与Selector]] [[Volume]] [[容器编排]]
- 项目：[[11-Kubernetes CKA真题解析]]

## 来源
- 《Kubernetes CKA 考题》（cka-kaoti）题集，原文 `.cache/cka-kaoti/full.txt`（PDF 为图片混排版，约 13KB，部分命令由题集结构与 CKA 通用知识补全，路径/证书以考试题目给定为准）。
- 配套详细解析见 [[11-Kubernetes CKA真题解析]]；认证备考主线见 [[CKA认证]]。
