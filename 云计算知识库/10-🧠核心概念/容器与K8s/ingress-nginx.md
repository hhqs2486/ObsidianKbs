---
类型: 概念
主题: 容器与K8s
tags: [概念]
创建: 2026-07-21
复习: 
状态: 种子
---

# ingress-nginx

## 一句话定义
> **ingress-nginx** 是 **Kubernetes 社区官方维护的 Ingress Controller 实现**（仓库 `kubernetes/ingress-nginx`），它把 Nginx 当作反向代理，实时把 [[Ingress入门]] 声明的"域名+路径→Service"规则翻译成 Nginx 配置并生效。

## 它解决什么问题 / 为什么存在
- 先读 [[Ingress入门]]：Ingress 只是"路由规则"，真正干活的是 Controller。ingress-nginx 是生产环境最主流的 Controller 之一。
- 注意两个易混项目：
  - **ingress-nginx** = Kubernetes 社区维护（本卡主角）。
  - **nginx-ingress** = Nginx 公司官方维护（`nginxinc/kubernetes-ingress`），配置项和注解体系不同。

## 核心原理（大二能懂的水平）
- 以 **DaemonSet** 部署在几台专用节点上，`hostNetwork: true` 直接监听宿主机的 80/443（省去一层 NodePort 转发，性能更好），并通过 QoS/污点挑专用节点。
- Controller 监听集群内 Ingress 资源变化 → 动态生成/重载 Nginx 配置 → 按 host/path 转发到后端 [[Service]] → Pod。
- **两种配置作用域**：
  - **ConfigMap（全局）**：对所有 Ingress 生效，例如黑名单 `block-cidrs: 192.168.1.19`。
  - **Annotations（单 Ingress）**：只对该 Ingress 生效，例如白名单。经验法则：**黑名单用 ConfigMap，白名单用 Annotations**。
- **自带 metrics**：暴露 Prometheus 指标（默认 `10254` 端口，`prometheus.io/scrape: "true"`），可直接被 [[Prometheus]] 抓取做 Ingress 层监控。

## 关键参数 / 易错点
- **常用注解（annotations）**：
  - `nginx.ingress.kubernetes.io/rewrite-target: /$2`：路径重写（配合 `path: /something(/|$)(.*)`）。
  - `nginx.ingress.kubernetes.io/ssl-redirect: "false"`：关闭 HTTPS 强制跳转。
  - `permanent-redirect`：整站 301 跳转。
  - `whitelist-source-range`：来源 IP 白名单。
  - `canary`：灰度/金丝雀发布（按权重或 header 分流）。
- **易错**：`hostNetwork: true` 时节点 80/443 被占用，不能再用 NodePort 冲突；DaemonSet 下要配节点亲和/污点只跑在边缘节点。
- **易错**：注解前缀必须和 Controller 启动参数 `--annotations-prefix` 一致（默认 `nginx.ingress.kubernetes.io`）。
- **易错**：ingress-nginx 版本与 [[Kubernetes]] 版本有兼容矩阵，升级 K8s 前要同步核对。

## 类比（帮助理解）
ingress-nginx 是"会所里真正带路的前台"（对比 [[Ingress入门]] 只是那张"楼层导引表"）：导引表写好了，前台按表把客人领到对应办公室；前台还自带打卡机（metrics）让监控室知道每秒接待了多少人。

## 设计时怎么用（反推思维）
> 做 XX 系统时，我会用它能解决 YY。
做需要"一个域名按路径/子域名把流量分到多个服务、且要灰度/白名单/TLS"的集群时，我会装 ingress-nginx（DaemonSet+hostNetwork 在专用边缘节点），用 ConfigMap 管全局黑名单、用 Annotations 做单业务重写与灰度，并接 [[Prometheus]] 抓 10254 指标。

## 典型应用 / 我在哪见过
- V2 章07（Ingress Nginx）：ingress-nginx vs nginx-ingress 区别、DaemonSet+hostNetwork 部署、rewrite/ssl-redirect/whitelist/canary 注解、10254 指标、完整 RBAC+YAML 示例。

## 关联
- 前置/核心：[[Ingress入门]] [[Service]] [[Kubernetes]]
- 部署相关：[[DaemonSet]] [[RBAC]] [[资源限制与QoS]]（专用节点 QoS）
- 监控：[[Prometheus]] [[监控Kubernetes集群]]

## 来源
- V2 章07（Ingress Nginx）：`.cache/V2章07Ingress/full.txt`（含 6、Nginx Ingress.docx、ingress.yaml、nginx.json、request-handling-performance.json、第六章 Ingress.ppt）
- 本卡结合 ingress-nginx 官方知识整理（课件为课件文档，结合章节结构整理）。
