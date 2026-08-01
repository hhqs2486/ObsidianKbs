---
类型: 概念
主题: Java/Spring
tags: [概念]
创建: 2026-07-21
复习: 
状态: 种子
---

# Spring Boot

## 一句话定义
> Spring Boot 是 Spring 生态的「快速启动脚手架」框架，用「约定优于配置 + 自动装配」让开发者几乎零 XML 就能跑起一个生产级 Spring 应用。

## 它解决什么问题 / 为什么存在
- 传统 Spring 要写大量 XML/Java 配置、自己配 [[Spring IoC]] 容器、自己接 Web 服务器，上手重、易出错。
- Spring Boot 把「怎么把 Spring 各模块拼起来」变成默认约定，开发者只写业务代码。

## 核心原理（大二能懂的水平）
- **起步依赖（Starter）**：如 `spring-boot-starter-web` 一次性引入 Web + 内嵌 Tomcat + [[Spring IoC]] 等一整套传递依赖，版本由 Boot 统一管理（BOM），避免依赖冲突。
- **自动配置（Auto-configuration）**：基于 classpath 上存在的 jar，用条件化注解（`@ConditionalOnClass` 等）自动注册 Bean——检测到 HSQLDB 就自动配内存数据源，检测到 Redis 就自动配 `RedisTemplate`。
- **内嵌服务器**：Tomcat/Jetty 直接打进可执行 jar，`java -jar` 即跑，无需外部 Web 容器。
- **Actuator**：暴露健康检查、指标等运维端点。
- 本质仍是建立在 [[Spring IoC]] / [[依赖注入]] 之上——自动配置只是帮你「批量写好了 Bean 定义」，核心机制没变。

## 关键参数 / 易错点
- `application.properties` / `application.yml` 是主配置入口。
- `@SpringBootApplication` = `@Configuration` + `@EnableAutoConfiguration` + `@ComponentScan` 三合一。
- 易错：自动配置「太多/太少」时用排除（`@SpringBootApplication(exclude=...)`）或手动 `@Bean` 覆盖（就近优先）；Starter 版本不要自己乱升，交给 Boot 的 BOM 管。
- 注意：Boot 是建立在 [[Spring IoC]] 之上的「上层封装」，不是替代 IoC。

## 类比（帮助理解）
- 乐高套装：零件（Starter）和拼装说明（Auto-config）都给你配好了，你只管按图纸拼自己想要的部分；而 [[Spring IoC]] 是那套「积木咬合（注入）」的基本机制。

## 设计时怎么用（反推思维）
> 要快速搭一个微服务 / Web 后端时，我会用 Spring Boot 起项目，靠 Starter 引入能力、靠自动配置少写 Bean，只在业务层用 [[依赖注入]] 解耦；需要精细控制时再用 `@Bean` 覆盖默认。它是现代 Java [[微服务]] 的默认底座。

## 典型应用 / 我在哪见过
- 绝大多数现代 Java 后端 / 微服务用 Spring Boot；常作为 Spring Cloud（[[微服务]] 治理）的底座。
- 与 [[Spring IoC]]、[[依赖注入]] 是「上层封装 vs 底层机制」的关系。

## 关联
- 前置知识：[[Spring IoC]] [[依赖注入]]
- 相关：[[微服务]]
- 反例/误区：纯手写 XML 把各 Spring 模块一个个拼起来（效率低、易出错）

## 来源
- 通用 Spring 框架知识（本批《Spring的IoC容器》聚焦 IoC / DI 基础，Spring Boot 为其上层封装，结合知识补全）。
