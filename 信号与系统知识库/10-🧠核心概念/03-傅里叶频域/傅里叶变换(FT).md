---
类型: 概念
模块: 03-傅里叶频域
tags: [信号与系统, 03-傅里叶频域]
创建: 2026-07-31
复习: 
状态: 种子
---

# 傅里叶变换(FT)

## 一句话定义
> 把**非周期**信号 $f(t)$ 分解成"无数个连续频率的复指数分量"——正变换给出每个频率分量的"配方" $F(j\omega)$，反变换用配方还原信号。类比：把一道混合菜拆成"各频率调料"的含量表。

## 它解决什么问题 / 为什么存在
- [[傅里叶级数（指数型）]] 只适用于周期信号（离散谱）；FT 把思想推广到一般非周期信号，得到**连续频谱**，是频域分析的总入口。
- 求系统响应、滤波、调制、[[抽样定理]]、[[无失真传输]] 全都建立在 FT 之上。
- 对 [[LTI系统]]，频域里输出 = 输入频谱 × [[频率响应]] $H(j\omega)$，把卷积变成乘法（见 [[卷积积分]]）。

## 核心原理（大二能懂的水平）
- 正变换（信号 → 频谱）：
  $$F(j\omega)=\int_{-\infty}^{\infty} f(t)e^{-j\omega t}dt$$
- 反变换（频谱 → 信号）：
  $$f(t)=\frac{1}{2\pi}\int_{-\infty}^{\infty} F(j\omega)e^{j\omega t}d\omega$$
- **存在条件（狄里赫利/充分条件）**：信号绝对可积 $\int|f(t)|dt<\infty$（更弱条件允许含冲激项，如 $\varepsilon(t)$、常数）。
- FT ↔ 傅里叶级数的关系：周期信号可看作"FT 退化成冲激串"，见 [[周期信号的傅里叶变换]]。

## ⭐ 重点标注（公式 / 定理 / 必记考点）
### 核心公式
$$F(j\omega)=\int_{-\infty}^{\infty} f(t)e^{-j\omega t}dt,\qquad f(t)=\frac{1}{2\pi}\int_{-\infty}^{\infty} F(j\omega)e^{j\omega t}d\omega$$

### 重要定理 / 结论
**常用变换对（必背，做题高频）**：
- $\delta(t)\leftrightarrow 1$
- $1\leftrightarrow 2\pi\delta(\omega)$
- $e^{-at}\varepsilon(t)\ (a>0)\leftrightarrow \dfrac{1}{a+j\omega}$
- $e^{-a|t|}\ (a>0)\leftrightarrow \dfrac{2a}{a^2+\omega^2}$
- $\varepsilon(t)\leftrightarrow \pi\delta(\omega)+\dfrac{1}{j\omega}$
- 门函数 $g_\tau(t)\leftrightarrow \tau\,\mathrm{Sa}\!\left(\dfrac{\omega\tau}{2}\right)$，其中 $\mathrm{Sa}(x)=\dfrac{\sin x}{x}$
- $\mathrm{Sa}(\omega_c t)\leftrightarrow \dfrac{\pi}{\omega_c}\big[\varepsilon(\omega+\omega_c)-\varepsilon(\omega-\omega_c)\big]$（对称性）
- $e^{j\omega_0 t}\leftrightarrow 2\pi\delta(\omega-\omega_0)$
- $\cos\omega_0 t\leftrightarrow \pi[\delta(\omega-\omega_0)+\delta(\omega+\omega_0)]$
- $\sin\omega_0 t\leftrightarrow j\pi[\delta(\omega+\omega_0)-\delta(\omega-\omega_0)]$
- $\mathrm{sgn}(t)\leftrightarrow \dfrac{2}{j\omega}$

### 必记考点
- 正变换积分核 $e^{-j\omega t}$，反变换核 $e^{j\omega t}$，差一个负号和 $1/2\pi$。
- 门函数 ↔ Sa 函数、Sa ↔ 门函数，是对称性的典型，选择题/计算题必考。
- FT 与 [[拉普拉斯变换(LT)]] 关系：LT 是 FT 的推广（收敛域概念在 04 模块），存在 FT 不一定存在 LT，反之存在 LT 也不一定存在 FT（见考点真题）。

## 关键参数 / 易错点
- $e^{-at}\varepsilon(t)$ 的变换要求 $a>0$，否则不收敛（发散信号无普通 FT）。
- 含 $\varepsilon(t)$、常数、直流的变换会冒出 $\delta(\omega)$ 项，别漏。
- $F(j\omega)$ 一般是复数，写结果时幅度+相位或实部+虚部分开。

## 类比（帮助理解）
- 把信号比作一段混合香水，FT 就是"气相色谱报告"：横轴是频率，纵轴是每种频率"香料"的含量（复数，含强弱和相位）。反变换是按配方重新调出原香水。

## 关联
- 前置依赖（先懂这些）：[[LTI系统]]、[[冲激响应]]、[[卷积积分]]、[[傅里叶级数（指数型）]]
- 相关：[[FT性质]]、[[周期信号的傅里叶变换]]、[[频谱]]、[[频率响应]]、[[抽样定理]]、[[拉普拉斯变换(LT)]]
- 反例 / 误区：认为"有拉氏变换就一定有傅氏变换"——错（如增长信号 $e^{at}\varepsilon(t),a>0$ 有 LT 无 FT）。

## 来源
- 吴大正《信号与线性系统分析》第5版（笔记/题库文字版整理）
