---

类型: 概念
主题: subprocess
创建: 2026-07-21
状态: 种子
tags: [Python, 标准库与工程, 概念]
---
---

# subprocess 模块

## 一句话定义
> subprocess 在当前 Python 程序里「启动并控制另一个外部程序」，捕获它的输出/错误/返回码——替代老旧的 `os.system`。

## 它解决什么问题 / 为什么存在
- `os.system()` 只能返回退出码，拿不到命令的标准输出，也不安全。
- subprocess 把外部命令当「可控子进程」：传参、读输出、管错误、设超时。

## 核心原理（大二能懂的水平）
- **类比**：你（Python）雇了个外包（子进程）干活，subprocess 是你们之间的「工作单 + 验收通道」——你写下要他做啥、他干完把成果（stdout）交回来，出问题你能知道（stderr/returncode）。
- `subprocess.run(['ls', '-l'], capture_output=True, text=True)` 最推荐。

## 关键参数 / 易错点
- 用**列表**传参：`['grep', 'foo']`，别拼成字符串，避免 shell 注入风险。
- `capture_output=True` + `text=True` 拿字符串输出；结果在 `r.stdout` / `r.stderr` / `r.returncode`。
- `check=True` 让非 0 退出码抛异常。
- `timeout=` 防止命令卡死。
- 易错：传字符串给 `shell=False` 会被当成「命令名含空格」而失败；需要 shell 特性时才 `shell=True`（谨慎）。

## 设计时怎么用（反推思维）
> 做「调用 ffmpeg/git 等现成命令行工具」时，我会用 `subprocess.run(..., check=True, capture_output=True)` 拿到结果并处理失败。

## 典型应用 / 我在哪见过
- 调用 git 做自动化提交。
- 流水线里串接外部可执行文件。

## 关联
- 前置知识：[[os模块]] [[异常处理]] [[标准库]]
- 相关：[[multiprocessing模块]] [[threading模块]] [[argparse模块]]
- 反例/误区：[[os模块]]（别用 os.system，拿不到输出且不安全）

## 来源
- Python 3.6.5 标准库文档（完整中文版）§17.5 subprocess — 子流程管理
