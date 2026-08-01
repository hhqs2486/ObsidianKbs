---
类型: 组件参考
组件: Placement
tags: [组件参考, OpenStack]
创建: 2026-07-21
状态: 种子
---

# Placement

## 基本信息
- 类别：OpenStack 核心服务（资源调度元数据服务）
- 核心用途：追踪云中**资源提供者**（计算节点、共享存储、网络）及其库存与特质(trait)，为 Nova 调度提供决策依据
- 官方文档：https://docs.openstack.org/placement/

## 关键能力 / 参数（摘录）
| 维度 | 说明 |
|------|------|
| 资源提供者模型 | 用树/图表达资源层级（如 节点→NUMA→CPU） |
| 库存 Inventory | 每种资源的总量/已用/预留/步长 |
| 特质 Trait | 标记能力（如 SSD、GPU、多可用区） |
| API | placement-api，Rocky 起已是独立必装服务 |

## 与其它组件的关系
- 被依赖：[[Nova]] 调度在选节点前先查 Placement 库存
- 依赖：[[Keystone]]（认证）、MariaDB（存库存数据）
- 同代：与 [[Neutron]]/[[Cinder]] 一起在控制节点部署

## 设计时必看的点
- placement-api 版本需与 Nova 匹配，否则调度报"找不到资源提供者"。
- 升级时若漏迁 placement 数据库，会出现资源库存为空、虚拟机建不出来。
- 高可用部署里 placement 也需多副本+负载均衡（见 [[高可用HA]]）。

## 选型结论
OpenStack Rocky 起的**必装组件**，不是可选项；任何"调度不到资源"的诡异问题先查 Placement 库存上报。

## 关联
- 用到它的项目：[[20260721-OpenStackRocky高可用集群部署]]
- 同类替代：无（Nova 调度强依赖）

## 来源
04-OpenStack-Rocky高可用集群部署（Nova 卡链接）；OpenStack 通用知识
