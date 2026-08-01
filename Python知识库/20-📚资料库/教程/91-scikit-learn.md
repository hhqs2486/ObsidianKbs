---

类型: 教程
来源: Python数据科学速查表 - Scikit-Learn.pdf（DataCamp 出品，呆鸟 译，天善智能）
创建: 2026-07-21
状态: 已读待消化
tags: [Python, 教程]
---
---

# Scikit-Learn 速查表

## 这条教程在解决什么
一页式速查表，把 [[scikit-learn]]（scikit-learn）的统一建模接口串起来：加载数据 → 预处理 → 拟合 → 预测 → 评估 → 调参。是 [[机器学习]] 工程化的"操作地图"。

> 注：`Scikit-Learn` 作为库名在库中暂无独立概念卡（由数据科学 anchor 书负责），下文以"Scikit-Learn(库)"指代，相关算法链接到各自概念卡。

## 定位 / 适合谁
- 定位：scikit-learn 工作流速查；强调"统一 estimator API"这一设计。
- 适合谁：学过基础 ML、需要回忆 `fit/predict`、预处理与调参写法的人。

## 关键内容（按速查表区块）
- **数据格式**：数字存为 [[NumPy]] 数组 / SciPy 稀疏矩阵，也支持 [[Pandas]] DataFrame
- **统一接口**：`estimator.fit(X, y)` → `predict` / `predict_proba` / `score`；有监督与无监督同此范式
- **有监督模型**：`LinearRegression`、`SVC`(见 [[支持向量机SVM]])、`GaussianNB`(朴素贝叶斯)、`KNeighborsClassifier`(KNN)
- **无监督模型**：`KMeans`(见 [[聚类]])、`PCA`(见 [[降维PCA]])
- **数据预处理**（`sklearn.preprocessing`）：
  - `StandardScaler`(标准化) / `Normalizer`(归一化) / `Binarizer`(二值化)
  - `LabelEncoder`(类别编码)
  - `Imputer`(缺失值填补，对应 [[缺失值处理]])
  - `PolynomialFeatures`(多项式特征，[[特征工程]])
- **训练/测试切分**：`train_test_split`
- **模型评估**（`sklearn.metrics`）：
  - 分类：`accuracy_score` / `classification_report` / `confusion_matrix`
  - 回归：`mean_absolute_error` / `mean_squared_error` / `r2_score`
  - 聚类：`adjusted_rand_score` / `homogeneity_score` / `v_measure_score`
- **交叉验证**：`cross_val_score` ——见 [[交叉验证]]
- **模型调参**：`GridSearchCV`(网格) / `RandomizedSearchCV`(随机) ——属于 [[特征工程]] 后的关键一步
- **简例**：用 `datasets.load_iris` + `StandardScaler` + `KNeighborsClassifier` + `accuracy_score` 跑通全流程

## 它背后的原理（别只记操作）
scikit-learn 的精髓是 **estimator 统一接口 + 管道化**：每个算法都暴露 `fit/predict`，预处理也当作 estimator，因此可以像搭积木一样串成 Pipeline，再用 `GridSearchCV` 整体调参。这与 [[梯度下降]]（优化内部）、[[损失函数]]（评估内部）是上下层关系。

## 我能复用/改编的点
> 做建模系统时，固定"StandardScaler → 算法 → cross_val_score"三段式；调参用 `GridSearchCV` 而不是手调；分类问题务必同时看 `confusion_matrix` 而非只看准确率。

## 关联
- 概念：[[机器学习]] [[监督学习]] [[无监督学习]] [[分类]] [[回归]] [[聚类]] [[降维PCA]] [[交叉验证]] [[特征工程]] [[缺失值处理]] [[梯度下降]] [[支持向量机SVM]] [[决策树]] [[随机森林]] [[集成学习]] [[损失函数]] [[NumPy]] [[Pandas]]
- 互补：[[NumPy]]/[[Pandas]] 负责造数据，本表负责建模与评估

## 来源
- Python数据科学速查表 - Scikit-Learn.pdf（DataCamp，呆鸟 译，天善智能；TEXT 提取，内容真实）
