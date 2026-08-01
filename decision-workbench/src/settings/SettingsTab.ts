// ============================================================
// SettingsTab — 插件设置页
// ============================================================

import { App, PluginSettingTab, Setting } from "obsidian";
import DecisionWorkbenchPlugin from "../../main";

const DEFAULT_RULES_CONTENT = `# 决策规则

修改此文件自定义决策工作台的分析行为，下次运行分析时自动生效。

## 分析参数

\`\`\`yaml
similarity_threshold: 0.2    # 标签相似度阈值（默认 0.3，越低关联越多）
max_suggestions: 10          # 最大建议数（默认 5）
max_clusters: 8              # 最大聚类数（默认 5）
\`\`\`

## 优先级自动提升规则

\`\`\`yaml
# condition 格式: tag:标签名 或 due:天数
# 匹配后自动设置对应优先级
priority_rules:
  - condition: "tag:PCB"
    priority: high
  - condition: "due:3"
    priority: high
  - condition: "tag:学习"
    priority: medium
\`\`\`

## 标签路由表

\`\`\`yaml
# 按标签自动分配处理流程
# 卡片上会显示路由徽章
routes:
  PCB: 器件选型流程
  学习: 费曼学习法流程
  写作: 内容创作流程
  Python: 编程开发流程
\`\`\`
`;

export class DecisionWorkbenchSettingsTab extends PluginSettingTab {
  private plugin: DecisionWorkbenchPlugin;

  constructor(app: App, plugin: DecisionWorkbenchPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    containerEl.createEl("h3", { text: "决策工作台设置" });

    // 自动提取
    new Setting(containerEl)
      .setName("自动提取任务")
      .setDesc("笔记保存时自动提取任务信息和关联笔记")
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.autoExtract)
          .onChange(async (value) => {
            this.plugin.settings.autoExtract = value;
            await this.plugin.saveSettings();
          })
      );

    // 决策分析间隔
    new Setting(containerEl)
      .setName("决策分析间隔（秒）")
      .setDesc("自动运行决策引擎的最小间隔时间")
      .addText((text) =>
        text
          .setValue(String(this.plugin.settings.decisionInterval))
          .onChange(async (value) => {
            const num = parseInt(value, 10);
            if (!isNaN(num) && num >= 60) {
              this.plugin.settings.decisionInterval = num;
              await this.plugin.saveSettings();
            }
          })
      );

    // 相似度阈值
    new Setting(containerEl)
      .setName("关联强度阈值")
      .setDesc("笔记自动关联的最小相似度（0-1），值越低关联越多")
      .addText((text) =>
        text
          .setValue(String(this.plugin.settings.similarityThreshold))
          .onChange(async (value) => {
            const num = parseFloat(value);
            if (!isNaN(num) && num >= 0 && num <= 1) {
              this.plugin.settings.similarityThreshold = num;
              await this.plugin.saveSettings();
            }
          })
      );

    // 看板列配置
    containerEl.createEl("h4", { text: "看板列配置" });
    const colsContainer = containerEl.createDiv({ cls: "dw-settings-columns" });
    for (let i = 0; i < this.plugin.settings.columns.length; i++) {
      const colSetting = new Setting(colsContainer)
        .setName(`列 ${i + 1}`)
        .addText((text) =>
          text
            .setValue(this.plugin.settings.columns[i])
            .onChange(async (value) => {
              this.plugin.settings.columns[i] = value;
              await this.plugin.saveSettings();
            })
        );
      if (this.plugin.settings.columns.length > 2) {
        colSetting.addButton((btn) =>
          btn
            .setIcon("trash")
            .setTooltip("删除此列")
            .onClick(async () => {
              this.plugin.settings.columns.splice(i, 1);
              await this.plugin.saveSettings();
              this.display();
            })
        );
      }
    }

    new Setting(colsContainer)
      .addButton((btn) =>
        btn
          .setButtonText("添加列")
          .setIcon("plus")
          .onClick(async () => {
            this.plugin.settings.columns.push("新列");
            await this.plugin.saveSettings();
            this.display();
          })
      );

    // 操作按钮
    containerEl.createEl("h4", { text: "数据操作" });

    new Setting(containerEl)
      .setName("扫描全部笔记")
      .setDesc("从所有笔记中提取任务并建立关联")
      .addButton((btn) =>
        btn
          .setButtonText("开始扫描")
          .setIcon("search")
          .onClick(async () => {
            btn.setButtonText("扫描中...");
            const count = await this.plugin.taskLinker.processAllNotes();
            btn.setButtonText(`完成 (${count} 个任务)`);
            setTimeout(() => {
              btn.setButtonText("开始扫描");
              this.display();
            }, 3000);
          })
      );

    new Setting(containerEl)
      .setName("运行决策分析")
      .setDesc("手动触发决策引擎分析")
      .addButton((btn) =>
        btn
          .setButtonText("运行分析")
          .setIcon("lightbulb")
          .onClick(async () => {
            btn.setButtonText("分析中...");
            const suggestions = await this.plugin.decisionEngine.analyze();
            btn.setButtonText(`完成 (${suggestions.length} 条建议)`);
            setTimeout(() => {
              btn.setButtonText("运行分析");
            }, 3000);
          })
      );

    new Setting(containerEl)
      .setName("清除所有任务数据")
      .setDesc("删除任务存储中的所有任务（不影响笔记文件）")
      .addButton((btn) =>
        btn
          .setButtonText("清除")
          .setIcon("trash")
          .setWarning()
          .onClick(async () => {
            const tasks = this.plugin.taskStore.getAllTasks();
            for (const task of tasks) {
              this.plugin.taskStore.deleteTask(task.id);
            }
            await this.plugin.taskStore.save();
            btn.setButtonText("已清除");
            setTimeout(() => {
              btn.setButtonText("清除");
            }, 2000);
          })
      );

    // 决策规则文件
    containerEl.createEl("h4", { text: "决策规则" });

    new Setting(containerEl)
      .setName("个人规则文件")
      .setDesc("decision-rules.md — 自定义分析参数、优先级规则、标签路由")
      .addButton((btn) =>
        btn
          .setButtonText("创建/打开")
          .setIcon("file-edit")
          .onClick(async () => {
            const rulesPath = "decision-rules.md";
            const exists = await this.app.vault.adapter.exists(rulesPath);
            if (!exists) {
              await this.app.vault.create(rulesPath, DEFAULT_RULES_CONTENT);
            }
            this.app.workspace.openLinkText(rulesPath, "", false);
          })
      )
      .addButton((btn) =>
        btn
          .setButtonText("重新加载")
          .setIcon("refresh-cw")
          .onClick(async () => {
            await this.plugin.decisionEngine.loadRules();
            btn.setButtonText("已加载");
            setTimeout(() => btn.setButtonText("重新加载"), 2000);
          })
      );
  }
}
