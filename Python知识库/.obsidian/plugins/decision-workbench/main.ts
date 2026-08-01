// ============================================================
// Decision Workbench — Plugin Entry
// ============================================================
// 插件主入口，负责：
// - 生命周期管理（加载/卸载）
// - 模块实例化（TaskStore、NoteExtractor、TaskLinker、DecisionEngine）
// - 视图注册（看板视图、任务面板）
// - 命令注册
// - 设置管理
// ============================================================

import {
  Plugin,
  WorkspaceLeaf,
  TFile,
  FuzzySuggestModal,
  Modal,
  App,
  Notice,
} from "obsidian";
import {
  DecisionWorkbenchSettings,
  DEFAULT_SETTINGS,
  Suggestion,
  ParsedTaskInput,
} from "./src/types";
import { TaskStore } from "./src/core/TaskStore";
import { NoteExtractor } from "./src/core/NoteExtractor";
import { TaskLinker } from "./src/core/TaskLinker";
import { DecisionEngine } from "./src/core/DecisionEngine";
import { BoardView, BOARD_VIEW_TYPE } from "./src/views/BoardView";
import { TaskPanel, TASK_PANEL_VIEW_TYPE } from "./src/views/TaskPanel";
import { DecisionWorkbenchSettingsTab } from "./src/settings/SettingsTab";
import { parseNaturalLanguage } from "./src/utils/nlpParser";

export default class DecisionWorkbenchPlugin extends Plugin {
  settings!: DecisionWorkbenchSettings;
  taskStore!: TaskStore;
  noteExtractor!: NoteExtractor;
  taskLinker!: TaskLinker;
  decisionEngine!: DecisionEngine;

  private lastSuggestions: Suggestion[] = [];
  private decisionTimer: number | null = null;

  async onload() {
    // 加载设置
    await this.loadSettings();

    // 实例化核心模块
    this.taskStore = new TaskStore(this.app);
    await this.taskStore.load();

    this.noteExtractor = new NoteExtractor(this.app);
    this.taskLinker = new TaskLinker(this.app, this.taskStore, this.noteExtractor);
    this.decisionEngine = new DecisionEngine(this.app, this.taskStore, this.settings);

    // 注册视图
    this.registerView(BOARD_VIEW_TYPE, (leaf) => new BoardView(leaf, this));
    this.registerView(TASK_PANEL_VIEW_TYPE, (leaf) => new TaskPanel(leaf, this));

    // 注册命令
    this.registerCommands();

    // 注册设置页
    this.addSettingTab(new DecisionWorkbenchSettingsTab(this.app, this));

    // 注册事件：笔记变更时自动提取
    if (this.settings.autoExtract) {
      this.registerEvent(
        this.app.metadataCache.on("changed", async (file: TFile) => {
          try {
            await this.taskLinker.processNote(file);
            await this.taskStore.save();
          } catch (e) {
            console.error("[Decision Workbench] Auto-extract error:", e);
          }
        })
      );
    }

    // 注册事件：笔记重命名时更新任务来源
    this.registerEvent(
      this.app.vault.on("rename", async (file: TFile, oldPath: string) => {
        const task = this.taskStore.getTaskByNote(oldPath);
        if (task) {
          this.taskStore.updateTask(task.id, { sourceNote: file.path });
          // 更新 linkedNotes 中的路径
          const updated = task.linkedNotes.map((n) =>
            n.path === oldPath ? { ...n, path: file.path } : n
          );
          this.taskStore.updateTask(task.id, { linkedNotes: updated });
          await this.taskStore.save();
        }
      })
    );

    // 注册事件：笔记删除时清理任务
    this.registerEvent(
      this.app.vault.on("delete", async (file: TFile) => {
        const task = this.taskStore.getTaskByNote(file.path);
        if (task) {
          // 不删除任务，但标记来源已失效
          this.taskStore.updateTask(task.id, { sourceNote: "" });
          await this.taskStore.save();
        }
      })
    );

    // 添加 ribbon 图标
    this.addRibbonIcon("layout-dashboard", "打开决策看板", () => {
      this.activateBoardView();
    });

    // 自动决策分析定时器
    this.startDecisionTimer();

    // 首次加载时自动扫描
    this.app.workspace.onLayoutReady(() => {
      if (this.taskStore.getAllTasks().length === 0) {
        this.taskLinker.processAllNotes().then((count) => {
          if (count > 0) {
            new Notice(`[决策工作台] 扫描完成，发现 ${count} 个任务`);
          }
        });
      }
    });
  }

  onunload() {
    if (this.decisionTimer) {
      window.clearInterval(this.decisionTimer);
    }
  }

  // ============================================================
  // 命令注册
  // ============================================================

  private registerCommands() {
    // 打开看板
    this.addCommand({
      id: "open-decision-board",
      name: "打开决策看板",
      callback: () => this.activateBoardView(),
    });

    // 打开任务面板
    this.addCommand({
      id: "open-task-panel",
      name: "打开任务详情面板",
      callback: () => this.activateTaskPanel(),
    });

    // 从当前笔记提取任务
    this.addCommand({
      id: "extract-task-from-note",
      name: "从当前笔记提取任务",
      callback: async () => {
        const file = this.app.workspace.getActiveFile();
        if (!file) {
          new Notice("请先打开一个笔记文件");
          return;
        }
        const task = await this.taskLinker.processNote(file);
        await this.taskStore.save();
        if (task) {
          new Notice(`任务已提取: ${task.title}`);
        } else {
          new Notice("未在当前笔记中找到任务内容");
        }
      },
    });

    // 运行决策分析
    this.addCommand({
      id: "run-decision-analysis",
      name: "运行决策分析",
      callback: async () => {
        new Notice("正在分析...");
        const suggestions = await this.decisionEngine.analyze();
        this.lastSuggestions = suggestions;
        new Notice(`分析完成，生成 ${suggestions.length} 条建议`);
        // 刷新看板
        this.app.workspace.getLeavesOfType(BOARD_VIEW_TYPE).forEach((leaf) => {
          const view = leaf.view;
          if (view instanceof BoardView) {
            view.render();
          }
        });
      },
    });

    // 关联笔记到任务
    this.addCommand({
      id: "link-note-to-task",
      name: "关联笔记到任务",
      callback: () => this.showLinkNoteModal(),
    });

    // 自然语言添加任务
    this.addCommand({
      id: "add-task-from-text",
      name: "用自然语言添加任务",
      callback: () => {
        new TaskInputModal(this.app, async (text) => {
          const parsed = parseNaturalLanguage(text);
          const task = this.taskStore.createTask(parsed.title, {
            priority: parsed.priority,
            due: parsed.due,
            tags: parsed.tags,
          });

          // 尝试自动关联笔记
          const allFiles = this.app.vault.getMarkdownFiles();
          for (const file of allFiles) {
            const fileTags = this.app.metadataCache.getFileCache(file)?.frontmatter?.tags;
            if (fileTags && Array.isArray(fileTags)) {
              const overlap = parsed.tags.filter((t) =>
                fileTags.some((ft: string) =>
                  ft.toLowerCase().includes(t.toLowerCase()) ||
                  t.toLowerCase().includes(ft.toLowerCase())
                )
              );
              if (overlap.length > 0) {
                this.taskStore.addLinkedNote(task.id, file.path, "reference");
              }
            }
          }

          await this.taskStore.save();
          const dueStr = parsed.due ? ` | 截止: ${parsed.due}` : "";
          const tagStr = parsed.tags.length > 0 ? ` | 标签: ${parsed.tags.join(", ")}` : "";
          new Notice(`任务已创建: ${parsed.title}${dueStr}${tagStr}`);
          this.saveAndRefresh();
        }).open();
      },
    });
  }

  // ============================================================
  // 视图激活
  // ============================================================

  async activateBoardView() {
    const { workspace } = this.app;
    let leaf = workspace.getLeavesOfType(BOARD_VIEW_TYPE)[0];
    if (!leaf) {
      leaf = workspace.getLeaf(false);
      await leaf.setViewState({
        type: BOARD_VIEW_TYPE,
        active: true,
      });
    }
    workspace.revealLeaf(leaf);
  }

  async activateTaskPanel() {
    const { workspace } = this.app;
    let leaf = workspace.getLeavesOfType(TASK_PANEL_VIEW_TYPE)[0];
    if (!leaf) {
      leaf = workspace.getRightLeaf(false);
      if (leaf) {
        await leaf.setViewState({
          type: TASK_PANEL_VIEW_TYPE,
          active: true,
        });
      }
    }
    if (leaf) {
      workspace.revealLeaf(leaf);
    }
  }

  // ============================================================
  // 笔记关联选择器
  // ============================================================

  private showLinkNoteModal() {
    const files = this.app.vault.getMarkdownFiles();
    const modal = new FuzzySuggestModal(this.app);
    modal.setTitle("选择要关联的笔记");
    modal.setItems(
      files.map((f) => f.basename)
    );

    const tasks = this.taskStore.getAllTasks();
    if (tasks.length === 0) {
      new Notice("暂无任务，请先提取任务");
      return;
    }

    // 先选笔记，再选任务
    modal.onChooseItem = (noteName: string) => {
      const file = files.find((f) => f.basename === noteName);
      if (!file) return;

      // 选择要关联到的任务
      const taskModal = new FuzzySuggestModal(this.app);
      taskModal.setTitle(`选择 "${noteName}" 要关联的任务`);
      taskModal.setItems(tasks.map((t) => t.title));
      taskModal.onChooseItem = async (taskTitle: string) => {
        const task = tasks.find((t) => t.title === taskTitle);
        if (!task) return;
        this.taskStore.addLinkedNote(task.id, file.path, "reference");
        await this.taskStore.save();
        new Notice(`已关联 "${noteName}" 到任务 "${taskTitle}"`);
      };
      taskModal.open();
    };
    modal.open();
  }

  // ============================================================
  // 决策定时器
  // ============================================================

  private startDecisionTimer() {
    if (this.decisionTimer) {
      window.clearInterval(this.decisionTimer);
    }
    const intervalMs = this.settings.decisionInterval * 1000;
    this.decisionTimer = window.setInterval(async () => {
      if (this.decisionEngine.shouldAutoRun()) {
        try {
          this.lastSuggestions = await this.decisionEngine.analyze();
          // 刷新看板
          this.app.workspace.getLeavesOfType(BOARD_VIEW_TYPE).forEach((leaf) => {
            const view = leaf.view;
            if (view instanceof BoardView) {
              view.render();
            }
          });
        } catch (e) {
          console.error("[Decision Workbench] Decision timer error:", e);
        }
      }
    }, intervalMs);
  }

  // ============================================================
  // 设置管理
  // ============================================================

  async loadSettings() {
    this.settings = Object.assign(
      {},
      DEFAULT_SETTINGS,
      await this.loadData()
    );
  }

  async saveSettings() {
    await this.saveData(this.settings);
    // 更新决策引擎设置
    this.decisionEngine["settings"] = this.settings;
    // 重启定时器
    this.startDecisionTimer();
  }

  // ============================================================
  // 便捷方法
  // ============================================================

  /**
   * 保存任务数据并刷新看板
   */
  async saveAndRefresh() {
    await this.taskStore.save();
    this.app.workspace.getLeavesOfType(BOARD_VIEW_TYPE).forEach((leaf) => {
      const view = leaf.view;
      if (view instanceof BoardView) {
        view.render();
      }
    });
  }

  /**
   * 获取最近一次决策建议
   */
  getLastSuggestions(): Suggestion[] {
    return this.lastSuggestions;
  }
}

// ============================================================
// TaskInputModal — 自然语言任务输入弹窗
// ============================================================
class TaskInputModal extends Modal {
  private onSubmit: (text: string) => void;
  private inputEl: HTMLTextAreaElement;

  constructor(app: App, onSubmit: (text: string) => void) {
    super(app);
    this.onSubmit = onSubmit;
  }

  onOpen() {
    const { contentEl, titleEl } = this;
    titleEl.setText("自然语言添加任务");

    const hint = contentEl.createEl("p", {
      text: "输入任务描述，系统会自动解析时间、优先级和标签。例如：",
      cls: "dw-input-hint",
    });

    const examples = contentEl.createEl("p", {
      text: "明天上午10点设计电源模块原理图 #PCB 紧急",
      cls: "dw-input-example",
    });

    this.inputEl = contentEl.createEl("textarea", {
      cls: "dw-nlp-input",
      attr: {
        placeholder: "输入任务描述...",
        rows: "3",
        autofocus: "true",
      },
    });

    // 回车提交（Shift+Enter 换行）
    this.inputEl.addEventListener("keydown", (e: KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        this.submit();
      }
    });

    const btnContainer = contentEl.createDiv({ cls: "dw-modal-actions" });
    const cancelBtn = btnContainer.createEl("button", {
      text: "取消",
      cls: "dw-btn",
    });
    cancelBtn.onclick = () => this.close();

    const submitBtn = btnContainer.createEl("button", {
      text: "创建任务",
      cls: "dw-btn dw-btn-primary",
    });
    submitBtn.onclick = () => this.submit();
  }

  private submit() {
    const text = this.inputEl.value.trim();
    if (text) {
      this.onSubmit(text);
    }
    this.close();
  }

  onClose() {
    this.contentEl.empty();
  }
}
