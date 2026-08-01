---

类型: 概念
主题: 网络编程
创建: 2026-07-21
复习: 
状态: 种子
tags: [Python, 网络编程, 概念]
---
---

# HTTP客户端

## 一句话定义
> HTTP 客户端 = 用代码「像浏览器一样」向服务器发 HTTP 请求、收响应并解析的程序侧逻辑。底层仍是 [[socket编程]] + [[TCP协议]]，但它替你管好了「请求行/头/体、状态码、重定向、Cookie、压缩」这些细节。

## 它解决什么问题 / 为什么存在
- 手写裸 socket 发 HTTP（书 ch01 的 `search4.py`）能用，但要自己拼 `GET /path HTTP/1.1\r\nHost:...\r\n`，还得手动解析状态行、头、正文——脆弱又易错。
- HTTP 客户端库把这套「应用层协议」封装好：你给 URL + 参数，它返回状态码、响应头、正文。这是绝大多数「调接口 / 爬网页 / 对接 Web 服务」的入口。

## 核心原理（大二能懂的水平）
- 一次请求 = 方法(GET/POST/…) + URL(协议+主机+路径+查询) + 请求头 + 可选请求体；服务器回 状态行(如 `200 OK`) + 响应头 + 响应体。
- 协议栈位置：HTTP 坐在 [[TCP协议]] 之上（默认 80，HTTPS 443）；TLS 加密见书第6章。它又常坐在更上层（如 Google Maps API）之下——典型「协议栈一层套一层」。
- Python 里的实现层次（由低到高）：
  1. 裸 `socket`（书 ch01，最原始）；
  2. `http.client`(Py3) / `httplib`(Py2)：直接操作 HTTP 报文；
  3. `urllib`（标准库，开箱即用，见 [[urllib]]）；
  4. `requests`（第三方，最人性化，见 [[requests库]]）——书本身以 urllib/httplib 为例，但现代实践几乎都用 requests。
- 关键机制：状态码（2xx 成功 / 3xx 重定向 / 4xx 客户端错 / 5xx 服务端错）、`Content-Length` 决定正文读多少、`Cookie` 维持会话、`User-Agent` 表身份、`gzip` 压缩透明解压。

## 关键参数 / 易错点
- **别手写 socket 发 HTTP**：除非教学，否则一律用库，省去重定向/分块/编码/错误处理的无数坑。
- **超时必设**：`requests` 的 `timeout=` 不设，网络卡住时程序永久挂起。
- **重定向与压缩**：好库默认处理；自己解析响应头时别漏 `3xx` 跳转和 `Content-Encoding: gzip`。
- **编码**：响应 `.text` 乱码时查 `.encoding` 或改用 `.content` 手动 `decode`。
- HTTPS 证书：关 `verify` 仅测试；生产别关。
- 书 ch17「屏幕抓取（Screen Scraping）」提醒：很多页面是 JS 渲染，纯 HTTP 抓回来只有空壳——要内容得用动态渲染方案（属 [[网络爬虫]] 范畴）。

## 类比（帮助理解）
- HTTP 客户端就像「自动版浏览器地址栏 + 表单提交」：你填 URL 和点按钮，它把「请求报文」这封信写好后通过 TCP 寄出，再把回信拆好递给你。

## 设计时怎么用（反推思维）
> 做「调 REST API / 抓静态网页 / 模拟登录」时，我先用 [[requests库]] 发请求（要登录态建 `Session`，要过反爬配 `headers`+`proxies`）；受限环境不能装第三方库才退回 [[urllib]]；若追求极致底层控制或教学理解，再看 `http.client`/裸 socket。需要高并发抓取就接 [[异步网络编程]]（asyncio + aiohttp）或 [[并发编程]]（线程池）。

## 典型应用 / 我在哪见过
- 调第三方开放 API（Google Maps、支付、短信）、网页爬取、Webhook 接收、微服务间 HTTP 调用、文件下载。

## 关联
- 前置知识：[[网络协议栈]] [[TCP协议]] [[socket编程]]
- 相关（他人所有，仅链接）：[[requests库]] [[urllib]] [[网络爬虫]]
- 进阶：[[异步网络编程]] [[并发编程]]

## 来源
- 《Foundations of Python 3 Network Programming, 2nd》第16章 HTTP、第17章 Screen Scraping
