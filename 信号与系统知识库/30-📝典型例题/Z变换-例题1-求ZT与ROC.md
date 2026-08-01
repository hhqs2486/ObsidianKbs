---
类型: 例题
模块: 05-Z变换
tags: [信号与系统, 例题]
创建: 2026-07-31
难度: 中
来源学校: 武汉大学
---

# Z变换-例题1-求ZT与ROC

## 题目
已知 $x(n)=a^n u(n)$，$0<a<1$，分别求：
（1）$n x(n)$ 的 z 变换；
（2）$a^{-n}u(-n)$ 的 z 变换。
[武汉大学 2015 年研]

## 解题思路（先看这一步）
- （1）先写出 $x(n)$ 的 ZT，再用 **z 域微分性质** $n x(n)\leftrightarrow -z\dfrac{dX(z)}{dz}$ 得到 $n x(n)$ 的变换。
- （2）把 $a^{-n}u(-n)$ 写成 $x(-n)$ 的形式，套**反转性质** $x(-n)\leftrightarrow X(z^{-1})$；注意它是**左边序列**，ROC 是圆内。

## 详细解答
（1）已知 $X(z)=\mathscr{Z}\{a^n u(n)\}=\dfrac{z}{z-a},\ |z|>a$。
由 z 域微分性质：
$$\mathscr{Z}\{n x(n)\}=-z\frac{dX(z)}{dz}=-z\frac{d}{dz}\!\left(\frac{z}{z-a}\right)=-z\cdot\frac{-a}{(z-a)^2}=\frac{az}{(z-a)^2}$$
故 $n a^n u(n)\leftrightarrow \dfrac{az}{(z-a)^2},\ |z|>a$。

（2）令 $g(n)=a^{-n}u(-n)=x(-n)$，由反转性质 $x(-n)\leftrightarrow X(z^{-1})$，得
$$G(z)=X(z^{-1})=\frac{z^{-1}}{z^{-1}-a}=\frac{1}{1-az}=\frac{-a^{-1}}{z-a}\cdot(-a)\quad\text{整理为}\quad \frac{z}{z-a^{-1}}\Big|_{反转处理}$$
更直接地：
$$G(z)=\frac{1}{1-az}=\frac{-1/a}{z-a^{-1}}\cdot a^{-1}\dots$$
规范写法：因 $a^{-n}u(-n)$ 是左边（反因果）序列，利用 $-b^n\varepsilon(-n-1)\leftrightarrow\dfrac{z}{z-b}$（$|z|<|b|$），令 $b=a^{-1}$：
$$a^{-n}u(-n)=-(a^{-1})^n\big[-u(-n)\big]\ \Rightarrow\ \mathscr{Z}\{a^{-n}u(-n)\}=\frac{-z}{z-a^{-1}},\quad |z|<a^{-1}$$
（因 $0<a<1$，故 $a^{-1}>1$，ROC 为小圆内部。）

## 考点 & 易错
- 考查知识点：[[Z变换(ZT)]]、[[ZT性质]]（z 域微分、反转）、[[收敛域(ROC)]]
- 易错点：
  1. 反转后忘记 ROC 翻转——右边序列 $|z|>a$ 的反转应变成**圆内** $|z|<a^{-1}$；
  2. 左边序列公式易漏负号 $-a^n\varepsilon(-n-1)\leftrightarrow z/(z-a)$；
  3. 混淆 $a^{-n}u(-n)$ 与 $a^n u(-n)$ 的极点位置。

## 同类题 / 变式
- 把 $u(n)$ 换成 $|n|$ 双边序列（如 $(1/2)^{|n|}$），需拆成右边+左边两段分别求再合并 ROC 为环域（见 [[逆Z变换]] 双边情形）。
- $x(n)=a^{|n|}$（中山大学 2018）同理拆因果+反因果。

## 关联
- 知识点：[[Z变换(ZT)]]、[[ZT性质]]、[[收敛域(ROC)]]

## 来源
- 吴大正《信号与线性系统分析》第5版（笔记/题库文字版整理）
