---
类型: 组件参考
组件: Azure DevOps
tags: [组件参考]
创建: 2026-07-21
状态: 待精读
---

# Azure DevOps

## 基本信息
- 类别（编排/虚拟化/监控/网络/存储/CI）：CI / DevOps 平台（微软云一站式研发协作平台）
- 核心用途：把「规划工作 → 写代码 → 自动构建测试 → 部署上线 → 测试反馈」整条软件交付链路收进一个平台，支撑协作文化，让组织比传统开发方法更快地产出和改进产品。
- 官方文档链接：https://learn.microsoft.com/azure/devops/

## 关键能力/参数（摘录）
| 维度 | 说明 | 备注 |
|------|------|------|
| 架构角色 | 软件开发生命周期（SDLC）的统一门户 / 控制面 | 客户端/服务器模型；Web 门户与 IDE 客户端皆可访问 |
| 数据模型 | 组织(Organization)→项目集合→项目→工作项/仓库/管道 | Services 用「组织+项目」；Server 用「部署+项目集合+项目」 |
| 扩展性 | 扩展市场(Marketplace)、服务挂钩(Service Hooks)、REST API | 可接 Slack/Trello/自建应用 |
| 性能/规模 | Services 99.9% SLA、全球数据中心、按订阅或按用量付费 | 弹性缩放；Server 本地受自有硬件限制 |

## 五大服务（子组件）
- **Azure Boards**：看板/Scrum 规划与跟踪工作、缺陷、问题（敏捷工具：积压工作、冲刺、任务板）。
- **Azure Repos**：Git 或 TFVC 源代码管理（无限私有 Git 仓库，Git 是新项目默认）。
- **Azure Pipelines**：生成与发布服务，支撑 [[CI-CD]]（持续集成与持续交付），是整套平台的核心引擎。
- **Azure Test Plans**：手动/探索/自动化测试。
- **Azure Artifacts**：共享包（Maven/npm/NuGet/Python/通用包）并接入管道 → 见 [[制品仓库]]。

## 与其它组件的关系
- 依赖：[[Git]]（默认代码源）、[[Azure]]（云底座，Services 即云托管）、[[CI-CD]]（核心方法论）。
- 被依赖：团队日常研发全流程；与 [[Kubernetes]]、[[容器]] 配合完成部署；[[微服务]] 架构下做多服务流水线。
- 替代/竞品：GitLab CI、GitHub Actions、Jenkins（自建）、Atlassian（Jira + Bitbucket + Bamboo）。

## 设计时必看的点
- 部署前提：注册组织（`https://dev.azure.com/{org}`）或安装 Azure DevOps Server（需 SQL Server 后端）。
- 配置要点：用 Microsoft Entra ID（而非个人 Microsoft 账户）做身份验证更安全，可开启 MFA/IP 限制；访问级别(Stakeholder/Basic)控制功能与计费。
- 常见坑：Services 与 Server 功能差异（如 Services 不支持 SSRS 报表）；免费层并行作业有限（1 并发 / 月 30 小时），大团队需购买并行作业；YAML 文件必须叫 `azure-pipelines.yml` 并置于仓库根才能被自动识别。

## 选型结论
> 适合需要「开箱即用、和微软生态 / Azure 云紧耦合、少运维」的中大型研发团队。若团队已用 GitHub，可走 GitHub + [[Azure Pipelines]] 集成；若追求完全自托管与数据留在内网，选 Azure DevOps Server。

## 关联
- 用到它的项目：[[14-azure-DevOps]]
- 同类替代：[[CI-CD]]

## 来源
- 本书（PDF 为图片混排版，结合章节结构整理）；ch11_DevOps 资源中心.txt「什么是 Azure DevOps？」「服务概述」「Azure DevOps Services 与 Server 比较」。
