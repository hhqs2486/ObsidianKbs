// ============================================================
// CachedDecisionGraph — 决策图谱增量缓存
// ============================================================
// 图谱构建后缓存，通过事件增量更新节点和边。
// 邻接表预构建，BFS 不再重复构建。
// 标签倒排索引优化 O(n²) → O(Σk²)。
// ============================================================

import { App, TFile } from "obsidian";
import {
  GraphNode,
  GraphEdge,
  Task,
} from "../types";
import { TaskStore } from "../core/TaskStore";
import { readNoteTags, readNoteLinks } from "../utils/frontmatter";

export class CachedDecisionGraph {
  private app: App;
  private store: TaskStore;

  // 核心数据结构
  private nodes = new Map<string, GraphNode>();
  private edges = new Map<string, GraphEdge>(); // key: "from→to→type"
  private adjacency = new Map<string, Set<string>>(); // from → Set<to>
  private reverseAdjacency = new Map<string, Set<string>>(); // to → Set<from>
  private noteNodesByTag = new Map<string, Set<string>>(); // tag → Set<nodeId>

  private initialized = false;

  constructor(app: App, store: TaskStore) {
    this.app = app;
    this.store = store;
  }

  /**
   * 全量构建（仅启动时调用一次）
   */
  build(): void {
    if (this.initialized) return;

    // 1. 添加笔记节点
    const files = this.app.vault.getMarkdownFiles();
    for (const file of files) {
      this.addNoteNode(file);
    }

    // 2. 添加任务节点
    for (const task of this.store.getAllTasks()) {
      this.addTaskNode(task);
    }

    this.initialized = true;
  }

  // ============================================================
  // 节点管理
  // ============================================================

  private addNoteNode(file: TFile): void {
    const tags = readNoteTags(this.app, file);
    const links = readNoteLinks(this.app, file);

    const node: GraphNode = {
      id: file.path,
      type: "note",
      label: file.basename,
      tags,
      metadata: { links },
    };
    this.nodes.set(file.path, node);

    // 预构建邻接表
    for (const link of links) {
      this.addEdge(file.path, link, "links-to", 1.0);
    }

    // 预构建标签倒排索引
    for (const tag of tags) {
      if (!this.noteNodesByTag.has(tag)) {
        this.noteNodesByTag.set(tag, new Set());
      }
      this.noteNodesByTag.get(tag)!.add(file.path);
    }
  }

  private addTaskNode(task: Task): void {
    const node: GraphNode = {
      id: task.id,
      type: "task",
      label: task.title,
      tags: task.tags,
      metadata: {
        status: task.status,
        priority: task.priority,
        sourceNote: task.sourceNote,
      },
    };
    this.nodes.set(task.id, node);

    if (task.sourceNote) {
      this.addEdge(task.id, task.sourceNote, "extracted-from", 1.0);
    }
    for (const linked of task.linkedNotes) {
      this.addEdge(task.id, linked.path, "links-to", 0.5);
    }
  }

  private addEdge(
    from: string,
    to: string,
    type: GraphEdge["type"],
    weight: number
  ): void {
    const key = `${from}\u2192${to}\u2192${type}`;
    if (this.edges.has(key)) return;
    this.edges.set(key, { from, to, type, weight });

    if (!this.adjacency.has(from)) this.adjacency.set(from, new Set());
    this.adjacency.get(from)!.add(to);

    if (!this.reverseAdjacency.has(to)) this.reverseAdjacency.set(to, new Set());
    this.reverseAdjacency.get(to)!.add(from);
  }

  private removeEdge(from: string, to: string, type: GraphEdge["type"]): void {
    const key = `${from}\u2192${to}\u2192${type}`;
    this.edges.delete(key);
    this.adjacency.get(from)?.delete(to);
    this.reverseAdjacency.get(to)?.delete(from);
  }

  private removeNoteNode(path: string): void {
    const node = this.nodes.get(path);
    if (!node) return;

    // 移除标签索引
    for (const tag of node.tags) {
      this.noteNodesByTag.get(tag)?.delete(path);
    }

    // 移除出边
    const outEdges = this.adjacency.get(path);
    if (outEdges) {
      for (const to of [...outEdges]) {
        this.removeEdge(path, to, "links-to");
      }
    }

    // 移除入边
    const inEdges = this.reverseAdjacency.get(path);
    if (inEdges) {
      for (const from of [...inEdges]) {
        for (const type of ["links-to", "extracted-from"] as const) {
          this.removeEdge(from, path, type);
        }
      }
    }

    this.nodes.delete(path);
  }

  private removeTaskNode(taskId: string): void {
    const outEdges = this.adjacency.get(taskId);
    if (outEdges) {
      for (const to of [...outEdges]) {
        this.removeEdge(taskId, to, "extracted-from");
        this.removeEdge(taskId, to, "links-to");
      }
    }
    this.nodes.delete(taskId);
  }

  // ============================================================
  // 增量更新（事件驱动）
  // ============================================================

  onNoteChanged(file: TFile): void {
    this.removeNoteNode(file.path);
    this.addNoteNode(file);
  }

  onNoteDeleted(path: string): void {
    this.removeNoteNode(path);
  }

  onTaskChanged(task: Task): void {
    this.removeTaskNode(task.id);
    this.addTaskNode(task);
  }

  onTaskDeleted(taskId: string): void {
    this.removeTaskNode(taskId);
  }

  /**
   * 全量重建（定期校验或 vault 重新打开时调用）
   */
  rebuild(): void {
    this.nodes.clear();
    this.edges.clear();
    this.adjacency.clear();
    this.reverseAdjacency.clear();
    this.noteNodesByTag.clear();
    this.initialized = false;
    this.build();
  }

  /**
   * 同步任务节点（笔记节点保持缓存不变）
   * 在每次 analyze() 前调用，确保任务数据是最新的。
   * O(T) where T = task count (通常 << note count)
   */
  syncTasks(): void {
    // 移除所有现有任务节点
    const taskIds = [...this.nodes.values()]
      .filter((n) => n.type === "task")
      .map((n) => n.id);
    for (const taskId of taskIds) {
      this.removeTaskNode(taskId);
    }

    // 重新添加所有当前任务
    for (const task of this.store.getAllTasks()) {
      this.addTaskNode(task);
    }
  }

  // ============================================================
  // 查询（使用预构建索引，O(1) 或 O(k)）
  // ============================================================

  /**
   * BFS 最短路径 — 使用预构建邻接表，不再每次重建
   */
  findShortestPath(fromId: string, toId: string): string[] | null {
    if (fromId === toId) return [fromId];
    if (!this.adjacency.has(fromId)) return null;

    const visited = new Set<string>([fromId]);
    const queue: { id: string; path: string[] }[] = [
      { id: fromId, path: [fromId] },
    ];

    while (queue.length > 0) {
      const { id, path } = queue.shift()!;
      const neighbors = this.adjacency.get(id);
      if (!neighbors) continue;

      for (const next of neighbors) {
        if (next === toId) return [...path, next];
        if (!visited.has(next)) {
          visited.add(next);
          queue.push({ id: next, path: [...path, next] });
        }
      }
    }
    return null;
  }

  /**
   * 获取标签相似但未互链的笔记 — 使用标签倒排索引优化
   * 从 O(n²) 优化到 O(Σk²)，k = 共享同一标签的笔记数
   */
  getUnlinkedSimilarNotes(): {
    from: string;
    to: string;
    commonTags: string[];
  }[] {
    const result: { from: string; to: string; commonTags: string[] }[] = [];
    const seen = new Set<string>();

    // 按标签分组，只比较共享标签的笔记对
    for (const [tag, noteIds] of this.noteNodesByTag) {
      if (noteIds.size < 2) continue;
      const notes = [...noteIds];

      for (let i = 0; i < notes.length; i++) {
        for (let j = i + 1; j < notes.length; j++) {
          const pairKey =
            notes[i] < notes[j]
              ? `${notes[i]}|${notes[j]}`
              : `${notes[j]}|${notes[i]}`;
          if (seen.has(pairKey)) continue;

          const a = this.nodes.get(notes[i]);
          const b = this.nodes.get(notes[j]);
          if (!a || !b) continue;

          // 检查是否已互链
          if (this.adjacency.get(a.id)?.has(b.id)) continue;
          if (this.adjacency.get(b.id)?.has(a.id)) continue;

          const commonTags = a.tags.filter((t) => b.tags.includes(t));
          if (commonTags.length >= 2) {
            result.push({
              from: a.id,
              to: b.id,
              commonTags,
            });
            seen.add(pairKey);
          }
        }
      }
    }

    return result;
  }

  /**
   * 获取共享关联笔记的任务对 — 使用预构建邻接表
   */
  getTasksWithSharedNotes(): {
    taskA: string;
    taskB: string;
    sharedNotes: string[];
  }[] {
    const taskNodes = [...this.nodes.values()].filter(
      (n) => n.type === "task"
    );

    // 为每个任务预计算关联笔记集合（使用邻接表 O(1)）
    const taskNotes = new Map<string, Set<string>>();
    for (const task of taskNodes) {
      const notes = new Set<string>();
      const sourceNote =
        (task.metadata?.sourceNote as string | undefined) ?? "";
      const outEdges = this.adjacency.get(task.id);
      if (outEdges) {
        for (const to of outEdges) {
          const targetNode = this.nodes.get(to);
          if (targetNode?.type === "note" && to !== sourceNote) {
            notes.add(to);
          }
        }
      }
      taskNotes.set(task.id, notes);
    }

    // 两两比较（任务数通常远少于笔记数）
    const result: {
      taskA: string;
      taskB: string;
      sharedNotes: string[];
    }[] = [];
    for (let i = 0; i < taskNodes.length; i++) {
      for (let j = i + 1; j < taskNodes.length; j++) {
        const notesA = taskNotes.get(taskNodes[i].id)!;
        const notesB = taskNotes.get(taskNodes[j].id)!;
        if (notesA.size === 0 || notesB.size === 0) continue;

        // 遍历较小的集合
        const [smaller, larger] =
          notesA.size < notesB.size ? [notesA, notesB] : [notesB, notesA];
        const shared: string[] = [];
        for (const n of smaller) {
          if (larger.has(n)) shared.push(n);
        }
        if (shared.length > 0) {
          result.push({
            taskA: taskNodes[i].id,
            taskB: taskNodes[j].id,
            sharedNotes: shared,
          });
        }
      }
    }
    return result;
  }

  get isInitialized(): boolean {
    return this.initialized;
  }

  get nodeCount(): number {
    return this.nodes.size;
  }

  get edgeCount(): number {
    return this.edges.size;
  }
}
