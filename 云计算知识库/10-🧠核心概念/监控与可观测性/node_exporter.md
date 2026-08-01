---
类型: 组件参考
组件: node_exporter
tags: [组件参考]
创建: 2026-07-21
状态: 待精读
---

# node_exporter

## 基本信息
- 类别（监控）：主机指标 exporter
- 核心用途：用 Go 编写，收集 Linux/Unix 主机的 CPU、内存、磁盘、文件系统、网络、systemd 等服务状态，于 `:9100/metrics` 暴露给[[Prometheus]]抓取。最常见的[[Exporter]]。
- 官方文档链接：https://github.com/prometheus/node_exporter

## 关键能力/参数（摘录）
| 维度 | 说明 | 备注 |
|------|------|------|
| 架构角色 | 主机侧 agent | 每台主机一个实例 |
| 数据模型 | 大量 node_* 指标（gauge/counter） | 配收集器开关 |
| 扩展性 | 收集器可插拔 | `--collector.*`，`no-` 前缀禁用 |
| 性能/规模 | 轻量，默认全开收集器 | 可用 Prometheus 端 `collect[]` 过滤 |

## 常用收集器与指标
- CPU：`node_cpu_seconds_total{mode="idle"}` → `irate` 算使用率。
- 内存：`node_memory_MemTotal_bytes`/`MemFree_bytes`/`Cached_bytes`/`Buffers_bytes`。
- 磁盘/文件系统：`node_filesystem_size_bytes`、`node_filesystem_free_bytes`。
- 平均负载：`node_load1/5/15`；systemd：`node_systemd_unit_state`。
- `textfile` 收集器：扫描目录 `*.prom` 暴露自定义/静态指标（如主机角色 metadata）。
- `systemd` 收集器：看服务状态，需以 root 跑容器（[[Kubernetes]] DaemonSet 有提权风险）。

## 与其它组件的关系
- 依赖：被[[Prometheus]]抓取；常配合[[Exporter]]体系。
- 被依赖：USE 方法监控、记录规则、主机[[告警规则]]。
- 替代/竞品：collectd（可写 Prometheus 格式）、windows_exporter。

## 设计时必看的点
- 部署前提：主机可达、端口 9100 开放；建议用配置管理/[[DaemonSet]]批量部署。
- 配置要点：默认路径 `/metrics`，可用 `--web.listen-address`/`--web.telemetry-path` 改；textfile 目录用 `--collector.textfile.directory`。
- 常见坑：容器里跑需挂 `/run/systemd/private`、开 `hostNetwork/hostPID`、以 root 运行 → 安全风险，敏感环境直接装到实例更妥。

## 选型结论
> 适合我的哪个场景？为什么选它 / 为什么不？
监控裸金属/VM 主机指标首选。纯容器环境可用 cAdvisor 看容器，但节点级仍靠 node_exporter。

## 关联
- 用到它的项目：[[监控Kubernetes集群]]
- 同类替代：[[Exporter]]、[[Prometheus]]、[[指标Metric]]
- 部署：[[容器]]、[[DaemonSet]]

## 来源
- 《Prometheus监控实战》第4章、第12章（`.cache/prometheus/ch06_*.txt`、`ch14_第12章 监控Kubernetes.txt`）
