---

类型: 教程
来源: Natural Language Processing with Python.pdf
创建: 2026-07-21
状态: 已读待消化
tags: [Python, 教程]
---
---

# Natural Language Processing with Python（NLTK 实战）

## 这条教程在解决什么
- 用 NLTK 库带着做自然语言处理：从语料访问、词性标注、分类到句法/语义分析，边做边补 Python 基础。

## 定位 / 适合谁
- 定位：NLP 入门的“官方配套书”（NLTK 作者团队编写），经典但示例基于 Python 2.x。
- 适合：想用 Python 做文本/语言处理、已有少量 Python 基础的读者。

## 关键内容（按 PDF 章节提纲）
- Ch1 Language Processing and Python（NLTK 安装、语料、频率分布；穿插 [[Python]] 基础）
- Ch2 Accessing Text Corpora and Lexical Resources（语料库、词典资源）
- Ch3 Processing Raw Text（分词、原始文本处理） → [[正则表达式]] [[字符串]] [[列表]]
- Ch4 Writing Structured Programs（条件、函数、[[异常处理]]） → [[函数基础]] [[控制流]]
- Ch5 Categorizing and Tagging Words（词性标注）
- Ch6 Learning to Classify Text（文本分类、朴素贝叶斯） → [[机器学习]]
- Ch7 Extracting Information from Text（信息抽取、组块、正则解析）
- Ch8 Analyzing Sentence Structure（句法树、解析器）
- Ch9 Building Feature-Based Grammars（基于特征的文法）
- Ch10 Analyzing the Meaning of Sentences（语义分析）
- Ch11 Managing Linguistic Data（语言数据管理）

## 我卡住/没懂的地方
- 全书示例为 Python 2.x（print 语句、除法语义），迁移到 Python 3 需自行调整。
- NLTK 库本身本库未建独立概念卡，相关知识点归入 [[自然语言处理]]。

## 它背后的原理（别只记操作）
- “计算即语言”：把文本当原始数据，用频率分布、条件频率分布等统计手段提炼风格与内容特征。
- 文本分类本质是有监督学习：用特征（词频等）训练分类器 → 衔接 [[机器学习]]。

## 我能复用/改编的点
> 换需求时：Ch3 的分词/正则清洗、Ch6 的特征提取+分类套路，可直接套到“垃圾邮件识别 / 情感分析”等任务。

## 关联
- 概念：[[Python]] [[自然语言处理]] [[机器学习]] [[字符串]] [[列表]] [[函数基础]] [[控制流]] [[异常处理]] [[正则表达式]]
- 项目：（无）

## 互补关系
- 与 [[自然语言处理]] 概念卡互补（该书即该领域的权威入门）。
- 库级内容（NLTK）可与本库「用Python进行自然语言处理」「NLTK基础教程」等书互链；文本分类一章衔接 [[机器学习]]。

## 来源
- Natural Language Processing with Python.pdf；缓存 full.txt 为真实可提取文本（504页，英文，17章），本笔记据此整理，无图片版说明。
