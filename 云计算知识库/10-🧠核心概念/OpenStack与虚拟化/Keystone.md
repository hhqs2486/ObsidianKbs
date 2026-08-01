---
类型: 组件参考
组件: Keystone
tags: [组件参考]
创建: 2026-07-21
状态: 待精读
---

# Keystone

## 基本信息
- 类别（编排/虚拟化/监控/网络/存储/CI）：认证/身份（IAM）
- 核心用途：OpenStack 的"身份认证服务"，是所有其它服务的统一入口——签发令牌(token)、管理用户/项目(租户)/角色/服务目录(endpoint)。
- 官方文档链接：https://docs.openstack.org/keystone/rocky/

## 关键能力/参数（摘录）
| 维度 | 说明 | 备注 |
|------|------|------|
| 架构角色 | keystone 进程经 httpd+mod_wsgi 提供 | 本书 C 节用 systemd:httpd 纳入 Pacemaker |
| 数据模型 | 独立库 keystone | 本书 C 节 |
| 扩展性 | 无状态多活，靠共享库+Memcached 缓存 | 本书 3 控制节点都跑 |
| 性能/规模 | token 量大，Memcached 缓存是关键 | `memcache_servers` 列全 3 节点 |

## 与其它组件的关系
- 依赖：[[MariaDB-Galera]]、Memcached、[[RESTfulAPI]]
- 被依赖：**所有** OpenStack 服务（Nova/Neutron/Glance/Cinder/Horizon 都要 `auth_url=http://controller:5000`）
- 替代/竞品：LDAP/企业 IdP 可作后端；Keystone 本身无替代

## 设计时必看的点
- 部署前提：装 `openstack-keystone httpd mod_wsgi`，bootstrap 建 admin 用户+3 个 API endpoint（public/internal/admin 都指向 `http://controller:5000/v3`）（full.txt C 节）。
- 配置要点：`[database] connection=mysql+pymysql://keystone:...@controller/keystone`（注意用 VIP 主机名 `controller`）；`[cache] backend=oslo_cache.memcache_pool`、`memcache_servers=controller1:11211,controller2:11211,controller3:11211`；`[token] provider=fernet`。
- **高可用要同步密钥**：`keystone-manage fernet_setup` / `credential_setup` 生成的 `fernet-keys/`、`credential-keys/` 必须 `scp` 到 controller2/3 并改属主（full.txt C 节）——否则各节点校验 token 不一致。
- 常见坑：httpd 只 `Listen` 本机 IP 而非 0.0.0.0；忘了同步 fernet 密钥导致部分节点 401。

## 选型结论
> OpenStack 的"门禁 + 通讯录"，没有它其它服务全连不上；务必多节点多活 + 密钥同步 + Memcached 缓存，否则成为单点。本书用 Pacemaker clone 多活。

## 关联
- 用到它的项目：[[20260721-OpenStackRocky高可用集群部署]]
- 同类替代：企业 IdP/LDAP（作后端）
- 相关：[[Nova]] [[Neutron]] [[Glance]] [[Cinder]] [[Horizon]] [[MariaDB-Galera]] [[控制节点]] [[RESTfulAPI]]

## 来源
- 《OpenStack-Rocky高可用集群部署》full.txt 步骤 C（Keystone 集群、fernet 密钥同步、httpd、pcs 资源）。
