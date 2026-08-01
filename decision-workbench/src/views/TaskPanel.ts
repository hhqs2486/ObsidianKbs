// ============================================================
// TaskPanel — 任务详情侧栏面板
// ============================================================
// 右侧侧栏，显示当前选中任务的详细信息：
// - 任务标题、优先级、截止日期
// - 关联笔记列表（可点击打开）
// - 进度条
// - 子任务清单（可勾选）
// ============================================================

import { ItemView, WorkspaceLeaf, TFile } from "obsidian";
import DecisionWorkbenchPlugin from "../../main";
import { Task, Priority } from "../types";

export const TASK_PANEL_VIEW_TYPE = "decision-task-panel";

export class TaskPanel extends ItemView {
  private plugin: DecisionWorkbenchPlugin;
  private currentTaskId: string | null = null;

  constructor(leaf: WorkspaceLeaf, plugin: DecisionWorkbenchPlugin) {
    super(leaf);
    this.plugin = plugin;
  }

  getViewType(): string {
    return TASK_PANEL_VIEW_TYPE;
  }

  getDisplayText(): string {
    return "任务详情";
  }

  getIcon(): string {
    return "list-checks";
  }

  async onOpen() {
    this.registerChangeHandler();
    this.render();
  }

  async onClose() {}

  /**
   * 设置当前任务
   */
  setTask(taskId: string | null) {
    this.currentTaskId = taskId;
    this.render();
  }

  /**
   * 注册变更监听
   */
  private registerChangeHandler() {
    this.plugin.taskStore.onChange(() => {
      this.render();
    });
  }

  render() {
    const container = this.containerEl.children[1] as HTMLElement;
    container.empty();
    container.addClass("dw-task-panel-root");

    if (!this.currentTaskId) {
      container.createDiv({ cls: "dw-empty-state" }).setText("从看板选择一个任务查看详情");
      return;
    }

    const task = this.plugin.taskStore.getTask(this.currentTaskId);
    if (!task) {
      container.createDiv({ cls: "dw-empty-state" }).setText("任务不存在");
      return;
    }

    this.renderTaskHeader(container, task);
    this.renderLinkedNotes(container, task);
    this.renderProgress(container, task);
    this.renderSubtasks(container, task);
  }

  /**
   * 渲染任务头部
   */
  private renderTaskHeader(container: HTMLElement, task: Task) {
    const header = container.createDiv({ cls: "dw-panel-header" });

    const titleEl = header.createDiv({ cls: "dw-panel-title" });
    titleEl.setText(task.title);

    const metaEl = header.createDiv({ cls: "dw-panel-meta" });

    // 优先级
    const priorityEl = metaEl.createSpan({ cls: "dw-meta-item" });
    priorityEl.createSpan({ cls: "dw-meta-label" }).setText("优先级: ");
    const priorityValue = priorityEl.createSpan({ cls: "dw-meta-value" });
    const priorityLabels: Record<Priority, string> = {
      low: "低",
      medium: "中",
      high: "高",
    };
    priorityValue.setText(priorityLabels[task.priority]);
    priorityValue.addClass(`dw-priority--${task.priority}`);

    // 截止日期
    if (task.due) {
      const dueEl = metaEl.createSpan({ cls: "dw-meta-item" });
      dueEl.createSpan({ cls: "dw-meta-label" }).setText("截止: ");
      dueEl.createSpan({ cls: "dw-meta-value" }).setText(task.due);
    }

    // 状态
    const statusEl = metaEl.createSpan({ cls: "dw-meta-item" });
    statusEl.createSpan({ cls: "dw-meta-label" }).setText("状态: ");
    const statusLabels: Record<string, string> = {
      todo: "待办",
      "in-progress": "进行中",
      done: "已完成",
    };
    statusEl.createSpan({ cls: "dw-meta-value" }).setText(
      statusLabels[task.status] ?? task.status
    );
  }

  /**
   * 渲染关联笔记
   */
  private renderLinkedNotes(container: HTMLElement, task: Task) {
    const section = container.createDiv({ cls: "dw-panel-section" });
    section.createDiv({ cls: "dw-section-label" }).setText(
      `关联笔记 (${task.linkedNotes.length})`
    );

    if (task.linkedNotes.length === 0 && !task.sourceNote) {
      section.createDiv({ cls: "dw-empty-hint-sm" }).setText("暂无关联笔记");
      return;
    }

    // 来源笔记
    if (task.sourceNote) {
      const item = section.createDiv({ cls: "dw-note-link-item dw-note-link-item--primary" });
      const name = task.sourceNote.split("/").pop()?.replace(/\.md$/, "") ?? task.sourceNote;
      item.createSpan({ cls: "dw-note-relation" }).setText("来源");
      item.createSpan({ cls: "dw-note-title" }).setText(`[[${name}]]`);
      item.onClickEvent(() => {
        this.app.workspace.openLinkText(task.sourceNote, "", false);
      });
    }

    // 关联笔记
    for (const linked of task.linkedNotes) {
      if (linked.path === task.sourceNote && linked.relation === "primary") continue;

      const item = section.createDiv({ cls: "dw-note-link-item" });
      const name = linked.path.split("/").pop()?.replace(/\.md$/, "") ?? linked.path;
      item.createSpan({ cls: "dw-note-relation" }).setText(linked.relation);
      item.createSpan({ cls: "dw-note-title" }).setText(`[[${name}]]`);
      item.onClickEvent(() => {
        this.app.workspace.openLinkText(linked.path, "", false);
      });
    }
  }

  /**
   * 渲染进度条
   */
  private renderProgress(container: HTMLElement, task: Task) {
    if (task.subtasks.length === 0) return;

    const section = container.createDiv({ cls: "dw-panel-section" });
    section.createDiv({ cls: "dw-section-label" }).setText("进度");

    const progressEl = section.createDiv({ cls: "dw-progress-container" });
    const bar = progressEl.createDiv({ cls: "dw-progress-bar" });
    const fill = bar.createDiv({ cls: "dw-progress-fill" });
    fill.style.width = `${Math.round(task.progress * 100)}%`;

    const text = progressEl.createDiv({ cls: "dw-progress-text" });
    const done = task.subtasks.filter((s) => s.done).length;
    text.setText(`${Math.round(task.progress * 100)}% (${done}/${task.subtasks.length} 步骤)`);
  }

  /**
   * 渲染子任务
   */
  private renderSubtasks(container: HTMLElement, task: Task) {
    if (task.subtasks.length === 0) return;

    const section = container.createDiv({ cls: "dw-panel-section" });
    section.createDiv({ cls: "dw-section-label" }).setText("子任务");

    for (const subtask of task.subtasks) {
      const item = section.createDiv({ cls: "dw-subtask-item" });

      const checkbox = item.createEl("input", {
        type: "checkbox",
        cls: "dw-subtask-checkbox",
      });
      checkbox.checked = subtask.done;
      checkbox.onChange(() => {
        this.plugin.taskStore.toggleSubtask(task.id, subtask.id);
        this.plugin.saveAndRefresh();
      });

      const label = item.createSpan({ cls: "dw-subtask-label" });
      if (subtask.done) {
        label.addClass("dw-subtask-done");
        label.createEl("span", { cls: "dw-done-strike" }).setText(subtask.title);
      } else {
        label.setText(subtask.title);
      }
    }
  }
}
