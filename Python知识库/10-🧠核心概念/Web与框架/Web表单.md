---

类型: 概念
主题: Web与框架
创建: 2026-07-21
复习: 
状态: 种子
tags: [Python, Web与框架, 概念]
---
---

# Web表单

## 一句话定义
> Web 表单是网页上收集用户输入（登录框、留言框）的机制；在 Flask 里通常用 **WTForms + Flask-WTF** 用"Python 类"来声明表单字段与校验规则。

## 它解决什么问题 / 为什么存在
- 手写 HTML `<form>` 再手写一堆 `if 字段为空/太长` 的校验既啰嗦又易漏，且容易被绕过。用表单类把"字段+校验"集中定义，服务端统一验证，还自动生成 CSRF 令牌防跨站伪造。

## 核心原理（大二能懂的水平）
- 你定义一个 `class HelloForm(FlaskForm): name = StringField('名字', validators=[DataRequired(), Length(1,20)])`。
- 模板里 `{{ form.name() }}` 渲染输入框，`form.validate_on_submit()` 在 POST 时自动跑校验。
- Flask-WTF 在表单里塞隐藏的 `csrf_token` 字段防 CSRF。校验不过就带错误信息重渲染页面。

## 关键参数 / 易错点
- `validators=[DataRequired(), Length(min,max), ...]` 决定规则。
- `validate_on_submit()` 同时判断"是 POST 且校验通过"。
- 不渲染/不校验 `csrf_token` 会返回 400。
- 字段类型要对：`StringField`/`TextAreaField`/`PasswordField`/`SubmitField`。
- 错误用 `form.field.errors` 显示。
- 易错：把校验逻辑写在视图里而不是 validators（重复且易漏）。

## 类比（帮助理解）
- 像银行柜台的单子：表格上印好"此项必填、字数≤20"（validators），你填错柜员当场打回（validate_on_submit 失败），还盖个防伪章（csrf_token）证明是你本人填的。

## 设计时怎么用（反推思维）
> 做留言板时，我会用 FlaskForm 定义 body+name 两个字段加必填校验，`index` 视图里 `if form.validate_on_submit(): 存库+flash+redirect`——提交、校验、存数据一条龙。

## 典型应用 / 我在哪见过
- 登录/注册表单、评论/留言、搜索框、资料编辑。
- 本书留言板：`HelloForm(FlaskForm)` 含 `TextAreaField('Message', validators=[DataRequired(), Length(1,200)])` 与 `SubmitField`。

## 关联
- 前置知识：[[类与对象]] [[类型标注]]
- 相关：[[请求与响应]] [[模板引擎Jinja2]]
- 反例/误区：纯手写 HTML 表单不做服务端校验（前端 JS 校验可被绕过）。

## 来源
- 《Flask Web开发实战》第4、7章；本地文本 `.cache\Flask实战\ch09`、`.cache\Flask实战\ch12`
