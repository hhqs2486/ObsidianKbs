// ============================================================
// DecisionFrameworks — 逻辑卡片决策框架
// ============================================================
// 支持两种决策框架：
// - 5W1H：What/Why/When/Where/Who/How 六维度分析
// - SWOT：Strengths/Weaknesses/Opportunities/Threats 四象限分析
//
// 触发条件：笔记 frontmatter 中 decision-framework: "5w1h" 或 "swot"
// ============================================================

import { App, TFile } from "obsidian";
import {
  DecisionFramework,
  FrameworkAnalysis,
  FrameworkDimension,
  Priority,
  Suggestion,
  Task,
} from "../types";
import { TaskStore } from "../core/TaskStore";
import { readNoteTags, readNoteLinks } from "../utils/frontmatter";
import { tagSimilarity } from "../utils/similarity";

export class DecisionFrameworks {
  private app: App;
  private store: TaskStore;

  constructor(app: App, store: TaskStore) {
    this.app = app;
    this.store = store;
  }

  /**
   * 对指定任务执行框架分析
   */
  analyze(task: Task, framework: DecisionFramework): FrameworkAnalysis | null {
    switch (framework) {
      case "5w1h":
        return this.analyze5W1H(task);
      case "swot":
        return this.analyzeSWOT(task);
      default:
        return null;
    }
  }

  /**
   * 将框架分析结果转为 Suggestion
   */
  toSuggestion(analysis: FrameworkAnalysis, task: Task): Suggestion {
    const type =
      analysis.framework === "5w1h" ? "framework-5w1h" : "framework-swot";
    return {
      type,
      title: `[${analysis.framework.toUpperCase()}] ${analysis.summary}`,
      detail: analysis.dimensions.map(
        (d) => `${d.label}: ${d.content}`
      ),
      confidence: 0.85,
      relatedNotes: task.linkedNotes.map((n) => n.path),
      relatedTasks: [task.id],
    };
  }

  // ============================================================
  // 5W1H 分析
  // ============================================================

  private analyze5W1H(task: Task): FrameworkAnalysis {
    const dims: FrameworkDimension[] = [];

    // What — 任务是什么
    dims.push({
      label: "What (什么)",
      content: task.title,
    });

    // Why — 为什么做（从标签和关联笔记推断）
    const whyContent = this.inferWhy(task);
    dims.push({
      label: "Why (为什么)",
      content: whyContent,
      severity: task.priority === "high" ? "danger" : "info",
    });

    // When — 何时（截止日期 + 紧迫度）
    const whenDim = this.analyzeWhen(task);
    dims.push(whenDim);

    // Where — 在哪里做（从标签推断项目/领域）
    dims.push({
      label: "Where (何地)",
      content:
        task.tags.length > 0
          ? `所属领域: ${task.tags.map((t) => t.replace(/^#/, "")).join(", ")}`
          : "未指定领域",
    });

    // Who — 谁来做
    dims.push({
      label: "Who (谁)",
      content: "当前用户（单人）",
    });

    // How — 如何做（从子任务推断执行路径）
    const howContent = this.inferHow(task);
    dims.push({
      label: "How (如何)",
      content: howContent,
      severity: task.progress < 0.3 && task.subtasks.length > 3 ? "warning" : "info",
    });

    const prioritySuggestion = this.suggestPriority(task, dims);

    return {
      framework: "5w1h",
      taskTitle: task.title,
      dimensions: dims,
      summary: this.summarize5W1H(task, whenDim, prioritySuggestion),
      prioritySuggestion,
    };
  }

  private inferWhy(task: Task): string {
    const reasons: string[] = [];

    if (task.tags.length > 0) {
      reasons.push(
        `任务归属于 ${task.tags.length} 个知识领域`
      );
    }

    if (task.linkedNotes.length > 0) {
      reasons.push(
        `有 ${task.linkedNotes.length} 篇关联笔记提供上下文支撑`
      );
    }

    if (task.parent) {
      reasons.push("属于上级任务的子任务");
    }

    if (task.due) {
      reasons.push(`有明确截止日期 (${task.due})`);
    }

    return reasons.length > 0 ? reasons.join("；") : "动机不明，建议补充任务背景";
  }

  private analyzeWhen(task: Task): FrameworkDimension {
    if (!task.due) {
      return {
        label: "When (何时)",
        content: "未设置截止日期，建议设定时间约束",
        severity: "warning",
      };
    }

    const dueDate = new Date(task.due);
    const now = new Date();
    const daysLeft = Math.ceil(
      (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysLeft < 0) {
      return {
        label: "When (何时)",
        content: `已超期 ${Math.abs(daysLeft)} 天 (截止: ${task.due})`,
        severity: "danger",
      };
    } else if (daysLeft <= 2) {
      return {
        label: "When (何时)",
        content: `仅剩 ${daysLeft} 天 (截止: ${task.due})，时间紧迫`,
        severity: "warning",
      };
    } else {
      return {
        label: "When (何时)",
        content: `截止日期: ${task.due} (剩余 ${daysLeft} 天)`,
        severity: "info",
      };
    }
  }

  private inferHow(task: Task): string {
    if (task.subtasks.length === 0) {
      return "尚无分解步骤，建议拆分为可执行子任务";
    }

    const done = task.subtasks.filter((s) => s.done).length;
    const total = task.subtasks.length;
    const pct = Math.round((done / total) * 100);

    const remaining = task.subtasks
      .filter((s) => !s.done)
      .map((s) => s.title)
      .slice(0, 3);

    const lines = [`已完成 ${done}/${total} 步骤 (${pct}%)`];
    if (remaining.length > 0) {
      lines.push(`下一步: ${remaining[0]}`);
    }

    return lines.join("；");
  }

  private summarize5W1H(
    task: Task,
    whenDim: FrameworkDimension,
    priority: Priority
  ): string {
    const urgency =
      whenDim.severity === "danger"
        ? "已超期"
        : whenDim.severity === "warning"
        ? "时间紧迫"
        : "时间充裕";

    return `「${task.title}」${urgency}，建议优先级: ${this.priorityLabel(priority)}`;
  }

  // ============================================================
  // SWOT 分析
  // ============================================================

  private analyzeSWOT(task: Task): FrameworkAnalysis {
    const dims: FrameworkDimension[] = [];
    const allTasks = this.store.getAllTasks();
    const allNotes = this.app.vault.getMarkdownFiles();

    // Strengths — 优势
    const strengths: string[] = [];
    if (task.linkedNotes.length >= 2) {
      strengths.push(`${task.linkedNotes.length} 篇关联笔记提供知识支撑`);
    }
    if (task.tags.length >= 2) {
      strengths.push(`${task.tags.length} 个标签覆盖多个知识领域`);
    }
    const completedSubtasks = task.subtasks.filter((s) => s.done).length;
    if (completedSubtasks > 0) {
      strengths.push(`已完成 ${completedSubtasks} 个子任务，有执行基础`);
    }
    if (strengths.length === 0) strengths.push("任务已纳入管理系统，可追踪进度");

    dims.push({
      label: "Strengths (优势)",
      content: strengths.join("；"),
      severity: "info",
    });

    // Weaknesses — 劣势
    const weaknesses: string[] = [];
    if (task.linkedNotes.length === 0) {
      weaknesses.push("无关联笔记，缺乏知识上下文");
    }
    if (task.subtasks.length === 0) {
      weaknesses.push("未拆分子任务，执行路径不清晰");
    }
    if (task.progress < 0.3 && task.status === "in-progress") {
      weaknesses.push("进度低于 30%，可能存在执行阻力");
    }
    if (!task.due) {
      weaknesses.push("无截止日期约束");
    }
    if (weaknesses.length === 0) weaknesses.push("暂无明显短板");

    dims.push({
      label: "Weaknesses (劣势)",
      content: weaknesses.join("；"),
      severity: weaknesses.length > 2 ? "warning" : "info",
    });

    // Opportunities — 机会
    const opportunities: string[] = [];
    const sameTagTasks = allTasks.filter(
      (t) =>
        t.id !== task.id &&
        t.tags.some((tag) => task.tags.includes(tag))
    );
    if (sameTagTasks.length > 0) {
      opportunities.push(
        `${sameTagTasks.length} 个同类标签任务可复用知识`
      );
    }

    const unlinkedSimilar = this.findUnlinkedSimilar(task);
    if (unlinkedSimilar.length > 0) {
      opportunities.push(
        `${unlinkedSimilar.length} 篇相关笔记尚未关联，建立链接可扩展知识网络`
      );
    }

    if (opportunities.length === 0) {
      opportunities.push("当前知识网络已较完善，建议专注于执行");
    }

    dims.push({
      label: "Opportunities (机会)",
      content: opportunities.join("；"),
      severity: "info",
    });

    // Threats — 威胁
    const threats: string[] = [];
    if (task.due) {
      const days = this.daysUntilDue(task.due);
      if (days < 0) {
        threats.push(`已超期 ${Math.abs(days)} 天`);
      } else if (days <= 2) {
        threats.push(`仅剩 ${days} 天截止`);
      }
    }

    const conflicting = this.findConflictingTasks(task);
    if (conflicting.length > 0) {
      threats.push(
        `${conflicting.length} 个进行中任务共享关联笔记，可能存在资源冲突`
      );
    }

    const overloaded = allTasks.filter(
      (t) => t.status === "in-progress" && t.id !== task.id
    );
    if (overloaded.length >= 3) {
      threats.push(`已有 ${overloaded.length} 个进行中任务，并行负载高`);
    }

    if (threats.length === 0) threats.push("暂无明显风险");

    dims.push({
      label: "Threats (威胁)",
      content: threats.join("；"),
      severity: threats.length > 1 ? "danger" : "warning",
    });

    const prioritySuggestion = this.suggestPriority(task, dims);

    return {
      framework: "swot",
      taskTitle: task.title,
      dimensions: dims,
      summary: this.summarizeSWOT(dims, prioritySuggestion),
      prioritySuggestion,
    };
  }

  private findUnlinkedSimilar(task: Task): string[] {
    const result: string[] = [];
    const allFiles = this.app.vault.getMarkdownFiles();

    for (const file of allFiles) {
      if (file.path === task.sourceNote) continue;
      if (task.linkedNotes.some((n) => n.path === file.path)) continue;

      const tags = readNoteTags(this.app, file);
      if (tags.length === 0) continue;

      const sim = tagSimilarity(task.tags, tags);
      if (sim > 0.3) {
        result.push(file.path);
      }
    }

    return result.slice(0, 5);
  }

  private findConflictingTasks(task: Task): Task[] {
    return this.store
      .getAllTasks()
      .filter(
        (t) =>
          t.id !== task.id &&
          t.status === "in-progress" &&
          t.linkedNotes.some((n) =>
            task.linkedNotes.some((ln) => ln.path === n.path)
          )
      );
  }

  // ============================================================
  // 优先级推断
  // ============================================================

  private suggestPriority(
    task: Task,
    dims: FrameworkDimension[]
  ): Priority {
    let score = 0;

    // 截止日期影响
    if (task.due) {
      const days = this.daysUntilDue(task.due);
      if (days < 0) score += 3;
      else if (days <= 2) score += 2;
      else if (days <= 7) score += 1;
    }

    // 当前优先级权重
    if (task.priority === "high") score += 2;
    else if (task.priority === "medium") score += 1;

    // 维度严重性影响
    for (const dim of dims) {
      if (dim.severity === "danger") score += 1;
      else if (dim.severity === "warning") score += 0.5;
    }

    // 状态影响
    if (task.status === "in-progress") score += 1;

    if (score >= 4) return "high";
    if (score >= 2) return "medium";
    return "low";
  }

  private daysUntilDue(due: string): number {
    const dueDate = new Date(due);
    const now = new Date();
    return Math.ceil(
      (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
  }

  private priorityLabel(priority: Priority): string {
    const labels: Record<Priority, string> = {
      low: "低",
      medium: "中",
      high: "高",
    };
    return labels[priority];
  }

  private summarizeSWOT(
    dims: FrameworkDimension[],
    priority: Priority
  ): string {
    const dangerCount = dims.filter((d) => d.severity === "danger").length;
    const warnCount = dims.filter((d) => d.severity === "warning").length;

    const risk =
      dangerCount > 0
        ? "高风险"
        : warnCount > 1
        ? "中等风险"
        : "低风险";

    return `风险评估: ${risk}，建议优先级: ${this.priorityLabel(priority)}`;
  }
}
