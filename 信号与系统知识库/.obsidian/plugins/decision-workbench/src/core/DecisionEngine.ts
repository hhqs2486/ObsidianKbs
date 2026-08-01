// ============================================================
// DecisionEngine — 决策建议引擎
// ============================================================
// 四类分析产出决策建议：
// 1. 标签聚类分析：发现标签相似但未互链的笔记
// 2. 链接路径推理：补充间接关联的直接链接
// 3. 上下文聚合：检测共享关联笔记的任务依赖
// 4. 逻辑卡片框架：5W1H/SWOT 结构化分析（frontmatter decision-framework 触发）
//
// 建议产出后回流写入相关笔记的 frontmatter。
// ============================================================

import { App, TFile } from "obsidian";
import { Suggestion, DecisionWorkbenchSettings, DecisionFramework } from "../types";
import { TaskStore } from "./TaskStore";
import { DecisionGraphBuilder } from "../graph/DecisionGraph";
import { DecisionFrameworks } from "./DecisionFrameworks";
import { updateFrontmatter, readNoteTags, readNoteLinks, readAllFrontmatter } from "../utils/frontmatter";
import { clusterByTags } from "../utils/similarity";

export class DecisionEngine {
  private app: App;
  private store: TaskStore;
  private graphBuilder: DecisionGraphBuilder;
  private frameworks: DecisionFrameworks;
  private settings: DecisionWorkbenchSettings;
  private lastRunTime: number = 0;

  constructor(
    app: App,
    store: TaskStore,
    settings: DecisionWorkbenchSettings
  ) {
    this.app = app;
    this.store = store;
    this.settings = settings;
    this.graphBuilder = new DecisionGraphBuilder(app, store);
    this.frameworks = new DecisionFrameworks(app, store);
  }

  /**
   * 执行完整分析，返回所有建议
   */
  async analyze(): Promise<Suggestion[]> {
    const suggestions: Suggestion[] = [];

    // 构建决策图谱
    const graph = this.graphBuilder.build();

    // 1. 标签聚类分析
    suggestions.push(...this.analyzeTagClusters());

    // 2. 链接路径推理
    suggestions.push(...this.analyzeLinkPaths(graph));

    // 3. 上下文聚合（任务依赖）
    suggestions.push(...this.analyzeTaskDependencies(graph));

    // 4. 逻辑卡片框架分析
    suggestions.push(...this.analyzeFrameworks());

    // 5. 回流写入
    await this.writeBack(suggestions);

    this.lastRunTime = Date.now();
    return suggestions;
  }

  /**
   * 分析 1：标签聚类 — 发现标签相似但未互链的笔记
   */
  private analyzeTagClusters(): Suggestion[] {
    const files = this.app.vault.getMarkdownFiles();
    const notesData: { path: string; tags: string[]; links: string[] }[] = [];

    for (const file of files) {
      const tags = readNoteTags(this.app, file);
      const links = readNoteLinks(this.app, file);
      if (tags.length > 0) {
        notesData.push({ path: file.path, tags, links });
      }
    }

    const clusters = clusterByTags(notesData);
    const suggestions: Suggestion[] = [];

    for (const cluster of clusters.slice(0, 5)) {
      if (cluster.unlinkedPairs.length === 0) continue;

      suggestions.push({
        type: "missing-link",
        title: `${cluster.notes.length} 篇笔记标签相似但未互链`,
        detail: cluster.unlinkedPairs
          .slice(0, 3)
          .map(
            (p) =>
              `建议补充 [[${p.from}]] → [[${p.to}]] (相似度: ${(p.similarity * 100).toFixed(0)}%)`
          ),
        confidence: cluster.similarity,
        relatedNotes: cluster.notes.map((n) => n.path),
        relatedTasks: [],
      });
    }

    return suggestions;
  }

  /**
   * 分析 2：链接路径推理 — 补充间接关联
   */
  private analyzeLinkPaths(graph: ReturnType<DecisionGraphBuilder["build"]>): Suggestion[] {
    const unlinked = this.graphBuilder.getUnlinkedSimilarNotes(graph);
    const suggestions: Suggestion[] = [];

    for (const pair of unlinked.slice(0, 5)) {
      // 检查是否存在间接路径
      const path = this.graphBuilder.findShortestPath(
        graph,
        pair.from,
        pair.to
      );

      if (path && path.length > 2) {
        const intermediaries = path
          .slice(1, -1)
          .map((p) => p.split("/").pop() ?? p)
          .join(" → ");

        suggestions.push({
          type: "link-suggestion",
          title: `检测到间接关联，建议补充直接链接`,
          detail: [
            `[[${pair.from.split("/").pop()}]] 通过 ${intermediaries} 间接关联 [[${pair.to.split("/").pop()}]]`,
            `共同标签: ${pair.commonTags.join(", ")}`,
            `建议创建直接 wikilink 缩短检索路径`,
          ],
          confidence: 0.7,
          relatedNotes: [pair.from, pair.to],
          relatedTasks: [],
        });
      } else if (!path) {
        // 完全没有路径但有共同标签
        suggestions.push({
          type: "missing-link",
          title: `标签高度相似但无链接路径`,
          detail: [
            `[[${pair.from.split("/").pop()}]] 和 [[${pair.to.split("/").pop()}]]`,
            `共同标签: ${pair.commonTags.join(", ")}`,
            `建议创建 wikilink 建立知识连接`,
          ],
          confidence: 0.6,
          relatedNotes: [pair.from, pair.to],
          relatedTasks: [],
        });
      }
    }

    return suggestions;
  }

  /**
   * 分析 3：上下文聚合 — 任务依赖推断
   */
  private analyzeTaskDependencies(graph: ReturnType<DecisionGraphBuilder["build"]>): Suggestion[] {
    const sharedPairs = this.graphBuilder.getTasksWithSharedNotes(graph);
    const suggestions: Suggestion[] = [];

    for (const pair of sharedPairs.slice(0, 5)) {
      const taskA = this.store.getTask(pair.taskA);
      const taskB = this.store.getTask(pair.taskB);
      if (!taskA || !taskB) continue;
      if (taskA.status === "done" && taskB.status === "done") continue;

      const sharedNames = pair.sharedNotes
        .map((p) => `[[${p.split("/").pop()}]]`)
        .join(", ");

      const inProgress =
        taskA.status === "in-progress" || taskB.status === "in-progress";

      suggestions.push({
        type: "task-order",
        title: `检测到任务可能存在依赖关系`,
        detail: [
          `"${taskA.title}" 和 "${taskB.title}" 共享关联笔记: ${sharedNames}`,
          inProgress
            ? `建议：评估两个任务的执行顺序，可能存在前置依赖`
            : `建议：检查是否需要先完成其中一个再开始另一个`,
        ],
        confidence: 0.5,
        relatedNotes: pair.sharedNotes,
        relatedTasks: [pair.taskA, pair.taskB],
      });
    }

    // 检查超期任务
    const now = Date.now();
    for (const task of this.store.getAllTasks()) {
      if (task.status !== "in-progress") continue;
      if (!task.due) continue;

      const dueDate = new Date(task.due).getTime();
      if (isNaN(dueDate)) continue;

      const daysOverdue = Math.floor((now - dueDate) / (1000 * 60 * 60 * 24));
      if (daysOverdue > 0) {
        suggestions.push({
          type: "priority-adjust",
          title: `进行中任务超期 ${daysOverdue} 天`,
          detail: [
            `任务: "${task.title}"`,
            `截止日期: ${task.due}`,
            `建议：重新评估优先级或调整截止日期`,
          ],
          confidence: 0.9,
          relatedNotes: task.linkedNotes.map((n) => n.path),
          relatedTasks: [task.id],
        });
      }
    }

    return suggestions;
  }

  /**
   * 分析 4：逻辑卡片框架 — 5W1H / SWOT 结构化分析
   * 触发条件：笔记 frontmatter 中 decision-framework: "5w1h" 或 "swot"
   */
  private analyzeFrameworks(): Suggestion[] {
    const suggestions: Suggestion[] = [];

    for (const task of this.store.getAllTasks()) {
      if (task.status === "done") continue;
      if (!task.sourceNote) continue;

      const file = this.app.vault.getAbstractFileByPath(task.sourceNote);
      if (!file || !(file instanceof TFile)) continue;

      const fm = readAllFrontmatter(this.app, file);
      if (!fm) continue;

      const frameworkValue = fm["decision-framework"];
      if (!frameworkValue || typeof frameworkValue !== "string") continue;

      const framework = frameworkValue.toLowerCase() as DecisionFramework;
      if (framework !== "5w1h" && framework !== "swot") continue;

      const analysis = this.frameworks.analyze(task, framework);
      if (!analysis) continue;

      // 如果引擎建议的优先级与当前不同，追加优先级调整建议
      if (analysis.prioritySuggestion !== task.priority) {
        suggestions.push({
          type: "priority-adjust",
          title: `[${framework.toUpperCase()}] 建议调整优先级: ${this.priorityLabel(task.priority)} → ${this.priorityLabel(analysis.prioritySuggestion)}`,
          detail: [analysis.summary, ...analysis.dimensions.map((d) => `${d.label}: ${d.content}`)],
          confidence: 0.85,
          relatedNotes: task.linkedNotes.map((n) => n.path),
          relatedTasks: [task.id],
        });
      }

      // 框架分析建议
      const sug = this.frameworks.toSuggestion(analysis, task);
      suggestions.push(sug);
    }

    return suggestions;
  }

  private priorityLabel(p: string): string {
    const labels: Record<string, string> = { low: "低", medium: "中", high: "高" };
    return labels[p] ?? p;
  }

  /**
   * 回流写入：将建议写入相关笔记的 frontmatter
   */
  private async writeBack(suggestions: Suggestion[]): Promise<void> {
    // 按笔记分组建议
    const noteSuggestions = new Map<string, string[]>();

    for (const sug of suggestions) {
      for (const notePath of sug.relatedNotes) {
        if (!noteSuggestions.has(notePath)) {
          noteSuggestions.set(notePath, []);
        }
        const list = noteSuggestions.get(notePath)!;
        list.push(`${sug.title}: ${sug.detail[0]}`);
      }
    }

    // 逐笔记写入
    for (const [notePath, sugs] of noteSuggestions) {
      try {
        const file = this.app.vault.getAbstractFileByPath(notePath);
        if (!file || !(file instanceof TFile)) continue;

        await updateFrontmatter(this.app, file, {
          suggestions: sugs.slice(0, 5),
          suggestionsGeneratedAt: new Date().toISOString(),
        });
      } catch (e) {
        console.error(
          `[Decision Workbench] Failed to write suggestions to ${notePath}:`,
          e
        );
      }
    }
  }

  /**
   * 是否应该自动运行
   */
  shouldAutoRun(): boolean {
    const elapsed = Date.now() - this.lastRunTime;
    return elapsed >= this.settings.decisionInterval * 1000;
  }

  /**
   * 获取上次运行时间
   */
  getLastRunTime(): number {
    return this.lastRunTime;
  }
}
