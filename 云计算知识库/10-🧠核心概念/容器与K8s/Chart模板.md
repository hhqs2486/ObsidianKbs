---
类型: 概念
主题: Chart模板
tags: [概念]
创建: 2026-07-21
复习: 
状态: 种子
---

# Chart模板

## 一句话定义
> Chart 模板（templates/ 下的文件）是用 Go 文本模板语言写的 K8s 清单"骨架"：Helm 渲染时把值注入其中，生成最终 YAML 发给 K8s。

## 它解决什么问题 / 为什么存在
- 纯 YAML 写死后无法参数化、无法复用逻辑、跨集群适配困难。
- 模板让"一个 chart 适配多种配置、多种集群能力"，是 chart 的核心（本书称模板构成 chart 的大部分内容）。

## 核心原理（大二能懂的水平）
- 动作 `{{ }}` 包裹逻辑，动作外的内容原样输出。点（`.`）是根作用域对象，包含：`.Values`（用户值）、`.Release`（发布信息，如 .Release.Name/.Namespace）、`.Chart`（Chart.yaml，如 .Chart.Name/.Version）、`.Capabilities`（集群能力，如 .Capabilities.KubeVersion/.APIVersions.Has）、`.Files`、`.Template`。
- 语言特性：管道 `|`（如 `.Values.x | default "rocket" | quote`）、`if/else/with`（with 会改作用域）、`range` 循环（遍历 list/dict）、变量 `$x := ...`、define 命名模板（放 `_helpers.tpl`，用 `include` 调用）。
- 函数来自 Sprig 库：`default`、`quote`、`indent`/`nindent`（缩进）、`toYaml`/`toJson`（转格式）。
- 集群交互：`{{ .Capabilities.APIVersions.Has "apps/v1" }}` 检查资源是否可用；`lookup` 函数查集群内资源（但 `helm template` 试运行不连集群，返回空）。

## 关键参数 / 易错点
- 属性名大写开头：`.Values`、`.Chart.Name`（Chart.yaml 里是小写，模板里大写）——这是 Go 的公有/私有约定。
- `{{-` 去掉前导空格、`-}}` 去掉尾随空格，缩进错会导致 YAML 解析失败。
- 缩进大坑：用 `toYaml` 配合 `nindent` 输出嵌套 YAML（如 securityContext），否则清单会因缩进错误失败。
- 易错：`id: e12345` 这类会被 YAML 当成科学记数法，需 `quote` 包成字符串。
- `helm template` 不连集群、不校验 CRD；`--dry-run` 连集群但混有非 YAML 信息。调试三件套：`--dry-run`、`helm get manifest`、`helm lint`（第5章）。

## 类比（帮助理解）
- 像邮件"模板 + 填充字段"，或者填空题：骨架写好，空白处用 `{{ .Values.xxx }}` 填。

## 设计时怎么用（反推思维）
> 做 XX 系统时，我会把 K8s 清单写成模板，把可变项用 `{{ .Values.xxx | default ... | quote }}` 参数化；把多处复用的片段抽成 `_helpers.tpl` 命名模板（如通用 labels），保持 DRY。

## 典型应用 / 我在哪见过
- 本书第4章（anvil chart 的 deployment.yaml / service.yaml）、第5章（模板语法、命名模板、调试）。

## 关联
- 前置知识：[[Helm Chart]] [[values.yaml]] [[YAML]] [[Kubernetes]]
- 相关：[[应用包管理]] [[Helm Release]]
- 反例/误区：模板不是普通 YAML，单独看是带 `{{}}` 的文本；`helm template` 渲染结果不校验集群 CRD。
- 教程笔记：[[06-Helm学习指南]]

## 来源
- 本书第1章（1.3.2）、第4章（4.3）、第5章（开发模板）；结合 Helm v3 知识整理。
