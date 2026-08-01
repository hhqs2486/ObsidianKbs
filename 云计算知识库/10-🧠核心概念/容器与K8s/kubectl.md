---
类型: 概念
主题: 容器与K8s
tags: [概念]
创建: 2026-07-21
复习: 
状态: 种子
---

# kubectl

## 一句话定义
> kubectl 是 K8s 的命令行"大管家"：通过它对集群发指令、管理所有资源对象（Pod、Service、Deployment…），可装在任意能连 Master 的机器上。

## 它解决什么问题 / 为什么存在
- 集群里有几十种资源，需要统一入口去创建/查看/改/删，而不是每台机器登上去手动操作。
- kubectl 把你的命令翻译成对 [[APIServer]] 的 REST 调用（[[RESTfulAPI]]），是人和集群之间最主要的交互通道。

## 核心原理（大二能懂的水平）
- 语法：`kubectl [command] [type] [name] [flags]`
  - command：操作（create/get/describe/apply/delete/exec/run/scale/label…）
  - type：资源类型，大小写敏感，可单/复/缩写（pod/pods/po）
  - name：资源名，大小写敏感
- `kubectl apply -f xxx.yaml`：按 YAML 声明式地创建/更新（推荐，配置可像代码一样管理）。
- `kubectl create -f xxx.yaml`：创建（已存在会报错）。
- 它最终都打到 APIServer，由控制平面去落实。

## 关键参数 / 易错点
- `-f`：从 YAML/JSON 文件读配置；`-o wide/yaml/json`：控制输出格式。
- `-n <命名空间>`：指定空间，漏了就默认 default。
- `--show-labels`、`-l <标签>`：按标签筛选（配合 [[Label与Selector]]）。
- 易错：资源类型/名字大小写写错导致 "not found"。
- 易错：用 `kubectl run` 临时建的东西和 YAML 管理的东西混在一起，难以追溯——正式环境尽量用 apply + 文件。

## 类比（帮助理解）
- kubectl 像"遥控器"：你按"开机(create)/查状态(get)/换台(apply)"，真正干活的是电视里的电路(控制平面)；遥控器不用对着电视(可装在别的电脑)，只要能连上就行。

## 设计时怎么用（反推思维）
> 做 XX 系统时，我会用它能解决 YY。
- 把 kubectl 当"调试与应急"工具 + 用 `apply -f` 做"正式部署"；所有 YAML 进版本库，做到"部署即代码"。

## 典型应用 / 我在哪见过
- 第3章整章；第4章 run/scale/exec/delete；第5章 get svc/endpoints；第10章 cordon/drain/label；第11章 apply 部署。

## 关联
- 前置知识：[[YAML]] [[APIServer]] [[RESTfulAPI]]
- 相关：[[Deployment]] [[Service]] [[Pod]] [[Namespace]] [[Label与Selector]] [[集群搭建kubeadm]] [[kubelet]]
- 反例/误区：把它当唯一部署方式（应与 YAML/Helm 配合，保证可复现）

## 来源
- 《Kubernetes零基础快速入门 2021.3》第3章
