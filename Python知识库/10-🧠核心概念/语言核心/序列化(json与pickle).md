---

类型: 概念
主题: 语言核心
创建: 2026-07-21
复习: 
状态: 种子
tags: [Python, 语言核心, 概念]
---
---

# 序列化(json与pickle)

## 一句话定义
> 序列化就是“把内存里的 Python 对象变成能存盘/能网络传输的字节或文本，之后再还原回来”；`json` 走通用文本格式（跨语言），`pickle` 走 Python 私有二进制格式（保类型但仅限 Python）。

## 它解决什么问题 / 为什么存在
- 程序关了数据就没了（见[[文件IO]]）。但 `write` 只能写字符串，字典/对象直接写会报错。序列化把“任意对象 ↔ 字符串/字节”打通，实现持久化和进程间传递。
- `json`：和人类可读、和 JS/Java 等通用，适合配置文件、Web 接口、跨语言交换。
- `pickle`：能存几乎任何 Python 对象（含函数、自定义类实例），适合本机缓存、临时存储，但**不安全、不跨语言**。

## 核心原理（大二能懂的水平）
- **`json.dumps(obj)`** → 字符串；**`json.loads(字符串)`** → 对象；**`json.dump(obj, f)`** / **`json.load(f)`** 直接对接文件对象（配合[[文件IO]]的 `open`）。
- **类型映射**：dict↔对象、list↔数组、str/int/float/bool/None 直映；**`datetime`、自定义类实例 json 默认不会序列化**，需 `default=` 回调转成基本类型（也见[[日期时间]]）。
- **`pickle.dumps(obj)`** → bytes；**`pickle.loads(bytes)`** → 对象；同样有 `dump/load` 对接文件（用 `'rb'/'wb'` 二进制模式）。
- **`pickle` 保类型**：还原回来还是原来的类实例；`json` 还原回来只有 dict/list 等基础结构，类型信息丢失。
- **`ensure_ascii=False`**：让 json 直接写中文而不是 `\uXXXX` 转义。

## 关键参数 / 易错点
- **`pickle` 不能跨语言、且不安全的反序列化**：`pickle.loads` 对恶意数据可执行任意代码，**只 pickle 自己信任的数据**，绝不对外部输入 unpickle。
- **`json` 默认不认识 `datetime`/自定义对象**：直接 `dumps` 会 `TypeError`，要用 `default=` 转成 str/时间戳。
- **`json` 还原丢类型**：读回来是 dict，不是原来的类；需要结构对应自己再组装。
- **中文乱码**：不指定 `ensure_ascii=False` 时中文被转义；写文件用 `encoding='utf-8'`。
- **`pickle` 版本兼容**：不同 Python 版本的 pickle 协议可能不互通。

## 类比（帮助理解）
- 序列化像「把乐高模型拆成装箱清单再复原」：`json` 是一份通用的、谁都能照着拼的清单（跨语言）；`pickle` 是连“这块原本属于哪个特殊零件”都记下的原厂说明书（仅本厂能复原）。
- `json` 像「便签纸留言」：人能看懂、别的语言也能读；`pickle` 像「真空封存」：完整但只有 Python 能打开。

## 设计时怎么用（反推思维）
> 做 XX 系统时，我会用它能解决 YY：
> 做「本地配置/缓存」时，我会反推“数据给谁用、要不要跨语言”：给前端/别的语言用 → `json.dump(cfg, open('cfg.json','w',encoding='utf-8'), ensure_ascii=False, indent=2)`；仅本机 Python 临时缓存复杂对象 → `pickle.dump(obj, open('cache.pkl','wb'))`，且**绝不**对网络来的字节 `pickle.loads`。一句话：**对外/跨语言用 `json`（配 default 处理特殊类型），纯 Python 内部且可信数据用 `pickle`，永远不反序列化不可信来源**。

## 典型应用 / 我在哪见过
- 与[[文件IO]]：序列化结果常落盘到文件（`dump/load` 直接吃文件对象）。
- 与[[日期时间]]：时间对象需转字符串/时间戳才能进 json。
- 与[[标准库]]：`json`/`pickle` 属标准库持久化模块。

## 关联
- 前置知识：[[数据类型]] [[文件IO]]
- 相关：[[日期时间]]（序列化需转换）[[标准库]] [[模块与包]]
- 反例/误区：pickle 不可信数据；json 默认不识 datetime；忽略中文 ensure_ascii

## 来源
- 《Python程序设计开发宝典》(明日科技, 2017 v3.x) — PDF 为图片版，结合章节结构整理
