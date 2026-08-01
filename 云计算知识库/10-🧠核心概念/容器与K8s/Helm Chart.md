---
类型: 概念
主题: Helm Chart
tags: [概念]
创建: 2026-07-21
复习: 
状态: 种子
---

# Helm Chart

## 一句话定义
> Helm Chart 是 Helm 用来打包 Kubernetes 应用的"软件包"：一组按约定组织的目录和文件（Chart.yaml、values.yaml、templates/ 等），完整描述"如何在 K8s 里安装一个应用"。

## 它解决什么问题 / 为什么存在
- 手写 K8s YAML 散落各处、难复用、难分发、难版本化。一个 WordPress 往往要 Deployment + ConfigMap + Secret + Service + StatefulSet + RBAC 几千行 YAML。
- Chart 把一组相关资源打包成"可安装、可升级、可分享"的单元，让"装一个应用"像"装一个软件包"一样简单。

## 核心原理（大二能懂的水平）
- Chart 有两种形态：未打包的目录（如 anvil/，含 Chart.yaml、values.yaml、templates/），以及打包的 .tgz（tar+gzip，命名约定 name-version.tgz，如 anvil-0.1.0.tgz）。两者内容一致。
- 一次 `helm install` 的流程：读 chart（必要时从 [[Helm仓库]] 下载）→ 把 [[values.yaml]] 里的值注入 [[Chart模板]] 生成 K8s 清单 → 交给 [[Kubernetes]] → K8s 创建资源。
- 标准结构：Chart.yaml（元数据/版本/依赖）、values.yaml（默认配置）、templates/（K8s 清单模板）、charts/（依赖的子 chart）、crds/（自定义资源定义，Helm 不模板化也不自动升级）、templates/NOTES.txt（安装后提示）、templates/tests/（测试）。

## 关键参数 / 易错点
- Chart.yaml 三个必填：apiVersion（Helm3 用 v2）、name（只能小写字母数字 `-` `.`，且以字母/数字开头结尾）、version（必须 SemVer，如 0.1.0）。
- 镜像位置不要硬编码进模板，应通过 values 注入，便于换环境。
- Helm3 默认没有 stable 仓库，需要自己 `helm repo add`（如 bitnami）。
- 易错：把 chart 当成"容器镜像"——chart 不打包镜像，只打包 K8s 资源描述；镜像仍从 [[容器]] 镜像仓库拉取。

## 类比（帮助理解）
- 像 apt 的 `.deb` / Homebrew 的 formula：把"安装说明书 + 食材清单"打包成一份菜谱，别人拿到就能复现同一道菜。

## 设计时怎么用（反推思维）
> 做 XX 系统时，我会用 Helm Chart 把整套 K8s 资源（[[Deployment]]/[[Service]]/[[ConfigMap]]/[[Secret]]…）打包成一个可复用、可版本化的交付物，而不是让每个人手写一堆 YAML。

## 典型应用 / 我在哪见过
- 本书示例 anvil chart（第4章）、bitnami/drupal、WordPress chart（第1、2章）。
- 日常：公司内部的"中间件栈"常以 chart 形式分发给各团队。

## 关联
- 前置知识：[[Helm]] [[Kubernetes]] [[YAML]]
- 相关：[[values.yaml]] [[Chart模板]] [[Helm Release]] [[Helm仓库]] [[应用包管理]]
- 反例/误区：chart 不是容器镜像（镜像来自 [[容器]] 镜像仓库），它只打包 K8s 资源描述。
- 教程笔记：[[06-Helm学习指南]]

## 来源
- 本书第1章（1.3.2 chart）、第4章（构建 chart）；结合 Helm v3 知识整理。
