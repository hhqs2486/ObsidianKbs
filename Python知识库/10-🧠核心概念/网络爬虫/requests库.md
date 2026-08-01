---

类型: 概念
主题: 网络爬虫
创建: 2026-07-21
复习: 
状态: 种子
tags: [Python, 网络爬虫, 概念]
---
---

# requests库

## 一句话定义
> Python 中发送 HTTP 请求的第三方库，比内置 urllib 更简洁、更人性化。

## 它解决什么问题 / 为什么存在
- 内置 urllib 写法繁琐（开连接、拼 data、处理编码都要手写）；requests 用极简 API 完成 GET/POST、携带请求头与 Cookie、会话保持、文件上传、超时与代理。
- 是绝大多数 Python 爬虫"发请求"的入口。

## 核心原理（大二能懂的水平）
- 底层封装了 socket 与 HTTP 协议；你调用 `requests.get(url)` 它就帮你完成 TCP 连接、组请求、收响应、解响应。
- `Session` 对象会复用 TCP 连接并自动保存/携带 Cookie，从而维持"登录态"。

## 关键参数 / 易错点
- `params=` 拼 URL 查询参数；`data=` 表单、`json=` 直接发 JSON 体，二者别混。
- `headers=` 设置 User-Agent 等，防止被拒；`cookies=` 维持会话。
- `timeout=` 必设，否则网络卡住时程序会一直挂起。
- `proxies=` 设代理，支持 `http` / `https` / `socks5`（如 `{"http": "socks5://..."}`）。
- `verify=False` 可关 SSL 证书校验（不安全，仅测试用）。
- 响应编码：`.text` 乱码时设 `.encoding` 或改用 `.content` 手动解码。

## 类比（帮助理解）
- 像用浏览器地址栏 + 表单提交，但用一行代码一键完成，还能批量、自动。

## 设计时怎么用（反推思维）
> 做任何需要调 HTTP 接口或抓静态页的系统时，我会先用 requests 发请求；要登录态就建 `Session`；要过反爬就配 `headers` + `proxies`；若页面是 JS 渲染的，就别硬刚 requests，交给动态渲染方案。

## 典型应用 / 我在哪见过
- 调用 REST API、下载文件、爬取静态网页、模拟登录拿 Cookie。

## 关联
- 前置知识：[[Python]] [[网络爬虫]]
- 相关：[[BeautifulSoup]] [[反爬虫进阶]]
- 技术（他人所有，仅链接）：[[正则表达式爬虫]]

## 来源
- 《Python 3网络爬虫开发实战》第3章 基本库的使用（urllib / requests）
