---
类型: 概念
主题: Secret
tags: [概念]
创建: 2026-07-21
复习: 
状态: 种子
---

# Secret

## 一句话定义
Secret 是 Kubernetes 里用来保存**敏感数据**（密码、令牌、密钥、证书）的 API 对象，结构和 [[ConfigMap]] 几乎一样，但值会被 Base64 编码（混淆），并配合更严格的访问控制。

## 它解决什么问题 / 为什么存在
把密码写进镜像或明文 ConfigMap，等于把钥匙贴在门上——谁 pull 镜像谁就能看到。Secret 把敏感数据从镜像和代码里摘出来，集中、受控地注入容器，降低泄露面。

## 核心原理（大二能懂的水平）
- Secret 也是 core/v1 对象，数据在 `data` 里以 Base64 编码存储（注意：Base64 **不是加密**，只是编码，拿到的人能直接解码）。
- 注入方式和 ConfigMap 一样：环境变量、卷挂载。`kubectl create secret generic <名> --from-literal password=xxx`。
- Kubernetes 1.7+ 支持对 etcd 里 Secret 做静态加密；1.11+ 可把「密钥加密密钥 KEK」放到集群外（HSM/KMS），避免登录节点后绕过加密。
- 每个 [[Pod]] 会被自动挂一个 **[[ServiceAccount]] 令牌**（本质也是 Secret）用于访问 [[APIServer]]；不需要访问 API 的 Pod 应设 `automountServiceAccountToken: false`。

## 关键参数 / 易错点
- `type` 常见：`Opaque`（默认任意数据）、`kubernetes.io/tls`（证书）、`kubernetes.io/dockerconfigjson`（私有镜像库凭证）。
- **易错**：Base64 不是加密，默认配置下 etcd 里是明文可解的——生产要开 etcd 加密 + 管住 KEK。
- **易错**：Secret 不会自动轮转，改了密码要重建 Secret 并滚动 Pod 才生效。
- **易错**：挂载成卷时文件权限默认 0644，注意用 `defaultMode` 收紧。

## 类比（帮助理解）
Secret 像银行保险箱里的纸条：内容被锁起来（编码+权限），只有被授权的柜员（Pod）能拿出纸条用；但纸条本身不是防弹玻璃，银行（etcd）被攻破就危险，所以银行本身（节点/etcd 访问）也得守好。

## 设计时怎么用（反推思维）
> 做 XX 系统时，我会用它能解决 YY。
做需要连数据库/第三方 API 的系统时，我会把数据库密码、API Key、TLS 证书做成 Secret 注入，做到**镜像里零密钥**；再配合 etcd 加密和最小权限，避免密钥随镜像扩散。

## 典型应用 / 我在哪见过
- 第9章：书里点明「敏感数据用 Secret，它和 ConfigMap 设计类似但会混淆值」。
- 第11章：用 Secret 把证书挂进 Pod 做 Pod 间 mTLS；ServiceAccount 令牌本身就是 Secret。
- 第12章：镜像库凭证（`dockerconfigjson`）、数据库解密密钥。

## 关联
- 前置知识：[[ConfigMap]] [[Pod]] [[APIServer]] [[ServiceAccount]]
- 相关：[[资源限制与QoS]]（安全与资源都靠声明式约束）、[[RBAC]]（控制谁能读 Secret）、[[安全与认证]]
- 反例/误区：用 ConfigMap 存密码（应改 Secret）

## 来源
- 本书第9章（ConfigMap 章中对比提及）、第11章 11.2.2/11.5.2、第12章 12.1（镜像库凭证）。PDF 为图片版章节，结合章节结构与通用知识补全 Secret 的细节。
