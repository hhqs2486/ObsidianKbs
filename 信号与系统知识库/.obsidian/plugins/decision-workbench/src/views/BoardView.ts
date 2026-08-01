// ============================================================
// BoardView — 任务看板视图
// ============================================================
// 自定义 Obsidian ItemView，渲染 Kanban 看板：
// - 三列（待办/进行中/已完成），支持拖拽
// - 任务卡片含标签徽章和笔记来源计数
// - 底部决策建议区 + 笔记来源面板
// ============================================================

import { ItemView, TFile, WorkspaceLeaf, Menu } from "obsidian";
import DecisionWorkbenchPlugin from "../../main";
import { Task, TaskStatus, Suggestion } from "../types";

export const BOARD_VIEW_TYPE = "decision-board";

// 状态映射到列索引
const STATUS_TO_COLUMN: Record<TaskStatus, number> = {
  todo: 0,
  "in-progress": 1,
  done: 2,
};

const COLUMN_TO_STATUS: TaskStatus[] = ["todo", "in-progress", "done"];

export class BoardView extends ItemView {
  private plugin: DecisionWorkbenchPlugin;
  private selectedTaskId: string | null = null;
  private filterTag: string | null = null;
  private dragTaskId: string | null = null;

  constructor(leaf: WorkspaceLeaf, plugin: DecisionWorkbenchPlugin) {
    super(leaf);
    this.plugin = plugin;
  }

  getViewType(): string {
    return BOARD_VIEW_TYPE;
  }

  getDisplayText(): string {
    return "决策看板";
  }

  getIcon(): string {
    return "layout-dashboard";
  }

  async onOpen() {
    this.render();
    this.registerEvents();
  }

  async onClose() {
    // cleanup
  }

  /**
   * 完整渲染
   */
  render() {
    const container = this.containerEl.children[1] as HTMLElement;
    container.empty();
    container.addClass("decision-board-root");

    this.renderHeader(container);
    this.renderBoard(container);
    this.renderDecisionPanel(container);
    this.renderNoteSources(container);
  }

  /**
   * 渲染顶部状态栏
   */
  private renderHeader(container: HTMLElement) {
    const header = container.createDiv({ cls: "dw-header" });

    const title = header.createSpan({ cls: "dw-header-title" });
    title.setText("决策工作台");

    const stats = header.createDiv({ cls: "dw-header-stats" });
    const tasks = this.plugin.taskStore.getAllTasks();
    const todo = tasks.filter((t) => t.status === "todo").length;
    const inProgress = tasks.filter((t) => t.status === "in-progress").length;
    const done = tasks.filter((t) => t.status === "done").length;
    stats.setText(`待办 ${todo} · 进行中 ${inProgress} · 已完成 ${done}`);

    if (this.filterTag) {
      const filter = header.createSpan({ cls: "dw-filter-badge" });
      filter.setText(`筛选: ${this.filterTag}`);
      filter.onClickEvent(() => {
        this.filterTag = null;
        this.render();
      });
    }

    const actions = header.createDiv({ cls: "dw-header-actions" });
    const analyzeBtn = actions.createEl("button", {
      cls: "dw-btn",
      text: "运行决策分析",
    });
    analyzeBtn.onClickEvent(async () => {
      analyzeBtn.setText("分析中...");
      const suggestions = await this.plugin.decisionEngine.analyze();
      analyzeBtn.setText(`完成 (${suggestions.length} 条建议)`);
      setTimeout(() => {
        analyzeBtn.setText("运行决策分析");
        this.render();
      }, 2000);
    });
  }

  /**
   * 渲染看板列
   */
  private renderBoard(container: HTMLElement) {
    const board = container.createDiv({ cls: "dw-board" });
    const columns = this.plugin.settings.columns;

    let tasks = this.plugin.taskStore.getAllTasks();
    if (this.filterTag) {
      tasks = tasks.filter(
        (t) => t.tags.includes(this.filterTag!) || t.tags.includes(`#${this.filterTag!}`)
      );
    }

    for (let colIdx = 0; colIdx < columns.length; colIdx++) {
      const status = COLUMN_TO_STATUS[colIdx];
      const colTasks = tasks.filter((t) => t.status === status);

      const column = board.createDiv({ cls: "dw-column" });
      column.dataset.colIdx = String(colIdx);

      // 列标题
      const colHeader = column.createDiv({ cls: "dw-column-header" });
      colHeader.createSpan({ cls: "dw-column-title" }).setText(columns[colIdx]);
      colHeader.createSpan({ cls: "dw-column-count" }).setText(`(${colTasks.length})`);

      // 卡片容器
      const cardsEl = column.createDiv({ cls: "dw-cards" });

      // 拖放目标
      column.addEventListener("dragover", (e) => {
        e.preventDefault();
        column.addClass("dw-column-dragover");
      });
      column.addEventListener("dragleave", () => {
        column.removeClass("dw-column-dragover");
      });
      column.addEventListener("drop", (e) => {
        e.preventDefault();
        column.removeClass("dw-column-dragover");
        if (this.dragTaskId) {
          this.handleDrop(this.dragTaskId, status);
          this.dragTaskId = null;
        }
      });

      // 渲染卡片
      for (const task of colTasks) {
        this.renderCard(cardsEl, task);
      }

      // 空列提示
      if (colTasks.length === 0) {
        cardsEl.createDiv({ cls: "dw-empty-column" }).setText("暂无任务");
      }
    }
  }

  /**
   * 渲染单个任务卡片
   */
  private renderCard(container: HTMLElement, task: Task) {
    const card = container.createDiv({ cls: "dw-task-card" });
    card.dataset.taskId = task.id;

    if (this.selectedTaskId === task.id) {
      card.addClass("dw-task-card--selected");
    }

    // 拖拽源
    card.setAttr("draggable", "true");
    card.addEventListener("dragstart", () => {
      this.dragTaskId = task.id;
      card.addClass("dw-task-card--dragging");
    });
    card.addEventListener("dragend", () => {
      card.removeClass("dw-task-card--dragging");
    });

    // 点击选中
    card.onClickEvent(() => {
      this.selectedTaskId = task.id;
      this.render();
    });

    // 右键菜单
    card.oncontextmenu = (e) => {
      e.preventDefault();
      this.showCardMenu(task, e as MouseEvent);
    };

    // 标题
    const title = card.createDiv({ cls: "dw-card-title" });
    if (task.status === "done") {
      title.createEl("span", { cls: "dw-done-strike" }).setText(task.title);
    } else {
      title.setText(task.title);
    }

    // 标签徽章
    if (task.tags.length > 0) {
      const tagsEl = card.createDiv({ cls: "dw-card-tags" });
      for (const tag of task.tags.slice(0, 3)) {
        const cleanTag = tag.replace(/^#/, "");
        tagsEl.createSpan({ cls: "dw-tag-badge" }).setText(cleanTag);
      }
      if (task.tags.length > 3) {
        tagsEl.createSpan({ cls: "dw-tag-badge dw-tag-more" }).setText(`+${task.tags.length - 3}`);
      }
    }

    // 底部信息行
    const footer = card.createDiv({ cls: "dw-card-footer" });

    // 关联笔记计数
    if (task.linkedNotes.length > 0) {
      const notes = footer.createSpan({ cls: "dw-card-notes" });
      notes.setText(`${task.linkedNotes.length} 篇笔记`);
    }

    // 进度
    if (task.subtasks.length > 0) {
      const progress = footer.createDiv({ cls: "dw-mini-progress" });
      const bar = progress.createDiv({ cls: "dw-mini-progress-bar" });
      bar.style.width = `${Math.round(task.progress * 100)}%`;
      progress.createSpan({ cls: "dw-mini-progress-text" }).setText(
        `${Math.round(task.progress * 100)}%`
      );
    }

    // 优先级标记
    if (task.priority === "high") {
      card.addClass("dw-task-card--priority-high");
    }
  }

  /**
   * 渲染决策建议区
   */
  private renderDecisionPanel(container: HTMLElement) {
    const panel = container.createDiv({ cls: "dw-decision-panel" });
    panel.createDiv({ cls: "dw-section-title" }).setText("决策建议");

    // 从插件获取最近一次的建议
    const suggestions = this.plugin.getLastSuggestions();

    if (suggestions.length === 0) {
      panel.createDiv({ cls: "dw-empty-hint" }).setText(
        "点击「运行决策分析」生成建议"
      );
      return;
    }

    for (const sug of suggestions.slice(0, 5)) {
      const item = panel.createDiv({ cls: "dw-suggestion-item" });

      const header = item.createDiv({ cls: "dw-suggestion-header" });
      const typeBadge = header.createSpan({ cls: "dw-suggestion-type" });
      const typeLabels: Record<string, string> = {
        "link-suggestion": "链接建议",
        "task-order": "任务依赖",
        "priority-adjust": "优先级调整",
        "missing-link": "补充链接",
      };
      typeBadge.setText(typeLabels[sug.type] ?? sug.type);
      typeBadge.addClass(`dw-suggestion-type--${sug.type}`);

      header.createSpan({ cls: "dw-suggestion-title" }).setText(sug.title);

      if (sug.confidence > 0) {
        header.createSpan({ cls: "dw-confidence" }).setText(
          `${Math.round(sug.confidence * 100)}%`
        );
      }

      const detail = item.createDiv({ cls: "dw-suggestion-detail" });
      for (const line of sug.detail) {
        detail.createDiv({ cls: "dw-suggestion-line" }).setText(line);
      }

      const actions = item.createDiv({ cls: "dw-suggestion-actions" });
      const acceptBtn = actions.createEl("button", {
        cls: "dw-btn dw-btn-sm",
        text: "采纳",
      });
      acceptBtn.onClickEvent(() => {
        // 采纳建议：打开相关笔记
        if (sug.relatedNotes.length > 0) {
          const file = this.app.vault.getAbstractFileByPath(sug.relatedNotes[0]);
          if (file && file instanceof TFile) {
            this.app.workspace.openLinkText(sug.relatedNotes[0], "", false);
          }
        }
      });
    }
  }

  /**
   * 渲染笔记来源面板
   */
  private renderNoteSources(container: HTMLElement) {
    const panel = container.createDiv({ cls: "dw-note-sources" });
    panel.createDiv({ cls: "dw-section-title" }).setText("笔记来源");

    let tasks = this.plugin.taskStore.getAllTasks();
    if (this.filterTag) {
      tasks = tasks.filter(
        (t) => t.tags.includes(this.filterTag!) || t.tags.includes(`#${this.filterTag!}`)
      );
    }

    // 收集所有关联笔记
    const noteSet = new Map<string, { tags: string[]; taskCount: number }>();
    for (const task of tasks) {
      for (const linked of task.linkedNotes) {
        if (!noteSet.has(linked.path)) {
          noteSet.set(linked.path, { tags: task.tags, taskCount: 1 });
        } else {
          noteSet.get(linked.path)!.taskCount++;
        }
      }
      if (task.sourceNote && !noteSet.has(task.sourceNote)) {
        noteSet.set(task.sourceNote, { tags: task.tags, taskCount: 1 });
      }
    }

    if (noteSet.size === 0) {
      panel.createDiv({ cls: "dw-empty-hint" }).setText("暂无关联笔记");
      return;
    }

    for (const [notePath, info] of noteSet) {
      const item = panel.createDiv({ cls: "dw-note-item" });
      const name = notePath.split("/").pop()?.replace(/\.md$/, "") ?? notePath;
      item.createSpan({ cls: "dw-note-link" }).setText(`[[${name}]]`);

      if (info.tags.length > 0) {
        const tags = item.createSpan({ cls: "dw-note-tags" });
        tags.setText(
          ` - 标签: ${info.tags.slice(0, 3).map((t) => t.replace(/^#/, "")).join(", ")}`
        );
      }

      item.onClickEvent(() => {
        this.app.workspace.openLinkText(notePath, "", false);
      });
    }
  }

  /**
   * 卡片右键菜单
   */
  private showCardMenu(task: Task, evt: MouseEvent) {
    const menu = new Menu();
    menu.addItem((item) =>
      item
        .setTitle("打开来源笔记")
        .setIcon("file-text")
        .onClick(() => {
          if (task.sourceNote) {
            this.app.workspace.openLinkText(task.sourceNote, "", false);
          }
        })
    );
    menu.addItem((item) =>
      item
        .setTitle(task.status === "done" ? "重新打开" : "标记完成")
        .setIcon("check")
        .onClick(() => {
          const newStatus: TaskStatus = task.status === "done" ? "todo" : "done";
          this.plugin.taskStore.setTaskStatus(task.id, newStatus);
          this.plugin.saveAndRefresh();
        })
    );
    menu.addItem((item) =>
      item
        .setTitle("设置高优先级")
        .setIcon("flame")
        .onClick(() => {
          this.plugin.taskStore.updateTask(task.id, { priority: "high" });
          this.plugin.saveAndRefresh();
        })
    );
    menu.addSeparator();
    menu.addItem((item) =>
      item
        .setTitle("删除任务")
        .setIcon("trash")
        .onClick(() => {
          this.plugin.taskStore.deleteTask(task.id);
          this.plugin.saveAndRefresh();
        })
    );
    menu.showAtPosition({ x: evt.clientX, y: evt.clientY });
  }

  /**
   * 处理拖放
   */
  private handleDrop(taskId: string, newStatus: TaskStatus) {
    this.plugin.taskStore.setTaskStatus(taskId, newStatus);
    this.plugin.saveAndRefresh();
  }

  /**
   * 设置标签筛选
   */
  setFilter(tag: string | null) {
    this.filterTag = tag;
    this.render();
  }

  /**
   * 注册事件
   */
  private registerEvents() {
    // 笔记变更时刷新
    this.registerEvent(
      this.app.metadataCache.on("changed", (file) => {
        if (this.plugin.settings.autoExtract) {
          this.plugin.taskLinker.processNote(file).then(() => {
            this.render();
          });
        }
      })
    );
  }

  /**
   * 刷新单个卡片
   */
  refreshCard(file: TFile) {
    this.render();
  }
}
