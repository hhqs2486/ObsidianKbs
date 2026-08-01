---
类型: 概念
主题: Java/Spring
tags: [概念]
创建: 2026-07-21
复习: 
状态: 种子
---

# Spring IoC

## 一句话定义
> Spring IoC（Inversion of Control，控制反转）是 Spring 框架的「容器」核心思想——原本由对象自己 `new` 依赖、自己控制依赖的获取时机，反转成「由 IoC 容器统一创建对象并注入依赖，对象只管使用」。

## 它解决什么问题 / 为什么存在
- 对象之间硬编码 `new` 导致紧耦合（《Spring的IoC容器》里 `FXNewsProvider` 直接 `new DowJonesNewsListener`）：换实现、做测试、扩展都要改源码。
- IoC 把「依赖的创建与绑定」从业务代码抽走，交给容器；业务对象只声明「我需要什么」，由 [[依赖注入]] 把实例送进来，从而解耦、可测试、可复用。
- 一句话概括书里的原话：**IoC 是一种帮助我们解耦各业务对象间依赖关系的对象绑定方式**。

## 核心原理（大二能懂的水平）
- IoC 容器本质是一个 **IoC Service Provider**（书里原话），统一管理所有受管对象（Bean）及它们之间的依赖关系。
- Spring 提供两种容器类型：
  - **BeanFactory**（基础容器）：默认**延迟初始化（lazy-load）**，用到才初始化并注入；启动快、省资源，适合资源受限场景。
  - **ApplicationContext**（高级容器）：构建在 BeanFactory 之上，启动即初始化全部 Bean，还额外提供事件发布、国际化、统一资源加载等；资源充足、要功能多时用它（代价是启动慢一点）。
- 对象只需声明依赖，容器在创建时把依赖对象「注入」进来（见 [[依赖注入]] 的三种方式）。容器背后靠 `BeanFactory` / `ApplicationContext` 接口与 `Resource` / `ResourceLoader` 抽象加载配置（XML / 注解 / Java Config）。

## 关键参数 / 易错点
- **BeanFactory vs ApplicationContext** 这点最关键：前者 lazy（启动快、运行期首次访问才初始化），后者 eager（启动慢、运行期零等待）。
- Bean 作用域（singleton / prototype 等）决定容器创建几个实例。
- 易错：把 IoC 和 [[依赖注入]] 当成两个独立概念——书里明确 IoC 的别名就是依赖注入（DI 是实现 IoC 的一种方式）。

## 类比（帮助理解）
- 原来「自己跑到衣柜拿衣服穿」（主动 `new`）；现在「跟另一半说一声，衣服直接送过来」（容器注入）。书里还有酒吧点酒类比：你只管说「Tsingdao」，服务生（容器）把酒送来，你不用关心酒从哪来。

## 设计时怎么用（反推思维）
> 做业务系统、希望模块之间松耦合、方便单测与替换实现时，我会把所有「被依赖的对象」交给 Spring IoC 容器管理，业务类只写接口依赖 + 注入点（构造器或 setter）。换实现（如换新闻源）零改业务代码：`new FXNewsProvider(new MarketWin24NewsListener(), new DowJonesNewsPersister())` 即可。

## 典型应用 / 我在哪见过
- Spring 全家桶（[[Spring Boot]]、Spring MVC、Spring Data、Spring Security）全都建立在 IoC 容器之上。
- 书里 `FXNewsProvider` 用 IoC 后无需为 `MarketWin24` 新闻源重写类，只换注入的 Listener 实现。

## 关联
- 前置知识：[[依赖注入]]
- 相关：[[Spring Boot]] [[微服务]]
- 反例/误区：在业务代码里到处 `new` 具体实现（紧耦合、难测、难扩展）

## 来源
- 《Spring的IoC容器》第 2 章（IoC 基本概念）、第 4 章（BeanFactory）、第 5 章（ApplicationContext），原文可引用。
