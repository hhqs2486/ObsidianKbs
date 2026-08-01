// ============================================================
// TaskStore — 任务数据存储管理
// ============================================================
// 任务数据持久化为 vault 内 JSON 文件。
// 存储路径: .obsidian/plugins/decision-workbench/tasks.json
// 同时维护内存索引，支持快速查询。
// ============================================================

import { App, TFile, normalizePath } from "obsidian";
import {
  Task,
  TaskStoreData,
  TaskStatus,
  DEFAULT_TASK_STORE,
} from "../types";
import { generateTaskId } from "../utils/frontmatter";

const STORE_PATH = ".obsidian/plugins/decision-workbench/tasks.json";

export class TaskStore {
  private app: App;
  private data: TaskStoreData;
  private listeners: Set<() => void> = new Set();

  // ---- 索引层（O(1) 查询） ----
  private idIndex = new Map<string, Task>();              // id → Task
  private noteIndex = new Map<string, Task>();            // sourceNote → Task
  private statusIndex = new Map<TaskStatus, Set<Task>>(); // status → Set<Task>
  private tagIndex = new Map<string, Set<Task>>();        // tag(不含#) → Set<Task>

  constructor(app: App) {
    this.app = app;
    this.data = { ...DEFAULT_TASK_STORE };
  }

  /** 初始化：加载或创建存储文件 */
  async load(): Promise<void> {
    const exists = await this.app.vault.adapter.exists(STORE_PATH);
    if (exists) {
      try {
        const raw = await this.app.vault.adapter.read(STORE_PATH);
        const parsed = JSON.parse(raw) as TaskStoreData;
        this.data = { ...DEFAULT_TASK_STORE, ...parsed };
      } catch (e) {
        console.error("[Decision Workbench] Failed to load task store:", e);
        this.data = { ...DEFAULT_TASK_STORE };
      }
    }
    // 加载完成后构建索引
    this.rebuildIndexes();
  }

  /** 持久化到 vault */
  async save(): Promise<void> {
    try {
      const dir = STORE_PATH.substring(0, STORE_PATH.lastIndexOf("/"));
      if (!(await this.app.vault.adapter.exists(dir))) {
        await this.app.vault.adapter.mkdir(dir);
      }
      await this.app.vault.adapter.write(
        STORE_PATH,
        JSON.stringify(this.data, null, 2)
      );
      this.notifyListeners();
    } catch (e) {
      console.error("[Decision Workbench] Failed to save task store:", e);
    }
  }

  // ============================================================
  // 索引维护
  // ============================================================

  /** 全量重建索引（load 后调用） */
  private rebuildIndexes(): void {
    this.idIndex.clear();
    this.noteIndex.clear();
    this.statusIndex.clear();
    this.tagIndex.clear();
    for (const task of this.data.tasks) {
      this.indexTask(task);
    }
  }

  /** 索引单个任务 */
  private indexTask(task: Task): void {
    this.idIndex.set(task.id, task);
    if (task.sourceNote) this.noteIndex.set(task.sourceNote, task);

    if (!this.statusIndex.has(task.status)) {
      this.statusIndex.set(task.status, new Set());
    }
    this.statusIndex.get(task.status)!.add(task);

    for (const tag of task.tags) {
      const clean = tag.replace(/^#/, "");
      if (!this.tagIndex.has(clean)) this.tagIndex.set(clean, new Set());
      this.tagIndex.get(clean)!.add(task);
    }
  }

  /** 从索引中移除单个任务 */
  private unindexTask(task: Task): void {
    this.idIndex.delete(task.id);
    if (task.sourceNote) this.noteIndex.delete(task.sourceNote);
    this.statusIndex.get(task.status)?.delete(task);
    for (const tag of task.tags) {
      const clean = tag.replace(/^#/, "");
      this.tagIndex.get(clean)?.delete(task);
    }
  }

  // ============================================================
  // 查询（O(1) 索引查找）
  // ============================================================

  /** 获取全部任务（返回只读引用，防止外部 mutate） */
  getAllTasks(): readonly Task[] {
    return this.data.tasks;
  }

  /** 按 ID 获取任务 — O(1) */
  getTask(id: string): Task | undefined {
    return this.idIndex.get(id);
  }

  /** 按状态获取任务 — O(1) */
  getTasksByStatus(status: TaskStatus): Task[] {
    return [...(this.statusIndex.get(status) ?? [])];
  }

  /** 按来源笔记获取任务 — O(1) */
  getTaskByNote(notePath: string): Task | undefined {
    return this.noteIndex.get(notePath);
  }

  /** 按标签获取任务 — O(k), k = 匹配标签的任务数 */
  getTasksByTag(tag: string): Task[] {
    const clean = tag.replace(/^#/, "");
    return [...(this.tagIndex.get(clean) ?? [])];
  }

  /** 创建新任务 */
  createTask(
    title: string,
    options: Partial<Task> = {}
  ): Task {
    const now = new Date().toISOString();
    const task: Task = {
      id: generateTaskId(),
      title,
      status: "todo",
      priority: "medium",
      tags: [],
      sourceNote: "",
      linkedNotes: [],
      subtasks: [],
      progress: 0,
      createdAt: now,
      updatedAt: now,
      ...options,
    };
    this.data.tasks.push(task);
    this.indexTask(task);
    return task;
  }

  /** 更新任务 */
  updateTask(id: string, updates: Partial<Task>): Task | undefined {
    const task = this.idIndex.get(id);
    if (!task) return undefined;

    // 先取消旧索引
    this.unindexTask(task);

    Object.assign(task, updates, { updatedAt: new Date().toISOString() });
    if (task.subtasks.length > 0) {
      const done = task.subtasks.filter((s) => s.done).length;
      task.progress = done / task.subtasks.length;
    }

    // 重新索引
    this.indexTask(task);
    return task;
  }

  /** 删除任务 */
  deleteTask(id: string): boolean {
    const task = this.idIndex.get(id);
    if (!task) return false;
    this.unindexTask(task);
    const idx = this.data.tasks.indexOf(task);
    if (idx >= 0) this.data.tasks.splice(idx, 1);
    return true;
  }

  /** 更新任务状态 */
  setTaskStatus(id: string, status: TaskStatus): void {
    this.updateTask(id, { status });
  }

  /** 添加关联笔记 */
  addLinkedNote(
    taskId: string,
    notePath: string,
    relation: "primary" | "reference" | "decision" = "reference"
  ): void {
    const task = this.getTask(taskId);
    if (!task) return;
    if (task.linkedNotes.some((n) => n.path === notePath)) return;
    task.linkedNotes.push({ path: notePath, relation });
    task.updatedAt = new Date().toISOString();
  }

  /** 添加子任务 */
  addSubtask(taskId: string, title: string): void {
    const task = this.getTask(taskId);
    if (!task) return;
    task.subtasks.push({
      id: `st-${Date.now().toString(36)}`,
      title,
      done: false,
    });
    task.updatedAt = new Date().toISOString();
  }

  /** 切换子任务状态 */
  toggleSubtask(taskId: string, subtaskId: string): void {
    const task = this.getTask(taskId);
    if (!task) return;
    const st = task.subtasks.find((s) => s.id === subtaskId);
    if (!st) return;
    st.done = !st.done;
    const done = task.subtasks.filter((s) => s.done).length;
    task.progress = task.subtasks.length > 0 ? done / task.subtasks.length : 0;
    task.updatedAt = new Date().toISOString();
  }

  /** 获取列配置 */
  getColumns(): string[] {
    return this.data.columns;
  }

  /** 注册变更监听 */
  onChange(listener: () => void): void {
    this.listeners.add(listener);
  }

  /** 注销变更监听 */
  offChange(listener: () => void): void {
    this.listeners.delete(listener);
  }

  /** 通知所有监听器 */
  private notifyListeners(): void {
    this.listeners.forEach((l) => l());
  }
}
