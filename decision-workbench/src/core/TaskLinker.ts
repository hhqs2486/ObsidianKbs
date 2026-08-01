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

  // 标签倒排索引：tag → Set<filePath>
  private tagToFileIndex = new Map<string, Set<string>>();
  // 缓存每篇笔记的 tags/links，避免重复读取 metadataCache
  private noteDataCache = new Map<string, { tags: string[]; links: string[] }>();

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
   * 使用标签倒排索引优化：O(n²) → O(n×k)，k = 共享标签的笔记数
   */
  private async suggestLinkedNotes(
    sourceFile: TFile,
    task: Task
  ): Promise<void> {
    const sourceTags = readNoteTags(this.app, sourceFile);
    const sourceLinks = readNoteLinks(this.app, sourceFile);

    if (sourceTags.length === 0) return;

    // 用标签倒排索引收集候选（只看共享标签的文件）
    const candidates = new Map<string, number>(); // path → overlap count

    for (const tag of sourceTags) {
      // 先尝试从索引获取
      const filesWithTag = this.tagToFileIndex.get(tag);
      if (filesWithTag) {
        for (const candidatePath of filesWithTag) {
          if (candidatePath === sourceFile.path) continue;
          candidates.set(
            candidatePath,
            (candidates.get(candidatePath) ?? 0) + 1
          );
        }
      } else {
        // 索引未构建（单笔记变更场景），全量扫描
        const allFiles = this.app.vault.getMarkdownFiles();
        for (const file of allFiles) {
          if (file.path === sourceFile.path) continue;
          const tags = readNoteTags(this.app, file);
          if (tags.includes(tag)) {
            candidates.set(
              file.path,
              (candidates.get(file.path) ?? 0) + 1
            );
          }
        }
      }
    }

    // 对候选计算精确关联强度
    const ranked: { file: TFile; strength: number }[] = [];
    for (const [candidatePath] of candidates) {
      const candidateData = this.noteDataCache.get(candidatePath);
      let candTags: string[];
      let candLinks: string[];

      if (candidateData) {
        candTags = candidateData.tags;
        candLinks = candidateData.links;
      } else {
        const file = this.app.vault.getAbstractFileByPath(candidatePath);
        if (!file || !(file instanceof TFile)) continue;
        candTags = readNoteTags(this.app, file);
        candLinks = readNoteLinks(this.app, file);
      }

      const file = this.app.vault.getAbstractFileByPath(candidatePath);
      if (!file || !(file instanceof TFile)) continue;

      const strength = associationStrength(
        sourceTags,
        candTags,
        sourceLinks,
        candLinks,
        sourceFile.path,
        candidatePath
      );

      if (strength > 0.3) {
        ranked.push({ file, strength });
      }
    }

    // 按关联强度排序，取 Top 10
    ranked.sort((a, b) => b.strength - a.strength);
    const topCandidates = ranked.slice(0, 10);

    // 添加到任务的 linkedNotes（去重）
    for (const { file } of topCandidates) {
      const exists = task.linkedNotes.some((n) => n.path === file.path);
      if (!exists) {
        this.store.addLinkedNote(task.id, file.path, "reference");
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
   * 两阶段优化：Phase 1 构建标签索引 O(n)，Phase 2 用索引做关联 O(n×k)
   */
  async processAllNotes(): Promise<number> {
    const files = this.app.vault.getMarkdownFiles();

    // Phase 1: 构建标签倒排索引 + 缓存笔记数据（O(n)）
    this.tagToFileIndex.clear();
    this.noteDataCache.clear();

    for (const file of files) {
      const tags = readNoteTags(this.app, file);
      const links = readNoteLinks(this.app, file);
      this.noteDataCache.set(file.path, { tags, links });

      for (const tag of tags) {
        if (!this.tagToFileIndex.has(tag)) {
          this.tagToFileIndex.set(tag, new Set());
        }
        this.tagToFileIndex.get(tag)!.add(file.path);
      }
    }

    // Phase 2: 用索引做关联（O(n×k)，k = 共享标签的笔记数）
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
