---

类型: 概念
主题: scikit-learn
创建: 2026-07-21
复习: 
状态: 种子
tags: [Python, 数据科学与AI, 概念]
---
---

# scikit-learn

## 一句话定义
> scikit-learn（常写 sklearn）是 Python 里最主流的**传统机器学习**库，把分类、回归、聚类、降维、模型选择等算法统一成一套「实例化 → fit → predict」的 API。

## 它解决什么问题 / 为什么存在
- 传统机器学习（非深度学习）任务里，每个算法自己造轮子太累：数据预处理、训练、评估、调参、交叉验证都要重复写。
- sklearn 把这些流程标准化，让你用几行代码完成「读数据 → 建模 → 预测 → 评估」的完整闭环，是 Kaggle 入门和工程落地的默认基座。

## 核心原理（大二能懂的水平）
- **统一接口（Estimator API）**：几乎所有模型都是同一个套路——
  - `model = SomeModel(...)` 先实例化（设超参数）
  - `model.fit(X_train, y_train)` 用训练数据拟合（学参数）
  - `model.predict(X_test)` 预测；无监督的用 `model.fit(X).transform(X)` 或 `predict`
- **数据形态**：特征矩阵 `X` 是二维数组（样本 × 特征），标签 `y` 是一维数组。
- **Pipeline（管道）**：把「标准化 → 降维 → 训练」串成一条流水线，避免数据泄露、方便整体调参。
- **Transformer / Predictor 分工**：`Transformer`（如 `StandardScaler`、`PCA`）做特征变换，有 `fit_transform`；`Predictor`（如 `LogisticRegression`、`KMeans`）做预测。
- **模型选择工具**：`train_test_split`、`cross_val_score`、`GridSearchCV` 负责切分、交叉验证、网格搜超参。

## 关键参数 / 易错点
- **数据必须数值化、无缺失**：sklearn 不吃字符串类别、不放过 NaN；类别要先 `OneHotEncoder`/`LabelEncoder`，缺失要先 `SimpleImputer`。
- **fit 只拟合训练集**：测试集绝不能进 `fit`，否则数据泄露、指标虚高。
- **特征缩放影响距离类模型**：KNN、SVM、逻辑回归、PCA 对量纲敏感，先 `StandardScaler`；树模型（决策树/随机森林）不强制。
- **随机性要固定种子**：`random_state=42` 保证结果可复现。
- **版本与 NumPy/Pandas 强耦合**：常以 `np arrays` 或 `pd.DataFrame` 输入，注意列名在 Pipeline 中的传递。

## 类比（帮助理解）
- 把 sklearn 想成「机器学习乐高套装」：每个算法是一块标准积木（`LinearRegression`、`RandomForestClassifier`、`KMeans`），`Pipeline` 是拼装说明书，`GridSearchCV` 是自动帮你试不同拼法的助手。你只管把数据塞进去、选积木、按统一按钮（fit/predict）。

## 设计时怎么用（反推思维）
> 做「用历史数据预测设备是否故障」这类系统时，我会用 sklearn 的 `Pipeline(标准化 + 随机森林)` + `GridSearchCV` 快速产出可用基线模型，再用交叉验证确认泛化能力，而不是自己手搓训练循环。

## 典型应用 / 我在哪见过
- 房价预测（回归：`LinearRegression`/`RandomForestRegressor`）
- 邮件/设备故障分类（分类：`LogisticRegression`/`SVC`/`RandomForestClassifier`）
- 用户分群（聚类：`KMeans`）
- 特征降维可视化（`PCA`）
- Kaggle「从零开始通往 Kaggle 竞赛之路」「机器学习实践指南」等书的示例基座

## 关联
- 前置知识：[[机器学习]]、[[NumPy]]、[[Pandas]]、[[数据清洗]]
- 相关：[[降维PCA]]、[[随机森林]]、[[支持向量机SVM]]、[[决策树]]、[[交叉验证]]、[[特征工程]]、[[过拟合]]、[[Matplotlib]]（结果可视化）
- 反例/误区：[[深度学习]]（海量数据/复杂结构才上 TensorFlow/PyTorch，小数据 sklearn 更香）；别把测试集喂进 `fit`

## 来源
- 《Python机器学习及实践——从零开始通往Kaggle竞赛之路》《Python机器学习实践指南》《Python机器学习（原书第2版）》《Python数据科学速查表 - Scikit-Learn》
- 官方文档：scikit-learn.org
