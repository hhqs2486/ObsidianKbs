---
类型: 教程
来源: Docker 技术栈 5 本 + 10个精选的容器应用案例
tags: [教程]
创建: 2026-07-21
状态: 已读待消化
---

# 18-Docker技术栈实战

## 这条教程在解决什么
- 把 5 本 Docker 书（《Docker书》《Docker实战》《Docker实战(图解)》《Docker经典实例》《Docker从入门到实践》）和《10个精选的容器应用案例》消化成**一条主线**：
  **Docker 用「镜像」打包应用、用「容器」隔离运行、用「Dockerfile」声明构建、用「数据卷」持久化、用「网络」连通、用「多阶段构建」瘦身**——帮读者从「会敲 `docker run`」走到「懂镜像分层与构建原理」。

## 关键内容（按主题）

### 一、镜像与 Dockerfile（打包应用）
- **核心概念卡**：[[Dockerfile]]、[[容器镜像]]。
- 镜像不是单个文件，而是**分层存储**：每一条会改文件系统的指令（RUN/COPY/ADD）叠加一层，前层只读、后层只记差异；底层基础 Linux + 上层应用，靠 Union FS / overlay2 联合挂载（见《图解》ch03、《入门到实践》ch05、ch07）。
- Dockerfile 是镜像的「菜谱」：`FROM` 选底包（优先 alpine / slim）、`RUN` 构建期执行、`CMD`/`ENTRYPOINT` 定启动入口、`COPY` 拷文件、`ENV` 固化环境变量、`ARG` 仅构建期、`WORKDIR`/`EXPOSE`/`VOLUME` 配置运行环境（《图解》ch04 完整指令表）。
- 镜像寻址 `<仓库名>:<标签>`，默认 `latest`；集中存储分发靠 [[镜像仓库]]（Docker Hub / 阿里云加速器等）。
- 经典配方（《经典实例》1.14、2.3）：`FROM busybox` / `FROM ubuntu:14.04` 起手，`docker build -t name .` 出镜像。

### 二、容器运行（隔离运行）
- **核心概念卡**：[[容器]]（见 [[Docker]]）。
- 镜像与容器 = 类与实例；容器实质是一个运行在自己 Network/Mount/PID 等 namespace 里的进程，靠 **namespace 做隔离、cgroups 做资源限制**（《图解》ch01：UTS/IPC/PID/Network/Mount/User 六类隔离 + cpu/memory 等子系统）。
- 容器可写层（UpperDir）生命周期=容器生命周期，删容器即丢；最佳实践：**容器无状态化，写操作走 [[Docker数据卷]] 或 bind mount**（《入门到实践》ch05）。
- 常用命令：`docker run`（`-d` 后台、`-p` 映射、`-e` 传环境、`-v` 挂卷、`--net` 指定网络）、`docker exec -it` 进容器、`docker ps -s` 看真实写层大小。

### 三、数据卷（持久化）
- **核心概念卡**：[[Docker数据卷]]。
- 三种挂载：**Volumes**（Docker 托管，最推荐）/ **Bind mounts**（挂宿主机绝对路径，危险）/ **tmpfs**（仅内存）。写法上 `-v` 以 `/` 开头=bind、否则=具名卷（《图解》ch03、《入门到实践》ch10）。
- 陷阱：bind mount 空目录会遮盖容器内原内容致启动失败；删容器想连卷删用 `docker rm -v`；无主卷用 `docker volume prune` 清理。
- 有状态服务（MySQL/Redis）务必挂卷；`VOLUME /var/lib/mysql` 是官方 MySQL 镜像的标准做法（《经典实例》wordpress+mysql 栈）。

### 四、网络（连通）
- **核心概念卡**：[[Docker网络]]。
- 默认 `docker0` 虚拟网桥 + veth pair 给每个容器分配 Container-IP；五种模式 bridge/host/none/container/自定义网络（《图解》ch03、《入门到实践》ch11）。
- 外部访问：`-p 5000:5000` 或 `-P` 随机映射；`-p` 可多次、支持 `/udp`。
- 容器互联：**`--link` 已过时，改用自定义 bridge 网络**（自带 DNS，可用主机名互 ping）；跨网络用 `docker network connect`（《图解》ch03 自建网络测试）。
- 与上层 [[Kubernetes]] 的区别见 [[容器网络]]/[[CNI网络]]/[[网络模型]]：Docker 网络是单机引擎自带，K8s 跨节点由 CNI 插件负责；多容器共享网络的做法正是 [[Pod]] 的思路。

### 五、多阶段构建（瘦身）
- **核心概念卡**：[[多阶段构建]]。
- 一个 Dockerfile 多个 `FROM ... AS stage`，构建阶段用 maven/JDK 编译，运行阶段只 `COPY --from=builder` 取 jar 进 `openjdk:8-jre-alpine`——镜像从 1GB 降到几十 MB（《图解》ch04 第11、12节）。
- 配合手段：合并 RUN 减层、同 RUN 内清 apt 缓存、`.dockerignore` 排除上下文、`scratch` 放纯静态二进制、`--no-cache` 强制重构建。
- 这是把应用做成小镜像、接 [[CI-CD]] 自动构建、上 [[Kubernetes]] 跑的「标准姿势」，也是 [[云原生]] 轻量理念的体现。

### 六、应用案例（10 个精选容器案例）
- 来源：《10个精选的容器应用案例》（InfoQ/极客邦，2016），目录列出的 10 个真实落地：
  1. **中国移动浙江公司 DCOS**：以 [[Docker]] 封装应用，Mesos+Marathon 调度，HAProxy+Confd+Etcd 做服务注册与引流，弹性支撑「双11」。
  2. **蘑菇街 11.11**：私有云平台的 Docker 应用实践。
  3. **Apple 用 Apache Mesos 重建 Siri 后端**：容器化后端服务。
  4. **阿里百川 TAE 2.0**：全架构 PaaS 的 Docker 实践（贴近 [[容器云平台]]）。
  5. **大众点评容器云平台**：运营超一年，承载大部分业务。
  6. **京东 618**：Docker 扛大旗，弹性伸缩成重点。
  7. **腾讯游戏**：如何规模化使用 Docker。
  8. **蚂蚁金融云**：Docker 在金融云平台的探索。
  9. **去哪儿网**：Mesos 实践之路。
  10. **SAE 容器云**：基于 [[Kubernetes]] 打造。
- 共性规律：都是「用 [[容器]] 把应用和环境打包 → 用 [[微服务]] 拆分 → 用编排（Mesos/K8s）调度 → 用 PaaS/DCOS 平台化交付」，印证了 [[容器]] + 编排是云原生落地的主干。

## 我卡住/没懂的地方
- 《Docker书》《Docker实战》两本是扫描图片版，抽取文本极少，几乎只能看到目录与零散片段，Dockerfile/卷/网络的具体写法主要靠通用知识补全（已在各卡「来源」标注）。
- overlay2 的 `LowerDir/UpperDir/MergedDir/WorkDir` 四个目录职责，第一次看 `docker inspect` 输出容易绕；对照《图解》ch03 的 nginx 分层示例才理清。
- `--link` 与「自定义网络自带 DNS」的区别，书上讲得分散，需要把《图解》ch03 和《入门到实践》ch11 拼起来才明白为什么 `--link` 被淘汰。

## 它背后的原理（别只记操作）
- **分层 + 写时复制（CoW）**是 Docker 省磁盘、快启动的根本：多个容器共享只读基础层，只有各自可写层不同。
- **namespace + cgroups** 是容器「隔离又受限」的底层机制，区别于虚拟机的完整 Guest OS。
- **构建期 vs 运行期**是两件事：Dockerfile 的 RUN 发生在 build，CMD/ENTRYPOINT 发生在 run；多阶段构建正是把「重构建」和「轻运行」拆到不同时机。
- **数据卷绕过容器层**是因为容器层随容器消亡，而卷由 Docker 独立管理——这是「有状态」能在「无状态容器」上成立的关键。

## 我能复用/改编的点
> 换个需求，这套做法还能怎么用？
- 写任何新服务的交付物时，先写 Dockerfile（小底包 + 多阶段），再推 [[镜像仓库]]，交给 CI 自动 build+扫描，最后 K8s 拉取跑——这是可复用的标准交付流水线。
- 需要「Web 连 DB」本地联调时，建一个自定义 bridge 网络把两容器连进去，用主机名访问，不必暴露 DB 端口，比 `--link` 稳。
- 跑数据库/缓存等有状态组件，第一时间挂 Volume，避免删容器丢数据；上 K8s 再升级为 [[PV与PVC]]。
- 想给团队做技术分享，可用「镜像=类、容器=实例」「卷=移动硬盘」「docker0=宿舍交换机」这几个类比降低理解门槛。

## 关联
- 概念：[[Dockerfile]] [[容器镜像]] [[Docker数据卷]] [[Docker网络]] [[多阶段构建]]（本批新建的 5 张卡）
- 只链接（不建）：[[Docker]] [[容器]] [[镜像仓库]] [[微服务]] [[Kubernetes]] [[云原生]] [[YAML]] [[CI-CD]] [[Pod]] [[Deployment]] [[Service]] [[容器网络]] [[网络模型]] [[CNI网络]] [[Volume]] [[PV与PVC]] [[容器云平台]]
- 项目：[[容器云平台]]（案例中多家自研 PaaS/DCOS）

## 来源
- 《Docker书》（docker-book，SCANNED 图片版，文本极少，以知识补全）
- 《Docker实战》（docker-shizhan，SCANNED 图片版，文本极少，以知识补全）
- 《Docker实战(图解)》（docker-tujie，TEXT 真实文本，ch01/ch03/ch04 为主）
- 《Docker经典实例》（docker-jingdian，TEXT 真实文本，Dockerfile/卷/网络/wordpress 栈等实例）
- 《Docker从入门到实践》（docker-rumen，MIXED 图片混排，ch05/ch07/ch10/ch11 为主）
- 《10个精选的容器应用案例》（container-cases，MIXED 图片混排，10 个企业落地案例目录与 DCOS 详述）
- 注：SCANNED/MIXED 书籍中不足处，以通用 Docker 知识补全，并在对应概念卡「来源」中标注「本书（PDF 为图片版，结合章节结构整理）」。
