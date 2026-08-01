---
类型: 组件参考
组件: Horizon
tags: [组件参考]
创建: 2026-07-21
状态: 待精读
---

# Horizon

## 基本信息
- 类别（编排/虚拟化/监控/网络/存储/CI）：界面（Dashboard）
- 核心用途：OpenStack 的 Web 管理界面，把命令行能干的事（建实例、网络、卷、镜像、用户）做成网页，给运维和租户用。
- 官方文档链接：https://docs.openstack.org/horizon/rocky/

## 关键能力/参数（摘录）
| 维度 | 说明 | 备注 |
|------|------|------|
| 架构角色 | Django 应用，跑在 httpd 上 | 本书 G 节 `openstack-dashboard` |
| 数据模型 | 自身无库，调各服务 API | 经 [[Keystone]] 认证 |
| 扩展性 | 无状态，多节点 + [[HAProxy]] 即可多活 | 本书 dashboard_cluster 经 VIP:80 |
| 性能/规模 | 仅人机交互面，压力小 | 缓存用 Memcached |

## 与其它组件的关系
- 依赖：[[Keystone]]（登录/鉴权）、所有其它服务（经 API）、Memcached（会话/缓存）
- 被依赖：最终用户、运维
- 替代/竞品：命令行 openstackclient、Terraform/API 直接调用

## 设计时必看的点
- 部署前提：装 `openstack-dashboard`，改 `local_settings`（full.txt G 节）。
- 配置要点：`OPENSTACK_HOST = "controller"`、`OPENSTACK_KEYSTONE_URL = "http://%s:5000/v3"`、`ALLOWED_HOSTS = ['*']`、`CACHES` 指向三节点 Memcached、`OPENSTACK_KEYSTONE_MULTIDOMAIN_SUPPORT = True`。
- **高可用**：每个控制节点都装 Horizon + httpd，HAProxy 的 `dashboard_cluster`（`bind 192.168.122.30:80`）按 `balance source` 分发；改 `openstack-dashboard.conf` 加 `WSGIApplicationGroup %{GLOBAL}` 防线程问题。
- 常见坑：Memcached 配错导致登录态丢失；`OPENSTACK_HOST` 写成具体 IP 而非 VIP，VIP 漂移后界面连不上后端。

## 选型结论
> 给"不想敲命令的人"一个统一控制台；生产环境常在前端再叠一层真实 [[负载均衡]]/WAF。多节点无状态部署即可，无单独数据库。

## 关联
- 用到它的项目：[[20260721-OpenStackRocky高可用集群部署]]
- 同类替代：openstackclient 命令行、Terraform
- 相关：[[Keystone]] [[Nova]] [[Neutron]] [[Glance]] [[Cinder]] [[控制节点]] [[HAProxy]]

## 来源
- 《OpenStack-Rocky高可用集群部署》full.txt 步骤 G（Dashboard 集群配置、local_settings、HAProxy dashboard_cluster）。
