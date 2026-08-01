---
类型: 概念
主题: Helm
tags: [概念]
创建: 2026-07-21
复习: 
状态: 种子
---

# Helm

## 一句话定义
Helm 是 Kubernetes 的**包管理器**（常被叫「K8s 的 apt/yum」）：用「Chart」（一串参数化的 YAML 模板）把一整套应用（Deployment+Service+[[ConfigMap]]+…）打包，一条命令就能安装/升级/回滚。

## 它解决什么问题 / 为什么存在
一个真实应用往往要写十几个 YAML（Deployment、Service、[[PV与PVC]]、Ingress…），手写易错、难复用、难版本化。Helm 用**模板 + 值文件（values.yaml）**把这些 YAML 参数化：同一份 Chart，传不同 values 就部署出不同环境/实例，还能像软件包一样发版本、回滚。

## 核心原理（大二能懂的水平）
- **Chart** = 模板目录（`templates/*.yaml` 里用 `{{ .Values.xxx }}` 占位）+ `Chart.yaml`（元信息）+ `values.yaml`（默认值）。
- `helm install <名> <chart>` 渲染模板生成最终 YAML 再交给 Kubernetes；`helm upgrade` 升级，`helm rollback` 回滚，`helm uninstall` 卸载。
- Helm 3 起去掉了服务端 Tiller，直接用 [[kubectl]] 上下文操作，更安全。
- 还能用 **Helm Hook**（如 `pre-install`、`post-upgrade`）在生命周期节点跑 Job 做迁移/初始化。

## 关键参数 / 易错点
- `values.yaml` 是覆盖入口；`--set key=val` 可命令行临时覆盖。
- **易错**：模板里 `{{ }}` 语法错会导致渲染失败，排错用 `helm template` 先看生成的最终 YAML。
- **易错**：Chart 版本和 values 要一起进 Git 版本管理，否则回滚应用却回不到当时的配置。
- **易错**：别在 Chart 里写死敏感值——密码走 [[Secret]]，values 里用占位符从外部注入。

## 类比（帮助理解）
Helm 像「应用商店 + 装修模板」：Chart 是「精装房方案」（含水电/家具清单），values 是「你选的墙色和地板」；开发商（Helm）按方案+你的选择把整套房一次性装好，不满意还能退到上一版装修。

## 设计时怎么用（反推思维）
> 做 XX 系统时，我会用它能解决 YY。
做要给多个团队/多个环境/多个客户重复部署同一套复杂应用的系统时，我会把它做成 Helm Chart，用 values 区分环境，进 Git 做版本与回滚；既统一了部署标准，又让 [[CI-CD]] 流水线一条命令完成发布。

## 典型应用 / 我在哪见过
- 本书未专门讲 Helm（偏运维包管理），第2/12章强调声明式 YAML 与配置即代码，Helm 是其自然延伸。
- 业界常见：用 Helm 一键装 Prometheus、Ingress-Nginx、数据库中间件等。

## 关联
- 前置知识：[[YAML]] [[Deployment]] [[Service]] [[ConfigMap]] [[kubectl]] [[声明式API]]
- 相关：[[CI-CD]]（流水线里 `helm upgrade`）、[[滚动更新与回滚]]（Helm 自带 rollback）、[[Ingress入门]]
- 反例/误区：手写几十个 YAML 还不版本化（应用 Helm/模板化）

## 来源
- 本书第2章（声明式 YAML）、第12章（配置即代码/CI-CD）提及理念，Helm 本身无独立章节。结合通用 Kubernetes 知识补全（本书未覆盖，结合通用知识整理）。
