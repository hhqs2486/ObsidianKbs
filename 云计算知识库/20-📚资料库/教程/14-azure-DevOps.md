---
类型: 教程
来源: 
tags: [教程]
创建: 2026-07-21
状态: 已读待消化
---

# 14-azure-DevOps

## 这条教程在解决什么
- 搞懂「Azure DevOps 到底是什么、怎么用」——微软云上的一站式 DevOps 平台，把计划、代码、构建、测试、部署、反馈整到同一个门户。重点是：[[Azure Pipelines]] 把代码自动变成可交付产物，是整套平台的核心引擎；它落地了 [[CI-CD]] 与 [[流水线即代码]]。

## 关键内容（按 PDF 章节提纲）
- 入门 / 什么是 Azure DevOps：五大服务 **Boards、Repos、Pipelines、Test Plans、Artifacts**；支持 Web 与 IDE 客户端；可选云(Services)或本地(Server)。
- 开始使用：注册组织（`https://dev.azure.com/{org}/{project}`）；连接项目可用 Web 门户 / Visual Studio / VS Code / IntelliJ / Android Studio 等客户端；先设 Git 或 TFVC。
- 集成概述：左侧垂直导航栏是功能入口（Boards / Repos / 管道 / Artifacts / Test Plans）；仪表板 + 小组件做个性化视图；服务挂钩(Service Hooks)把事件推给 Slack 等。
- Web 门户导航 / Search：Repos / Pipelines 等页内置代码搜索，可跨项目搜代码。
- Migrate：本地 Azure DevOps Server 用数据迁移工具分阶段迁到 Services（验证 → 准备测试运行 → 测试运行 → 生产迁移 → 迁移后）。
- 权限和访问权限：访问级别 Stakeholder / Basic 控制功能与计费；用 Microsoft Entra ID 组管理更安全；Server 用 AD 组同步。
- 状态和安全性：Services 99.9% SLA、数据保护；建议用 Entra 而非个人账户；限制作业授权范围到最低。
- IDE 客户端资源 / 资源 / DevOps 资源中心：YAML 架构参考、CLI（`az pipelines` / `az artifacts`）、多阶段管道、CI 触发器、状态徽章等。

## 我卡住/没懂的地方
- ch01–ch10 原书为图片版，纯文字抽取几乎为空；真正可读内容集中在 ch11「DevOps 资源中心」（概述 / 快速入门 / 参考）。部分操作细节（如 TFVC、Server 报表 SSRS）需看原图或官网补全。
- 「持续交付」与「持续部署」的边界，原书未细区分，需结合 [[CI-CD]] 通用概念理解（见 [[持续交付]]）。

## 它背后的原理（别只记操作）
- 本质是把软件交付的每一步「服务化 + 自动化」：规划(Boards) → 源码(Repos, [[Git]]) → 自动构建测试部署([[Azure Pipelines]]，即 [[CI-CD]]) → 制品沉淀([[制品仓库]]) → 测试反馈(Test Plans)。
- 核心是 [[流水线即代码]]：用 `azure-pipelines.yml` 声明「阶段 / 作业 / 步骤」，由平台分配代理执行，把交付能力本身变成版本控制的代码。
- 这与通用 DevOps / [[微服务]] / [[Kubernetes]] 部署完全打通：Pipelines 产出镜像 / 包，交给 [[容器]]、[[Kubernetes]]、[[负载均衡]]、[[高可用]] 去运行。

## 我能复用/改编的点
> 换个需求，这套做法还能怎么用？
- 即使不用 Azure，也套用同一套路：写一个流水线定义文件（GitHub Actions / GitLab CI 同理），连接「提交即构建测试、过测即部署」。
- 多服务系统：每个 [[微服务]] 一条流水线，共享一个 [[制品仓库]] 的 feed，部署到同一个 [[Kubernetes]] 集群，用 [[负载均衡]] 对外暴露。

## 关联
- 概念：[[Azure DevOps]]、[[Azure Pipelines]]、[[持续交付]]、[[流水线即代码]]、[[Azure]]、[[制品仓库]]、[[CI-CD]]、[[Git]]
- 项目：（本 agent 不建项目实战）

## 来源
- 本书（PDF 为图片混排版，结合章节结构整理）；目录 `.cache/azure-devops/` 下 ch01–ch11，正文主要来自 ch11_DevOps 资源中心.txt。
