# Skills

本目录存放可在 AI Agent（如 Claude Code、Cursor、CodeBuddy 等）中使用的可复用 skills。每个 skill 是 YAML frontmatter + Markdown body 的文本文件，Agent 加载后按 skill 定义的流程执行任务。

## 可用 Skills

| Skill | 文件 | 用途 |
| --- | --- | --- |
| teach | [teach/SKILL.md](teach/SKILL.md) | 让 AI 充当私人导师，按"知识-技能-智慧"递进引导学习 |

## 如何使用

1. 将仓库克隆到本地后，在你的 AI Agent 工作目录下引用对应的 SKILL.md
2. 例如使用 `teach` skill 学习 Agent 开发：
   - 告诉你的 Agent "请加载 skills/teach/SKILL.md 来教我学习本仓库的内容"
   - Agent 会引导你创建 MISSION.md 记录学习目标
   - 它会生成结构化课程、交互式练习、参考材料和学习记录
3. teach skill 适合配合仓库 README 中的 Learning Todo List 使用

## 与 Stage 5 的关系

Stage 5 讲解了 Skill 的设计原则：Skill、Tool、Prompt、MCP 的边界。本目录中的 skill 是这些原则的实际应用示例。学习 Stage 5 时可以参考 teach skill 的 `SKILL.md` 结构，以及它的格式模板（`MISSION-FORMAT.md`、`RESOURCES-FORMAT.md` 等）理解一个完整 skill 包的组成。

## Skill 目录结构

```
teach/
  SKILL.md                  # 核心：skill 定义（frontmatter + Markdown）
  MISSION-FORMAT.md         # 学习目标模板格式说明
  RESOURCES-FORMAT.md       # 资源整理格式说明
  LEARNING-RECORD-FORMAT.md # 学习记录格式说明
  GLOSSARY-FORMAT.md        # 术语表格式说明
```

## 贡献 Skills

如果你为某个学习阶段写了可复用的 skill，欢迎提交 PR 加入本目录。参照 [CONTRIBUTING.md](../CONTRIBUTING.md) 的指引。

- skill 应遵循 `frontmatter: name + description` 格式
- 附带至少一个格式模板或脚本说明
- 在 stage-5/README.md 的 skill 示例列表中增加引用
