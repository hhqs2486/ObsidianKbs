---
类型: 教程
来源: 《Prometheus监控实战》(Prometheus: Up & Running 风格，James Turnbull)
tags: [教程]
创建: 2026-07-21
状态: 已读待消化
---

# 05-Prometheus监控实战

## 这条教程在解决什么
教我用一套**基于拉取（pull）的时序监控系统** Prometheus，把「主机/容器/应用/日志/探针/短期任务」的指标统一收集、用 [[PromQL]] 查询聚合、用 [[告警规则]] 触发警报、用 [[Grafana]] 可视化，最终在 [[Kubernetes]] 上落地一个可扩展、有冗余的监控平台。核心思维是「指标模型 → 查询 → 告警 → 可视化」主线。

## 关键内容（按 PDF 章节提纲）
### 第1章 监控简介
- 监控有两个"客户"：技术（团队）和业务（价值）。监控应是应用核心功能，不是增值件。
- 反模式：事后监控、机械式监控（只盯 CPU/内存不看业务）、不够准确（只看 HTTP 200 不看内容）、静态阈值、不频繁监控、缺少自动化。
- 监控两类数据：**指标**（时间序列）与**日志**。[[指标Metric]] 才是本书主角。
- 指标类型：测量型（gauge）、计数型（counter）、直方图（histogram）、摘要型（summary）。
- 统计陷阱：平均值/中位数会被异常值掩盖，**百分位数（p75/p99/pmax）** 才能反映真实分布。
- 两个方法论：**USE**（Utilization/Saturation/Error，主机级）与 Google **四个黄金指标**（延迟/流量/错误/饱和度，应用级）；还有 RED（Rate/Error/Duration）。

### 第2章 Prometheus简介
- 起源：受 Google Borgmon 启发，由 SoundCloud 开源，Go 编写，CNCF 孵化。专注"近实时"数据（默认保留 15 天）。
- 架构：Prometheus 拉取 exporter 暴露的 `/metrics` → 本地 [[时序数据库TSDB]] 存储；告警推给 [[Alertmanager]]；查询用 [[PromQL]]；可视化接 [[Grafana]]。
- 数据模型：**多维时间序列** = 指标名 + 标签（label，键/值维度）。时间序列由"名称+标签"唯一标识；改/加标签 = 新时间序列。
- 安全模型：默认无鉴权/加密，需自管（反向代理等）。

### 第3章 安装和启动Prometheus
- 二进制/YAML 配置。配置文件 4 块：`global`（scrape_interval、evaluation_interval）、`alerting`、`rule_files`、`scrape_configs`。
- 第一个目标：抓取 Prometheus 自身 `http://localhost:9090/metrics`，指标如 `go_gc_duration_seconds{quantile="0.5"}`、`prometheus_build_info`。
- 表达式浏览器 4 种 PromQL 数据类型：**即时向量、范围向量、标量、字符串**。
- 真实查询示例：
  - `sum(promhttp_metric_handler_requests_total)` —— 求和
  - `sum by (code) (promhttp_metric_handler_requests_total)` —— 按标签聚合
  - `rate(promhttp_metric_handler_requests_total[5m])` —— 5 分钟平均增长率（仅用于 counter）
  - `irate(...[5m])` —— 瞬时增长率
- 容量规划：内存 ≈ 每秒样本数×2 字节；磁盘默认 15 天、建议 SSD。`--storage.tsdb.path` / `--storage.tsdb.retention`。

### 第4章 监控主机和容器
- [[node_exporter]]（端口 9100）收集主机 CPU/内存/磁盘/文件系统；textfile 收集器导出静态元数据；systemd 收集器看服务状态。
- 容器监控用 **cAdvisor**（端口 8080）暴露容器指标，Prometheus 抓它。
- **抓取生命周期**：服务发现 → 生成带 `__meta_*` 元数据标签的目标 → relabel_configs（抓取前）→ 抓取 → metric_relabel_configs（抓取后、入库前）。
- **标签分类**：拓扑标签（job/instance/datacenter）+ 模式标签（url/error_code）。
- **重新标记**：抓取前 `relabel_configs`、抓取后 `metric_relabel_configs`（drop/keep/replace/labeldrop/labelkeep）。`honor_labels` 控制标签冲突。
- USE 实战 PromQL：
  - CPU 使用率：`100 - (avg by (instance) (irate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)`
  - 内存使用率：`(1 - (node_memory_MemFree_bytes + node_memory_Cached_bytes + node_memory_Buffers_bytes)/node_memory_MemTotal_bytes) * 100`
  - 磁盘耗尽预测：`predict_linear(node_filesystem_free_bytes{mountpoint="/"}[1h], 4*3600) < 0`
- `up` 指标（1=健康，0=抓取失败）做可用性监控。
- **记录规则**：把常用/开销大的查询预计算成新时间序列（如 `instance:node_cpu:avg_rate5m`），规则文件在 `rule_files` 加载，由 `evaluation_interval` 控制。
- [[Grafana]] 接 Prometheus 数据源（Access=proxy），建第一个仪表板。

### 第5章 服务发现
- 静态配置不可扩展 → 三类服务发现：**基于文件**（JSON/YAML，配置管理生成）、**基于 API/平台**（EC2、Consul、[[Kubernetes]]、GCE）、**基于 DNS**（SRV/A/AAAA 记录）。
- 抓取前 relabel 用 `__meta_*` 元数据（如 `__meta_ec2_tag_Name`）丰富标签。

### 第6章 警报管理
- 好警报三原则：关注**症状而非原因**、正确优先级、带上下文。反模式：过多/错误分类/无用通知。
- [[Alertmanager]] 职责：去重、分组、路由、接收器（邮件/Slack/PagerDuty/Webhook）、silence（维护静音）。
- 警报规则（YAML）含 `alert`/`expr`/`for`/`labels`/`annotations`。状态机：Inactive→Pending→Firing（`for` 子句防抖动）。
- 真实规则：CPU>80% 持续 60 分；磁盘 4h 内耗尽（`predict_linear`）；`up == 0`；`absent(up{job="node"})` 检测目标消失。
- 模板用 Go 模板语法：`{{$labels.instance}}`、`{{$value}}`、`humanize`。
- 路由树：`group_by`、`group_wait`(30s)、`group_interval`(5m)、`repeat_interval`(3h)、`match`/`match_re`、`continue`。

### 第7章 可靠性和可扩展性
- 容错：跑**两个配置相同的 Prometheus** + **[[Alertmanager]] 集群**（gossip/Memberlist，端口 9094）。上游靠 Alertmanager 去重。
- 扩展：功能分片（按地域/功能）、水平分片（worker 节点 + 主节点用 **federation `/federate` API** 抓聚合指标，配 `external_labels` 与 `hashmod`）。
- 远程存储：`remote_write`/`remote_read`（InfluxDB、Cortex、Thanos 等）。

### 第8章 监控应用程序
- 在代码里用客户端库（Ruby/Go/Java/Python）注册指标并暴露 `/metrics`，由 Prometheus 抓取。
- 指标分**应用指标**（延迟/吞吐/错误）与**业务指标**（销量/交易额）。实用程序模式（metrics-utility 类）集中创建指标。
- 入口/出口埋点：请求数、外部调用、cron 作业、业务事件。

### 第9章 日志监控
- 用 **mtail** 解析日志行生成指标（如 Apache combined、Rails 直方图），通过 3903 端口暴露给 Prometheus。
- 边车（sidecar）模式部署：**每应用一个 mtail 实例**。

### 第10章 探针监控
- **Blackbox exporter**（端口 9115）做黑盒探测：HTTP/HTTPS/DNS/TCP/ICMP。探测放在能代表用户网络位置的地方。
- 抓取时用 relabel 把 `__param_target`、exporter 地址写入 `__address__`，指标如 `probe_success`、`probe_http_status_code`。

### 第11章 推送指标和Pushgateway
- [[Pushgateway]]（端口 9091）解决"拉不到"的场景：短生命周期批处理作业、防火墙后、无端点的目标。它是**缓存代理不是聚合器**（最后推送值生效，非累加）。
- 推送路径：`/metrics/job/<jobname>{/<labelvalue>}`；抓取时设 `honor_labels: true` 保留原始 job/instance。

### 第12章 监控Kubernetes
- Prometheus 部署进 [[Kubernetes]]（用 [[ConfigMap]] 挂配置，放 `monitoring` [[Namespace]]）。
- Node Exporter 用 **[[DaemonSet]]** 跑在每个节点（含主节点，靠 toleration），配 liveness/readiness [[探针LivenessReadiness]]；Service 加注解 `prometheus.io/scrape: "true"`、`prometheus.io/port`。
- 用内置 **kubernetes_sd_configs**（`role: endpoints/node/pod/service`）自动发现；relabel 把注解转成标签、用 `labelmap` 复制 K8s 元数据。
- **Kube-state-metrics** 暴露部署/副本/Pod 重启等工作负载状态；API Server 作业抓 `apiserver_request_latencies_bucket`，用 `histogram_quantile(0.99, rate(...[5m]))` 算 p99 延迟。
- 四个黄金指标落地：MySQL 慢查询、Redis 命中率、Tornado API 延迟等警报。

### 第13章 监控Tornado
- 在 [[Kubernetes]] 上用**边车模式**监控多服务应用：MySQL（`mysqld_exporter`，端口 9104）、Redis（`redis_exporter`，端口 9121）作为[[容器]] sidecar；Tornado API 用 Clojure 客户端 iapetos 暴露 `/metrics`。
- exporter 作为 Service 端点暴露 → 复用第12章的 `kubernetes-service-endpoints` 作业自动抓取，无需单独建作业。

## 我卡住/没懂的地方
- `relabel_configs` 与 `metric_relabel_configs` 两阶段容易混淆——记住"抓取前 vs 抓取后入库前"即可。
- federation 主从分片下，警报应放 worker 而非主节点（减少延迟），一开始会想着集中告警。
- `histogram_quantile` 必须配合 histogram bucket 指标（如 `*_bucket`），不能对普通 gauge 用。
- `for` 子句与 `evaluation_interval` 的交互：带 `for` 的警报至少需两个评估周期才 Firing。

## 它背后的原理（别只记操作）
- **拉取模型**：Prometheus 主动定时抓 `/metrics`，天然适配动态环境（目标可随时上线/下线），也方便通过服务发现自动登记目标。
- **多维数据模型 + 标签**让"一个指标名"能按任意维度切片/聚合，这是 PromQL 强大表达力的根基。
- **指标 vs 日志**：指标是结构化、低开销、适合聚合/告警的时间序列；日志适合诊断但量大。两者互补。
- **症状告警**：对"用户可感知的症状"（高延迟/错误率）告警，而非内部原因（高 CPU），避免告警疲劳。
- **分层扩展**：单机 → 分片 → federation → 远程存储/Thanos，代价是数据一致性与延迟递增。

## 我能复用/改编的点
> 换个需求，这套做法还能怎么用？
- 任何暴露 `/metrics` 的系统（自研服务、数据库、消息队列）都能用同一套 [[Exporter]] + 抓取 + [[PromQL]] + [[告警规则]] + [[Grafana]] 管线，几乎零改造监控新组件。
- 想监控"拉不到"的内部批处理/云函数 → 套 [[Pushgateway]]。
- 想监控第三方黑盒（网站可用性）→ 套 Blackbox exporter 探针。
- 想在 [[Kubernetes]] 里自动监控新服务 → 给 Service 打 `prometheus.io/scrape` 注解 + kubernetes_sd_configs，新服务"零配置"被纳入监控。

## 关联
- 概念：[[Prometheus]] [[Exporter]] [[PromQL]] [[Alertmanager]] [[Grafana]] [[node_exporter]] [[Pushgateway]] [[时序数据库TSDB]] [[指标Metric]] [[告警规则]] [[服务发现]] [[可视化面板]] [[可观测性]]
- 别人拥有的概念（仅链接，不建卡）：[[Kubernetes]] [[Pod]] [[DaemonSet]] [[Deployment]] [[Service]] [[Namespace]] [[kubectl]] [[ConfigMap]] [[容器]] [[Docker]] [[Label与Selector]] [[DNS与服务发现]] [[探针LivenessReadiness]] [[高可用]] [[微服务]] [[云原生]] [[声明式API]] [[YAML]]
- 项目：[[监控Kubernetes集群]]（见教程第12章实践）

## 来源
- 《Prometheus监控实战》第1–13章（本地抽取文本 `云计算知识库/.cache/prometheus/ch03~ch15_*.txt`）
- 官方文档：https://prometheus.io/docs/ ，https://grafana.com/
