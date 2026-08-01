---

类型: 教程
来源: Python数据科学速查表 - Keras
创建: 2026-07-21
状态: 已读待消化
tags: [Python, 教程]
---
---

# 速查表：Keras（深度学习高层 API）

## 这条教程在解决什么
一张 Keras 速查表（DataCamp / 呆鸟 译），覆盖用 Keras 这个基于 TensorFlow/Theano 的高阶神经网络 API 来「搭模型 → 编译 → 训练 → 评估/预测 → 保存」的全流程高频代码。

## 定位 / 适合谁
- 定位：随用随查的备忘录，不是教程。
- 适合谁：已懂[[深度学习]]基本概念、想快速写出 MLP/CNN/RNN 网络的人。

## 关键内容（速查主题）
- **模型架构**：`Sequential`；全连接`Dense` 搭[[多层感知机]]；编译 `compile`（optimizer/loss/metrics）。
- **三类网络**：MLP（二分类/多分类/回归）、[[卷积神经网络]]（Conv2D/MaxPooling2D）、[[循环神经网络]]（Embedding + [[LSTM]]）。
- **预处理**：独热编码 `to_categorical`、序列填充 `pad_sequences`、标准化 `StandardScaler`；数据须为[[NumPy]]数组。
- **训练与评估**：`fit`/`evaluate`/`predict`；`train_test_split` 切分；`EarlyStopping` 回调（属[[训练技巧]]）。
- **优化与审视**：RMSprop/Adam（见[[优化算法深度学习]]）、`summary`/`get_weights`、[[损失函数]]与[[激活函数]]的选择。
- **数据与持久化**：内置数据集（mnist/cifar10/imdb/boston_housing）、`save`/`load_model`。

## 与其他书的互补
- 理论底座见[[深度学习]]、[[神经网络]]、[[卷积神经网络]]、[[循环神经网络]]、[[LSTM]]、[[Dropout]]、[[损失函数]]、[[梯度下降]]、[[激活函数]]、[[优化算法深度学习]]、[[训练技巧]]。
- 底层张量运算见[[张量]]；数据准备见[[NumPy]]/[[Pandas]]。
- 库 **Keras** 在库中暂无独立概念卡，需要时可在`数据科学与AI`下补充。

## 关联
- 概念：[[深度学习]] [[神经网络]] [[卷积神经网络]] [[循环神经网络]] [[LSTM]] [[多层感知机]] [[Dropout]] [[损失函数]] [[激活函数]] [[梯度下降]] [[优化算法深度学习]] [[训练技巧]] [[张量]] [[NumPy]] [[数据科学]]
- 项目：（暂无）

## 来源
- Python数据科学速查表 - Keras（DataCamp，呆鸟 译）；缓存 `.cache/045_Python数据科学速查表 - Keras.pdf/`（TEXT，full.txt 约 6KB）。
