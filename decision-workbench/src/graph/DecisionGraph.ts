// ============================================================
// DecisionGraph — 决策图谱
// ============================================================
// 内存中的有向图，记录笔记 → 任务 → 决策的关联关系。
// 用于决策引擎的路径推理和关联分析。
// ============================================================

import { App, TFile } from "obsidian";
import {
  GraphNode,
  GraphEdge,
  DecisionGraph,
  Task,
} from "../types";
import { TaskStore } from "./../core/TaskStore";
import { readNoteTags, readNoteLinks } from "../utils/frontmatter";

export class DecisionGraphBuilder {
  private app: App;
  private store: TaskStore;

  constructor(app: App, store: TaskStore) {
    this.app = app;
    this.store = store;
  }

  /**
   * 构建完整的决策图谱
   */
  build(): DecisionGraph {
    const nodes: GraphNode[] = [];
    const edges: GraphEdge[] = [];
    const nodeIndex = new Map<string, number>();

    const addNode = (node: GraphNode): string => {
      const key = node.id;
      if (!nodeIndex.has(key)) {
        nodeIndex.set(key, nodes.length);
        nodes.push(node);
      }
      return key;
    };

    const addEdge = (edge: GraphEdge): void => {
      const exists = edges.some(
        (e) => e.from === edge.from && e.to === edge.to && e.type === edge.type
      );
      if (!exists) edges.push(edge);
    };

    // 1. 添加笔记节点
    const files = this.app.vault.getMarkdownFiles();
    for (const file of files) {
      const tags = readNoteTags(this.app, file);
      const links = readNoteLinks(this.app, file);

      addNode({
        id: file.path,
        type: "note",
        label: file.basename,
        tags,
        metadata: { links },
      });

      // 添加笔记间的链接边
      for (const link of links) {
        addEdge({
          from: file.path,
          to: link,
          type: "links-to",
          weight: 1.0,
        });
      }
    }

    // 2. 添加任务节点
    const tasks = this.store.getAllTasks();
    for (const task of tasks) {
      addNode({
        id: task.id,
        type: "task",
        label: task.title,
        tags: task.tags,
        metadata: {
          status: task.status,
          priority: task.priority,
          sourceNote: task.sourceNote,
        },
      });

      // 任务到来源笔记的边
      if (task.sourceNote) {
        addEdge({
          from: task.id,
          to: task.sourceNote,
          type: "extracted-from",
          weight: 1.0,
        });
      }

      // 任务到关联笔记的边
      for (const linked of task.linkedNotes) {
        addEdge({
          from: task.id,
          to: linked.path,
          type: "links-to",
          weight: 0.5,
        });
      }
    }

    return { nodes, edges };
  }

  /**
   * 查找两个节点之间的最短路径（BFS）
   */
  findShortestPath(
    graph: DecisionGraph,
    fromId: string,
    toId: string
  ): string[] | null {
    if (fromId === toId) return [fromId];

    const adjacency = new Map<string, string[]>();
    for (const edge of graph.edges) {
      if (!adjacency.has(edge.from)) adjacency.set(edge.from, []);
      adjacency.get(edge.from)!.push(edge.to);
    }

    const visited = new Set<string>([fromId]);
    const queue: { id: string; path: string[] }[] = [
      { id: fromId, path: [fromId] },
    ];

    while (queue.length > 0) {
      const { id, path } = queue.shift()!;
      const neighbors = adjacency.get(id) ?? [];

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
   * 获取节点的所有邻居（指定跳数内）
   */
  getNeighbors(
    graph: DecisionGraph,
    nodeId: string,
    maxHops: number = 2
  ): string[] {
    const adjacency = new Map<string, string[]>();
    for (const edge of graph.edges) {
      if (!adjacency.has(edge.from)) adjacency.set(edge.from, []);
      adjacency.get(edge.from)!.push(edge.to);
    }

    const visited = new Set<string>([nodeId]);
    const frontier = [nodeId];
    const result: string[] = [];

    for (let hop = 0; hop < maxHops; hop++) {
      const next: string[] = [];
      for (const node of frontier) {
        const neighbors = adjacency.get(node) ?? [];
        for (const nb of neighbors) {
          if (!visited.has(nb)) {
            visited.add(nb);
            result.push(nb);
            next.push(nb);
          }
        }
      }
      frontier.length = 0;
      frontier.push(...next);
    }

    return result;
  }

  /**
   * 获取标签相似但未互链的笔记对
   */
  getUnlinkedSimilarNotes(
    graph: DecisionGraph
  ): { from: string; to: string; commonTags: string[] }[] {
    const noteNodes = graph.nodes.filter((n) => n.type === "note");
    const result: { from: string; to: string; commonTags: string[] }[] = [];

    // 构建链接索引
    const linkSet = new Set<string>();
    for (const edge of graph.edges) {
      if (edge.type === "links-to") {
        linkSet.add(`${edge.from}→${edge.to}`);
        linkSet.add(`${edge.to}→${edge.from}`);
      }
    }

    for (let i = 0; i < noteNodes.length; i++) {
      for (let j = i + 1; j < noteNodes.length; j++) {
        const a = noteNodes[i];
        const b = noteNodes[j];
        const key = `${a.id}→${b.id}`;

        if (linkSet.has(key)) continue;

        const commonTags = a.tags.filter((t) => b.tags.includes(t));
        if (commonTags.length >= 2) {
          result.push({
            from: a.id,
            to: b.id,
            commonTags,
          });
        }
      }
    }

    return result;
  }

  /**
   * 获取共享关联笔记的任务对（可能存在依赖关系）
   * 注意：排除任务自身的 sourceNote，避免"自己和自己的源笔记共享"误报
   */
  getTasksWithSharedNotes(
    graph: DecisionGraph
  ): { taskA: string; taskB: string; sharedNotes: string[] }[] {
    const tasks = graph.nodes.filter((n) => n.type === "task");
    const result: { taskA: string; taskB: string; sharedNotes: string[] }[] = [];

    // 为每个任务收集关联笔记（排除自身的 sourceNote）
    const taskNotes = new Map<string, Set<string>>();
    for (const task of tasks) {
      const notes = new Set<string>();
      const sourceNote = (task.metadata?.sourceNote as string | undefined) ?? "";
      for (const edge of graph.edges) {
        if (edge.from !== task.id) continue;
        const targetNode = graph.nodes.find((n) => n.id === edge.to);
        if (!targetNode || targetNode.type !== "note") continue;
        if (edge.to === sourceNote) continue; // 排除自身源笔记
        notes.add(edge.to);
      }
      taskNotes.set(task.id, notes);
    }

    // 查找共享笔记的任务对
    for (let i = 0; i < tasks.length; i++) {
      for (let j = i + 1; j < tasks.length; j++) {
        const a = tasks[i];
        const b = tasks[j];
        const notesA = taskNotes.get(a.id) ?? new Set();
        const notesB = taskNotes.get(b.id) ?? new Set();
        const shared: string[] = [];
        for (const n of notesA) {
          if (notesB.has(n)) shared.push(n);
        }
        if (shared.length > 0) {
          result.push({
            taskA: a.id,
            taskB: b.id,
            sharedNotes: shared,
          });
        }
      }
    }

    return result;
  }
}
