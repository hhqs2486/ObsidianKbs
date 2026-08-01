---

类型: 概念
主题: logging
创建: 2026-07-21
状态: 种子
tags: [Python, 标准库与工程, 概念]
---
---

# logging 模块

## 一句话定义
> logging 是「正式日志系统」：按级别（DEBUG/INFO/WARNING/ERROR）输出带时间、模块名的信息到控制台或文件，比 `print` 专业得多。

## 它解决什么问题 / 为什么存在
- `print` 调试完要删、不能控制严重程度、无法同时写文件、生产环境没开关。
- logging 让你设级别、加格式、分渠道，一条配置全局生效。

## 核心原理（大二能懂的水平）
- **类比**：logging 像公司的「汇报制度」——小事（DEBUG）只记笔记本，大事（ERROR）要上报老板。级别阈值决定哪些被看到。
- 五个级别递增：`DEBUG(10) < INFO(20) < WARNING(30) < ERROR(40) < CRITICAL(50)`。

## 关键参数 / 易错点
- `logging.basicConfig(level=logging.INFO, filename='app.log', format='%(asctime)s %(levelname)s %(message)s')`。
- `logger = logging.getLogger(__name__)` 拿模块级 logger，比直接用 root 更规范。
- `logger.debug/info/warning/error(...)` 输出。
- 易错：级别设 INFO 时 DEBUG 不会显示（被阈值过滤）；重复 `basicConfig` 只在第一次生效。
- 进阶：`FileHandler` / `StreamHandler` 同时写文件和屏幕；`RotatingFileHandler` 自动切分日志。

## 设计时怎么用（反推思维）
> 做「服务/脚本」时，我会用 logging 替代 print：INFO 记正常流程、ERROR 记异常，配 `RotatingFileHandler` 防止日志爆盘。

## 典型应用 / 我在哪见过
- Web 服务请求链路追踪。
- 批处理任务的进度与失败记录。

## 关联
- 前置知识：[[模块与包]] [[异常处理]] [[标准库]]
- 相关：[[os模块]] [[标准库]]
- 反例/误区：[[异常处理]]（异常要 logger.error 记录，别只 pass）

## 来源
- Python 3.6.5 标准库文档（完整中文版）§16.6 logging — Python 的日志记录工具
