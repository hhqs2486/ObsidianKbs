---

类型: 概念
主题: urllib
创建: 2026-07-21
状态: 种子
tags: [Python, 标准库与工程, 概念]
---
---

# urllib 模块

## 一句话定义
> urllib 是标准库自带的「网络请求 + URL 处理」集合：`urllib.request` 发 HTTP 请求，`urllib.parse` 拼/拆 URL。

## 它解决什么问题 / 为什么存在
- 不装第三方库（requests）也能抓取网页、下载文件、解析查询参数。
- 适合轻量需求；复杂场景第三方 requests 更舒服。

## 核心原理（大二能懂的水平）
- **类比**：urllib.request 像「内置的迷你浏览器」，你给它网址它把网页内容端回来；urllib.parse 像「网址拆装工具」，把 `?a=1&b=2` 拆成字典或拼回去。
- `urllib.request.urlopen(url).read()` 拿字节；`urllib.parse.urlencode({'a':1})` 拼查询串。

## 关键参数 / 易错点
- `urlopen` 返回类文件对象，要 `.read().decode('utf-8')` 转字符串。
- 发 POST：`urllib.request.Request(url, data=urlencode(...).encode(), method='POST')`。
- 易错：默认不处理 HTTPS 证书/重定向细节；中文或特殊字符要先 `quote` 编码。
- 没有会话/cookie 自动管理，复杂爬虫还是用 requests。

## 设计时怎么用（反推思维）
> 做「简单下载/调用 REST 接口」且不想引第三方依赖时，我会用 urllib.request 发请求、urllib.parse 拼参数。

## 典型应用 / 我在哪见过
- 下载固定 URL 的资源文件。
- 调简单的 HTTP API。

## 关联
- 前置知识：[[标准库]] [[文件IO]] [[异常处理]]
- 相关：[[subprocess模块]] 网络编程
- 反例/误区：[[标准库]]（复杂 HTTP 客户端优先考虑 requests）

## 来源
- Python 3.6.5 标准库文档（完整中文版）§21.5 urllib — URL 处理模块
