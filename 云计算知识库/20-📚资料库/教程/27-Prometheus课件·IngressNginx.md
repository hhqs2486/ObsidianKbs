---
类型: 教程
资料: Prometheus课件笔记（云原生大礼包#9）
tags: [教程]
创建: 2026-07-21
---

# Prometheus 课件·Ingress Nginx（ingress-nginx 控制器实战）

> 源：V2.0 `chap07 Ingress Nginx`（6、Nginx Ingress.docx + ingress.yaml + nginx.json + request-handling-performance.json + 第六章 Ingress.ppt）。

## 概述
本章专讲 **ingress-nginx** 这个 K8s 最主流的 Ingress Controller 怎么部署、怎么用注解调行为、怎么暴露监控指标。先把"ingress-nginx（社区）"和"nginx-ingress（Nginx 公司）"两个项目分清，再给一整套生产级 YAML。

## 核心要点（按课件结构）
- **两个项目别混**：`ingress-nginx` = Kubernetes 社区维护；`nginx-ingress` = Nginx 公司官方维护，注解体系不同。
- **部署形态**：DaemonSet + `hostNetwork: true` 跑在专用边缘节点（配节点亲和/污点 + QoS），直接监听 80/443；自带 RBAC（ServiceAccount / ClusterRole / RoleBinding）。
- **配置作用域**：ConfigMap 全局（如 `block-cidrs` 黑名单）、Annotations 单 Ingress 生效（如白名单）——**黑名单用 ConfigMap，白名单用 Annotations**。
- **常用注解**：
  - `rewrite-target: /$2`（路径重写，配 `path: /something(/|$)(.*)`）
  - `ssl-redirect: "false"`（关 HTTPS 强跳）
  - `permanent-redirect`（整站跳转）
  - `whitelist-source-range`（来源白名单）
  - `canary`（灰度/金丝雀）
- **TLS**：Ingress `tls` 挂 `secretName` 证书；`--default-ssl-certificate` 设默认证书。
- **监控**：Controller 暴露 Prometheus 指标（端口 `10254`，注解 `prometheus.io/scrape: "true"`），可直接被 [[Prometheus]] 抓，配 Grafana 仪表盘。

## 关联概念卡
- 核心：[[ingress-nginx]] [[Ingress入门]] [[Service]] [[Kubernetes]]
- 部署：[[DaemonSet]] [[RBAC]] [[资源限制与QoS]]
- 监控：[[Prometheus]] [[监控Kubernetes集群]]

## 来源
- V2 章07：`.cache/V2章07Ingress/full.txt`
