---
类型: 教程
来源: 《Helm 学习指南 - Kubernetes 上的应用程序管理》(helm-guide)
tags: [教程]
创建: 2026-07-21
状态: 已读待消化
---

# Helm 学习指南

## 这条教程在解决什么
- 教读者把"手写 K8s YAML"升级为"用 Helm 做应用打包与版本化交付"：把一组 K8s 资源（Deployment/Service/ConfigMap/Secret…）打包成可复用、可配置、可分发、可回滚的 Helm Chart。
- 主线：Helm 把 K8s 的 YAML 打包成可复用 Chart → 用 values.yaml 参数化 → 用 Release 管理实例 → 用仓库分发。

## 关键内容（按 PDF 章节提纲）
- 第1章 Helm 简介：云原生与 K8s 背景；Helm 三目标（从零到 K8s、类 OS 包管理、安全/可重用/可配置）；核心概念 chart / 模板 / 发布；Helm3 已移除 Tiller。
- 第2章 使用 Helm：安装 helm 客户端；`helm repo add` 加仓库（Helm3 无默认 stable）、`helm search` 搜索；`helm install NAME CHART` 安装（区分 chart 与 release）；`--values` / `--set` 配置；`helm list` / `helm upgrade`（每次都要传 values，否则回退默认）/ `helm uninstall`（Helm3 默认删历史）。
- 第3章 Helm 的高级功能：安装五阶段（加载 chart→解析值→渲染模板→转 YAML→发 K8s）；`--dry-run` 与 `helm template`（不连集群、适合 CI）；release 记录存为 Secret、状态机（pending/deployed/superseded/failed…）；`helm get`（values/manifest/notes）、`helm history` / `helm rollback`；`--generate-name`、`--create-namespace`、`--wait`、`--atomic`、`--force`、`--reuse-values`（慎用）。
- 第4章 构建 chart：`helm create` 生成脚手架（anvil 示例）；Chart.yaml（apiVersion v2、name、version 必填）；改 templates/；values.yaml（镜像、service、ingress.enabled、resources）；`helm package`（name-version.tgz）、`.helmignore`、`helm lint`。
- 第5章 开发模板：Go 文本模板语法；动作 `{{}}`、点 `.` 作用域（.Values/.Release/.Chart/.Capabilities/.Files）；管道、if/else/with、range、变量、define 命名模板（_helpers.tpl）；Sprig 函数（default/quote/indent/nindent/toYaml）；调试三件套（--dry-run / helm get manifest / helm lint）。
- 第6章 chart 的高级功能：依赖项（Chart.yaml dependencies、version 范围、`helm dependency update`→Chart.lock、condition/tags、import-values）；库 chart（type: library）；values.schema.json；钩子（helm.sh/hook）；测试（helm test / Chart Testing）；安全（PGP provenance，`helm package --sign` / `helm verify`）；CRD（crds/ 目录 vs 第二个 chart）。
- 第7章 chart 存储库：index.yaml 结构（entries/urls/digest）；`helm repo` 系列、`helm pull`；自建静态仓库（Python http.server、GitHub Pages、mTLS 保护）；实验性 OCI 支持（helm chart save/push/pull、registry login）；相关项目 ChartMuseum / Harbor / chart-releaser。
- 第8章 Helm 插件和启动程序：插件（`helm plugin install`、plugin.yaml 定义子命令、hooks、downloader 插件、环境变量、shell 完成）；启动程序（starter，把 chart 转成 `helm create --starter` 的模板，`<CHARTNAME>` 占位）。
- 附录A chart API 版本：v2（Helm3，含 type/dependencies）vs v1（Helm2，用 requirements.yaml、无库 chart）；SemVer 版本号规则。
- 附录B chart 存储库 API：唯一的必需端点 `GET /index.yaml`；.tgz / .prov 文件的下载时机。

## 我卡住/没懂的地方
- 一开始分不清 chart（包）和 release（实例）两个概念——本书反复强调"安装的是 release，不是 chart"，这是 Helm 思维的关键切换点。
- `helm template` 与 `--dry-run` 的区别（前者纯渲染不连集群、不校验 CRD；后者连集群做验证但混有非 YAML 输出）容易混。
- release 记录默认存成 Secret、且 Helm3 卸载默认删历史——和"配置管理"心智不同，需要刻意记。

## 它背后的原理（别只记操作）
- Helm 本质是"K8s 上的包管理器"：把"声明式 YAML"当作"包内容"，用模板引擎做参数化，用 release 记录做版本化，用仓库做分发。
- 渲染管线是核心：值合并（默认 < 文件 < --set）→ 模板执行 → YAML → K8s 校验 → 接受则 deployed。理解这条管线，就理解了 install/upgrade/rollback/--dry-run 的一切行为。
- K8s 与 OS 不同（多实例、有 namespace）决定了 Helm 必须引入 release 名 + namespace 作用域，而不是简单"装一个软件"。

## 我能复用/改编的点
> 换个需求，这套做法还能怎么用？
- 自研服务：用 `helm create` 起脚手架，把 Deployment/Service/Ingress 抽成模板 + values，环境差异全走 values.yaml（dev 最小、prod 全开）。
- 多环境发布：用 values.schema.json 约束配置、用 `helm lint` 进 CI、用 `helm template` 在 CI 里预渲染检查。
- 多 chart 编排：用 [[Helmfile]] 把一整套中间件栈声明成一个文件，环境用 environments 切换。
- 私有分发：把 chart 推到 ChartMuseum / Harbor / GitHub Pages，团队 `helm repo add` 统一安装。

## 关联
- 概念：[[Helm Chart]] [[values.yaml]] [[Helm仓库]] [[Helm Release]] [[Chart模板]] [[应用包管理]] [[Helmfile]]
- 其他（由他 agent 拥有，仅链接）：[[Helm]] [[Kubernetes]] [[YAML]] [[容器]] [[Pod]] [[Deployment]] [[Service]] [[ConfigMap]] [[Secret]] [[Namespace]] [[RBAC]] [[CI-CD]] [[微服务]] [[云原生]]
- 项目：

## 来源
- 《Helm 学习指南 - Kubernetes 上的应用程序管理》（helm-guide）；章节文本来自 `.cache/helm-guide/` 的 ch07–ch16（第1–8章 + 附录A/B），文本抽取质量良好，按真实章节标题整理；其中 Helmfile 仅在第1章一处提及，已结合官方项目知识补全。
