---
类型: 概念
主题: 配置语言
tags: [概念]
创建: 2026-07-21
复习: 
状态: 种子
---

# YAML

## 一句话定义
> YAML 是一种"对人类友好、以数据为中心"的配置文件格式，K8s 里所有资源（Pod、Service、Deployment…）都用它声明期望状态。

## 它解决什么问题 / 为什么存在
- JSON 太啰嗦、括号易错；YAML 用缩进表达结构，可读性高，适合手写和版本管理。
- K8s 的"声明式 API"依赖结构化文本描述资源，YAML 是官方主推格式（也兼容 JSON，YAML 是 JSON 的超集）。

## 核心原理（大二能懂的水平）
- 两种核心结构：
  - Map（键值对）：`apiVersion: v1`、`kind: Pod`
  - List（列表）：以 `-` 开头，可嵌套在 Map 里
- 关键语法：大小写敏感；用空格缩进表示层级（禁用 Tab）；`#` 注释；相同层级左对齐即可，空格数不重要。
- K8s 资源通用骨架：`apiVersion`(API版本) / `kind`(资源类型) / `metadata`(资源自身属性，如 name) / `spec`(期望状态)。
- `kubectl apply -f xxx.yaml` 把它交给 [[APIServer]] 落实。

## 关键参数 / 易错点
- 易错：用 Tab 缩进 → 解析失败，必须空格。
- 易错：层级缩进不对（多/少空格）导致字段归错父级。
- 易错：`metadata.name` 与 `spec` 里模板的 name 混淆；注意 `metadata` 是"资源自身"，`spec` 是"资源内容"。
- 易错：冒号后要有空格（`key: value`）。

## 类比（帮助理解）
- YAML 像"填表"：表头(Map)写"姓名: 张三"，逐行缩进表达"家庭→成员→…"的从属；只要对齐、别用制表符，机器就能读懂这张表。

## 设计时怎么用（反推思维）
> 做 XX 系统时，我会用它能解决 YY。
- 把所有 K8s 部署写成 YAML 存进 Git（基础设施即代码），用 `kubectl apply -f` 部署，做到可复现、可回滚、可 review，而不是敲一堆命令行参数。

## 典型应用 / 我在哪见过
- 第4章 4.1.4 专门讲 YAML 语法与 Deployment YAML 结构；全书的 nginx-deployment.yaml、service.yaml、mysql-statefullset.yaml 等都是 YAML。

## 关联
- 前置知识：[[kubectl]] [[声明式API]]
- 相关：[[Pod]] [[Deployment]] [[Service]] [[Namespace]] [[APIServer]] [[Helm]]
- 反例/误区：把 YAML 当编程语言（它只是数据描述，逻辑在控制器里）

## 来源
- 《Kubernetes零基础快速入门 2021.3》第4章 4.1.4
