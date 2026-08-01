---
类型: 概念
主题: Job与CronJob
tags: [概念]
创建: 2026-07-21
复习: 
状态: 种子
---

# Job与CronJob

## 一句话定义
Job 是 Kubernetes 里运行**「一次性批处理任务」**的控制器——Pod 跑完任务就正常退出；CronJob 是 Job 的「定时版」，按 cron 时间表周期性创建 Job（如每天凌晨跑报表）。

## 它解决什么问题 / 为什么存在
[[Deployment]]/[[DaemonSet]] 都是「长期驻留、永远想保持 N 个副本在跑」的模型，不适合「跑完就走」的任务。数据迁移、批量计算、数据库备份、定时报表这类工作，需要的是「启动→执行→成功退出→回收」，Job/CronJob 正是为此设计。

## 核心原理（大二能懂的水平）
- **Job**：创建一个或多个 Pod，直到指定数量的 Pod 成功完成（`completed`）就算 Job 完成；失败会按 `backoffLimit` 重试。
- 关键字段：`completions`（要成功几个）、`parallelism`（同时并行几个）、`activeDeadlineSeconds`（超时强杀）、`backoffLimit`（重试次数）。
- **CronJob**：在 Job 之上加 `schedule`（标准 cron 表达式，如 `0 2 * * *` 每天 2 点），到点自动起一个 Job；`startingDeadlineSeconds` 处理错过触发窗口。
- 与 Deployment 的本质区别：Job 的 Pod 退出码 0 是「成功」，而 Deployment 的 Pod 退出就会被判定失败并重建——所以批处理**绝不能**用 Deployment 跑。

## 关键参数 / 易错点
- **易错**：把「跑完就退出的脚本」放 Deployment 里，会被无限重启（Exit 0 也被当失败）——批处理请用 Job。
- **易错**：`restartPolicy` 对 Job 只能是 `Never` 或 `OnFailure`，不能是 `Always`。
- **易错**：CronJob 若集群当时挂了，默认可能漏跑（取决于 `startingDeadlineSeconds` 和并发策略 `concurrencyPolicy`：Allow/Forbid/Replace）。

## 类比（帮助理解）
Job 像「叫外卖跑腿一次」：下单（创建）→ 跑腿员送到（Pod 执行）→ 完成签收（Exit 0）→ 订单结束。CronJob 像「每天定时送牛奶」：在日历上订好时间，每天到点自动派一单。

## 设计时怎么用（反推思维）
> 做 XX 系统时，我会用它能解决 YY。
做数据备份、批量导入导出、压力测试、一次性迁移脚本时，我会用 **Job**；做每天/每周定时的报表、清理、证书续期时，我会用 **CronJob**，并设好并发策略和超时，避免任务重叠或卡死。

## 典型应用 / 我在哪见过
- 第2章：点名「需要不定期运行的临时任务由定时任务（CronJob）来管理」。
- 第11章：日志 agent 用 DaemonSet 部署（对照理解——常驻用 DaemonSet，一次性用 Job）。

## 关联
- 前置知识：[[Pod]] [[Deployment]] [[DaemonSet]] [[资源限制与QoS]]
- 相关：[[CI-CD]]（流水线里常跑 Job 做构建/测试）、[[滚动更新与回滚]]
- 反例/误区：用 Deployment 跑批处理脚本（应改 Job）

## 来源
- 本书第2章、第11章提及，但无独立章节（书中仅把 CronJob 列为控制器之一）。结合通用 Kubernetes 知识补全（PDF 为图片版，结合章节结构整理）。
