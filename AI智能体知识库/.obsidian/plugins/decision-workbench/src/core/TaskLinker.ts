// ============================================================
// TaskLinker — 任务关联器
// ============================================================
// 负责笔记和任务之间的双向绑定：
// - 从笔记 frontmatter 的 task.id 查找已有任务
// - 新笔记首次出现 task 字段时创建任务并回写 ID
// - 根据标签重合度和 wikilink 关系自动建议关联笔记
// - 同步笔记正文中的 - [ ] 待办为任务子项
// ============================================================

import { App, TFile } from "obsidian";
import { Task, TaskStatus, Priority, Subtask, LinkedNote } from "../types";
import { TaskStore } from "./TaskStore";
import { NoteExtractor } from "./NoteExtractor";
import {
  generateTaskId,
  readNoteTags,
  readNoteLinks,
  updateFrontmatter,
} from "../utils/frontmatter";
import { associationStrength } from "../utils/similarity";

export class TaskLinker {
  private app: App;
  private store: TaskStore;
  private extractor: NoteExtractor;

  constructor(app: App, store: TaskStore, extractor: NoteExtractor) {
    this.app = app;
    this.store = store;
    this.extractor = extractor;
  }

  /**
   * 处理单篇笔记：提取任务信息、创建/更新任务、回写 frontmatter
   */
  async processNote(file: TFile): Promise<Task | null> {
    const data = await this.extractor.extract(file);

    // 没有 task frontmatter 且没有标签，跳过
    if (!data.taskMeta && data.tags.length === 0) return null;

    let task: Task | undefined;

    // 1. 尝试通过 frontmatter task.id 查找已有任务
    if (data.taskMeta?.id) {
      task = this.store.getTask(data.taskMeta.id);
    }

    // 2. 通过来源笔记路径查找
    if (!task) {
      task = this.store.getTaskByNote(file.path);
    }

    // 3. 没有找到任务 → 创建新任务
    if (!task) {
      const title = file.basename;
      const taskId = generateTaskId();

      task = this.store.createTask(title, {
        id: taskId,
        status: (data.taskMeta?.status as TaskStatus) ?? "todo",
        priority: (data.taskMeta?.priority as Priority) ?? "medium",
        due: data.taskMeta?.due,
        parent: data.taskMeta?.parent,
        tags: data.tags,
        sourceNote: file.path,
        subtasks: data.subtasks,
        progress: data.subtasks.length > 0
          ? data.subtasks.filter((s) => s.done).length / data.subtasks.length
          : 0,
      });

      // 回写 task.id 到 frontmatter
      await updateFrontmatter(this.app, file, {
        task: { id: taskId },
      });
    } else {
      // 4. 更新已有任务
      this.store.updateTask(task.id, {
        status: (data.taskMeta?.status as TaskStatus) ?? task.status,
        priority: (data.taskMeta?.priority as Priority) ?? task.priority,
        due: data.taskMeta?.due ?? task.due,
        tags: data.tags.length > 0 ? data.tags : task.tags,
        subtasks: data.subtasks.length > 0 ? data.subtasks : task.subtasks,
        sourceNote: file.path,
      });
    }

    // 5. 自动建议关联笔记
    await this.suggestLinkedNotes(file, task);

    return task;
  }

  /**
   * 基于标签和链接关系，自动建议关联笔记
   */
  private async suggestLinkedNotes(
    sourceFile: TFile,
    task: Task
  ): Promise<void> {
    const sourceTags = readNoteTags(this.app, sourceFile);
    const sourceLinks = readNoteLinks(this.app, sourceFile);

    if (sourceTags.length === 0) return;

    // 获取所有 markdown 文件
    const allFiles = this.app.vault.getMarkdownFiles();
    const candidates: { file: TFile; strength: number }[] = [];

    for (const file of allFiles) {
      if (file.path === sourceFile.path) continue;

      const tags = readNoteTags(this.app, file);
      const links = readNoteLinks(this.app, file);

      if (tags.length === 0 && links.length === 0) continue;

      const strength = associationStrength(
        sourceTags,
        tags,
        sourceLinks,
        links,
        sourceFile.path,
        file.path
      );

      if (strength > 0.3) {
        candidates.push({ file, strength });
      }
    }

    // 按关联强度排序，取 Top 10
    candidates.sort((a, b) => b.strength - a.strength);
    const topCandidates = candidates.slice(0, 10);

    // 添加到任务的 linkedNotes（去重）
    for (const { file } of topCandidates) {
      const exists = task.linkedNotes.some((n) => n.path === file.path);
      if (!exists) {
        this.store.addLinkedNote(
          task.id,
          file.path,
          "reference"
        );
      }
    }
  }

  /**
   * 手动关联笔记到任务
   */
  async linkNoteToTask(
    taskId: string,
    notePath: string,
    relation: LinkedNote["relation"] = "reference"
  ): Promise<void> {
    this.store.addLinkedNote(taskId, notePath, relation);

    // 如果关联的是 primary 笔记，更新 sourceNote
    if (relation === "primary") {
      this.store.updateTask(taskId, { sourceNote: notePath });
    }
  }

  /**
   * 批量处理所有笔记（首次扫描）
   */
  async processAllNotes(): Promise<number> {
    const files = this.app.vault.getMarkdownFiles();
    let count = 0;

    for (const file of files) {
      try {
        const task = await this.processNote(file);
        if (task) count++;
      } catch (e) {
        console.error(
          `[Decision Workbench] Error processing ${file.path}:`,
          e
        );
      }
    }

    await this.store.save();
    return count;
  }

  /**
   * 同步笔记正文的待办为任务子任务
   */
  async syncSubtasks(file: TFile): Promise<void> {
    const task = this.store.getTaskByNote(file.path);
    if (!task) return;

    const data = await this.extractor.extract(file);
    if (data.subtasks.length === 0) return;

    // 合并子任务：保留已完成状态，更新标题
    const existingById = new Map(
      task.subtasks.map((s) => [s.id, s])
    );
    const updated: Subtask[] = data.subtasks.map((newSt, idx) => {
      const existing = existingById.get(newSt.id);
      if (existing) {
        return { ...existing, title: newSt.title };
      }
      // 尝试按标题匹配
      const byTitle = task.subtasks.find(
        (s) => s.title === newSt.title
      );
      if (byTitle) {
        return { ...byTitle, title: newSt.title };
      }
      return {
        id: `st-${Date.now().toString(36)}-${idx}`,
        title: newSt.title,
        done: newSt.done,
      };
    });

    this.store.updateTask(task.id, { subtasks: updated });
  }
}
