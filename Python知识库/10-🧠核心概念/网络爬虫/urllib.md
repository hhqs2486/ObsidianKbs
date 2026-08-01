---

类型: 概念
主题: 网络爬虫
创建: 2026-07-21
复习: 
状态: 种子
tags: [Python, 网络爬虫, 概念]
---
---

# urllib

## 一句话定义
> Python 标准库内置的 HTTP 模块集合（urllib.request / urllib.parse / urllib.error / urllib.robotparser），无需安装第三方包即可发请求、读网页、拼参数。

## 它解决什么问题 / 为什么存在
- 免第三方依赖就能抓取静态网页，是入门教学首选，也帮助理解"请求到底是怎么发出的"这一底层机制。
- 在受限环境（不能 pip 安装）里，urllib 是唯一开箱即用的请求手段。

## 核心原理（大二能懂的水平）
- `urllib.request.urlopen(url)` 发一次 GET 请求，返回一个"类文件对象"；`.read()` 拿到的是 bytes，要 `.decode('utf-8')` 才变成字符串。
- 想加请求头或发 POST，用 `urllib.request.Request(url, data=..., headers=...)` 包装后再丢给 urlopen。
- `urllib.parse.urlencode(dict)` 把参数字典拼成 `k=v&...` 查询串；POST 时还要 `.encode()` 成 bytes。
- `urllib.error` 提供 URLError / HTTPError 做异常分支。

## 关键参数 / 易错点
- urlopen 返回的是 bytes，不 decode 直接当字符串用会报类型错或乱码。
- 默认请求没有 User-Agent，很多站点会直接拒绝 → 必须用 Request 包装并带上 headers。
- POST 的 data 必须是 urlencode 后的 bytes，不是 dict 也不是 str。
- 没有 Session 概念，Cookie 不会自动保存；要维持登录态需手动用 `http.cookiejar` + `build_opener`，比 requests库 麻烦得多。
- 异常处理别漏：网络不通抛 URLError，HTTP 错误状态码抛 HTTPError。

## 类比（帮助理解）
- 像手摇电话：能打通、能通话，但拨号、接线都得一步步手动；requests库 则是智能手机，一句话就搞定。

## 设计时怎么用（反推思维）
> 做轻量静态页采集、又不想装第三方库时，我用 urllib 发请求；一旦需要会话/Cookie 复用、代理或代码简洁，就改投 requests库；遇到 JS 渲染页再交给 动态网页爬取。

## 典型应用 / 我在哪见过
- 入门第一个爬虫、抓静态新闻页、下载图片/文件、教学演示请求底层。

## 关联
- 前置知识：[[Python]] [[网络爬虫]]
- 相关（本课所有）：[[正则表达式爬虫]] [[动态网页爬取]]
- 他人所有（仅链接）：[[requests库]] [[BeautifulSoup]] [[反爬虫进阶]] [[并发编程]]

## 来源
- 本书第3章 我的第一个爬虫（urllib 实践）（PDF 为图片版，结合章节结构整理）
