# 决策规则

修改此文件自定义决策工作台的分析行为，下次运行分析时自动生效。

## 分析参数

```yaml
similarity_threshold: 0.2    # 标签相似度阈值（默认 0.3，越低关联越多）
max_suggestions: 10          # 最大建议数（默认 5）
max_clusters: 8              # 最大聚类数（默认 5）
```

## 优先级自动提升规则

```yaml
# condition 格式: tag:标签名 或 due:天数
# 匹配后自动设置对应优先级
priority_rules:
  - condition: "tag:PCB"
    priority: high
  - condition: "due:3"
    priority: high
  - condition: "tag:学习"
    priority: medium
```

## 标签路由表

```yaml
# 按标签自动分配处理流程
# 卡片上会显示路由徽章
routes:
  PCB: 器件选型流程
  学习: 费曼学习法流程
  写作: 内容创作流程
  Python: 编程开发流程
```
