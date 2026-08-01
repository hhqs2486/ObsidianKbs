---
类型: 概念
主题: values.yaml
tags: [概念]
创建: 2026-07-21
复习: 
状态: 种子
---

# values.yaml

## 一句话定义
> values.yaml 是 chart 的"默认配置表"：存放可以被用户覆盖的参数，让同一个 chart 在不同环境（dev / prod）用不同配置跑起来。

## 它解决什么问题 / 为什么存在
- K8s 资源里大量"可变项"（镜像 tag、副本数、是否开 Ingress、资源限制）不该写死在模板里。
- values.yaml 把这些可变项抽出来做默认值是文档，用户再用文件或 `--set` 覆盖，实现"一套模板、千种配置"。

## 核心原理（大二能懂的水平）
- chart 根目录的 values.yaml 提供默认值；模板里用 `.Values.xxx` 读取。
- 值合并优先级（后者覆盖前者）：chart 默认 values.yaml < `-f`/`--values` 传入的文件 < `--set` 传入的单个值。
- "开关模式"：如 `ingress.enabled: false`，模板里用 `if` 决定是否生成 Ingress 清单（第4、5章）。
- `image.tag` 默认取 Chart.yaml 的 appVersion；`image.pullPolicy` 默认 IfNotPresent（用浮动 tag 时应设 Always）。

## 关键参数 / 易错点
- 易错（重要）：升级时忘记再次传 `--values`，会导致配置回退到默认值（本书 2.6.1）。务必每次 install/upgrade 都传一致的 values 文件。
- `--reuse-values` 不要和 `--set`/`--values` 混用，会让配置来源混乱、难以排查。
- values.yaml 本身无强制结构（无 schema）；第6章可用 values.schema.json 做 JSON Schema 校验（pullPolicy 枚举、类型检查等）。
- 敏感信息（口令、token）不要明文写进 values.yaml，应走 Secret / helm-secrets 插件。
- 被注释掉的值 = 空值（该配置项未启用）。

## 类比（帮助理解）
- 像点奶茶时的"可选配料表"：默认半糖少冰，你可以改成全糖，配方（模板）不变。

## 设计时怎么用（反推思维）
> 做 XX 系统时，我会把一切"环境相关项"抽到 values.yaml，让同一个 chart 既能最小部署到 dev，又能开全功能部署到 prod，而不是为不同环境复制整套 YAML。

## 典型应用 / 我在哪见过
- 本书 anvil chart 的 values.yaml（镜像、service 类型、ingress.enabled、resources 限制，第4章）。
- Drupal chart 通过 `drupalUsername` 等覆盖管理员配置（第2章）。

## 关联
- 前置知识：[[Helm Chart]] [[Chart模板]] [[YAML]]
- 相关：[[Helm Release]] [[Helmfile]] [[应用包管理]]
- 反例/误区：values.yaml 不是 K8s 清单，它只是"给模板喂的数据"；它没有强制 schema（第6章才可选加）。
- 教程笔记：[[06-Helm学习指南]]

## 来源
- 本书第1章（1.3.2）、第2章（2.4.1）、第4章（4.4）、第6章（6.3）。
