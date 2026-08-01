---

类型: 教程
来源: Machine Learning in Action（Peter Harrington）
创建: 2026-07-21
状态: 已读待消化
tags: [Python, 教程]
---
---

# 机器学习实战（Machine Learning in Action）

## 定位 / 适合谁
- 一本「手搓算法」的机器学习入门：不依赖 scikit-learn，从零用 NumPy 实现 kNN、决策树、SVM 等，强调可执行伪代码。
- 适合：想真正搞懂算法内部、愿意读代码的人；需 [[Python]] 与基础线性代数/概率。

## 章节脉络（按真实 TOC，TEXT 版）
- Part 1 分类：机器学习基础、kNN、决策树、朴素贝叶斯、Logistic 回归、SVM、AdaBoost
- Part 2 回归预测：线性回归、树回归（CART、剪枝、模型树）
- Part 3 无监督：k-means 聚类、Apriori 关联分析、FP-growth 频繁项集
- Part 4 附加工具：PCA 降维、SVD 奇异值分解（推荐系统/图像压缩）、MapReduce 与 mrjob
- 附录：Python 入门、线性代数、概率、资源

## 关键知识点（双链）
- 语言核心（已验证存在）：[[数据类型]]、[[列表]]、[[字典]]、[[推导式]]、[[函数基础]]、[[模块与包]]、[[文件IO]]、[[异常处理]]、[[迭代器与生成器]]、[[序列化(json与pickle)]]
- 数据科学与AI（已验证存在）：[[机器学习]]、[[数据科学]]、[[数据分析]]、[[NumPy]]、[[数据可视化]]（Matplotlib 散点/决策边界）、[[自然语言处理]]（词袋/垃圾邮件分类）
- 算法本身（kNN/决策树/SVM 等）库中暂无对应卡，按指示用纯文本，不双链

## 互补关系
- 与 anchor 书《Python机器学习（原书第2版）》《Python机器学习及实践》互补：本书重「实现」，那些重「体系与 sklearn」。
- 与 [[数据可视化]] 互补：大量用 Matplotlib 画决策边界与散点。
- 与 [[自然语言处理]] 互补：朴素贝叶斯做文本/垃圾邮件分类即 NLP 入门案例。

## 来源
- Machine Learning in Action, Peter Harrington (Manning, 2012)，key=011，TEXT 版，内容依据真实正文 TOC 与章节整理。
