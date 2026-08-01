// ============================================================
// Decision Workbench — Type Definitions
// ============================================================

/** 任务状态 */
export type TaskStatus = "todo" | "in-progress" | "done";

/** 优先级 */
export type Priority = "low" | "medium" | "high";

/** 关联关系类型 */
export type NoteRelation = "primary" | "reference" | "decision";

/** 从笔记中提取的结构化数据 */
export interface ExtractedData {
  taskMeta: TaskFrontmatter | null;
  subtasks: Subtask[];
  decisions: DecisionRecord[];
  tags: string[];
  links: string[];
}

/** frontmatter 中的 task 字段 */
export interface TaskFrontmatter {
  id?: string;
  status?: TaskStatus;
  priority?: Priority;
  due?: string;
  parent?: string;
}

/** 子任务 */
export interface Subtask {
  id: string;
  title: string;
  done: boolean;
}

/** 决策记录（从 callout 提取） */
export interface DecisionRecord {
  content: string;
  sourceLine: number;
}

/** 关联笔记 */
export interface LinkedNote {
  path: string;
  relation: NoteRelation;
}

/** 完整任务对象 */
export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  priority: Priority;
  due?: string;
  parent?: string;
  tags: string[];
  sourceNote: string;
  linkedNotes: LinkedNote[];
  subtasks: Subtask[];
  progress: number;
  createdAt: string;
  updatedAt: string;
}

/** 任务存储文件格式 */
export interface TaskStoreData {
  version: number;
  tasks: Task[];
  columns: string[];
  settings: TaskStoreSettings;
}

export interface TaskStoreSettings {
  autoExtract: boolean;
  decisionInterval: number;
}

/** 决策图谱节点 */
export interface GraphNode {
  id: string;
  type: "note" | "task" | "decision";
  label: string;
  tags: string[];
  metadata: Record<string, unknown>;
}

/** 决策图谱边 */
export interface GraphEdge {
  from: string;
  to: string;
  type: "links-to" | "depends-on" | "suggests" | "extracted-from";
  weight: number;
}

/** 决策图谱 */
export interface DecisionGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

/** 决策建议 */
export interface Suggestion {
  type: "link-suggestion" | "task-order" | "priority-adjust" | "missing-link" | "framework-5w1h" | "framework-swot";
  title: string;
  detail: string[];
  confidence: number;
  relatedNotes: string[];
  relatedTasks: string[];
}

/** 决策框架类型 */
export type DecisionFramework = "5w1h" | "swot";

/** 框架分析结果 */
export interface FrameworkAnalysis {
  framework: DecisionFramework;
  taskTitle: string;
  dimensions: FrameworkDimension[];
  summary: string;
  prioritySuggestion: Priority;
}

/** 框架分析维度 */
export interface FrameworkDimension {
  label: string;
  content: string;
  severity?: "info" | "warning" | "danger";
}

/** 自然语言解析结果 */
export interface ParsedTaskInput {
  title: string;
  due?: string;
  priority: Priority;
  tags: string[];
}

/** 插件设置 */
export interface DecisionWorkbenchSettings {
  columns: string[];
  autoExtract: boolean;
  decisionInterval: number;
  tagColumns: Record<string, string>;
  similarityThreshold: number;
}

/** 默认设置 */
export const DEFAULT_SETTINGS: DecisionWorkbenchSettings = {
  columns: ["待办", "进行中", "已完成"],
  autoExtract: true,
  decisionInterval: 300,
  tagColumns: {},
  similarityThreshold: 0.3,
};

/** 默认任务存储数据 */
export const DEFAULT_TASK_STORE: TaskStoreData = {
  version: 1,
  tasks: [],
  columns: ["待办", "进行中", "已完成"],
  settings: {
    autoExtract: true,
    decisionInterval: 300,
  },
};

// ============================================================
// 决策规则与路由
// ============================================================

/** 优先级自动提升规则 */
export interface PriorityRule {
  condition: string; // "tag:PCB" | "due:3" | "tag:学习"
  priority: Priority;
}

/** 标签路由 */
export interface TaskRoute {
  tag: string;
  flow: string;
}

/** 从 decision-rules.md 解析出的规则集 */
export interface DecisionRules {
  similarityThreshold: number;
  maxSuggestions: number;
  maxClusters: number;
  priorityRules: PriorityRule[];
  routes: TaskRoute[];
}

/** 默认规则 */
export const DEFAULT_RULES: DecisionRules = {
  similarityThreshold: 0.3,
  maxSuggestions: 5,
  maxClusters: 5,
  priorityRules: [],
  routes: [],
};

/** JSONL 决策日志条目 */
export interface DecisionLogEntry {
  ts: string;
  suggestions: number;
  byType: Record<string, number>;
  tasksTotal: number;
  tasksTodo: number;
  tasksInProgress: number;
  tasksDone: number;
}
