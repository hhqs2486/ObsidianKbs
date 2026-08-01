---
类型: 概念
tags: [Python知识库, 现代Python与生态]
主题: 现代Python与生态
创建: 2026-07-22
状态: 种子
---

# Zstandard 压缩 compression.zstd（PEP 784）

## 一句话定义
> Python 3.14 在标准库中内置 `compression.zstd` 模块，支持 Zstandard 压缩算法——比 gzip 更快、压缩率更高。

## 它解决什么问题 / 为什么存在
- 之前只能用 `gzip`/`bz2`/`lzma`，Zstd 需要第三方库（python-zstandard）
- Zstd 在工业界广泛使用（数据库/日志/大数据），标准库支持降低依赖

## 核心原理（大二能懂的水平）
- Zstandard 由 Facebook 开发，兼顾压缩率与速度
- 支持压缩级别 1-22，支持字典训练和流式处理
- API 与 `gzip` 模块风格一致

```python
import compression.zstd as zstd

data = b"large binary data..." * 1000
compressed = zstd.compress(data, level=3)
decompressed = zstd.decompress(compressed)
```

## 关键参数 / 易错点
- 压缩级别越高越慢但文件越小；默认 level=3 是速度和压缩率的平衡点
- 不是 `import zstd`，路径是 `compression.zstd`
- 流式处理用 `ZstdCompressor`/`ZstdDecompressor` 类

## 类比（帮助理解）
- gzip 是普速列车，zstd 是高铁——更快、更省空间，但票价（CPU）稍高。

## 设计时怎么用（反推思维）
> 日志归档、网络传输压缩、大数据存储时，用 zstd 替代 gzip 获得 2-5× 更快速度。

## 关联
- 前置知识：[[标准库与工程地图]]
- 相关：[[文件IO]]

## 来源
- Python 3.14 What's New (PEP 784)
