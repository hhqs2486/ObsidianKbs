---
类型: 概念
主题: 容器与K8s
tags: [概念]
创建: 2026-07-21
复习: 
状态: 种子
---

# Docker网络

## 一句话定义
> Docker 网络是 Docker 在宿主机上用 Linux 虚拟网络技术搭出的一套连通方案，解决「容器怎么被外部访问、容器之间怎么互相通信」；我用 [[Docker]] 自带的网桥和自定义网络来管理连通性。

## 它解决什么问题 / 为什么存在
- 容器默认在隔离的 Network namespace 里，互相不通、外面也访问不到。网络让「端口映射」和「容器互联」成为可能。
- 区别于 [[Kubernetes]] 的 [[容器网络]] / [[CNI网络]] / [[网络模型]]：Docker 单机网络是容器引擎自带的；K8s 跨节点网络由 CNI 插件（如 Calico / Flannel）负责，是一套更大的体系——本卡只讲 Docker 侧。

## 核心原理（大二能懂的水平）
- 装了 Docker 的 Linux 主机默认有一个虚拟网桥 `docker0`；每起一个容器，Docker 从 docker0 网段分给它一个 Container-IP，docker0 就是容器默认网关（《Docker实战(图解)》ch03、《Docker从入门到实践》ch11）。
- 容器与宿主机各有一个虚拟网卡，成对出现（**veth pair**），内核直接复制转发，效率极高。
- 五种网络模式：
  - `bridge`（默认）：在 docker0 上给容器建新网络栈。
  - `host`：与宿主机共享 Network namespace，无隔离、性能好。
  - `none`：不配网络，后续自配。
  - `container:<name>`：和另一个容器共享网络命名空间（[[Kubernetes]] 的 [[Pod]] 多容器共享网络正是这思路）。
  - 自定义网络（`docker network create --driver bridge --subnet ...`）：同网内容器可用**主机名**互相访问，自带 DNS。

## 关键参数 / 易错点
- 外部访问用 `-p` / `-P`：`-p 5000:5000`（host:container），`-P` 随机映射 49000~49900；`-p` 可多次绑定多端口；支持 `ip:hostPort:containerPort` 和 `/udp`。
- 老式 `--link` 已被**自定义网络取代**：`--link` 靠改 `/etc/hosts` 实现，删了就断；自定义网络实时维护 DNS，推荐。
- 跨网络连通用 `docker network connect 网络名 容器名`。
- `EXPOSE` 只是声明文档，不等于真发布端口，还是要 `-p`。

## 类比（帮助理解）
- docker0 像「宿舍楼里的交换机」：每个容器是插了网的房间，分配内网 IP；`-p` 像在楼外墙上开了个「门牌对应内部房间号」的窗口，外面才能敲。host 模式像「房间直接用了整栋楼的门牌」。

## 设计时怎么用（反推思维）
> 做「一个 Web 容器要连 MySQL 容器」时，我会建一个自定义 bridge 网络，把两个容器都连进去，Web 直接用主机名 `mysql` 访问，不必暴露 MySQL 端口、也不用脆弱的 `--link`。上生产交给 [[Kubernetes]] 的 [[Service]] 做服务发现。

## 典型应用 / 我在哪见过
- 端口映射暴露 Web 服务；自定义网络实现多容器互联；docker-compose 默认即自定义网络。
- 见过：《Docker实战(图解)》ch03 网络原理 + 网桥/模式表；《Docker从入门到实践》ch11 使用网络；《Docker经典实例》wordpress `--link mysqlwp:mysql -p 80:80`、SimpleHTTPServer 端口映射。

## 关联
- 前置：[[Docker]]、[[容器]]
- 相关：[[容器网络]]、[[网络模型]]、[[CNI网络]]、[[Service]]、[[Pod]]、[[微服务]]、[[Kubernetes]]
- 反例/误区：用 `--link` 做生产互联（已被自定义网络取代）；以为 `EXPOSE` 会自动开端口。

## 来源
- 《Docker实战(图解)》（docker-tujie，TEXT 真实文本）ch03 网络和存储原理
- 《Docker从入门到实践》（docker-rumen，MIXED 图片混排）ch11 使用网络
- 《Docker经典实例》（docker-jingdian，TEXT 真实文本）网络/端口映射实例
- 补充：本书（PDF 为图片版，结合章节结构整理）——Docker书 / Docker实战 文本极少，以知识补全
