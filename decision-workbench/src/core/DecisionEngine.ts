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

import { App, TFile, parseYaml } from "obsidian";
import {
  Suggestion,
  DecisionWorkbenchSettings,
  DecisionFramework,
  DecisionRules,
  DEFAULT_RULES,
  PriorityRule,
  Task,
  Priority,
} from "../types";
import { TaskStore } from "./TaskStore";
import { DecisionGraphBuilder } from "../graph/DecisionGraph";
import { DecisionFrameworks } from "./DecisionFrameworks";
import { updateFrontmatter, readNoteTags, readNoteLinks, readAllFrontmatter } from "../utils/frontmatter";
import { clusterByTags } from "../utils/similarity";

const RULES_FILE = "decision-rules.md";
const LOG_FILE = ".obsidian/plugins/decision-workbench/decision_log.jsonl";

export class DecisionEngine {
  private app: App;
  private store: TaskStore;
  private graphBuilder: DecisionGraphBuilder;
  private frameworks: DecisionFrameworks;
  private settings: DecisionWorkbenchSettings;
  private rules: DecisionRules = { ...DEFAULT_RULES };
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
   * 从 vault 根目录读取 decision-rules.md 并解析规则
   */
  async loadRules(): Promise<DecisionRules> {
    const file = this.app.vault.getAbstractFileByPath(RULES_FILE);
    if (!file || !(file instanceof TFile)) {
      this.rules = { ...DEFAULT_RULES };
      return this.rules;
    }

    try {
      const content = await this.app.vault.read(file);
      this.rules = this.parseRulesMarkdown(content);
    } catch (e) {
      console.error("[Decision Workbench] Failed to load rules:", e);
      this.rules = { ...DEFAULT_RULES };
    }
    return this.rules;
  }

  /**
   * 解析 decision-rules.md 中的 YAML 代码块
   */
  private parseRulesMarkdown(content: string): DecisionRules {
    const rules: DecisionRules = { ...DEFAULT_RULES };
    // 提取所有 ```yaml 代码块
    const yamlBlocks: string[] = [];
    const regex = /```yaml\n([\s\S]*?)```/g;
    let match: RegExpExecArray | null;
    while ((match = regex.exec(content)) !== null) {
      yamlBlocks.push(match[1]);
    }
    if (yamlBlocks.length === 0) return rules;

    // 合并所有 YAML 块为一个对象
    const merged: Record<string, unknown> = {};
    for (const block of yamlBlocks) {
      try {
        const parsed = parseYaml(block) as Record<string, unknown>;
        Object.assign(merged, parsed);
      } catch { /* skip invalid YAML */ }
    }

    if (typeof merged.similarity_threshold === "number") {
      rules.similarityThreshold = merged.similarity_threshold;
    }
    if (typeof merged.max_suggestions === "number") {
      rules.maxSuggestions = merged.max_suggestions;
    }
    if (typeof merged.max_clusters === "number") {
      rules.maxClusters = merged.max_clusters;
    }

    if (Array.isArray(merged.priority_rules)) {
      rules.priorityRules = (merged.priority_rules as PriorityRule[])
        .filter((r) => r && typeof r.condition === "string" && typeof r.priority === "string");
    }

    if (merged.routes && typeof merged.routes === "object") {
      const routes = merged.routes as Record<string, string>;
      rules.routes = Object.entries(routes).map(([tag, flow]) => ({ tag, flow }));
    }

    return rules;
  }

  /**
   * 根据规则自动调整任务优先级
   */
  applyPriorityRules(tasks: Task[]): void {
    for (const task of tasks) {
      if (task.status === "done") continue;
      for (const rule of this.rules.priorityRules) {
        if (this.matchRule(task, rule)) {
          if (task.priority !== rule.priority) {
            this.store.updateTask(task.id, { priority: rule.priority });
          }
          break;
        }
      }
    }
  }

  /**
   * 匹配单条优先级规则
   * condition 格式: "tag:PCB" | "due:3" | "tag:学习"
   */
  private matchRule(task: Task, rule: PriorityRule): boolean {
    const cond = rule.condition;
    if (cond.startsWith("tag:")) {
      const tag = cond.slice(4).replace(/^#/, "");
      return task.tags.some((t) => t.replace(/^#/, "") === tag);
    }
    if (cond.startsWith("due:")) {
      const days = parseInt(cond.slice(4), 10);
      if (isNaN(days) || !task.due) return false;
      const due = new Date(task.due).getTime();
      if (isNaN(due)) return false;
      const diff = (due - Date.now()) / (1000 * 60 * 60 * 24);
      return diff <= days && diff >= -30; // 未来N天内或最多超期30天
    }
    return false;
  }

  /**
   * 查询任务的路由（基于标签路由表）
   */
  getRouteForTask(task: Task): string | null {
    for (const route of this.rules.routes) {
      if (task.tags.some((t) => t.replace(/^#/, "") === route.tag)) {
        return route.flow;
      }
    }
    return null;
  }

  /**
   * 追加 JSONL 决策日志（只追加不覆盖）
   */
  private async appendLog(suggestions: Suggestion[]): Promise<void> {
    const tasks = this.store.getAllTasks();
    const byType: Record<string, number> = {};
    for (const sug of suggestions) {
      byType[sug.type] = (byType[sug.type] ?? 0) + 1;
    }

    const entry = {
      ts: new Date().toISOString(),
      suggestions: suggestions.length,
      byType,
      tasksTotal: tasks.length,
      tasksTodo: tasks.filter((t) => t.status === "todo").length,
      tasksInProgress: tasks.filter((t) => t.status === "in-progress").length,
      tasksDone: tasks.filter((t) => t.status === "done").length,
    };

    try {
      const exists = await this.app.vault.adapter.exists(LOG_FILE);
      const existing = exists ? await this.app.vault.adapter.read(LOG_FILE) : "";
      const newContent = existing + JSON.stringify(entry) + "\n";
      await this.app.vault.adapter.write(LOG_FILE, newContent);
    } catch (e) {
      console.error("[Decision Workbench] Failed to append log:", e);
    }
  }

  /**
   * 执行完整分析，返回所有建议
   */
  async analyze(): Promise<Suggestion[]> {
    // 0. 加载用户规则
    await this.loadRules();

    // 0.5 应用优先级自动提升规则
    this.applyPriorityRules(this.store.getAllTasks());

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

    // 5. 去重
    const deduped = this.dedupe(suggestions).slice(0, this.rules.maxSuggestions);

    // 6. 回流写入
    await this.writeBack(deduped);

    // 7. 追加 JSONL 日志
    await this.appendLog(deduped);

    this.lastRunTime = Date.now();
    return deduped;
  }

  /**
   * 建议去重：按 (type, sorted(relatedNotes)) 作为 key
   */
  private dedupe(suggestions: Suggestion[]): Suggestion[] {
    const seen = new Map<string, Suggestion>();
    for (const sug of suggestions) {
      const key = `${sug.type}|${[...sug.relatedNotes].sort().join("|")}`;
      if (!seen.has(key)) {
        seen.set(key, sug);
      }
    }
    return [...seen.values()];
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

    for (const cluster of clusters.slice(0, this.rules.maxClusters)) {
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

    for (const pair of unlinked.slice(0, this.rules.maxSuggestions)) {
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
