---
类型: 概念
主题: Helm Release
tags: [概念]
创建: 2026-07-21
复习: 
状态: 种子
---

# Helm Release

## 一句话定义
> Helm Release（发布 / 实例）是"某个 chart 在 K8s 集群里的一次具体安装"。同一个 chart 能装出多个 Release（同名但不同 namespace）。

## 它解决什么问题 / 为什么存在
- K8s 集群里常要跑同一个应用的多个实例（比如给 A、B 两个项目各装一个 MySQL），但操作系统包管理"同软件只装一次"的模型不适用。
- 需要区分"软件包（chart）"和"装出来的实例（release）"，并追踪每次改动的版本，便于升级与回滚。

## 核心原理（大二能懂的水平）
- `helm install NAME CHART` 创建 release 的 v1；`helm upgrade` 生成 v2、v3…… 每次 install / upgrade / 配置变更 / rollback 都会产生一个新 revision（版本）。
- Helm3 把每个 release 记录存成一条特殊的 K8s [[Secret]]（类型 `helm.sh/release.v1`），默认最多保留 10 个 revision，超出删最旧的。
- 状态机：pending-install → deployed；升级时 pending-upgrade →（旧版变 superseded，新版 deployed）；失败为 failed；卸载为 uninstalling / uninstalled。
- 管理命令：`helm list`（看已装）、`helm history`（看版本历史）、`helm rollback`（回退）、`helm get`（取 values/manifest/notes）、`helm uninstall`（删，Helm3 默认删历史，加 `--keep-history` 可保留并回滚）。
- Helm3 的 release 名作用域是 namespace（同一 namespace 内唯一，不同 namespace 可重名）。

## 关键参数 / 易错点
- 升级务必每次都传 `--values`，否则配置会被默认值覆盖回退（本书 2.6.1）。
- 不要混用 `--reuse-values` 与 `--set`/`--values`，会让配置来源不可追溯。
- `helm rollback` 是"重新提交旧配置"，不是集群快照；若资源被 `kubectl edit` 手动改过，回滚会产生三向 diff，可能保留/合并/覆盖手工改动。
- Helm3 卸载默认删历史（与 Helm2 相反）；想保留用 `--keep-history`。
- 高级标志：`--wait`（等 Pod 就绪才算成功）、`--atomic`（失败自动回滚）、`--create-namespace`、`--generate-name`。

## 类比（帮助理解）
- chart 是"安装程序"，release 是"装好的那一份软件"；一次升级 = 多了一个版本号，像 Git 的一次 commit，能 checkout 回旧版。

## 设计时怎么用（反推思维）
> 做 XX 系统时，我会用 release 名区分环境 / 租户（如 mysite-dev、mysite-prod），用 revision + rollback 做变更与快速回退，把"部署"当成有版本的历史来管理。

## 典型应用 / 我在哪见过
- 本书第2章（安装 bitnami/drupal 为 mysite）、第3章（history / rollback / 失败状态演练）。

## 关联
- 前置知识：[[Helm Chart]] [[Kubernetes]] [[Helm]]
- 相关：[[values.yaml]] [[应用包管理]] [[Helm仓库]] [[Namespace]]
- 反例/误区：回滚不能恢复被手动改过的内容；release 不是 Pod，它是一组 K8s 资源的"安装实例"。
- 教程笔记：[[06-Helm学习指南]]

## 来源
- 本书第1章（1.3.3）、第2章（2.4–2.7）、第3章（发布版本信息 / 历史回滚）。
