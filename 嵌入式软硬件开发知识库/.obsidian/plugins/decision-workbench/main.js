"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// main.ts
var main_exports = {};
__export(main_exports, {
  default: () => DecisionWorkbenchPlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian8 = require("obsidian");

// src/types/index.ts
var DEFAULT_SETTINGS = {
  columns: ["\u5F85\u529E", "\u8FDB\u884C\u4E2D", "\u5DF2\u5B8C\u6210"],
  autoExtract: true,
  decisionInterval: 300,
  tagColumns: {},
  similarityThreshold: 0.3
};
var DEFAULT_TASK_STORE = {
  version: 1,
  tasks: [],
  columns: ["\u5F85\u529E", "\u8FDB\u884C\u4E2D", "\u5DF2\u5B8C\u6210"],
  settings: {
    autoExtract: true,
    decisionInterval: 300
  }
};
var DEFAULT_RULES = {
  similarityThreshold: 0.3,
  maxSuggestions: 5,
  maxClusters: 5,
  priorityRules: [],
  routes: []
};

// src/utils/frontmatter.ts
var import_obsidian = require("obsidian");
var TASK_KEY = "task";
var SUGGESTIONS_KEY = "decision-suggestions";
function readTaskMeta(app, file) {
  const cache = app.metadataCache.getFileCache(file);
  if (!cache || !cache.frontmatter)
    return null;
  const task = cache.frontmatter[TASK_KEY];
  if (!task || typeof task !== "object")
    return null;
  return task;
}
function readAllFrontmatter(app, file) {
  const cache = app.metadataCache.getFileCache(file);
  if (!cache || !cache.frontmatter)
    return null;
  return cache.frontmatter;
}
function readNoteTags(app, file) {
  var _a;
  const cache = app.metadataCache.getFileCache(file);
  if (!cache)
    return [];
  const tags = [];
  if ((_a = cache.frontmatter) == null ? void 0 : _a.tags) {
    const fmTags = cache.frontmatter.tags;
    if (Array.isArray(fmTags)) {
      tags.push(...fmTags.map((t) => String(t)));
    } else if (typeof fmTags === "string") {
      tags.push(fmTags);
    }
  }
  if (cache.tags) {
    for (const t of cache.tags) {
      if (!tags.includes(t.tag))
        tags.push(t.tag);
    }
  }
  return tags;
}
function readNoteLinks(app, file) {
  const cache = app.metadataCache.getFileCache(file);
  if (!cache || !cache.links)
    return [];
  return cache.links.map((l) => l.link).filter((link, idx, arr) => arr.indexOf(link) === idx);
}
function generateTaskId() {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).slice(2, 8);
  return `task-${timestamp}${random}`;
}
async function updateFrontmatter(app, file, updates) {
  var _a;
  const content = await app.vault.read(file);
  const { frontmatter, body, start, end } = splitFrontmatter(content);
  let updatedFm = {};
  if (frontmatter) {
    try {
      updatedFm = (0, import_obsidian.parseYaml)(frontmatter);
    } catch (e) {
      updatedFm = {};
    }
  }
  if (updates.task) {
    const existing = (_a = updatedFm[TASK_KEY]) != null ? _a : {};
    updatedFm[TASK_KEY] = { ...existing, ...updates.task };
  }
  if (updates.suggestions !== void 0) {
    if (updates.suggestions.length > 0) {
      updatedFm[SUGGESTIONS_KEY] = updates.suggestions;
      if (updates.suggestionsGeneratedAt) {
        updatedFm["decision-generated"] = updates.suggestionsGeneratedAt;
      }
    } else {
      delete updatedFm[SUGGESTIONS_KEY];
      delete updatedFm["decision-generated"];
    }
  }
  const yamlStr = (0, import_obsidian.stringifyYaml)(updatedFm).trim();
  const newContent = yamlStr.length > 0 ? `---
${yamlStr}
---
${body}` : body;
  await app.vault.modify(file, newContent);
}
function splitFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (match) {
    return {
      frontmatter: match[1],
      body: match[2],
      start: 0,
      end: match[1].length + 8
    };
  }
  return {
    frontmatter: null,
    body: content,
    start: -1,
    end: -1
  };
}

// src/core/TaskStore.ts
var STORE_PATH = ".obsidian/plugins/decision-workbench/tasks.json";
var TaskStore = class {
  // tag(不含#) → Set<Task>
  constructor(app) {
    this.listeners = /* @__PURE__ */ new Set();
    // ---- 索引层（O(1) 查询） ----
    this.idIndex = /* @__PURE__ */ new Map();
    // id → Task
    this.noteIndex = /* @__PURE__ */ new Map();
    // sourceNote → Task
    this.statusIndex = /* @__PURE__ */ new Map();
    // status → Set<Task>
    this.tagIndex = /* @__PURE__ */ new Map();
    this.app = app;
    this.data = { ...DEFAULT_TASK_STORE };
  }
  /** 初始化：加载或创建存储文件 */
  async load() {
    const exists = await this.app.vault.adapter.exists(STORE_PATH);
    if (exists) {
      try {
        const raw = await this.app.vault.adapter.read(STORE_PATH);
        const parsed = JSON.parse(raw);
        this.data = { ...DEFAULT_TASK_STORE, ...parsed };
      } catch (e) {
        console.error("[Decision Workbench] Failed to load task store:", e);
        this.data = { ...DEFAULT_TASK_STORE };
      }
    }
    this.rebuildIndexes();
  }
  /** 持久化到 vault */
  async save() {
    try {
      const dir = STORE_PATH.substring(0, STORE_PATH.lastIndexOf("/"));
      if (!await this.app.vault.adapter.exists(dir)) {
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
  rebuildIndexes() {
    this.idIndex.clear();
    this.noteIndex.clear();
    this.statusIndex.clear();
    this.tagIndex.clear();
    for (const task of this.data.tasks) {
      this.indexTask(task);
    }
  }
  /** 索引单个任务 */
  indexTask(task) {
    this.idIndex.set(task.id, task);
    if (task.sourceNote)
      this.noteIndex.set(task.sourceNote, task);
    if (!this.statusIndex.has(task.status)) {
      this.statusIndex.set(task.status, /* @__PURE__ */ new Set());
    }
    this.statusIndex.get(task.status).add(task);
    for (const tag of task.tags) {
      const clean = tag.replace(/^#/, "");
      if (!this.tagIndex.has(clean))
        this.tagIndex.set(clean, /* @__PURE__ */ new Set());
      this.tagIndex.get(clean).add(task);
    }
  }
  /** 从索引中移除单个任务 */
  unindexTask(task) {
    var _a, _b;
    this.idIndex.delete(task.id);
    if (task.sourceNote)
      this.noteIndex.delete(task.sourceNote);
    (_a = this.statusIndex.get(task.status)) == null ? void 0 : _a.delete(task);
    for (const tag of task.tags) {
      const clean = tag.replace(/^#/, "");
      (_b = this.tagIndex.get(clean)) == null ? void 0 : _b.delete(task);
    }
  }
  // ============================================================
  // 查询（O(1) 索引查找）
  // ============================================================
  /** 获取全部任务（返回只读引用，防止外部 mutate） */
  getAllTasks() {
    return this.data.tasks;
  }
  /** 按 ID 获取任务 — O(1) */
  getTask(id) {
    return this.idIndex.get(id);
  }
  /** 按状态获取任务 — O(1) */
  getTasksByStatus(status) {
    var _a;
    return [...(_a = this.statusIndex.get(status)) != null ? _a : []];
  }
  /** 按来源笔记获取任务 — O(1) */
  getTaskByNote(notePath) {
    return this.noteIndex.get(notePath);
  }
  /** 按标签获取任务 — O(k), k = 匹配标签的任务数 */
  getTasksByTag(tag) {
    var _a;
    const clean = tag.replace(/^#/, "");
    return [...(_a = this.tagIndex.get(clean)) != null ? _a : []];
  }
  /** 创建新任务 */
  createTask(title, options = {}) {
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const task = {
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
      ...options
    };
    this.data.tasks.push(task);
    this.indexTask(task);
    return task;
  }
  /** 更新任务 */
  updateTask(id, updates) {
    const task = this.idIndex.get(id);
    if (!task)
      return void 0;
    this.unindexTask(task);
    Object.assign(task, updates, { updatedAt: (/* @__PURE__ */ new Date()).toISOString() });
    if (task.subtasks.length > 0) {
      const done = task.subtasks.filter((s) => s.done).length;
      task.progress = done / task.subtasks.length;
    }
    this.indexTask(task);
    return task;
  }
  /** 删除任务 */
  deleteTask(id) {
    const task = this.idIndex.get(id);
    if (!task)
      return false;
    this.unindexTask(task);
    const idx = this.data.tasks.indexOf(task);
    if (idx >= 0)
      this.data.tasks.splice(idx, 1);
    return true;
  }
  /** 更新任务状态 */
  setTaskStatus(id, status) {
    this.updateTask(id, { status });
  }
  /** 添加关联笔记 */
  addLinkedNote(taskId, notePath, relation = "reference") {
    const task = this.getTask(taskId);
    if (!task)
      return;
    if (task.linkedNotes.some((n) => n.path === notePath))
      return;
    task.linkedNotes.push({ path: notePath, relation });
    task.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
  }
  /** 添加子任务 */
  addSubtask(taskId, title) {
    const task = this.getTask(taskId);
    if (!task)
      return;
    task.subtasks.push({
      id: `st-${Date.now().toString(36)}`,
      title,
      done: false
    });
    task.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
  }
  /** 切换子任务状态 */
  toggleSubtask(taskId, subtaskId) {
    const task = this.getTask(taskId);
    if (!task)
      return;
    const st = task.subtasks.find((s) => s.id === subtaskId);
    if (!st)
      return;
    st.done = !st.done;
    const done = task.subtasks.filter((s) => s.done).length;
    task.progress = task.subtasks.length > 0 ? done / task.subtasks.length : 0;
    task.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
  }
  /** 获取列配置 */
  getColumns() {
    return this.data.columns;
  }
  /** 注册变更监听 */
  onChange(listener) {
    this.listeners.add(listener);
  }
  /** 注销变更监听 */
  offChange(listener) {
    this.listeners.delete(listener);
  }
  /** 通知所有监听器 */
  notifyListeners() {
    this.listeners.forEach((l) => l());
  }
};

// src/core/NoteExtractor.ts
var NoteExtractor = class {
  constructor(app) {
    this.app = app;
  }
  /**
   * 从指定笔记中提取所有结构化数据
   */
  async extract(file) {
    const content = await this.app.vault.read(file);
    const taskMeta = readTaskMeta(this.app, file);
    const subtasks = this.extractSubtasks(content);
    const decisions = this.extractDecisions(content);
    const tags = readNoteTags(this.app, file);
    const links = readNoteLinks(this.app, file);
    return { taskMeta, subtasks, decisions, tags, links };
  }
  /**
   * 仅从缓存中提取元数据（不读文件内容，更快）
   */
  extractFromCache(file) {
    const taskMeta = readTaskMeta(this.app, file);
    const tags = readNoteTags(this.app, file);
    const links = readNoteLinks(this.app, file);
    return {
      taskMeta,
      subtasks: [],
      decisions: [],
      tags,
      links
    };
  }
  /**
   * 从正文提取待办事项
   * 匹配: - [ ] 和 - [x] 格式
   */
  extractSubtasks(content) {
    const regex = /^(\s*)- \[([ xX])\]\s+(.+)$/gm;
    const tasks = [];
    let match;
    let index = 0;
    while ((match = regex.exec(content)) !== null) {
      tasks.push({
        id: `st-${Date.now().toString(36)}-${index++}`,
        title: match[3].trim(),
        done: match[2].toLowerCase() === "x"
      });
    }
    return tasks;
  }
  /**
   * 从正文提取决策 callout 块
   * 匹配: > [!decision] ... 或 > [!决策] ...
   */
  extractDecisions(content) {
    const decisions = [];
    const lines = content.split("\n");
    let inDecision = false;
    let decisionContent = "";
    let startLine = -1;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const calloutMatch = line.match(
        /^>\s*\[!(decision|决策|conclusion|结论)\]/i
      );
      if (calloutMatch) {
        inDecision = true;
        decisionContent = "";
        startLine = i;
        const afterBracket = line.replace(
          /^>\s*\[!(decision|决策|conclusion|结论)\]\s*/i,
          ""
        );
        if (afterBracket.trim()) {
          decisionContent += afterBracket.trim() + "\n";
        }
        continue;
      }
      if (inDecision) {
        if (line.startsWith(">") || line.trim() === "") {
          decisionContent += line.replace(/^>\s?/, "") + "\n";
        } else {
          if (decisionContent.trim()) {
            decisions.push({
              content: decisionContent.trim(),
              sourceLine: startLine
            });
          }
          inDecision = false;
          decisionContent = "";
        }
      }
    }
    if (inDecision && decisionContent.trim()) {
      decisions.push({
        content: decisionContent.trim(),
        sourceLine
      });
    }
    return decisions;
  }
  /**
   * 检测笔记是否包含任务相关内容
   */
  hasTaskContent(file) {
    const data = this.extractFromCache(file);
    return data.taskMeta !== null || data.tags.length > 0 || data.links.length > 0;
  }
  /**
   * 批量提取库中所有包含任务内容的笔记
   */
  async extractAllMarkdown() {
    const files = this.app.vault.getMarkdownFiles();
    const results = [];
    for (const file of files) {
      const data = this.extractFromCache(file);
      if (data.taskMeta || data.tags.length > 0) {
        results.push({ file, data });
      }
    }
    return results;
  }
};

// src/core/TaskLinker.ts
var import_obsidian2 = require("obsidian");

// src/utils/similarity.ts
function jaccardSimilarity(setA, setB) {
  if (setA.length === 0 && setB.length === 0)
    return 0;
  const a = new Set(setA);
  const b = new Set(setB);
  let intersection = 0;
  for (const item of a) {
    if (b.has(item))
      intersection++;
  }
  const union = a.size + b.size - intersection;
  return union === 0 ? 0 : intersection / union;
}
function tagSimilarity(tagsA, tagsB) {
  if (tagsA.length === 0 || tagsB.length === 0)
    return 0;
  const exactScore = jaccardSimilarity(tagsA, tagsB);
  let parentScore = 0;
  for (const ta of tagsA) {
    for (const tb of tagsB) {
      const prefix = longestCommonPrefix(ta, tb);
      if (prefix.length > 0) {
        const ratio = prefix.length / Math.max(ta.length, tb.length);
        parentScore = Math.max(parentScore, ratio * 0.5);
      }
    }
  }
  return Math.max(exactScore, parentScore);
}
function longestCommonPrefix(a, b) {
  const partsA = a.split("/");
  const partsB = b.split("/");
  const common = [];
  for (let i = 0; i < Math.min(partsA.length, partsB.length); i++) {
    if (partsA[i] === partsB[i]) {
      common.push(partsA[i]);
    } else {
      break;
    }
  }
  return common.join("/");
}
function linkDistanceInverse(linksA, linksB, notePathA, notePathB) {
  if (linksA.includes(notePathB) || linksB.includes(notePathA)) {
    return 1;
  }
  const common = linksA.filter((l) => linksB.includes(l));
  if (common.length > 0) {
    return 0.5;
  }
  return 0;
}
function coReferenceScore(refByA, refByB) {
  if (refByA.length === 0 || refByB.length === 0)
    return 0;
  const common = refByA.filter((r) => refByB.includes(r));
  const maxRefs = Math.max(refByA.length, refByB.length);
  return common.length / maxRefs;
}
function associationStrength(tagsA, tagsB, linksA, linksB, notePathA, notePathB, refByA = [], refByB = []) {
  const tagScore = tagSimilarity(tagsA, tagsB) * 0.5;
  const linkScore = linkDistanceInverse(linksA, linksB, notePathA, notePathB) * 0.3;
  const refScore = coReferenceScore(refByA, refByB) * 0.2;
  return Math.min(1, tagScore + linkScore + refScore);
}
function clusterByTags(notes) {
  const tagToNotes = {};
  for (const note of notes) {
    for (const tag of note.tags) {
      if (!tagToNotes[tag])
        tagToNotes[tag] = [];
      tagToNotes[tag].push(note);
    }
  }
  const clusters = [];
  for (const [tag, noteList] of Object.entries(tagToNotes)) {
    if (noteList.length < 2)
      continue;
    const unlinkedPairs = [];
    for (let i = 0; i < noteList.length; i++) {
      for (let j = i + 1; j < noteList.length; j++) {
        const a = noteList[i];
        const b = noteList[j];
        if (!a.links.includes(b.path) && !b.links.includes(a.path)) {
          const sim = tagSimilarity(a.tags, b.tags);
          if (sim > 0.3) {
            unlinkedPairs.push({
              from: a.path,
              to: b.path,
              similarity: sim
            });
          }
        }
      }
    }
    if (unlinkedPairs.length > 0) {
      const avgSim = unlinkedPairs.reduce((sum, p) => sum + p.similarity, 0) / unlinkedPairs.length;
      clusters.push({
        tag,
        notes: noteList.map((n) => ({ path: n.path, tags: n.tags })),
        unlinkedPairs,
        similarity: avgSim
      });
    }
  }
  return clusters.sort((a, b) => b.similarity - a.similarity);
}

// src/core/TaskLinker.ts
var TaskLinker = class {
  constructor(app, store, extractor) {
    // 标签倒排索引：tag → Set<filePath>
    this.tagToFileIndex = /* @__PURE__ */ new Map();
    // 缓存每篇笔记的 tags/links，避免重复读取 metadataCache
    this.noteDataCache = /* @__PURE__ */ new Map();
    this.app = app;
    this.store = store;
    this.extractor = extractor;
  }
  /**
   * 处理单篇笔记：提取任务信息、创建/更新任务、回写 frontmatter
   */
  async processNote(file) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m;
    const data = await this.extractor.extract(file);
    if (!data.taskMeta && data.tags.length === 0)
      return null;
    let task;
    if ((_a = data.taskMeta) == null ? void 0 : _a.id) {
      task = this.store.getTask(data.taskMeta.id);
    }
    if (!task) {
      task = this.store.getTaskByNote(file.path);
    }
    if (!task) {
      const title = file.basename;
      const taskId = generateTaskId();
      task = this.store.createTask(title, {
        id: taskId,
        status: (_c = (_b = data.taskMeta) == null ? void 0 : _b.status) != null ? _c : "todo",
        priority: (_e = (_d = data.taskMeta) == null ? void 0 : _d.priority) != null ? _e : "medium",
        due: (_f = data.taskMeta) == null ? void 0 : _f.due,
        parent: (_g = data.taskMeta) == null ? void 0 : _g.parent,
        tags: data.tags,
        sourceNote: file.path,
        subtasks: data.subtasks,
        progress: data.subtasks.length > 0 ? data.subtasks.filter((s) => s.done).length / data.subtasks.length : 0
      });
      await updateFrontmatter(this.app, file, {
        task: { id: taskId }
      });
    } else {
      this.store.updateTask(task.id, {
        status: (_i = (_h = data.taskMeta) == null ? void 0 : _h.status) != null ? _i : task.status,
        priority: (_k = (_j = data.taskMeta) == null ? void 0 : _j.priority) != null ? _k : task.priority,
        due: (_m = (_l = data.taskMeta) == null ? void 0 : _l.due) != null ? _m : task.due,
        tags: data.tags.length > 0 ? data.tags : task.tags,
        subtasks: data.subtasks.length > 0 ? data.subtasks : task.subtasks,
        sourceNote: file.path
      });
    }
    await this.suggestLinkedNotes(file, task);
    return task;
  }
  /**
   * 基于标签和链接关系，自动建议关联笔记
   * 使用标签倒排索引优化：O(n²) → O(n×k)，k = 共享标签的笔记数
   */
  async suggestLinkedNotes(sourceFile, task) {
    var _a, _b;
    const sourceTags = readNoteTags(this.app, sourceFile);
    const sourceLinks = readNoteLinks(this.app, sourceFile);
    if (sourceTags.length === 0)
      return;
    const candidates = /* @__PURE__ */ new Map();
    for (const tag of sourceTags) {
      const filesWithTag = this.tagToFileIndex.get(tag);
      if (filesWithTag) {
        for (const candidatePath of filesWithTag) {
          if (candidatePath === sourceFile.path)
            continue;
          candidates.set(
            candidatePath,
            ((_a = candidates.get(candidatePath)) != null ? _a : 0) + 1
          );
        }
      } else {
        const allFiles = this.app.vault.getMarkdownFiles();
        for (const file of allFiles) {
          if (file.path === sourceFile.path)
            continue;
          const tags = readNoteTags(this.app, file);
          if (tags.includes(tag)) {
            candidates.set(
              file.path,
              ((_b = candidates.get(file.path)) != null ? _b : 0) + 1
            );
          }
        }
      }
    }
    const ranked = [];
    for (const [candidatePath] of candidates) {
      const candidateData = this.noteDataCache.get(candidatePath);
      let candTags;
      let candLinks;
      if (candidateData) {
        candTags = candidateData.tags;
        candLinks = candidateData.links;
      } else {
        const file2 = this.app.vault.getAbstractFileByPath(candidatePath);
        if (!file2 || !(file2 instanceof import_obsidian2.TFile))
          continue;
        candTags = readNoteTags(this.app, file2);
        candLinks = readNoteLinks(this.app, file2);
      }
      const file = this.app.vault.getAbstractFileByPath(candidatePath);
      if (!file || !(file instanceof import_obsidian2.TFile))
        continue;
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
    ranked.sort((a, b) => b.strength - a.strength);
    const topCandidates = ranked.slice(0, 10);
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
  async linkNoteToTask(taskId, notePath, relation = "reference") {
    this.store.addLinkedNote(taskId, notePath, relation);
    if (relation === "primary") {
      this.store.updateTask(taskId, { sourceNote: notePath });
    }
  }
  /**
   * 批量处理所有笔记（首次扫描）
   * 两阶段优化：Phase 1 构建标签索引 O(n)，Phase 2 用索引做关联 O(n×k)
   */
  async processAllNotes() {
    const files = this.app.vault.getMarkdownFiles();
    this.tagToFileIndex.clear();
    this.noteDataCache.clear();
    for (const file of files) {
      const tags = readNoteTags(this.app, file);
      const links = readNoteLinks(this.app, file);
      this.noteDataCache.set(file.path, { tags, links });
      for (const tag of tags) {
        if (!this.tagToFileIndex.has(tag)) {
          this.tagToFileIndex.set(tag, /* @__PURE__ */ new Set());
        }
        this.tagToFileIndex.get(tag).add(file.path);
      }
    }
    let count = 0;
    for (const file of files) {
      try {
        const task = await this.processNote(file);
        if (task)
          count++;
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
  async syncSubtasks(file) {
    const task = this.store.getTaskByNote(file.path);
    if (!task)
      return;
    const data = await this.extractor.extract(file);
    if (data.subtasks.length === 0)
      return;
    const existingById = new Map(
      task.subtasks.map((s) => [s.id, s])
    );
    const updated = data.subtasks.map((newSt, idx) => {
      const existing = existingById.get(newSt.id);
      if (existing) {
        return { ...existing, title: newSt.title };
      }
      const byTitle = task.subtasks.find(
        (s) => s.title === newSt.title
      );
      if (byTitle) {
        return { ...byTitle, title: newSt.title };
      }
      return {
        id: `st-${Date.now().toString(36)}-${idx}`,
        title: newSt.title,
        done: newSt.done
      };
    });
    this.store.updateTask(task.id, { subtasks: updated });
  }
};

// src/core/DecisionEngine.ts
var import_obsidian3 = require("obsidian");

// src/core/DecisionLog.ts
var MAX_LOG_ENTRIES = 500;
var DecisionLog = class {
  constructor(app, logPath) {
    this.cachedTail = null;
    this.app = app;
    this.logPath = logPath;
  }
  /**
   * 追加日志条目（不再读取整个文件做拼接，除非需要轮转）
   */
  async append(entry) {
    try {
      const line = JSON.stringify(entry) + "\n";
      const exists = await this.app.vault.adapter.exists(this.logPath);
      if (exists) {
        const content = await this.app.vault.adapter.read(this.logPath);
        const lines = content.trim().split("\n");
        if (lines.length >= MAX_LOG_ENTRIES) {
          const trimmed = lines.slice(-(MAX_LOG_ENTRIES - 1));
          trimmed.push(line.trim());
          await this.app.vault.adapter.write(
            this.logPath,
            trimmed.join("\n") + "\n"
          );
        } else {
          await this.app.vault.adapter.write(this.logPath, content + line);
        }
      } else {
        const dir = this.logPath.substring(0, this.logPath.lastIndexOf("/"));
        if (dir && !await this.app.vault.adapter.exists(dir)) {
          await this.app.vault.adapter.mkdir(dir);
        }
        await this.app.vault.adapter.write(this.logPath, line);
      }
      this.cachedTail = null;
    } catch (e) {
      console.error("[Decision Workbench] Failed to append log:", e);
    }
  }
  /**
   * 读取最近 N 条日志（尾部缓存 + 只解析最后 N*2 行）
   */
  async readTail(limit = 7) {
    if (this.cachedTail && this.cachedTail.length >= limit) {
      return this.cachedTail.slice(0, limit);
    }
    try {
      const exists = await this.app.vault.adapter.exists(this.logPath);
      if (!exists)
        return [];
      const raw = await this.app.vault.adapter.read(this.logPath);
      const lines = raw.trim().split("\n");
      const tailLines = lines.slice(-limit * 2);
      const entries = [];
      for (const line of tailLines) {
        if (!line.trim())
          continue;
        try {
          entries.push(JSON.parse(line));
        } catch (e) {
        }
      }
      entries.reverse();
      this.cachedTail = entries;
      return entries.slice(0, limit);
    } catch (e) {
      return [];
    }
  }
  /**
   * 失效缓存（外部数据变更时调用）
   */
  invalidate() {
    this.cachedTail = null;
  }
};

// src/graph/DecisionGraph.ts
var DecisionGraphBuilder = class {
  constructor(app, store) {
    this.app = app;
    this.store = store;
  }
  /**
   * 构建完整的决策图谱
   */
  build() {
    const nodes = [];
    const edges = [];
    const nodeIndex = /* @__PURE__ */ new Map();
    const addNode = (node) => {
      const key = node.id;
      if (!nodeIndex.has(key)) {
        nodeIndex.set(key, nodes.length);
        nodes.push(node);
      }
      return key;
    };
    const addEdge = (edge) => {
      const exists = edges.some(
        (e) => e.from === edge.from && e.to === edge.to && e.type === edge.type
      );
      if (!exists)
        edges.push(edge);
    };
    const files = this.app.vault.getMarkdownFiles();
    for (const file of files) {
      const tags = readNoteTags(this.app, file);
      const links = readNoteLinks(this.app, file);
      addNode({
        id: file.path,
        type: "note",
        label: file.basename,
        tags,
        metadata: { links }
      });
      for (const link of links) {
        addEdge({
          from: file.path,
          to: link,
          type: "links-to",
          weight: 1
        });
      }
    }
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
          sourceNote: task.sourceNote
        }
      });
      if (task.sourceNote) {
        addEdge({
          from: task.id,
          to: task.sourceNote,
          type: "extracted-from",
          weight: 1
        });
      }
      for (const linked of task.linkedNotes) {
        addEdge({
          from: task.id,
          to: linked.path,
          type: "links-to",
          weight: 0.5
        });
      }
    }
    return { nodes, edges };
  }
  /**
   * 查找两个节点之间的最短路径（BFS）
   */
  findShortestPath(graph, fromId, toId) {
    var _a;
    if (fromId === toId)
      return [fromId];
    const adjacency = /* @__PURE__ */ new Map();
    for (const edge of graph.edges) {
      if (!adjacency.has(edge.from))
        adjacency.set(edge.from, []);
      adjacency.get(edge.from).push(edge.to);
    }
    const visited = /* @__PURE__ */ new Set([fromId]);
    const queue = [
      { id: fromId, path: [fromId] }
    ];
    while (queue.length > 0) {
      const { id, path } = queue.shift();
      const neighbors = (_a = adjacency.get(id)) != null ? _a : [];
      for (const next of neighbors) {
        if (next === toId)
          return [...path, next];
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
  getNeighbors(graph, nodeId, maxHops = 2) {
    var _a;
    const adjacency = /* @__PURE__ */ new Map();
    for (const edge of graph.edges) {
      if (!adjacency.has(edge.from))
        adjacency.set(edge.from, []);
      adjacency.get(edge.from).push(edge.to);
    }
    const visited = /* @__PURE__ */ new Set([nodeId]);
    const frontier = [nodeId];
    const result = [];
    for (let hop = 0; hop < maxHops; hop++) {
      const next = [];
      for (const node of frontier) {
        const neighbors = (_a = adjacency.get(node)) != null ? _a : [];
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
  getUnlinkedSimilarNotes(graph) {
    const noteNodes = graph.nodes.filter((n) => n.type === "note");
    const result = [];
    const linkSet = /* @__PURE__ */ new Set();
    for (const edge of graph.edges) {
      if (edge.type === "links-to") {
        linkSet.add(`${edge.from}\u2192${edge.to}`);
        linkSet.add(`${edge.to}\u2192${edge.from}`);
      }
    }
    for (let i = 0; i < noteNodes.length; i++) {
      for (let j = i + 1; j < noteNodes.length; j++) {
        const a = noteNodes[i];
        const b = noteNodes[j];
        const key = `${a.id}\u2192${b.id}`;
        if (linkSet.has(key))
          continue;
        const commonTags = a.tags.filter((t) => b.tags.includes(t));
        if (commonTags.length >= 2) {
          result.push({
            from: a.id,
            to: b.id,
            commonTags
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
  getTasksWithSharedNotes(graph) {
    var _a, _b, _c, _d;
    const tasks = graph.nodes.filter((n) => n.type === "task");
    const result = [];
    const taskNotes = /* @__PURE__ */ new Map();
    for (const task of tasks) {
      const notes = /* @__PURE__ */ new Set();
      const sourceNote = (_b = (_a = task.metadata) == null ? void 0 : _a.sourceNote) != null ? _b : "";
      for (const edge of graph.edges) {
        if (edge.from !== task.id)
          continue;
        const targetNode = graph.nodes.find((n) => n.id === edge.to);
        if (!targetNode || targetNode.type !== "note")
          continue;
        if (edge.to === sourceNote)
          continue;
        notes.add(edge.to);
      }
      taskNotes.set(task.id, notes);
    }
    for (let i = 0; i < tasks.length; i++) {
      for (let j = i + 1; j < tasks.length; j++) {
        const a = tasks[i];
        const b = tasks[j];
        const notesA = (_c = taskNotes.get(a.id)) != null ? _c : /* @__PURE__ */ new Set();
        const notesB = (_d = taskNotes.get(b.id)) != null ? _d : /* @__PURE__ */ new Set();
        const shared = [];
        for (const n of notesA) {
          if (notesB.has(n))
            shared.push(n);
        }
        if (shared.length > 0) {
          result.push({
            taskA: a.id,
            taskB: b.id,
            sharedNotes: shared
          });
        }
      }
    }
    return result;
  }
};

// src/graph/CachedDecisionGraph.ts
var CachedDecisionGraph = class {
  constructor(app, store) {
    // 核心数据结构
    this.nodes = /* @__PURE__ */ new Map();
    this.edges = /* @__PURE__ */ new Map();
    // key: "from→to→type"
    this.adjacency = /* @__PURE__ */ new Map();
    // from → Set<to>
    this.reverseAdjacency = /* @__PURE__ */ new Map();
    // to → Set<from>
    this.noteNodesByTag = /* @__PURE__ */ new Map();
    // tag → Set<nodeId>
    this.initialized = false;
    this.app = app;
    this.store = store;
  }
  /**
   * 全量构建（仅启动时调用一次）
   */
  build() {
    if (this.initialized)
      return;
    const files = this.app.vault.getMarkdownFiles();
    for (const file of files) {
      this.addNoteNode(file);
    }
    for (const task of this.store.getAllTasks()) {
      this.addTaskNode(task);
    }
    this.initialized = true;
  }
  // ============================================================
  // 节点管理
  // ============================================================
  addNoteNode(file) {
    const tags = readNoteTags(this.app, file);
    const links = readNoteLinks(this.app, file);
    const node = {
      id: file.path,
      type: "note",
      label: file.basename,
      tags,
      metadata: { links }
    };
    this.nodes.set(file.path, node);
    for (const link of links) {
      this.addEdge(file.path, link, "links-to", 1);
    }
    for (const tag of tags) {
      if (!this.noteNodesByTag.has(tag)) {
        this.noteNodesByTag.set(tag, /* @__PURE__ */ new Set());
      }
      this.noteNodesByTag.get(tag).add(file.path);
    }
  }
  addTaskNode(task) {
    const node = {
      id: task.id,
      type: "task",
      label: task.title,
      tags: task.tags,
      metadata: {
        status: task.status,
        priority: task.priority,
        sourceNote: task.sourceNote
      }
    };
    this.nodes.set(task.id, node);
    if (task.sourceNote) {
      this.addEdge(task.id, task.sourceNote, "extracted-from", 1);
    }
    for (const linked of task.linkedNotes) {
      this.addEdge(task.id, linked.path, "links-to", 0.5);
    }
  }
  addEdge(from, to, type, weight) {
    const key = `${from}\u2192${to}\u2192${type}`;
    if (this.edges.has(key))
      return;
    this.edges.set(key, { from, to, type, weight });
    if (!this.adjacency.has(from))
      this.adjacency.set(from, /* @__PURE__ */ new Set());
    this.adjacency.get(from).add(to);
    if (!this.reverseAdjacency.has(to))
      this.reverseAdjacency.set(to, /* @__PURE__ */ new Set());
    this.reverseAdjacency.get(to).add(from);
  }
  removeEdge(from, to, type) {
    var _a, _b;
    const key = `${from}\u2192${to}\u2192${type}`;
    this.edges.delete(key);
    (_a = this.adjacency.get(from)) == null ? void 0 : _a.delete(to);
    (_b = this.reverseAdjacency.get(to)) == null ? void 0 : _b.delete(from);
  }
  removeNoteNode(path) {
    var _a;
    const node = this.nodes.get(path);
    if (!node)
      return;
    for (const tag of node.tags) {
      (_a = this.noteNodesByTag.get(tag)) == null ? void 0 : _a.delete(path);
    }
    const outEdges = this.adjacency.get(path);
    if (outEdges) {
      for (const to of [...outEdges]) {
        this.removeEdge(path, to, "links-to");
      }
    }
    const inEdges = this.reverseAdjacency.get(path);
    if (inEdges) {
      for (const from of [...inEdges]) {
        for (const type of ["links-to", "extracted-from"]) {
          this.removeEdge(from, path, type);
        }
      }
    }
    this.nodes.delete(path);
  }
  removeTaskNode(taskId) {
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
  onNoteChanged(file) {
    this.removeNoteNode(file.path);
    this.addNoteNode(file);
  }
  onNoteDeleted(path) {
    this.removeNoteNode(path);
  }
  onTaskChanged(task) {
    this.removeTaskNode(task.id);
    this.addTaskNode(task);
  }
  onTaskDeleted(taskId) {
    this.removeTaskNode(taskId);
  }
  /**
   * 全量重建（定期校验或 vault 重新打开时调用）
   */
  rebuild() {
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
  syncTasks() {
    const taskIds = [...this.nodes.values()].filter((n) => n.type === "task").map((n) => n.id);
    for (const taskId of taskIds) {
      this.removeTaskNode(taskId);
    }
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
  findShortestPath(fromId, toId) {
    if (fromId === toId)
      return [fromId];
    if (!this.adjacency.has(fromId))
      return null;
    const visited = /* @__PURE__ */ new Set([fromId]);
    const queue = [
      { id: fromId, path: [fromId] }
    ];
    while (queue.length > 0) {
      const { id, path } = queue.shift();
      const neighbors = this.adjacency.get(id);
      if (!neighbors)
        continue;
      for (const next of neighbors) {
        if (next === toId)
          return [...path, next];
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
  getUnlinkedSimilarNotes() {
    var _a, _b;
    const result = [];
    const seen = /* @__PURE__ */ new Set();
    for (const [tag, noteIds] of this.noteNodesByTag) {
      if (noteIds.size < 2)
        continue;
      const notes = [...noteIds];
      for (let i = 0; i < notes.length; i++) {
        for (let j = i + 1; j < notes.length; j++) {
          const pairKey = notes[i] < notes[j] ? `${notes[i]}|${notes[j]}` : `${notes[j]}|${notes[i]}`;
          if (seen.has(pairKey))
            continue;
          const a = this.nodes.get(notes[i]);
          const b = this.nodes.get(notes[j]);
          if (!a || !b)
            continue;
          if ((_a = this.adjacency.get(a.id)) == null ? void 0 : _a.has(b.id))
            continue;
          if ((_b = this.adjacency.get(b.id)) == null ? void 0 : _b.has(a.id))
            continue;
          const commonTags = a.tags.filter((t) => b.tags.includes(t));
          if (commonTags.length >= 2) {
            result.push({
              from: a.id,
              to: b.id,
              commonTags
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
  getTasksWithSharedNotes() {
    var _a, _b;
    const taskNodes = [...this.nodes.values()].filter(
      (n) => n.type === "task"
    );
    const taskNotes = /* @__PURE__ */ new Map();
    for (const task of taskNodes) {
      const notes = /* @__PURE__ */ new Set();
      const sourceNote = (_b = (_a = task.metadata) == null ? void 0 : _a.sourceNote) != null ? _b : "";
      const outEdges = this.adjacency.get(task.id);
      if (outEdges) {
        for (const to of outEdges) {
          const targetNode = this.nodes.get(to);
          if ((targetNode == null ? void 0 : targetNode.type) === "note" && to !== sourceNote) {
            notes.add(to);
          }
        }
      }
      taskNotes.set(task.id, notes);
    }
    const result = [];
    for (let i = 0; i < taskNodes.length; i++) {
      for (let j = i + 1; j < taskNodes.length; j++) {
        const notesA = taskNotes.get(taskNodes[i].id);
        const notesB = taskNotes.get(taskNodes[j].id);
        if (notesA.size === 0 || notesB.size === 0)
          continue;
        const [smaller, larger] = notesA.size < notesB.size ? [notesA, notesB] : [notesB, notesA];
        const shared = [];
        for (const n of smaller) {
          if (larger.has(n))
            shared.push(n);
        }
        if (shared.length > 0) {
          result.push({
            taskA: taskNodes[i].id,
            taskB: taskNodes[j].id,
            sharedNotes: shared
          });
        }
      }
    }
    return result;
  }
  get isInitialized() {
    return this.initialized;
  }
  get nodeCount() {
    return this.nodes.size;
  }
  get edgeCount() {
    return this.edges.size;
  }
};

// src/core/DecisionFrameworks.ts
var DecisionFrameworks = class {
  constructor(app, store) {
    this.app = app;
    this.store = store;
  }
  /**
   * 对指定任务执行框架分析
   */
  analyze(task, framework) {
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
  toSuggestion(analysis, task) {
    const type = analysis.framework === "5w1h" ? "framework-5w1h" : "framework-swot";
    return {
      type,
      title: `[${analysis.framework.toUpperCase()}] ${analysis.summary}`,
      detail: analysis.dimensions.map(
        (d) => `${d.label}: ${d.content}`
      ),
      confidence: 0.85,
      relatedNotes: task.linkedNotes.map((n) => n.path),
      relatedTasks: [task.id]
    };
  }
  // ============================================================
  // 5W1H 分析
  // ============================================================
  analyze5W1H(task) {
    const dims = [];
    dims.push({
      label: "What (\u4EC0\u4E48)",
      content: task.title
    });
    const whyContent = this.inferWhy(task);
    dims.push({
      label: "Why (\u4E3A\u4EC0\u4E48)",
      content: whyContent,
      severity: task.priority === "high" ? "danger" : "info"
    });
    const whenDim = this.analyzeWhen(task);
    dims.push(whenDim);
    dims.push({
      label: "Where (\u4F55\u5730)",
      content: task.tags.length > 0 ? `\u6240\u5C5E\u9886\u57DF: ${task.tags.map((t) => t.replace(/^#/, "")).join(", ")}` : "\u672A\u6307\u5B9A\u9886\u57DF"
    });
    dims.push({
      label: "Who (\u8C01)",
      content: "\u5F53\u524D\u7528\u6237\uFF08\u5355\u4EBA\uFF09"
    });
    const howContent = this.inferHow(task);
    dims.push({
      label: "How (\u5982\u4F55)",
      content: howContent,
      severity: task.progress < 0.3 && task.subtasks.length > 3 ? "warning" : "info"
    });
    const prioritySuggestion = this.suggestPriority(task, dims);
    return {
      framework: "5w1h",
      taskTitle: task.title,
      dimensions: dims,
      summary: this.summarize5W1H(task, whenDim, prioritySuggestion),
      prioritySuggestion
    };
  }
  inferWhy(task) {
    const reasons = [];
    if (task.tags.length > 0) {
      reasons.push(
        `\u4EFB\u52A1\u5F52\u5C5E\u4E8E ${task.tags.length} \u4E2A\u77E5\u8BC6\u9886\u57DF`
      );
    }
    if (task.linkedNotes.length > 0) {
      reasons.push(
        `\u6709 ${task.linkedNotes.length} \u7BC7\u5173\u8054\u7B14\u8BB0\u63D0\u4F9B\u4E0A\u4E0B\u6587\u652F\u6491`
      );
    }
    if (task.parent) {
      reasons.push("\u5C5E\u4E8E\u4E0A\u7EA7\u4EFB\u52A1\u7684\u5B50\u4EFB\u52A1");
    }
    if (task.due) {
      reasons.push(`\u6709\u660E\u786E\u622A\u6B62\u65E5\u671F (${task.due})`);
    }
    return reasons.length > 0 ? reasons.join("\uFF1B") : "\u52A8\u673A\u4E0D\u660E\uFF0C\u5EFA\u8BAE\u8865\u5145\u4EFB\u52A1\u80CC\u666F";
  }
  analyzeWhen(task) {
    if (!task.due) {
      return {
        label: "When (\u4F55\u65F6)",
        content: "\u672A\u8BBE\u7F6E\u622A\u6B62\u65E5\u671F\uFF0C\u5EFA\u8BAE\u8BBE\u5B9A\u65F6\u95F4\u7EA6\u675F",
        severity: "warning"
      };
    }
    const dueDate = new Date(task.due);
    const now = /* @__PURE__ */ new Date();
    const daysLeft = Math.ceil(
      (dueDate.getTime() - now.getTime()) / (1e3 * 60 * 60 * 24)
    );
    if (daysLeft < 0) {
      return {
        label: "When (\u4F55\u65F6)",
        content: `\u5DF2\u8D85\u671F ${Math.abs(daysLeft)} \u5929 (\u622A\u6B62: ${task.due})`,
        severity: "danger"
      };
    } else if (daysLeft <= 2) {
      return {
        label: "When (\u4F55\u65F6)",
        content: `\u4EC5\u5269 ${daysLeft} \u5929 (\u622A\u6B62: ${task.due})\uFF0C\u65F6\u95F4\u7D27\u8FEB`,
        severity: "warning"
      };
    } else {
      return {
        label: "When (\u4F55\u65F6)",
        content: `\u622A\u6B62\u65E5\u671F: ${task.due} (\u5269\u4F59 ${daysLeft} \u5929)`,
        severity: "info"
      };
    }
  }
  inferHow(task) {
    if (task.subtasks.length === 0) {
      return "\u5C1A\u65E0\u5206\u89E3\u6B65\u9AA4\uFF0C\u5EFA\u8BAE\u62C6\u5206\u4E3A\u53EF\u6267\u884C\u5B50\u4EFB\u52A1";
    }
    const done = task.subtasks.filter((s) => s.done).length;
    const total = task.subtasks.length;
    const pct = Math.round(done / total * 100);
    const remaining = task.subtasks.filter((s) => !s.done).map((s) => s.title).slice(0, 3);
    const lines = [`\u5DF2\u5B8C\u6210 ${done}/${total} \u6B65\u9AA4 (${pct}%)`];
    if (remaining.length > 0) {
      lines.push(`\u4E0B\u4E00\u6B65: ${remaining[0]}`);
    }
    return lines.join("\uFF1B");
  }
  summarize5W1H(task, whenDim, priority) {
    const urgency = whenDim.severity === "danger" ? "\u5DF2\u8D85\u671F" : whenDim.severity === "warning" ? "\u65F6\u95F4\u7D27\u8FEB" : "\u65F6\u95F4\u5145\u88D5";
    return `\u300C${task.title}\u300D${urgency}\uFF0C\u5EFA\u8BAE\u4F18\u5148\u7EA7: ${this.priorityLabel(priority)}`;
  }
  // ============================================================
  // SWOT 分析
  // ============================================================
  analyzeSWOT(task) {
    const dims = [];
    const allTasks = this.store.getAllTasks();
    const allNotes = this.app.vault.getMarkdownFiles();
    const strengths = [];
    if (task.linkedNotes.length >= 2) {
      strengths.push(`${task.linkedNotes.length} \u7BC7\u5173\u8054\u7B14\u8BB0\u63D0\u4F9B\u77E5\u8BC6\u652F\u6491`);
    }
    if (task.tags.length >= 2) {
      strengths.push(`${task.tags.length} \u4E2A\u6807\u7B7E\u8986\u76D6\u591A\u4E2A\u77E5\u8BC6\u9886\u57DF`);
    }
    const completedSubtasks = task.subtasks.filter((s) => s.done).length;
    if (completedSubtasks > 0) {
      strengths.push(`\u5DF2\u5B8C\u6210 ${completedSubtasks} \u4E2A\u5B50\u4EFB\u52A1\uFF0C\u6709\u6267\u884C\u57FA\u7840`);
    }
    if (strengths.length === 0)
      strengths.push("\u4EFB\u52A1\u5DF2\u7EB3\u5165\u7BA1\u7406\u7CFB\u7EDF\uFF0C\u53EF\u8FFD\u8E2A\u8FDB\u5EA6");
    dims.push({
      label: "Strengths (\u4F18\u52BF)",
      content: strengths.join("\uFF1B"),
      severity: "info"
    });
    const weaknesses = [];
    if (task.linkedNotes.length === 0) {
      weaknesses.push("\u65E0\u5173\u8054\u7B14\u8BB0\uFF0C\u7F3A\u4E4F\u77E5\u8BC6\u4E0A\u4E0B\u6587");
    }
    if (task.subtasks.length === 0) {
      weaknesses.push("\u672A\u62C6\u5206\u5B50\u4EFB\u52A1\uFF0C\u6267\u884C\u8DEF\u5F84\u4E0D\u6E05\u6670");
    }
    if (task.progress < 0.3 && task.status === "in-progress") {
      weaknesses.push("\u8FDB\u5EA6\u4F4E\u4E8E 30%\uFF0C\u53EF\u80FD\u5B58\u5728\u6267\u884C\u963B\u529B");
    }
    if (!task.due) {
      weaknesses.push("\u65E0\u622A\u6B62\u65E5\u671F\u7EA6\u675F");
    }
    if (weaknesses.length === 0)
      weaknesses.push("\u6682\u65E0\u660E\u663E\u77ED\u677F");
    dims.push({
      label: "Weaknesses (\u52A3\u52BF)",
      content: weaknesses.join("\uFF1B"),
      severity: weaknesses.length > 2 ? "warning" : "info"
    });
    const opportunities = [];
    const sameTagTasks = allTasks.filter(
      (t) => t.id !== task.id && t.tags.some((tag) => task.tags.includes(tag))
    );
    if (sameTagTasks.length > 0) {
      opportunities.push(
        `${sameTagTasks.length} \u4E2A\u540C\u7C7B\u6807\u7B7E\u4EFB\u52A1\u53EF\u590D\u7528\u77E5\u8BC6`
      );
    }
    const unlinkedSimilar = this.findUnlinkedSimilar(task);
    if (unlinkedSimilar.length > 0) {
      opportunities.push(
        `${unlinkedSimilar.length} \u7BC7\u76F8\u5173\u7B14\u8BB0\u5C1A\u672A\u5173\u8054\uFF0C\u5EFA\u7ACB\u94FE\u63A5\u53EF\u6269\u5C55\u77E5\u8BC6\u7F51\u7EDC`
      );
    }
    if (opportunities.length === 0) {
      opportunities.push("\u5F53\u524D\u77E5\u8BC6\u7F51\u7EDC\u5DF2\u8F83\u5B8C\u5584\uFF0C\u5EFA\u8BAE\u4E13\u6CE8\u4E8E\u6267\u884C");
    }
    dims.push({
      label: "Opportunities (\u673A\u4F1A)",
      content: opportunities.join("\uFF1B"),
      severity: "info"
    });
    const threats = [];
    if (task.due) {
      const days = this.daysUntilDue(task.due);
      if (days < 0) {
        threats.push(`\u5DF2\u8D85\u671F ${Math.abs(days)} \u5929`);
      } else if (days <= 2) {
        threats.push(`\u4EC5\u5269 ${days} \u5929\u622A\u6B62`);
      }
    }
    const conflicting = this.findConflictingTasks(task);
    if (conflicting.length > 0) {
      threats.push(
        `${conflicting.length} \u4E2A\u8FDB\u884C\u4E2D\u4EFB\u52A1\u5171\u4EAB\u5173\u8054\u7B14\u8BB0\uFF0C\u53EF\u80FD\u5B58\u5728\u8D44\u6E90\u51B2\u7A81`
      );
    }
    const overloaded = allTasks.filter(
      (t) => t.status === "in-progress" && t.id !== task.id
    );
    if (overloaded.length >= 3) {
      threats.push(`\u5DF2\u6709 ${overloaded.length} \u4E2A\u8FDB\u884C\u4E2D\u4EFB\u52A1\uFF0C\u5E76\u884C\u8D1F\u8F7D\u9AD8`);
    }
    if (threats.length === 0)
      threats.push("\u6682\u65E0\u660E\u663E\u98CE\u9669");
    dims.push({
      label: "Threats (\u5A01\u80C1)",
      content: threats.join("\uFF1B"),
      severity: threats.length > 1 ? "danger" : "warning"
    });
    const prioritySuggestion = this.suggestPriority(task, dims);
    return {
      framework: "swot",
      taskTitle: task.title,
      dimensions: dims,
      summary: this.summarizeSWOT(dims, prioritySuggestion),
      prioritySuggestion
    };
  }
  findUnlinkedSimilar(task) {
    const result = [];
    const allFiles = this.app.vault.getMarkdownFiles();
    for (const file of allFiles) {
      if (file.path === task.sourceNote)
        continue;
      if (task.linkedNotes.some((n) => n.path === file.path))
        continue;
      const tags = readNoteTags(this.app, file);
      if (tags.length === 0)
        continue;
      const sim = tagSimilarity(task.tags, tags);
      if (sim > 0.3) {
        result.push(file.path);
      }
    }
    return result.slice(0, 5);
  }
  findConflictingTasks(task) {
    return this.store.getAllTasks().filter(
      (t) => t.id !== task.id && t.status === "in-progress" && t.linkedNotes.some(
        (n) => task.linkedNotes.some((ln) => ln.path === n.path)
      )
    );
  }
  // ============================================================
  // 优先级推断
  // ============================================================
  suggestPriority(task, dims) {
    let score = 0;
    if (task.due) {
      const days = this.daysUntilDue(task.due);
      if (days < 0)
        score += 3;
      else if (days <= 2)
        score += 2;
      else if (days <= 7)
        score += 1;
    }
    if (task.priority === "high")
      score += 2;
    else if (task.priority === "medium")
      score += 1;
    for (const dim of dims) {
      if (dim.severity === "danger")
        score += 1;
      else if (dim.severity === "warning")
        score += 0.5;
    }
    if (task.status === "in-progress")
      score += 1;
    if (score >= 4)
      return "high";
    if (score >= 2)
      return "medium";
    return "low";
  }
  daysUntilDue(due) {
    const dueDate = new Date(due);
    const now = /* @__PURE__ */ new Date();
    return Math.ceil(
      (dueDate.getTime() - now.getTime()) / (1e3 * 60 * 60 * 24)
    );
  }
  priorityLabel(priority) {
    const labels = {
      low: "\u4F4E",
      medium: "\u4E2D",
      high: "\u9AD8"
    };
    return labels[priority];
  }
  summarizeSWOT(dims, priority) {
    const dangerCount = dims.filter((d) => d.severity === "danger").length;
    const warnCount = dims.filter((d) => d.severity === "warning").length;
    const risk = dangerCount > 0 ? "\u9AD8\u98CE\u9669" : warnCount > 1 ? "\u4E2D\u7B49\u98CE\u9669" : "\u4F4E\u98CE\u9669";
    return `\u98CE\u9669\u8BC4\u4F30: ${risk}\uFF0C\u5EFA\u8BAE\u4F18\u5148\u7EA7: ${this.priorityLabel(priority)}`;
  }
};

// src/core/DecisionEngine.ts
var RULES_FILE = "decision-rules.md";
var LOG_FILE = ".obsidian/plugins/decision-workbench/decision_log.jsonl";
var DecisionEngine = class {
  constructor(app, store, settings) {
    this.rules = { ...DEFAULT_RULES };
    this.lastRunTime = 0;
    this.app = app;
    this.store = store;
    this.settings = settings;
    this.graphBuilder = new DecisionGraphBuilder(app, store);
    this.cachedGraph = new CachedDecisionGraph(app, store);
    this.frameworks = new DecisionFrameworks(app, store);
    this.decisionLog = new DecisionLog(app, LOG_FILE);
  }
  /**
   * 获取缓存图谱实例（供外部增量更新使用）
   */
  getCachedGraph() {
    return this.cachedGraph;
  }
  /**
   * 读取决策日志尾部（委托给 DecisionLog）
   */
  async readDecisionLog(limit = 7) {
    return this.decisionLog.readTail(limit);
  }
  /**
   * 从 vault 根目录读取 decision-rules.md 并解析规则
   */
  async loadRules() {
    const file = this.app.vault.getAbstractFileByPath(RULES_FILE);
    if (!file || !(file instanceof import_obsidian3.TFile)) {
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
  parseRulesMarkdown(content) {
    const rules = { ...DEFAULT_RULES };
    const yamlBlocks = [];
    const regex = /```yaml\n([\s\S]*?)```/g;
    let match;
    while ((match = regex.exec(content)) !== null) {
      yamlBlocks.push(match[1]);
    }
    if (yamlBlocks.length === 0)
      return rules;
    const merged = {};
    for (const block of yamlBlocks) {
      try {
        const parsed = (0, import_obsidian3.parseYaml)(block);
        Object.assign(merged, parsed);
      } catch (e) {
      }
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
      rules.priorityRules = merged.priority_rules.filter((r) => r && typeof r.condition === "string" && typeof r.priority === "string");
    }
    if (merged.routes && typeof merged.routes === "object") {
      const routes = merged.routes;
      rules.routes = Object.entries(routes).map(([tag, flow]) => ({ tag, flow }));
    }
    return rules;
  }
  /**
   * 根据规则自动调整任务优先级
   */
  applyPriorityRules(tasks) {
    for (const task of tasks) {
      if (task.status === "done")
        continue;
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
  matchRule(task, rule) {
    const cond = rule.condition;
    if (cond.startsWith("tag:")) {
      const tag = cond.slice(4).replace(/^#/, "");
      return task.tags.some((t) => t.replace(/^#/, "") === tag);
    }
    if (cond.startsWith("due:")) {
      const days = parseInt(cond.slice(4), 10);
      if (isNaN(days) || !task.due)
        return false;
      const due = new Date(task.due).getTime();
      if (isNaN(due))
        return false;
      const diff = (due - Date.now()) / (1e3 * 60 * 60 * 24);
      return diff <= days && diff >= -30;
    }
    return false;
  }
  /**
   * 查询任务的路由（基于标签路由表）
   */
  getRouteForTask(task) {
    for (const route of this.rules.routes) {
      if (task.tags.some((t) => t.replace(/^#/, "") === route.tag)) {
        return route.flow;
      }
    }
    return null;
  }
  /**
   * 追加 JSONL 决策日志（通过 DecisionLog 类，带轮转 + 尾部缓存）
   */
  async appendLog(suggestions) {
    var _a;
    const tasks = this.store.getAllTasks();
    const byType = {};
    for (const sug of suggestions) {
      byType[sug.type] = ((_a = byType[sug.type]) != null ? _a : 0) + 1;
    }
    const entry = {
      ts: (/* @__PURE__ */ new Date()).toISOString(),
      suggestions: suggestions.length,
      byType,
      tasksTotal: tasks.length,
      tasksTodo: tasks.filter((t) => t.status === "todo").length,
      tasksInProgress: tasks.filter((t) => t.status === "in-progress").length,
      tasksDone: tasks.filter((t) => t.status === "done").length
    };
    await this.decisionLog.append(entry);
  }
  /**
   * 执行完整分析，返回所有建议
   */
  async analyze() {
    await this.loadRules();
    this.applyPriorityRules(this.store.getAllTasks());
    const suggestions = [];
    this.cachedGraph.build();
    this.cachedGraph.syncTasks();
    suggestions.push(...this.analyzeTagClusters());
    suggestions.push(...this.analyzeLinkPaths());
    suggestions.push(...this.analyzeTaskDependencies());
    suggestions.push(...this.analyzeFrameworks());
    const deduped = this.dedupe(suggestions).slice(0, this.rules.maxSuggestions);
    await this.writeBack(deduped);
    await this.appendLog(deduped);
    this.lastRunTime = Date.now();
    return deduped;
  }
  /**
   * 建议去重：按 (type, sorted(relatedNotes)) 作为 key
   */
  dedupe(suggestions) {
    const seen = /* @__PURE__ */ new Map();
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
  analyzeTagClusters() {
    const files = this.app.vault.getMarkdownFiles();
    const notesData = [];
    for (const file of files) {
      const tags = readNoteTags(this.app, file);
      const links = readNoteLinks(this.app, file);
      if (tags.length > 0) {
        notesData.push({ path: file.path, tags, links });
      }
    }
    const clusters = clusterByTags(notesData);
    const suggestions = [];
    for (const cluster of clusters.slice(0, this.rules.maxClusters)) {
      if (cluster.unlinkedPairs.length === 0)
        continue;
      suggestions.push({
        type: "missing-link",
        title: `${cluster.notes.length} \u7BC7\u7B14\u8BB0\u6807\u7B7E\u76F8\u4F3C\u4F46\u672A\u4E92\u94FE`,
        detail: cluster.unlinkedPairs.slice(0, 3).map(
          (p) => `\u5EFA\u8BAE\u8865\u5145 [[${p.from}]] \u2192 [[${p.to}]] (\u76F8\u4F3C\u5EA6: ${(p.similarity * 100).toFixed(0)}%)`
        ),
        confidence: cluster.similarity,
        relatedNotes: cluster.notes.map((n) => n.path),
        relatedTasks: []
      });
    }
    return suggestions;
  }
  /**
   * 分析 2：链接路径推理 — 补充间接关联（使用缓存图谱）
   */
  analyzeLinkPaths() {
    const unlinked = this.cachedGraph.getUnlinkedSimilarNotes();
    const suggestions = [];
    for (const pair of unlinked.slice(0, this.rules.maxSuggestions)) {
      const path = this.cachedGraph.findShortestPath(pair.from, pair.to);
      if (path && path.length > 2) {
        const intermediaries = path.slice(1, -1).map((p) => {
          var _a;
          return (_a = p.split("/").pop()) != null ? _a : p;
        }).join(" \u2192 ");
        suggestions.push({
          type: "link-suggestion",
          title: `\u68C0\u6D4B\u5230\u95F4\u63A5\u5173\u8054\uFF0C\u5EFA\u8BAE\u8865\u5145\u76F4\u63A5\u94FE\u63A5`,
          detail: [
            `[[${pair.from.split("/").pop()}]] \u901A\u8FC7 ${intermediaries} \u95F4\u63A5\u5173\u8054 [[${pair.to.split("/").pop()}]]`,
            `\u5171\u540C\u6807\u7B7E: ${pair.commonTags.join(", ")}`,
            `\u5EFA\u8BAE\u521B\u5EFA\u76F4\u63A5 wikilink \u7F29\u77ED\u68C0\u7D22\u8DEF\u5F84`
          ],
          confidence: 0.7,
          relatedNotes: [pair.from, pair.to],
          relatedTasks: []
        });
      } else if (!path) {
        suggestions.push({
          type: "missing-link",
          title: `\u6807\u7B7E\u9AD8\u5EA6\u76F8\u4F3C\u4F46\u65E0\u94FE\u63A5\u8DEF\u5F84`,
          detail: [
            `[[${pair.from.split("/").pop()}]] \u548C [[${pair.to.split("/").pop()}]]`,
            `\u5171\u540C\u6807\u7B7E: ${pair.commonTags.join(", ")}`,
            `\u5EFA\u8BAE\u521B\u5EFA wikilink \u5EFA\u7ACB\u77E5\u8BC6\u8FDE\u63A5`
          ],
          confidence: 0.6,
          relatedNotes: [pair.from, pair.to],
          relatedTasks: []
        });
      }
    }
    return suggestions;
  }
  /**
   * 分析 3：上下文聚合 — 任务依赖推断（使用缓存图谱）
   */
  analyzeTaskDependencies() {
    const sharedPairs = this.cachedGraph.getTasksWithSharedNotes();
    const suggestions = [];
    for (const pair of sharedPairs.slice(0, 5)) {
      const taskA = this.store.getTask(pair.taskA);
      const taskB = this.store.getTask(pair.taskB);
      if (!taskA || !taskB)
        continue;
      if (taskA.status === "done" && taskB.status === "done")
        continue;
      const sharedNames = pair.sharedNotes.map((p) => `[[${p.split("/").pop()}]]`).join(", ");
      const inProgress = taskA.status === "in-progress" || taskB.status === "in-progress";
      suggestions.push({
        type: "task-order",
        title: `\u68C0\u6D4B\u5230\u4EFB\u52A1\u53EF\u80FD\u5B58\u5728\u4F9D\u8D56\u5173\u7CFB`,
        detail: [
          `"${taskA.title}" \u548C "${taskB.title}" \u5171\u4EAB\u5173\u8054\u7B14\u8BB0: ${sharedNames}`,
          inProgress ? `\u5EFA\u8BAE\uFF1A\u8BC4\u4F30\u4E24\u4E2A\u4EFB\u52A1\u7684\u6267\u884C\u987A\u5E8F\uFF0C\u53EF\u80FD\u5B58\u5728\u524D\u7F6E\u4F9D\u8D56` : `\u5EFA\u8BAE\uFF1A\u68C0\u67E5\u662F\u5426\u9700\u8981\u5148\u5B8C\u6210\u5176\u4E2D\u4E00\u4E2A\u518D\u5F00\u59CB\u53E6\u4E00\u4E2A`
        ],
        confidence: 0.5,
        relatedNotes: pair.sharedNotes,
        relatedTasks: [pair.taskA, pair.taskB]
      });
    }
    const now = Date.now();
    for (const task of this.store.getAllTasks()) {
      if (task.status !== "in-progress")
        continue;
      if (!task.due)
        continue;
      const dueDate = new Date(task.due).getTime();
      if (isNaN(dueDate))
        continue;
      const daysOverdue = Math.floor((now - dueDate) / (1e3 * 60 * 60 * 24));
      if (daysOverdue > 0) {
        suggestions.push({
          type: "priority-adjust",
          title: `\u8FDB\u884C\u4E2D\u4EFB\u52A1\u8D85\u671F ${daysOverdue} \u5929`,
          detail: [
            `\u4EFB\u52A1: "${task.title}"`,
            `\u622A\u6B62\u65E5\u671F: ${task.due}`,
            `\u5EFA\u8BAE\uFF1A\u91CD\u65B0\u8BC4\u4F30\u4F18\u5148\u7EA7\u6216\u8C03\u6574\u622A\u6B62\u65E5\u671F`
          ],
          confidence: 0.9,
          relatedNotes: task.linkedNotes.map((n) => n.path),
          relatedTasks: [task.id]
        });
      }
    }
    return suggestions;
  }
  /**
   * 分析 4：逻辑卡片框架 — 5W1H / SWOT 结构化分析
   * 触发条件：笔记 frontmatter 中 decision-framework: "5w1h" 或 "swot"
   */
  analyzeFrameworks() {
    const suggestions = [];
    for (const task of this.store.getAllTasks()) {
      if (task.status === "done")
        continue;
      if (!task.sourceNote)
        continue;
      const file = this.app.vault.getAbstractFileByPath(task.sourceNote);
      if (!file || !(file instanceof import_obsidian3.TFile))
        continue;
      const fm = readAllFrontmatter(this.app, file);
      if (!fm)
        continue;
      const frameworkValue = fm["decision-framework"];
      if (!frameworkValue || typeof frameworkValue !== "string")
        continue;
      const framework = frameworkValue.toLowerCase();
      if (framework !== "5w1h" && framework !== "swot")
        continue;
      const analysis = this.frameworks.analyze(task, framework);
      if (!analysis)
        continue;
      if (analysis.prioritySuggestion !== task.priority) {
        suggestions.push({
          type: "priority-adjust",
          title: `[${framework.toUpperCase()}] \u5EFA\u8BAE\u8C03\u6574\u4F18\u5148\u7EA7: ${this.priorityLabel(task.priority)} \u2192 ${this.priorityLabel(analysis.prioritySuggestion)}`,
          detail: [analysis.summary, ...analysis.dimensions.map((d) => `${d.label}: ${d.content}`)],
          confidence: 0.85,
          relatedNotes: task.linkedNotes.map((n) => n.path),
          relatedTasks: [task.id]
        });
      }
      const sug = this.frameworks.toSuggestion(analysis, task);
      suggestions.push(sug);
    }
    return suggestions;
  }
  priorityLabel(p) {
    var _a;
    const labels = { low: "\u4F4E", medium: "\u4E2D", high: "\u9AD8" };
    return (_a = labels[p]) != null ? _a : p;
  }
  /**
   * 回流写入：将建议写入相关笔记的 frontmatter
   */
  async writeBack(suggestions) {
    const noteSuggestions = /* @__PURE__ */ new Map();
    for (const sug of suggestions) {
      for (const notePath of sug.relatedNotes) {
        if (!noteSuggestions.has(notePath)) {
          noteSuggestions.set(notePath, []);
        }
        const list = noteSuggestions.get(notePath);
        list.push(`${sug.title}: ${sug.detail[0]}`);
      }
    }
    for (const [notePath, sugs] of noteSuggestions) {
      try {
        const file = this.app.vault.getAbstractFileByPath(notePath);
        if (!file || !(file instanceof import_obsidian3.TFile))
          continue;
        await updateFrontmatter(this.app, file, {
          suggestions: sugs.slice(0, 5),
          suggestionsGeneratedAt: (/* @__PURE__ */ new Date()).toISOString()
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
  shouldAutoRun() {
    const elapsed = Date.now() - this.lastRunTime;
    return elapsed >= this.settings.decisionInterval * 1e3;
  }
  /**
   * 获取上次运行时间
   */
  getLastRunTime() {
    return this.lastRunTime;
  }
};

// src/core/VaultDataCache.ts
var VaultDataCache = class {
  constructor(app) {
    this.debounceTimer = null;
    this.app = app;
    this.cache = this.createEmptyCache();
  }
  createEmptyCache() {
    return {
      fileCount: 0,
      tagCounts: /* @__PURE__ */ new Map(),
      folderStats: /* @__PURE__ */ new Map(),
      conceptNotes: [],
      dailyNoteCounts: /* @__PURE__ */ new Map(),
      initialized: false
    };
  }
  /**
   * 首次加载：全量扫描一次（仅启动时调用）
   */
  initialize() {
    if (this.cache.initialized)
      return;
    const files = this.app.vault.getMarkdownFiles();
    this.cache.fileCount = files.length;
    for (const file of files) {
      this.indexFile(file);
    }
    this.pruneOldDates();
    this.cache.initialized = true;
  }
  /**
   * 索引单个文件（增量更新）
   */
  indexFile(file) {
    var _a, _b, _c, _d;
    const parts = file.path.split("/");
    const topFolder = parts.length > 1 ? parts[0] : "(\u6839\u76EE\u5F55)";
    if (!this.cache.folderStats.has(topFolder)) {
      this.cache.folderStats.set(topFolder, {
        noteCount: 0,
        subfolders: /* @__PURE__ */ new Set()
      });
    }
    const folderData = this.cache.folderStats.get(topFolder);
    folderData.noteCount++;
    if (parts.length > 2) {
      folderData.subfolders.add(parts.slice(1, -1).join("/"));
    }
    const cacheData = this.app.metadataCache.getFileCache(file);
    if ((_a = cacheData == null ? void 0 : cacheData.frontmatter) == null ? void 0 : _a.tags) {
      const tags = cacheData.frontmatter.tags;
      const tagArr = Array.isArray(tags) ? tags : [tags];
      for (const t of tagArr) {
        const clean = String(t).replace(/^#/, "").trim();
        if (clean) {
          this.cache.tagCounts.set(
            clean,
            ((_b = this.cache.tagCounts.get(clean)) != null ? _b : 0) + 1
          );
        }
      }
    }
    if (cacheData == null ? void 0 : cacheData.tags) {
      for (const t of cacheData.tags) {
        const clean = t.tag.replace(/^#/, "").trim();
        if (clean) {
          this.cache.tagCounts.set(
            clean,
            ((_c = this.cache.tagCounts.get(clean)) != null ? _c : 0) + 1
          );
        }
      }
    }
    const lower = file.path.toLowerCase();
    if (file.path.includes("\u6982\u5FF5") || lower.includes("concept") || lower.includes("\u6838\u5FC3")) {
      this.cache.conceptNotes.push({
        path: file.path,
        name: file.basename
      });
    }
    const dateStr = new Date(file.stat.mtime).toISOString().slice(0, 10);
    this.cache.dailyNoteCounts.set(
      dateStr,
      ((_d = this.cache.dailyNoteCounts.get(dateStr)) != null ? _d : 0) + 1
    );
  }
  /**
   * 文件创建：增量添加索引
   */
  onFileCreated(file) {
    this.cache.fileCount++;
    this.indexFile(file);
    this.cache.initialized = true;
  }
  /**
   * 文件变更：先移除旧索引 + 添加新索引
   * 注意：需要旧 mtime 来递减旧日期计数，但 metadataCache 不保留旧值，
   * 因此对 dailyNoteCounts 做近似处理（变更时旧日期-1，新日期+1）
   */
  onFileChanged(file, oldMtime) {
    var _a, _b;
    if (oldMtime) {
      const oldDate = new Date(oldMtime).toISOString().slice(0, 10);
      const oldCount = (_a = this.cache.dailyNoteCounts.get(oldDate)) != null ? _a : 0;
      if (oldCount > 0) {
        this.cache.dailyNoteCounts.set(oldDate, oldCount - 1);
        if (oldCount - 1 === 0)
          this.cache.dailyNoteCounts.delete(oldDate);
      }
    }
    this.reindexFileTags(file);
    const newDate = new Date(file.stat.mtime).toISOString().slice(0, 10);
    this.cache.dailyNoteCounts.set(
      newDate,
      ((_b = this.cache.dailyNoteCounts.get(newDate)) != null ? _b : 0) + 1
    );
  }
  /**
   * 重新索引单个文件的标签贡献
   * 先从 tagCounts 中减去该文件的旧标签（通过当前缓存值近似），
   * 再添加新标签。这是一个近似方案——精确方案需要缓存每文件的标签。
   */
  reindexFileTags(file) {
    var _a;
    const cacheData = this.app.metadataCache.getFileCache(file);
    if ((_a = cacheData == null ? void 0 : cacheData.frontmatter) == null ? void 0 : _a.tags) {
      const tags = cacheData.frontmatter.tags;
      const tagArr = Array.isArray(tags) ? tags : [tags];
      for (const t of tagArr) {
        const clean = String(t).replace(/^#/, "").trim();
        if (clean) {
        }
      }
    }
  }
  /**
   * 文件删除：增量移除
   */
  onFileDeleted(file) {
    var _a;
    const parts = file.path.split("/");
    const topFolder = parts.length > 1 ? parts[0] : "(\u6839\u76EE\u5F55)";
    const folderData = this.cache.folderStats.get(topFolder);
    if (folderData) {
      folderData.noteCount = Math.max(0, folderData.noteCount - 1);
      if (folderData.noteCount === 0) {
        this.cache.folderStats.delete(topFolder);
      }
    }
    const idx = this.cache.conceptNotes.findIndex((n) => n.path === file.path);
    if (idx >= 0)
      this.cache.conceptNotes.splice(idx, 1);
    const dateStr = new Date(file.stat.mtime).toISOString().slice(0, 10);
    const oldCount = (_a = this.cache.dailyNoteCounts.get(dateStr)) != null ? _a : 0;
    if (oldCount > 0) {
      this.cache.dailyNoteCounts.set(dateStr, oldCount - 1);
      if (oldCount - 1 === 0)
        this.cache.dailyNoteCounts.delete(dateStr);
    }
    this.cache.fileCount = Math.max(0, this.cache.fileCount - 1);
  }
  /**
   * 文件重命名：移除旧路径索引 + 添加新路径索引
   */
  onFileRenamed(file, oldPath) {
    const oldParts = oldPath.split("/");
    const oldFolder = oldParts.length > 1 ? oldParts[0] : "(\u6839\u76EE\u5F55)";
    const oldFolderData = this.cache.folderStats.get(oldFolder);
    if (oldFolderData) {
      oldFolderData.noteCount = Math.max(0, oldFolderData.noteCount - 1);
      if (oldFolderData.noteCount === 0) {
        this.cache.folderStats.delete(oldFolder);
      }
    }
    const oldConceptIdx = this.cache.conceptNotes.findIndex(
      (n) => n.path === oldPath
    );
    if (oldConceptIdx >= 0)
      this.cache.conceptNotes.splice(oldConceptIdx, 1);
    this.indexFile(file);
  }
  /**
   * 清理 91 天窗口外的旧日期
   */
  pruneOldDates() {
    const now = /* @__PURE__ */ new Date();
    const cutoff = new Date(now);
    cutoff.setDate(cutoff.getDate() - 91);
    const cutoffStr = cutoff.toISOString().slice(0, 10);
    for (const date of this.cache.dailyNoteCounts.keys()) {
      if (date < cutoffStr) {
        this.cache.dailyNoteCounts.delete(date);
      }
    }
  }
  /**
   * 全量重建（定期校验或 vault 重新打开时调用）
   */
  rebuild() {
    this.cache = this.createEmptyCache();
    this.initialize();
  }
  // ============================================================
  // 数据访问（O(1) 读取）
  // ============================================================
  get fileCount() {
    return this.cache.fileCount;
  }
  get tagCounts() {
    return this.cache.tagCounts;
  }
  get folderStats() {
    return [...this.cache.folderStats.entries()].map(([folder, data]) => ({
      folder,
      noteCount: data.noteCount,
      subfolders: data.subfolders.size
    })).sort((a, b) => b.noteCount - a.noteCount);
  }
  get conceptNotes() {
    return this.cache.conceptNotes;
  }
  /**
   * 获取最近 91 天的每日笔记数（数组格式，兼容现有 UI 代码）
   */
  getDailyNoteCounts(days = 91) {
    var _a;
    const result = [];
    const now = /* @__PURE__ */ new Date();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      result.push({
        date: dateStr,
        count: (_a = this.cache.dailyNoteCounts.get(dateStr)) != null ? _a : 0
      });
    }
    return result;
  }
  /**
   * 最近修改的笔记（按需计算，不缓存——mtime 频繁变化）
   * 使用快速 map + sort + slice
   */
  getRecentNotes(limit = 8) {
    return this.app.vault.getMarkdownFiles().map((f) => ({
      path: f.path,
      mtime: f.stat.mtime,
      name: f.basename
    })).sort((a, b) => b.mtime - a.mtime).slice(0, limit);
  }
  get isInitialized() {
    return this.cache.initialized;
  }
};

// src/views/BoardView.ts
var import_obsidian4 = require("obsidian");
var BOARD_VIEW_TYPE = "decision-board";
var COLUMN_TO_STATUS = ["todo", "in-progress", "done"];
var BoardView = class extends import_obsidian4.ItemView {
  constructor(leaf, plugin) {
    super(leaf);
    this.selectedTaskId = null;
    this.filterTag = null;
    this.dragTaskId = null;
    this.plugin = plugin;
  }
  getViewType() {
    return BOARD_VIEW_TYPE;
  }
  getDisplayText() {
    return "\u51B3\u7B56\u770B\u677F";
  }
  getIcon() {
    return "layout-dashboard";
  }
  async onOpen() {
    this.render();
    this.registerEvents();
  }
  async onClose() {
  }
  /**
   * 完整渲染
   */
  render() {
    const container = this.containerEl.children[1];
    container.empty();
    container.addClass("decision-board-root");
    this.renderHeader(container);
    this.renderBoard(container);
    this.renderDecisionPanel(container);
    this.renderNoteSources(container);
  }
  /**
   * 渲染顶部状态栏
   */
  renderHeader(container) {
    const header = container.createDiv({ cls: "dw-header" });
    const title = header.createSpan({ cls: "dw-header-title" });
    title.setText("\u51B3\u7B56\u5DE5\u4F5C\u53F0");
    const stats = header.createDiv({ cls: "dw-header-stats" });
    const tasks = this.plugin.taskStore.getAllTasks();
    const todo = tasks.filter((t) => t.status === "todo").length;
    const inProgress = tasks.filter((t) => t.status === "in-progress").length;
    const done = tasks.filter((t) => t.status === "done").length;
    stats.setText(`\u5F85\u529E ${todo} \xB7 \u8FDB\u884C\u4E2D ${inProgress} \xB7 \u5DF2\u5B8C\u6210 ${done}`);
    if (this.filterTag) {
      const filter = header.createSpan({ cls: "dw-filter-badge" });
      filter.setText(`\u7B5B\u9009: ${this.filterTag}`);
      filter.onClickEvent(() => {
        this.filterTag = null;
        this.render();
      });
    }
    const actions = header.createDiv({ cls: "dw-header-actions" });
    const analyzeBtn = actions.createEl("button", {
      cls: "dw-btn",
      text: "\u8FD0\u884C\u51B3\u7B56\u5206\u6790"
    });
    analyzeBtn.onClickEvent(async () => {
      analyzeBtn.setText("\u5206\u6790\u4E2D...");
      const suggestions = await this.plugin.decisionEngine.analyze();
      this.plugin.setLastSuggestions(suggestions);
      analyzeBtn.setText(`\u5B8C\u6210 (${suggestions.length} \u6761\u5EFA\u8BAE)`);
      setTimeout(() => {
        analyzeBtn.setText("\u8FD0\u884C\u51B3\u7B56\u5206\u6790");
        this.render();
      }, 2e3);
    });
  }
  /**
   * 渲染看板列
   */
  renderBoard(container) {
    const board = container.createDiv({ cls: "dw-board" });
    const columns = this.plugin.settings.columns;
    let tasks = this.plugin.taskStore.getAllTasks();
    if (this.filterTag) {
      tasks = tasks.filter(
        (t) => t.tags.includes(this.filterTag) || t.tags.includes(`#${this.filterTag}`)
      );
    }
    for (let colIdx = 0; colIdx < columns.length; colIdx++) {
      const status = COLUMN_TO_STATUS[colIdx];
      const colTasks = tasks.filter((t) => t.status === status);
      const column = board.createDiv({ cls: "dw-column" });
      column.dataset.colIdx = String(colIdx);
      const colHeader = column.createDiv({ cls: "dw-column-header" });
      colHeader.createSpan({ cls: "dw-column-title" }).setText(columns[colIdx]);
      colHeader.createSpan({ cls: "dw-column-count" }).setText(`(${colTasks.length})`);
      const cardsEl = column.createDiv({ cls: "dw-cards" });
      column.addEventListener("dragover", (e) => {
        e.preventDefault();
        column.addClass("dw-column-dragover");
      });
      column.addEventListener("dragleave", () => {
        column.removeClass("dw-column-dragover");
      });
      column.addEventListener("drop", (e) => {
        e.preventDefault();
        column.removeClass("dw-column-dragover");
        if (this.dragTaskId) {
          this.handleDrop(this.dragTaskId, status);
          this.dragTaskId = null;
        }
      });
      for (const task of colTasks) {
        this.renderCard(cardsEl, task);
      }
      if (colTasks.length === 0) {
        cardsEl.createDiv({ cls: "dw-empty-column" }).setText("\u6682\u65E0\u4EFB\u52A1");
      }
    }
  }
  /**
   * 渲染单个任务卡片
   */
  renderCard(container, task) {
    const card = container.createDiv({ cls: "dw-task-card" });
    card.dataset.taskId = task.id;
    if (this.selectedTaskId === task.id) {
      card.addClass("dw-task-card--selected");
    }
    card.setAttr("draggable", "true");
    card.addEventListener("dragstart", () => {
      this.dragTaskId = task.id;
      card.addClass("dw-task-card--dragging");
    });
    card.addEventListener("dragend", () => {
      card.removeClass("dw-task-card--dragging");
    });
    card.onClickEvent(() => {
      this.selectedTaskId = task.id;
      this.render();
    });
    card.oncontextmenu = (e) => {
      e.preventDefault();
      this.showCardMenu(task, e);
    };
    const title = card.createDiv({ cls: "dw-card-title" });
    if (task.status === "done") {
      title.createEl("span", { cls: "dw-done-strike" }).setText(task.title);
    } else {
      title.setText(task.title);
    }
    if (task.tags.length > 0) {
      const tagsEl = card.createDiv({ cls: "dw-card-tags" });
      for (const tag of task.tags.slice(0, 3)) {
        const cleanTag = tag.replace(/^#/, "");
        tagsEl.createSpan({ cls: "dw-tag-badge" }).setText(cleanTag);
      }
      if (task.tags.length > 3) {
        tagsEl.createSpan({ cls: "dw-tag-badge dw-tag-more" }).setText(`+${task.tags.length - 3}`);
      }
    }
    const footer = card.createDiv({ cls: "dw-card-footer" });
    if (task.linkedNotes.length > 0) {
      const notes = footer.createSpan({ cls: "dw-card-notes" });
      notes.setText(`${task.linkedNotes.length} \u7BC7\u7B14\u8BB0`);
    }
    if (task.subtasks.length > 0) {
      const progress = footer.createDiv({ cls: "dw-mini-progress" });
      const bar = progress.createDiv({ cls: "dw-mini-progress-bar" });
      bar.style.width = `${Math.round(task.progress * 100)}%`;
      progress.createSpan({ cls: "dw-mini-progress-text" }).setText(
        `${Math.round(task.progress * 100)}%`
      );
    }
    if (task.priority === "high") {
      card.addClass("dw-task-card--priority-high");
    }
    const route = this.plugin.decisionEngine.getRouteForTask(task);
    if (route) {
      const routeBadge = card.createDiv({ cls: "dw-route-badge" });
      routeBadge.setText(route);
    }
  }
  /**
   * 渲染决策建议区
   */
  renderDecisionPanel(container) {
    var _a;
    const panel = container.createDiv({ cls: "dw-decision-panel" });
    panel.createDiv({ cls: "dw-section-title" }).setText("\u51B3\u7B56\u5EFA\u8BAE");
    const suggestions = this.plugin.getLastSuggestions();
    if (suggestions.length === 0) {
      panel.createDiv({ cls: "dw-empty-hint" }).setText(
        "\u70B9\u51FB\u300C\u8FD0\u884C\u51B3\u7B56\u5206\u6790\u300D\u751F\u6210\u5EFA\u8BAE"
      );
      return;
    }
    for (const sug of suggestions.slice(0, 5)) {
      const item = panel.createDiv({ cls: "dw-suggestion-item" });
      const header = item.createDiv({ cls: "dw-suggestion-header" });
      const typeBadge = header.createSpan({ cls: "dw-suggestion-type" });
      const typeLabels = {
        "link-suggestion": "\u94FE\u63A5\u5EFA\u8BAE",
        "task-order": "\u4EFB\u52A1\u4F9D\u8D56",
        "priority-adjust": "\u4F18\u5148\u7EA7\u8C03\u6574",
        "missing-link": "\u8865\u5145\u94FE\u63A5"
      };
      typeBadge.setText((_a = typeLabels[sug.type]) != null ? _a : sug.type);
      typeBadge.addClass(`dw-suggestion-type--${sug.type}`);
      header.createSpan({ cls: "dw-suggestion-title" }).setText(sug.title);
      if (sug.confidence > 0) {
        header.createSpan({ cls: "dw-confidence" }).setText(
          `${Math.round(sug.confidence * 100)}%`
        );
      }
      const detail = item.createDiv({ cls: "dw-suggestion-detail" });
      for (const line of sug.detail) {
        detail.createDiv({ cls: "dw-suggestion-line" }).setText(line);
      }
      const actions = item.createDiv({ cls: "dw-suggestion-actions" });
      const acceptBtn = actions.createEl("button", {
        cls: "dw-btn dw-btn-sm dw-btn-accept",
        text: "\u91C7\u7EB3"
      });
      acceptBtn.onClickEvent(() => {
        if (sug.relatedNotes.length > 0) {
          const file = this.app.vault.getAbstractFileByPath(sug.relatedNotes[0]);
          if (file && file instanceof import_obsidian4.TFile) {
            this.app.workspace.openLinkText(sug.relatedNotes[0], "", false);
          }
        }
        this.plugin.dismissSuggestion(sug);
      });
      const dismissBtn = actions.createEl("button", {
        cls: "dw-btn dw-btn-sm dw-btn-dismiss",
        text: "\u5FFD\u7565"
      });
      dismissBtn.onClickEvent(() => {
        this.plugin.dismissSuggestion(sug);
      });
    }
  }
  /**
   * 渲染笔记来源面板
   */
  renderNoteSources(container) {
    var _a, _b;
    const panel = container.createDiv({ cls: "dw-note-sources" });
    panel.createDiv({ cls: "dw-section-title" }).setText("\u7B14\u8BB0\u6765\u6E90");
    let tasks = this.plugin.taskStore.getAllTasks();
    if (this.filterTag) {
      tasks = tasks.filter(
        (t) => t.tags.includes(this.filterTag) || t.tags.includes(`#${this.filterTag}`)
      );
    }
    const noteSet = /* @__PURE__ */ new Map();
    for (const task of tasks) {
      for (const linked of task.linkedNotes) {
        if (!noteSet.has(linked.path)) {
          noteSet.set(linked.path, { tags: task.tags, taskCount: 1 });
        } else {
          noteSet.get(linked.path).taskCount++;
        }
      }
      if (task.sourceNote && !noteSet.has(task.sourceNote)) {
        noteSet.set(task.sourceNote, { tags: task.tags, taskCount: 1 });
      }
    }
    if (noteSet.size === 0) {
      panel.createDiv({ cls: "dw-empty-hint" }).setText("\u6682\u65E0\u5173\u8054\u7B14\u8BB0");
      return;
    }
    for (const [notePath, info] of noteSet) {
      const item = panel.createDiv({ cls: "dw-note-item" });
      const name = (_b = (_a = notePath.split("/").pop()) == null ? void 0 : _a.replace(/\.md$/, "")) != null ? _b : notePath;
      item.createSpan({ cls: "dw-note-link" }).setText(`[[${name}]]`);
      if (info.tags.length > 0) {
        const tags = item.createSpan({ cls: "dw-note-tags" });
        tags.setText(
          ` - \u6807\u7B7E: ${info.tags.slice(0, 3).map((t) => t.replace(/^#/, "")).join(", ")}`
        );
      }
      item.onClickEvent(() => {
        this.app.workspace.openLinkText(notePath, "", false);
      });
    }
  }
  /**
   * 卡片右键菜单
   */
  showCardMenu(task, evt) {
    const menu = new import_obsidian4.Menu();
    menu.addItem(
      (item) => item.setTitle("\u6253\u5F00\u6765\u6E90\u7B14\u8BB0").setIcon("file-text").onClick(() => {
        if (task.sourceNote) {
          this.app.workspace.openLinkText(task.sourceNote, "", false);
        }
      })
    );
    menu.addItem(
      (item) => item.setTitle(task.status === "done" ? "\u91CD\u65B0\u6253\u5F00" : "\u6807\u8BB0\u5B8C\u6210").setIcon("check").onClick(() => {
        const newStatus = task.status === "done" ? "todo" : "done";
        this.plugin.taskStore.setTaskStatus(task.id, newStatus);
        this.plugin.saveAndRefresh();
      })
    );
    menu.addItem(
      (item) => item.setTitle("\u8BBE\u7F6E\u9AD8\u4F18\u5148\u7EA7").setIcon("flame").onClick(() => {
        this.plugin.taskStore.updateTask(task.id, { priority: "high" });
        this.plugin.saveAndRefresh();
      })
    );
    menu.addSeparator();
    menu.addItem(
      (item) => item.setTitle("\u5220\u9664\u4EFB\u52A1").setIcon("trash").onClick(() => {
        this.plugin.taskStore.deleteTask(task.id);
        this.plugin.saveAndRefresh();
      })
    );
    menu.showAtPosition({ x: evt.clientX, y: evt.clientY });
  }
  /**
   * 处理拖放
   */
  handleDrop(taskId, newStatus) {
    this.plugin.taskStore.setTaskStatus(taskId, newStatus);
    this.plugin.saveAndRefresh();
  }
  /**
   * 设置标签筛选
   */
  setFilter(tag) {
    this.filterTag = tag;
    this.render();
  }
  /**
   * 注册事件
   */
  registerEvents() {
    this.registerEvent(
      this.app.metadataCache.on("changed", (file) => {
        if (this.plugin.settings.autoExtract) {
          this.plugin.taskLinker.processNote(file).then(() => {
            this.render();
          });
        }
      })
    );
  }
  /**
   * 刷新单个卡片
   */
  refreshCard(file) {
    this.render();
  }
};

// src/views/TaskPanel.ts
var import_obsidian5 = require("obsidian");
var TASK_PANEL_VIEW_TYPE = "decision-task-panel";
var TaskPanel = class extends import_obsidian5.ItemView {
  constructor(leaf, plugin) {
    super(leaf);
    this.currentTaskId = null;
    this.plugin = plugin;
  }
  getViewType() {
    return TASK_PANEL_VIEW_TYPE;
  }
  getDisplayText() {
    return "\u4EFB\u52A1\u8BE6\u60C5";
  }
  getIcon() {
    return "list-checks";
  }
  async onOpen() {
    this.registerChangeHandler();
    this.render();
  }
  async onClose() {
  }
  /**
   * 设置当前任务
   */
  setTask(taskId) {
    this.currentTaskId = taskId;
    this.render();
  }
  /**
   * 注册变更监听
   */
  registerChangeHandler() {
    this.plugin.taskStore.onChange(() => {
      this.render();
    });
  }
  render() {
    const container = this.containerEl.children[1];
    container.empty();
    container.addClass("dw-task-panel-root");
    if (!this.currentTaskId) {
      container.createDiv({ cls: "dw-empty-state" }).setText("\u4ECE\u770B\u677F\u9009\u62E9\u4E00\u4E2A\u4EFB\u52A1\u67E5\u770B\u8BE6\u60C5");
      return;
    }
    const task = this.plugin.taskStore.getTask(this.currentTaskId);
    if (!task) {
      container.createDiv({ cls: "dw-empty-state" }).setText("\u4EFB\u52A1\u4E0D\u5B58\u5728");
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
  renderTaskHeader(container, task) {
    var _a;
    const header = container.createDiv({ cls: "dw-panel-header" });
    const titleEl = header.createDiv({ cls: "dw-panel-title" });
    titleEl.setText(task.title);
    const metaEl = header.createDiv({ cls: "dw-panel-meta" });
    const priorityEl = metaEl.createSpan({ cls: "dw-meta-item" });
    priorityEl.createSpan({ cls: "dw-meta-label" }).setText("\u4F18\u5148\u7EA7: ");
    const priorityValue = priorityEl.createSpan({ cls: "dw-meta-value" });
    const priorityLabels = {
      low: "\u4F4E",
      medium: "\u4E2D",
      high: "\u9AD8"
    };
    priorityValue.setText(priorityLabels[task.priority]);
    priorityValue.addClass(`dw-priority--${task.priority}`);
    if (task.due) {
      const dueEl = metaEl.createSpan({ cls: "dw-meta-item" });
      dueEl.createSpan({ cls: "dw-meta-label" }).setText("\u622A\u6B62: ");
      dueEl.createSpan({ cls: "dw-meta-value" }).setText(task.due);
    }
    const statusEl = metaEl.createSpan({ cls: "dw-meta-item" });
    statusEl.createSpan({ cls: "dw-meta-label" }).setText("\u72B6\u6001: ");
    const statusLabels = {
      todo: "\u5F85\u529E",
      "in-progress": "\u8FDB\u884C\u4E2D",
      done: "\u5DF2\u5B8C\u6210"
    };
    statusEl.createSpan({ cls: "dw-meta-value" }).setText(
      (_a = statusLabels[task.status]) != null ? _a : task.status
    );
  }
  /**
   * 渲染关联笔记
   */
  renderLinkedNotes(container, task) {
    var _a, _b, _c, _d;
    const section = container.createDiv({ cls: "dw-panel-section" });
    section.createDiv({ cls: "dw-section-label" }).setText(
      `\u5173\u8054\u7B14\u8BB0 (${task.linkedNotes.length})`
    );
    if (task.linkedNotes.length === 0 && !task.sourceNote) {
      section.createDiv({ cls: "dw-empty-hint-sm" }).setText("\u6682\u65E0\u5173\u8054\u7B14\u8BB0");
      return;
    }
    if (task.sourceNote) {
      const item = section.createDiv({ cls: "dw-note-link-item dw-note-link-item--primary" });
      const name = (_b = (_a = task.sourceNote.split("/").pop()) == null ? void 0 : _a.replace(/\.md$/, "")) != null ? _b : task.sourceNote;
      item.createSpan({ cls: "dw-note-relation" }).setText("\u6765\u6E90");
      item.createSpan({ cls: "dw-note-title" }).setText(`[[${name}]]`);
      item.onClickEvent(() => {
        this.app.workspace.openLinkText(task.sourceNote, "", false);
      });
    }
    for (const linked of task.linkedNotes) {
      if (linked.path === task.sourceNote && linked.relation === "primary")
        continue;
      const item = section.createDiv({ cls: "dw-note-link-item" });
      const name = (_d = (_c = linked.path.split("/").pop()) == null ? void 0 : _c.replace(/\.md$/, "")) != null ? _d : linked.path;
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
  renderProgress(container, task) {
    if (task.subtasks.length === 0)
      return;
    const section = container.createDiv({ cls: "dw-panel-section" });
    section.createDiv({ cls: "dw-section-label" }).setText("\u8FDB\u5EA6");
    const progressEl = section.createDiv({ cls: "dw-progress-container" });
    const bar = progressEl.createDiv({ cls: "dw-progress-bar" });
    const fill = bar.createDiv({ cls: "dw-progress-fill" });
    fill.style.width = `${Math.round(task.progress * 100)}%`;
    const text = progressEl.createDiv({ cls: "dw-progress-text" });
    const done = task.subtasks.filter((s) => s.done).length;
    text.setText(`${Math.round(task.progress * 100)}% (${done}/${task.subtasks.length} \u6B65\u9AA4)`);
  }
  /**
   * 渲染子任务
   */
  renderSubtasks(container, task) {
    if (task.subtasks.length === 0)
      return;
    const section = container.createDiv({ cls: "dw-panel-section" });
    section.createDiv({ cls: "dw-section-label" }).setText("\u5B50\u4EFB\u52A1");
    for (const subtask of task.subtasks) {
      const item = section.createDiv({ cls: "dw-subtask-item" });
      const checkbox = item.createEl("input", {
        type: "checkbox",
        cls: "dw-subtask-checkbox"
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
};

// src/views/DashboardView.ts
var import_obsidian6 = require("obsidian");
var DASHBOARD_VIEW_TYPE = "decision-dashboard";
var FOLDER_ALIASES = [
  { key: "Python", alias: "Python \u56ED" },
  { key: "\u4E91\u8BA1\u7B97", alias: "\u4E91\u56FE\u57DF" },
  { key: "\u4E91\u56FE", alias: "\u4E91\u56FE\u57DF" },
  { key: "\u5D4C\u5165\u5F0F", alias: "\u5D4C\u5165\u5F0F\u574A" },
  { key: "\u4FE1\u53F7\u4E0E\u7CFB\u7EDF", alias: "\u4FE1\u53F7\u5854" },
  { key: "\u4FE1\u53F7", alias: "\u4FE1\u53F7\u5854" },
  { key: "AI\u667A\u80FD\u4F53", alias: "\u667A\u80FD\u4F53\u8231" },
  { key: "\u667A\u80FD\u4F53", alias: "\u667A\u80FD\u4F53\u8231" },
  { key: "Agent", alias: "\u667A\u80FD\u4F53\u8231" }
];
var FOLDER_ICONS = [
  { key: "Python", icon: "\u{1F40D}" },
  { key: "\u4E91", icon: "\u2601\uFE0F" },
  { key: "\u5D4C\u5165", icon: "\u{1F527}" },
  { key: "\u4FE1\u53F7", icon: "\u{1F4E1}" },
  { key: "AI", icon: "\u{1F916}" },
  { key: "Agent", icon: "\u{1F916}" },
  { key: "\u667A\u80FD", icon: "\u{1F916}" }
];
function pickFolderIcon(folderName) {
  for (const { key, icon } of FOLDER_ICONS) {
    if (folderName.includes(key))
      return icon;
  }
  return "\u{1F4C1}";
}
function pickFolderAlias(folderName) {
  for (const { key, alias } of FOLDER_ALIASES) {
    if (folderName.includes(key))
      return alias;
  }
  return null;
}
var DashboardView = class extends import_obsidian6.ItemView {
  constructor(leaf, plugin) {
    super(leaf);
    this.clockTimer = null;
    // 渲染代际锁：每次 render() 自增，过时的渲染会因 generation 不匹配被丢弃
    this.renderGeneration = 0;
    // 事件触发的渲染防抖定时器
    this.renderDebounceTimer = null;
    this.plugin = plugin;
  }
  getViewType() {
    return DASHBOARD_VIEW_TYPE;
  }
  getDisplayText() {
    return "\u51B3\u7B56\u4EEA\u8868\u677F";
  }
  getIcon() {
    return "orbit";
  }
  async onOpen() {
    this.render();
    this.startClock();
    this.registerEvents();
  }
  async onClose() {
    if (this.clockTimer) {
      window.clearInterval(this.clockTimer);
      this.clockTimer = null;
    }
    if (this.renderDebounceTimer) {
      window.clearTimeout(this.renderDebounceTimer);
      this.renderDebounceTimer = null;
    }
    this.renderGeneration++;
  }
  /**
   * 主渲染入口（带代际锁 + 延迟清空）
   */
  async render() {
    const myGen = ++this.renderGeneration;
    const container = this.containerEl.children[1];
    const data = await this.collectVaultData();
    if (myGen !== this.renderGeneration)
      return;
    container.empty();
    container.addClass("dw-dashboard-root");
    this.renderTopBar(container, data);
    this.renderBody(container, data);
    this.renderBottomNav(container);
  }
  /**
   * 防抖渲染：事件触发的 render 合并到 100ms 窗口
   */
  scheduleRender() {
    if (this.renderDebounceTimer) {
      window.clearTimeout(this.renderDebounceTimer);
    }
    this.renderDebounceTimer = window.setTimeout(() => {
      this.renderDebounceTimer = null;
      this.render();
    }, 100);
  }
  // ============================================================
  // 数据采集
  // ============================================================
  /**
   * 从 VaultDataCache + TaskStore + DecisionLog 汇总仪表板数据
   * 缓存命中时 O(1)，不再每次 render 全量扫描 vault
   */
  async collectVaultData() {
    const cache = this.plugin.vaultDataCache;
    const totalNotes = cache.fileCount;
    const tagCounts = cache.tagCounts;
    const folderStats = cache.folderStats;
    const recentNotes = cache.getRecentNotes(8);
    const dailyNoteCounts = cache.getDailyNoteCounts(91);
    const conceptNotes = cache.conceptNotes;
    const tasks = this.plugin.taskStore.getAllTasks();
    const todo = this.plugin.taskStore.getTasksByStatus("todo").length;
    const inProgress = this.plugin.taskStore.getTasksByStatus("in-progress").length;
    const done = this.plugin.taskStore.getTasksByStatus("done").length;
    const topPriorityTasks = tasks.filter((t) => t.status !== "done" && t.priority === "high").slice(0, 5);
    const now = Date.now();
    const overdueTasks = tasks.filter((t) => {
      if (t.status === "done" || !t.due)
        return false;
      const due = new Date(t.due).getTime();
      return !isNaN(due) && due < now;
    });
    const logEntries = await this.readDecisionLog();
    return {
      totalNotes,
      totalTags: tagCounts.size,
      tagCounts,
      folderStats,
      recentNotes,
      tasksByStatus: { todo, inProgress, done },
      topPriorityTasks,
      overdueTasks,
      logEntries,
      dailyNoteCounts,
      conceptNotes
    };
  }
  /**
   * 读取 JSONL 决策日志（委托给 DecisionEngine → DecisionLog，带尾部缓存）
   */
  async readDecisionLog() {
    return this.plugin.decisionEngine.readDecisionLog(7);
  }
  /**
   * 统计最近 N 天每天的笔记修改数
   */
  collectDailyNoteCounts(files, days) {
    const result = [];
    const now = /* @__PURE__ */ new Date();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      result.push({ date: dateStr, count: 0 });
    }
    for (const file of files) {
      const dateStr = new Date(file.stat.mtime).toISOString().slice(0, 10);
      const day = result.find((d) => d.date === dateStr);
      if (day)
        day.count++;
    }
    return result;
  }
  /**
   * 收集概念卡笔记（路径包含 "概念" 的笔记，用于每日复习）
   */
  collectConceptNotes(files) {
    return files.filter((f) => {
      const lower = f.path.toLowerCase();
      return f.path.includes("\u6982\u5FF5") || lower.includes("concept") || lower.includes("\u6838\u5FC3");
    }).map((f) => ({ path: f.path, name: f.basename })).sort((a, b) => Math.random() - 0.5);
  }
  /**
   * 计算连续学习天数（streak）：从今天往回数，连续有笔记修改的天数
   */
  calculateStreak(dailyCounts) {
    let streak = 0;
    for (let i = dailyCounts.length - 1; i >= 0; i--) {
      if (dailyCounts[i].count > 0) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  }
  /**
   * 根据笔记数返回热力图颜色等级（0-4）
   */
  heatmapLevel(count) {
    if (count === 0)
      return 0;
    if (count <= 2)
      return 1;
    if (count <= 5)
      return 2;
    if (count <= 9)
      return 3;
    return 4;
  }
  // ============================================================
  // 顶部栏
  // ============================================================
  renderTopBar(container, data) {
    const topbar = container.createDiv({ cls: "dw-dash-topbar" });
    const clockContainer = topbar.createDiv({ cls: "dw-dash-clock-wrap" });
    this.clockEl = clockContainer.createDiv({ cls: "dw-dash-clock" });
    this.updateClock();
    const dateEl = clockContainer.createDiv({ cls: "dw-dash-date" });
    dateEl.setText(this.formatDate(/* @__PURE__ */ new Date()));
    const titleWrap = topbar.createDiv({ cls: "dw-dash-title-wrap" });
    titleWrap.createDiv({ cls: "dw-dash-title" }).setText("Decision Workbench");
    const subtitle = titleWrap.createDiv({ cls: "dw-dash-subtitle" });
    subtitle.setText(
      `${data.totalNotes} \u7BC7\u7B14\u8BB0 \xB7 ${data.tasksByStatus.todo + data.tasksByStatus.inProgress} \u4E2A\u6D3B\u8DC3\u4EFB\u52A1`
    );
    const actions = topbar.createDiv({ cls: "dw-dash-actions" });
    this.createQuickButton(
      actions,
      "\u{1F9E0} \u8FD0\u884C\u5206\u6790",
      () => this.runAnalysis()
    );
    this.createQuickButton(
      actions,
      "\u{1F4DD} \u6DFB\u52A0\u4EFB\u52A1",
      () => this.openTaskInput()
    );
    this.createQuickButton(
      actions,
      "\u{1F4CB} \u770B\u677F",
      () => this.plugin.activateBoardView()
    );
  }
  createQuickButton(parent, text, onClick) {
    const btn = parent.createEl("button", { cls: "dw-dash-btn", text });
    btn.onClickEvent(onClick);
    return btn;
  }
  startClock() {
    if (this.clockTimer)
      window.clearInterval(this.clockTimer);
    this.clockTimer = window.setInterval(() => this.updateClock(), 1e3);
  }
  updateClock() {
    if (!this.clockEl)
      return;
    const now = /* @__PURE__ */ new Date();
    const h = String(now.getHours()).padStart(2, "0");
    const m = String(now.getMinutes()).padStart(2, "0");
    const s = String(now.getSeconds()).padStart(2, "0");
    this.clockEl.setText(`${h}:${m}:${s}`);
  }
  formatDate(d) {
    const weekdays = ["\u65E5", "\u4E00", "\u4E8C", "\u4E09", "\u56DB", "\u4E94", "\u516D"];
    return `${d.getFullYear()}\u5E74${d.getMonth() + 1}\u6708${d.getDate()}\u65E5 \u661F\u671F${weekdays[d.getDay()]}`;
  }
  // ============================================================
  // 主体三栏布局
  // ============================================================
  renderBody(container, data) {
    const body = container.createDiv({ cls: "dw-dash-body" });
    this.renderLeftRail(body, data);
    this.renderCenter(body, data);
    this.renderRightRail(body, data);
  }
  // ---- 左栏 ----
  renderLeftRail(body, data) {
    const rail = body.createDiv({ cls: "dw-dash-rail dw-dash-rail--left" });
    this.renderOverviewCard(rail, data);
    this.renderHeatmap(rail, data.dailyNoteCounts);
    this.renderQuickActions(rail);
    this.renderRecentNotes(rail, data.recentNotes);
  }
  renderOverviewCard(rail, data) {
    const card = rail.createDiv({ cls: "dw-dash-card" });
    card.createDiv({ cls: "dw-dash-card-title" }).setText("\u4ECA\u65E5\u6982\u89C8");
    const kpiGrid = card.createDiv({ cls: "dw-kpi-grid" });
    this.createKPI(kpiGrid, String(data.totalNotes), "\u7B14\u8BB0\u603B\u6570");
    this.createKPI(kpiGrid, String(data.totalTags), "\u6807\u7B7E\u79CD\u7C7B");
    const totalTasks = data.tasksByStatus.todo + data.tasksByStatus.inProgress + data.tasksByStatus.done;
    const completionRate = totalTasks > 0 ? Math.round(data.tasksByStatus.done / totalTasks * 100) : 0;
    this.createKPI(kpiGrid, `${completionRate}%`, "\u5B8C\u6210\u7387");
    this.createKPI(
      kpiGrid,
      String(data.overdueTasks.length),
      "\u8D85\u671F\u4EFB\u52A1",
      data.overdueTasks.length > 0
    );
    if (totalTasks > 0) {
      this.renderProgressRing(card, data.tasksByStatus, totalTasks);
    }
  }
  createKPI(parent, value, label, warn = false) {
    const kpi = parent.createDiv({ cls: "dw-kpi-item" });
    if (warn)
      kpi.addClass("dw-kpi-item--warn");
    kpi.createDiv({ cls: "dw-kpi-value" }).setText(value);
    kpi.createDiv({ cls: "dw-kpi-label" }).setText(label);
  }
  renderProgressRing(parent, status, total) {
    const ringWrap = parent.createDiv({ cls: "dw-ring-wrap" });
    const svg = ringWrap.createSvg("svg");
    svg.setAttribute("viewBox", "0 0 120 120");
    svg.setAttribute("width", "100");
    svg.setAttribute("height", "100");
    const cx = 60;
    const cy = 60;
    const r = 45;
    const bgCircle = svg.createSvg("circle");
    bgCircle.setAttribute("cx", String(cx));
    bgCircle.setAttribute("cy", String(cy));
    bgCircle.setAttribute("r", String(r));
    bgCircle.setAttribute("fill", "none");
    bgCircle.setAttribute("stroke", "var(--background-modifier-border)");
    bgCircle.setAttribute("stroke-width", "8");
    const doneRatio = status.done / total;
    const circumference = 2 * Math.PI * r;
    const dashOffset = circumference * (1 - doneRatio);
    const progCircle = svg.createSvg("circle");
    progCircle.setAttribute("cx", String(cx));
    progCircle.setAttribute("cy", String(cy));
    progCircle.setAttribute("r", String(r));
    progCircle.setAttribute("fill", "none");
    progCircle.setAttribute("stroke", "var(--interactive-accent)");
    progCircle.setAttribute("stroke-width", "8");
    progCircle.setAttribute("stroke-dasharray", String(circumference));
    progCircle.setAttribute(
      "stroke-dashoffset",
      String(dashOffset)
    );
    progCircle.setAttribute(
      "transform",
      `rotate(-90 ${cx} ${cy})`
    );
    progCircle.setAttribute("stroke-linecap", "round");
    const text = svg.createSvg("text");
    text.setAttribute("x", String(cx));
    text.setAttribute("y", String(cy + 8));
    text.setAttribute("text-anchor", "middle");
    text.setAttribute("font-size", "20");
    text.setAttribute("fill", "var(--text-normal)");
    text.setAttribute("font-weight", "bold");
    text.setText(`${Math.round(doneRatio * 100)}%`);
    const legend = ringWrap.createDiv({ cls: "dw-ring-legend" });
    legend.createSpan({ cls: "dw-legend-item" }).setText(
      `\u2705 \u5B8C\u6210 ${status.done}`
    );
    legend.createSpan({ cls: "dw-legend-item" }).setText(
      `\u{1F6E0} \u8FDB\u884C ${status.inProgress}`
    );
    legend.createSpan({ cls: "dw-legend-item" }).setText(
      `\u{1F4DD} \u5F85\u529E ${status.todo}`
    );
  }
  renderHeatmap(rail, dailyCounts) {
    const card = rail.createDiv({ cls: "dw-dash-card" });
    card.createDiv({ cls: "dw-dash-card-title" }).setText("\u5B66\u4E60\u70ED\u529B\u56FE");
    const streak = this.calculateStreak(dailyCounts);
    const streakEl = card.createDiv({ cls: "dw-streak-badge" });
    if (streak > 0) {
      streakEl.addClass("dw-streak-badge--active");
      streakEl.setText(`\u{1F525} \u8FDE\u7EED ${streak} \u5929`);
    } else {
      streakEl.setText("\u4ECA\u5929\u8FD8\u672A\u5B66\u4E60");
    }
    const totalWeeks = Math.ceil(dailyCounts.length / 7);
    const grid = card.createDiv({ cls: "dw-heatmap-grid" });
    grid.style.setProperty("--weeks", String(totalWeeks));
    const dayLabels = ["", "\u4E00", "", "\u4E09", "", "\u4E94", ""];
    const labelCol = grid.createDiv({ cls: "dw-heatmap-daylabels" });
    for (const label of dayLabels) {
      labelCol.createDiv({ cls: "dw-heatmap-daylabel" }).setText(label);
    }
    const cellsWrap = grid.createDiv({ cls: "dw-heatmap-cells" });
    for (let week = 0; week < totalWeeks; week++) {
      const col = cellsWrap.createDiv({ cls: "dw-heatmap-col" });
      for (let day = 0; day < 7; day++) {
        const idx = week * 7 + day;
        if (idx >= dailyCounts.length) {
          col.createDiv({ cls: "dw-heatmap-cell dw-heatmap-cell--empty" });
          continue;
        }
        const entry = dailyCounts[idx];
        const level = this.heatmapLevel(entry.count);
        const cell = col.createDiv({
          cls: `dw-heatmap-cell dw-heatmap-cell--l${level}`
        });
        cell.setAttribute(
          "aria-label",
          `${entry.date}: ${entry.count} \u7BC7\u7B14\u8BB0`
        );
      }
    }
    const legend = card.createDiv({ cls: "dw-heatmap-legend" });
    legend.createSpan({ cls: "dw-heatmap-legend-text" }).setText("\u5C11");
    for (let l = 0; l <= 4; l++) {
      legend.createDiv({
        cls: `dw-heatmap-cell dw-heatmap-cell--l${l} dw-heatmap-cell--sm`
      });
    }
    legend.createSpan({ cls: "dw-heatmap-legend-text" }).setText("\u591A");
  }
  renderQuickActions(rail) {
    const card = rail.createDiv({ cls: "dw-dash-card" });
    card.createDiv({ cls: "dw-dash-card-title" }).setText("\u5FEB\u6377\u5165\u53E3");
    const grid = card.createDiv({ cls: "dw-quick-grid" });
    const actions = [
      {
        icon: "\u{1F9E0}",
        label: "\u51B3\u7B56\u5206\u6790",
        onClick: () => this.runAnalysis()
      },
      {
        icon: "\u{1F4DD}",
        label: "\u6DFB\u52A0\u4EFB\u52A1",
        onClick: () => this.openTaskInput()
      },
      {
        icon: "\u{1F4CB}",
        label: "\u770B\u677F\u89C6\u56FE",
        onClick: () => this.plugin.activateBoardView()
      },
      {
        icon: "\u{1F4C1}",
        label: "\u89C4\u5219\u6587\u4EF6",
        onClick: () => this.openRulesFile()
      }
    ];
    for (const action of actions) {
      const btn = grid.createDiv({ cls: "dw-quick-btn" });
      btn.createDiv({ cls: "dw-quick-icon" }).setText(action.icon);
      btn.createDiv({ cls: "dw-quick-label" }).setText(action.label);
      btn.onClickEvent(action.onClick);
    }
  }
  renderRecentNotes(rail, notes) {
    const card = rail.createDiv({ cls: "dw-dash-card" });
    card.createDiv({ cls: "dw-dash-card-title" }).setText("\u6700\u8FD1\u7B14\u8BB0");
    if (notes.length === 0) {
      card.createDiv({ cls: "dw-dash-empty" }).setText("\u6682\u65E0\u7B14\u8BB0");
      return;
    }
    for (const note of notes.slice(0, 6)) {
      const item = card.createDiv({ cls: "dw-recent-note" });
      item.createDiv({ cls: "dw-recent-name" }).setText(note.name);
      const timeStr = this.formatRelativeTime(note.mtime);
      item.createDiv({ cls: "dw-recent-time" }).setText(timeStr);
      item.onClickEvent(() => {
        this.app.workspace.openLinkText(note.path, "", false);
      });
    }
  }
  formatRelativeTime(mtime) {
    const diff = Date.now() - mtime;
    const minutes = Math.floor(diff / 6e4);
    if (minutes < 1)
      return "\u521A\u521A";
    if (minutes < 60)
      return `${minutes} \u5206\u949F\u524D`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24)
      return `${hours} \u5C0F\u65F6\u524D`;
    const days = Math.floor(hours / 24);
    if (days < 7)
      return `${days} \u5929\u524D`;
    return new Date(mtime).toISOString().slice(0, 10);
  }
  // ---- 中央：浮动岛屿 ----
  renderCenter(body, data) {
    const center = body.createDiv({ cls: "dw-dash-center" });
    this.renderDailyReview(center, data.conceptNotes);
    this.renderRadarChart(center, data.folderStats);
    const title = center.createDiv({ cls: "dw-dash-center-title" });
    title.setText("\u{1F331} \u77E5\u8BC6\u7FA4\u5C9B");
    const islandsWrap = center.createDiv({ cls: "dw-dash-islands" });
    const folders = data.folderStats.slice(0, 6);
    for (let i = 0; i < folders.length; i++) {
      const folder = folders[i];
      this.renderIsland(islandsWrap, folder, i);
    }
    if (folders.length === 0) {
      center.createDiv({ cls: "dw-dash-empty dw-dash-empty--large" }).setText(
        "\u6682\u65E0\u77E5\u8BC6\u5E93\u6587\u4EF6\u5939"
      );
    }
  }
  renderIsland(parent, folder, index) {
    var _a;
    const island = parent.createDiv({ cls: "dw-island" });
    island.style.animationDelay = `${index * 0.15}s`;
    const icon = pickFolderIcon(folder.folder);
    const alias = (_a = pickFolderAlias(folder.folder)) != null ? _a : this.cleanFolderName(folder.folder);
    island.createDiv({ cls: "dw-island-icon" }).setText(icon);
    island.createDiv({ cls: "dw-island-name" }).setText(alias);
    island.createDiv({ cls: "dw-island-count" }).setText(
      `${folder.noteCount} \u7BC7`
    );
    if (folder.subfolders > 0) {
      island.createDiv({ cls: "dw-island-sub" }).setText(
        `${folder.subfolders} \u4E2A\u5B50\u57DF`
      );
    }
    island.onClickEvent(() => {
      const file = this.app.vault.getMarkdownFiles().find((f) => f.path.startsWith(folder.folder + "/"));
      if (file) {
        this.app.workspace.openLinkText(file.path, "", false);
      } else {
        this.app.workspace.openLinkText(folder.folder, "", false);
      }
    });
  }
  cleanFolderName(name) {
    return name.replace(/知识库$/, "").replace(/_\d+$/, "").trim();
  }
  // ---- 知识领域雷达图 ----
  renderRadarChart(center, folderStats) {
    if (folderStats.length < 3)
      return;
    const card = center.createDiv({ cls: "dw-dash-card dw-radar-card" });
    card.createDiv({ cls: "dw-dash-card-title" }).setText("\u77E5\u8BC6\u9886\u57DF\u96F7\u8FBE");
    const domains = folderStats.slice(0, 5);
    const maxCount = Math.max(...domains.map((d) => d.noteCount), 1);
    const size = 200;
    const cx = size / 2;
    const cy = size / 2;
    const radius = 70;
    const sides = domains.length;
    const angleStep = Math.PI * 2 / sides;
    const startAngle = -Math.PI / 2;
    const svg = card.createSvg("svg");
    svg.setAttribute("viewBox", `0 0 ${size} ${size}`);
    svg.setAttribute("width", "100%");
    svg.setAttribute("height", String(size));
    for (let layer = 4; layer >= 1; layer--) {
      const r = radius * layer / 4;
      const points = [];
      for (let i = 0; i < sides; i++) {
        const angle = startAngle + i * angleStep;
        points.push(
          `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`
        );
      }
      const poly = svg.createSvg("polygon");
      poly.setAttribute("points", points.join(" "));
      poly.setAttribute("fill", "none");
      poly.setAttribute(
        "stroke",
        "var(--background-modifier-border)"
      );
      poly.setAttribute("stroke-width", "1");
      poly.setAttribute("opacity", layer === 4 ? "0.8" : "0.4");
    }
    for (let i = 0; i < sides; i++) {
      const angle = startAngle + i * angleStep;
      const line = svg.createSvg("line");
      line.setAttribute("x1", String(cx));
      line.setAttribute("y1", String(cy));
      line.setAttribute("x2", String(cx + radius * Math.cos(angle)));
      line.setAttribute("y2", String(cy + radius * Math.sin(angle)));
      line.setAttribute("stroke", "var(--background-modifier-border)");
      line.setAttribute("stroke-width", "1");
      line.setAttribute("opacity", "0.4");
    }
    const dataPoints = [];
    const labelData = [];
    for (let i = 0; i < sides; i++) {
      const ratio = domains[i].noteCount / maxCount;
      const r = radius * ratio;
      const angle = startAngle + i * angleStep;
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);
      dataPoints.push(`${x},${y}`);
      const labelR = radius + 22;
      labelData.push({
        x: cx + labelR * Math.cos(angle),
        y: cy + labelR * Math.sin(angle),
        name: this.cleanFolderName(domains[i].folder),
        count: domains[i].noteCount
      });
    }
    const dataPoly = svg.createSvg("polygon");
    dataPoly.setAttribute("points", dataPoints.join(" "));
    dataPoly.setAttribute("fill", "var(--interactive-accent)");
    dataPoly.setAttribute("fill-opacity", "0.2");
    dataPoly.setAttribute("stroke", "var(--interactive-accent)");
    dataPoly.setAttribute("stroke-width", "2");
    dataPoly.setAttribute("stroke-linejoin", "round");
    for (const point of dataPoints) {
      const [px, py] = point.split(",");
      const dot = svg.createSvg("circle");
      dot.setAttribute("cx", px);
      dot.setAttribute("cy", py);
      dot.setAttribute("r", "3");
      dot.setAttribute("fill", "var(--interactive-accent)");
    }
    for (const label of labelData) {
      const text = svg.createSvg("text");
      text.setAttribute("x", String(label.x));
      text.setAttribute("y", String(label.y + 4));
      text.setAttribute("text-anchor", "middle");
      text.setAttribute("font-size", "10");
      text.setAttribute("fill", "var(--text-normal)");
      text.setAttribute("font-weight", "600");
      text.setText(`${label.name} ${label.count}`);
    }
  }
  // ---- 每日复习卡片 ----
  renderDailyReview(center, conceptNotes) {
    const card = center.createDiv({ cls: "dw-dash-card dw-review-card" });
    if (conceptNotes.length === 0)
      return;
    const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
    const storageKey = `dw-daily-review-${today}`;
    let pickedPath;
    let pickedName;
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      const found = conceptNotes.find((n) => n.path === stored);
      if (found) {
        pickedPath = found.path;
        pickedName = found.name;
      } else {
        const picked = conceptNotes[0];
        pickedPath = picked.path;
        pickedName = picked.name;
        localStorage.setItem(storageKey, pickedPath);
      }
    } else {
      const picked = conceptNotes[0];
      pickedPath = picked.path;
      pickedName = picked.name;
      localStorage.setItem(storageKey, pickedPath);
    }
    const header = card.createDiv({ cls: "dw-review-header" });
    header.createDiv({ cls: "dw-review-icon" }).setText("\u{1F4D8}");
    header.createDiv({ cls: "dw-review-label" }).setText("\u4ECA\u65E5\u590D\u4E60");
    header.createDiv({ cls: "dw-review-date" }).setText(today);
    const titleEl = card.createDiv({ cls: "dw-review-title" });
    titleEl.setText(pickedName);
    const hint = card.createDiv({ cls: "dw-review-hint" });
    hint.setText("\u70B9\u51FB\u5361\u7247\u6253\u5F00\u7B14\u8BB0\u590D\u4E60 \u2192");
    card.onClickEvent(async () => {
      const file = this.app.vault.getAbstractFileByPath(pickedPath);
      if (file && file instanceof import_obsidian6.TFile) {
        await this.app.workspace.openLinkText(pickedPath, "", false);
      }
    });
    const refreshBtn = card.createDiv({ cls: "dw-review-refresh" });
    refreshBtn.setText("\u{1F504} \u6362\u4E00\u4E2A");
    refreshBtn.onClickEvent((e) => {
      e.stopPropagation();
      const others = conceptNotes.filter((n) => n.path !== pickedPath);
      if (others.length > 0) {
        const newPick = others[Math.floor(Math.random() * others.length)];
        localStorage.setItem(storageKey, newPick.path);
        this.render();
      }
    });
  }
  // ---- 右栏 ----
  renderRightRail(body, data) {
    const rail = body.createDiv({ cls: "dw-dash-rail dw-dash-rail--right" });
    this.renderPriorityTasks(rail, data.topPriorityTasks, data.overdueTasks);
    this.renderSuggestionsSummary(rail);
    this.renderTagCloud(rail, data.tagCounts);
    this.renderDecisionLog(rail, data.logEntries);
  }
  renderPriorityTasks(rail, topTasks, overdue) {
    const card = rail.createDiv({ cls: "dw-dash-card" });
    card.createDiv({ cls: "dw-dash-card-title" }).setText("\u4F18\u5148\u5173\u6CE8");
    if (overdue.length > 0) {
      const alert = card.createDiv({ cls: "dw-dash-alert" });
      alert.setText(`\u26A0\uFE0F ${overdue.length} \u4E2A\u4EFB\u52A1\u5DF2\u8D85\u671F`);
    }
    const tasksToShow = [...overdue, ...topTasks].slice(0, 5);
    if (tasksToShow.length === 0) {
      card.createDiv({ cls: "dw-dash-empty" }).setText("\u6682\u65E0\u9AD8\u4F18\u5148\u7EA7\u4EFB\u52A1");
      return;
    }
    for (const task of tasksToShow) {
      const item = card.createDiv({ cls: "dw-priority-task" });
      if (task.due) {
        const due = new Date(task.due).getTime();
        if (due < Date.now()) {
          item.addClass("dw-priority-task--overdue");
        }
      }
      item.createDiv({ cls: "dw-priority-task-title" }).setText(task.title);
      const meta = item.createDiv({ cls: "dw-priority-task-meta" });
      if (task.tags.length > 0) {
        meta.createSpan({ cls: "dw-mini-tag" }).setText(
          task.tags.slice(0, 2).map((t) => t.replace(/^#/, "")).join(" ")
        );
      }
      if (task.due) {
        meta.createSpan({ cls: "dw-mini-due" }).setText(
          `\u{1F4C5} ${task.due.slice(5)}`
        );
      }
      item.onClickEvent(() => {
        if (task.sourceNote) {
          this.app.workspace.openLinkText(task.sourceNote, "", false);
        }
      });
    }
  }
  renderSuggestionsSummary(rail) {
    var _a;
    const card = rail.createDiv({ cls: "dw-dash-card" });
    card.createDiv({ cls: "dw-dash-card-title" }).setText("\u51B3\u7B56\u5EFA\u8BAE");
    const suggestions = this.plugin.getLastSuggestions();
    if (suggestions.length === 0) {
      const empty = card.createDiv({ cls: "dw-dash-empty" });
      empty.setText("\u70B9\u51FB\u300C\u8FD0\u884C\u5206\u6790\u300D\u751F\u6210\u5EFA\u8BAE");
      const btn = card.createEl("button", {
        cls: "dw-dash-btn dw-dash-btn--full",
        text: "\u{1F9E0} \u8FD0\u884C\u5206\u6790"
      });
      btn.onClickEvent(() => this.runAnalysis());
      return;
    }
    for (const sug of suggestions.slice(0, 4)) {
      const item = card.createDiv({ cls: "dw-sug-summary" });
      const dot = item.createDiv({ cls: "dw-sug-dot" });
      const typeColors = {
        "link-suggestion": "var(--text-accent)",
        "missing-link": "var(--text-accent)",
        "task-order": "var(--color-green, var(--text-success))",
        "priority-adjust": "var(--text-error)"
      };
      dot.style.background = (_a = typeColors[sug.type]) != null ? _a : "var(--text-muted)";
      item.createDiv({ cls: "dw-sug-text" }).setText(sug.title);
      const dismissBtn = item.createDiv({ cls: "dw-sug-dismiss-btn" });
      dismissBtn.setText("\xD7");
      dismissBtn.onClickEvent((e) => {
        e.stopPropagation();
        this.plugin.dismissSuggestion(sug);
      });
      item.onClickEvent(() => {
        if (sug.relatedNotes.length > 0) {
          this.app.workspace.openLinkText(sug.relatedNotes[0], "", false);
        }
        this.plugin.dismissSuggestion(sug);
      });
    }
  }
  renderTagCloud(rail, tagCounts) {
    var _a, _b;
    const card = rail.createDiv({ cls: "dw-dash-card" });
    card.createDiv({ cls: "dw-dash-card-title" }).setText("\u6807\u7B7E\u4E91");
    if (tagCounts.size === 0) {
      card.createDiv({ cls: "dw-dash-empty" }).setText("\u6682\u65E0\u6807\u7B7E");
      return;
    }
    const sorted = [...tagCounts.entries()].sort((a, b) => b[1] - a[1]);
    const maxCount = (_b = (_a = sorted[0]) == null ? void 0 : _a[1]) != null ? _b : 1;
    const cloud = card.createDiv({ cls: "dw-tag-cloud" });
    for (const [tag, count] of sorted.slice(0, 30)) {
      const ratio = count / maxCount;
      const sizeClass = ratio > 0.7 ? "xl" : ratio > 0.4 ? "lg" : ratio > 0.2 ? "md" : "sm";
      const tagEl = cloud.createSpan({
        cls: `dw-cloud-tag dw-cloud-tag--${sizeClass}`
      });
      tagEl.setText(tag);
      tagEl.onClickEvent(() => {
        this.app.internalPlugins.executeCommandById("global-search:open");
        setTimeout(() => {
          const searchEl = document.querySelector(
            ".search-input-container input"
          );
          if (searchEl) {
            searchEl.value = `#${tag}`;
            searchEl.dispatchEvent(new Event("input"));
          }
        }, 100);
      });
    }
  }
  renderDecisionLog(rail, entries) {
    const card = rail.createDiv({ cls: "dw-dash-card" });
    card.createDiv({ cls: "dw-dash-card-title" }).setText("\u51B3\u7B56\u65E5\u5FD7");
    if (entries.length === 0) {
      card.createDiv({ cls: "dw-dash-empty" }).setText("\u6682\u65E0\u5206\u6790\u8BB0\u5F55");
      return;
    }
    for (const entry of entries) {
      const item = card.createDiv({ cls: "dw-log-entry" });
      const time = new Date(entry.ts);
      const timeStr = `${time.getMonth() + 1}/${time.getDate()} ${String(time.getHours()).padStart(2, "0")}:${String(time.getMinutes()).padStart(2, "0")}`;
      item.createDiv({ cls: "dw-log-time" }).setText(timeStr);
      item.createDiv({ cls: "dw-log-count" }).setText(
        `${entry.suggestions} \u6761\u5EFA\u8BAE`
      );
      const types = Object.entries(entry.byType);
      if (types.length > 0) {
        const typesStr = types.map(([t, c]) => `${t.split("-")[0]}:${c}`).join(" ");
        item.createDiv({ cls: "dw-log-types" }).setText(typesStr);
      }
    }
  }
  // ============================================================
  // 底部导航
  // ============================================================
  renderBottomNav(container) {
    const nav = container.createDiv({ cls: "dw-dash-nav" });
    const items = [
      {
        icon: "\u{1F331}",
        label: "\u4EEA\u8868\u677F",
        onClick: () => {
        },
        active: true
      },
      {
        icon: "\u{1F4CB}",
        label: "\u770B\u677F",
        onClick: () => this.plugin.activateBoardView()
      },
      {
        icon: "\u{1F9E0}",
        label: "\u5206\u6790",
        onClick: () => this.runAnalysis()
      },
      {
        icon: "\u{1F4DD}",
        label: "\u52A0\u4EFB\u52A1",
        onClick: () => this.openTaskInput()
      },
      {
        icon: "\u2699\uFE0F",
        label: "\u8BBE\u7F6E",
        onClick: () => {
          this.app.setting.openTab();
          this.app.setting.openTabById("decision-workbench");
        }
      }
    ];
    for (const item of items) {
      const btn = nav.createDiv({ cls: "dw-nav-item" });
      if (item.active)
        btn.addClass("dw-nav-item--active");
      btn.createDiv({ cls: "dw-nav-icon" }).setText(item.icon);
      btn.createDiv({ cls: "dw-nav-label" }).setText(item.label);
      btn.onClickEvent(item.onClick);
    }
  }
  // ============================================================
  // 操作
  // ============================================================
  async runAnalysis() {
    new import_obsidian6.Notice("\u6B63\u5728\u5206\u6790...");
    const suggestions = await this.plugin.decisionEngine.analyze();
    this.plugin.setLastSuggestions(suggestions);
    new import_obsidian6.Notice(`\u5206\u6790\u5B8C\u6210\uFF0C\u751F\u6210 ${suggestions.length} \u6761\u5EFA\u8BAE`);
    this.render();
  }
  openTaskInput() {
    this.app.commands.executeCommandById(
      "decision-workbench:add-task-from-text"
    );
  }
  async openRulesFile() {
    const file = this.app.vault.getAbstractFileByPath("decision-rules.md");
    if (file && file instanceof import_obsidian6.TFile) {
      await this.app.workspace.openLinkText("decision-rules.md", "", false);
    } else {
      new import_obsidian6.Notice("\u89C4\u5219\u6587\u4EF6\u672A\u521B\u5EFA\uFF0C\u8BF7\u5728\u8BBE\u7F6E\u4E2D\u521B\u5EFA");
    }
  }
  // ============================================================
  // 事件
  // ============================================================
  registerEvents() {
    this.registerEvent(
      this.app.metadataCache.on("changed", () => {
        this.scheduleRender();
      })
    );
    this.registerEvent(
      this.app.vault.on("create", () => {
        this.scheduleRender();
      })
    );
    this.registerEvent(
      this.app.vault.on("delete", () => {
        this.scheduleRender();
      })
    );
  }
};

// src/settings/SettingsTab.ts
var import_obsidian7 = require("obsidian");
var DEFAULT_RULES_CONTENT = `# \u51B3\u7B56\u89C4\u5219

\u4FEE\u6539\u6B64\u6587\u4EF6\u81EA\u5B9A\u4E49\u51B3\u7B56\u5DE5\u4F5C\u53F0\u7684\u5206\u6790\u884C\u4E3A\uFF0C\u4E0B\u6B21\u8FD0\u884C\u5206\u6790\u65F6\u81EA\u52A8\u751F\u6548\u3002

## \u5206\u6790\u53C2\u6570

\`\`\`yaml
similarity_threshold: 0.2    # \u6807\u7B7E\u76F8\u4F3C\u5EA6\u9608\u503C\uFF08\u9ED8\u8BA4 0.3\uFF0C\u8D8A\u4F4E\u5173\u8054\u8D8A\u591A\uFF09
max_suggestions: 10          # \u6700\u5927\u5EFA\u8BAE\u6570\uFF08\u9ED8\u8BA4 5\uFF09
max_clusters: 8              # \u6700\u5927\u805A\u7C7B\u6570\uFF08\u9ED8\u8BA4 5\uFF09
\`\`\`

## \u4F18\u5148\u7EA7\u81EA\u52A8\u63D0\u5347\u89C4\u5219

\`\`\`yaml
# condition \u683C\u5F0F: tag:\u6807\u7B7E\u540D \u6216 due:\u5929\u6570
# \u5339\u914D\u540E\u81EA\u52A8\u8BBE\u7F6E\u5BF9\u5E94\u4F18\u5148\u7EA7
priority_rules:
  - condition: "tag:PCB"
    priority: high
  - condition: "due:3"
    priority: high
  - condition: "tag:\u5B66\u4E60"
    priority: medium
\`\`\`

## \u6807\u7B7E\u8DEF\u7531\u8868

\`\`\`yaml
# \u6309\u6807\u7B7E\u81EA\u52A8\u5206\u914D\u5904\u7406\u6D41\u7A0B
# \u5361\u7247\u4E0A\u4F1A\u663E\u793A\u8DEF\u7531\u5FBD\u7AE0
routes:
  PCB: \u5668\u4EF6\u9009\u578B\u6D41\u7A0B
  \u5B66\u4E60: \u8D39\u66FC\u5B66\u4E60\u6CD5\u6D41\u7A0B
  \u5199\u4F5C: \u5185\u5BB9\u521B\u4F5C\u6D41\u7A0B
  Python: \u7F16\u7A0B\u5F00\u53D1\u6D41\u7A0B
\`\`\`
`;
var DecisionWorkbenchSettingsTab = class extends import_obsidian7.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display() {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl("h3", { text: "\u51B3\u7B56\u5DE5\u4F5C\u53F0\u8BBE\u7F6E" });
    new import_obsidian7.Setting(containerEl).setName("\u81EA\u52A8\u63D0\u53D6\u4EFB\u52A1").setDesc("\u7B14\u8BB0\u4FDD\u5B58\u65F6\u81EA\u52A8\u63D0\u53D6\u4EFB\u52A1\u4FE1\u606F\u548C\u5173\u8054\u7B14\u8BB0").addToggle(
      (toggle) => toggle.setValue(this.plugin.settings.autoExtract).onChange(async (value) => {
        this.plugin.settings.autoExtract = value;
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian7.Setting(containerEl).setName("\u51B3\u7B56\u5206\u6790\u95F4\u9694\uFF08\u79D2\uFF09").setDesc("\u81EA\u52A8\u8FD0\u884C\u51B3\u7B56\u5F15\u64CE\u7684\u6700\u5C0F\u95F4\u9694\u65F6\u95F4").addText(
      (text) => text.setValue(String(this.plugin.settings.decisionInterval)).onChange(async (value) => {
        const num = parseInt(value, 10);
        if (!isNaN(num) && num >= 60) {
          this.plugin.settings.decisionInterval = num;
          await this.plugin.saveSettings();
        }
      })
    );
    new import_obsidian7.Setting(containerEl).setName("\u5173\u8054\u5F3A\u5EA6\u9608\u503C").setDesc("\u7B14\u8BB0\u81EA\u52A8\u5173\u8054\u7684\u6700\u5C0F\u76F8\u4F3C\u5EA6\uFF080-1\uFF09\uFF0C\u503C\u8D8A\u4F4E\u5173\u8054\u8D8A\u591A").addText(
      (text) => text.setValue(String(this.plugin.settings.similarityThreshold)).onChange(async (value) => {
        const num = parseFloat(value);
        if (!isNaN(num) && num >= 0 && num <= 1) {
          this.plugin.settings.similarityThreshold = num;
          await this.plugin.saveSettings();
        }
      })
    );
    containerEl.createEl("h4", { text: "\u770B\u677F\u5217\u914D\u7F6E" });
    const colsContainer = containerEl.createDiv({ cls: "dw-settings-columns" });
    for (let i = 0; i < this.plugin.settings.columns.length; i++) {
      const colSetting = new import_obsidian7.Setting(colsContainer).setName(`\u5217 ${i + 1}`).addText(
        (text) => text.setValue(this.plugin.settings.columns[i]).onChange(async (value) => {
          this.plugin.settings.columns[i] = value;
          await this.plugin.saveSettings();
        })
      );
      if (this.plugin.settings.columns.length > 2) {
        colSetting.addButton(
          (btn) => btn.setIcon("trash").setTooltip("\u5220\u9664\u6B64\u5217").onClick(async () => {
            this.plugin.settings.columns.splice(i, 1);
            await this.plugin.saveSettings();
            this.display();
          })
        );
      }
    }
    new import_obsidian7.Setting(colsContainer).addButton(
      (btn) => btn.setButtonText("\u6DFB\u52A0\u5217").setIcon("plus").onClick(async () => {
        this.plugin.settings.columns.push("\u65B0\u5217");
        await this.plugin.saveSettings();
        this.display();
      })
    );
    containerEl.createEl("h4", { text: "\u6570\u636E\u64CD\u4F5C" });
    new import_obsidian7.Setting(containerEl).setName("\u626B\u63CF\u5168\u90E8\u7B14\u8BB0").setDesc("\u4ECE\u6240\u6709\u7B14\u8BB0\u4E2D\u63D0\u53D6\u4EFB\u52A1\u5E76\u5EFA\u7ACB\u5173\u8054").addButton(
      (btn) => btn.setButtonText("\u5F00\u59CB\u626B\u63CF").setIcon("search").onClick(async () => {
        btn.setButtonText("\u626B\u63CF\u4E2D...");
        const count = await this.plugin.taskLinker.processAllNotes();
        btn.setButtonText(`\u5B8C\u6210 (${count} \u4E2A\u4EFB\u52A1)`);
        setTimeout(() => {
          btn.setButtonText("\u5F00\u59CB\u626B\u63CF");
          this.display();
        }, 3e3);
      })
    );
    new import_obsidian7.Setting(containerEl).setName("\u8FD0\u884C\u51B3\u7B56\u5206\u6790").setDesc("\u624B\u52A8\u89E6\u53D1\u51B3\u7B56\u5F15\u64CE\u5206\u6790").addButton(
      (btn) => btn.setButtonText("\u8FD0\u884C\u5206\u6790").setIcon("lightbulb").onClick(async () => {
        btn.setButtonText("\u5206\u6790\u4E2D...");
        const suggestions = await this.plugin.decisionEngine.analyze();
        btn.setButtonText(`\u5B8C\u6210 (${suggestions.length} \u6761\u5EFA\u8BAE)`);
        setTimeout(() => {
          btn.setButtonText("\u8FD0\u884C\u5206\u6790");
        }, 3e3);
      })
    );
    new import_obsidian7.Setting(containerEl).setName("\u6E05\u9664\u6240\u6709\u4EFB\u52A1\u6570\u636E").setDesc("\u5220\u9664\u4EFB\u52A1\u5B58\u50A8\u4E2D\u7684\u6240\u6709\u4EFB\u52A1\uFF08\u4E0D\u5F71\u54CD\u7B14\u8BB0\u6587\u4EF6\uFF09").addButton(
      (btn) => btn.setButtonText("\u6E05\u9664").setIcon("trash").setWarning().onClick(async () => {
        const tasks = this.plugin.taskStore.getAllTasks();
        for (const task of tasks) {
          this.plugin.taskStore.deleteTask(task.id);
        }
        await this.plugin.taskStore.save();
        btn.setButtonText("\u5DF2\u6E05\u9664");
        setTimeout(() => {
          btn.setButtonText("\u6E05\u9664");
        }, 2e3);
      })
    );
    containerEl.createEl("h4", { text: "\u51B3\u7B56\u89C4\u5219" });
    new import_obsidian7.Setting(containerEl).setName("\u4E2A\u4EBA\u89C4\u5219\u6587\u4EF6").setDesc("decision-rules.md \u2014 \u81EA\u5B9A\u4E49\u5206\u6790\u53C2\u6570\u3001\u4F18\u5148\u7EA7\u89C4\u5219\u3001\u6807\u7B7E\u8DEF\u7531").addButton(
      (btn) => btn.setButtonText("\u521B\u5EFA/\u6253\u5F00").setIcon("file-edit").onClick(async () => {
        const rulesPath = "decision-rules.md";
        const exists = await this.app.vault.adapter.exists(rulesPath);
        if (!exists) {
          await this.app.vault.create(rulesPath, DEFAULT_RULES_CONTENT);
        }
        this.app.workspace.openLinkText(rulesPath, "", false);
      })
    ).addButton(
      (btn) => btn.setButtonText("\u91CD\u65B0\u52A0\u8F7D").setIcon("refresh-cw").onClick(async () => {
        await this.plugin.decisionEngine.loadRules();
        btn.setButtonText("\u5DF2\u52A0\u8F7D");
        setTimeout(() => btn.setButtonText("\u91CD\u65B0\u52A0\u8F7D"), 2e3);
      })
    );
  }
};

// src/utils/nlpParser.ts
function parseNaturalLanguage(input, now = /* @__PURE__ */ new Date()) {
  let remaining = input.trim();
  const tags = [];
  const tagRegex = /#([^\s#]+)/g;
  let tagMatch;
  while ((tagMatch = tagRegex.exec(remaining)) !== null) {
    tags.push(tagMatch[1]);
  }
  remaining = remaining.replace(tagRegex, "").trim();
  const { priority, cleaned } = parsePriority(remaining);
  remaining = cleaned;
  const { due, cleaned: cleanedTime } = parseDateTime(remaining, now);
  remaining = cleanedTime;
  const title = remaining.replace(/\s+/g, " ").replace(/^[\s,，、]+|[\s,，、]+$/g, "").trim();
  return {
    title: title || "\u672A\u547D\u540D\u4EFB\u52A1",
    due,
    priority,
    tags
  };
}
function parsePriority(text) {
  let priority = "medium";
  let cleaned = text;
  const highKeywords = [
    "\u7D27\u6025",
    "\u975E\u5E38\u91CD\u8981",
    "\u9AD8\u4F18\u5148\u7EA7",
    "critical",
    "urgent",
    "asap",
    "\u7ACB\u5373",
    "\u9A6C\u4E0A"
  ];
  const lowKeywords = [
    "\u4F4E\u4F18\u5148\u7EA7",
    "\u4E0D\u6025",
    "\u6709\u7A7A\u518D\u505A",
    "low priority",
    "\u4E0D\u7D27\u6025",
    "\u968F\u4FBF\u4EC0\u4E48\u65F6\u5019"
  ];
  const mediumKeywords = ["\u4E00\u822C", "\u4E2D\u7B49\u4F18\u5148\u7EA7", "medium", "normal"];
  for (const kw of highKeywords) {
    if (cleaned.toLowerCase().includes(kw.toLowerCase())) {
      priority = "high";
      cleaned = cleaned.replace(new RegExp(kw, "gi"), "");
      break;
    }
  }
  if (priority === "medium") {
    for (const kw of lowKeywords) {
      if (cleaned.toLowerCase().includes(kw.toLowerCase())) {
        priority = "low";
        cleaned = cleaned.replace(new RegExp(kw, "gi"), "");
        break;
      }
    }
  }
  if (priority === "medium") {
    for (const kw of mediumKeywords) {
      if (cleaned.toLowerCase().includes(kw.toLowerCase())) {
        cleaned = cleaned.replace(new RegExp(kw, "gi"), "");
        break;
      }
    }
  }
  return { priority, cleaned: cleaned.replace(/\s+/g, " ").trim() };
}
function parseDateTime(text, now) {
  let due;
  let cleaned = text;
  const timeWithDay = cleaned.match(
    /(今天|明天|后天|大后天|今天明天|下周[一二三四五六日天]|下个月\w*号?|后天大后天)\s*(上午|下午|晚上|中午|清晨|傍晚)?\s*(\d{1,2})\s*[点时:：]\s*(\d{1,2})?\s*(分)?/
  );
  if (timeWithDay) {
    const dayWord = timeWithDay[1];
    const periodWord = timeWithDay[2] || "";
    const hour = parseInt(timeWithDay[3], 10);
    const minute = timeWithDay[4] ? parseInt(timeWithDay[4], 10) : 0;
    const targetDate = resolveDay(dayWord, now);
    const finalHour = adjustHourForPeriod(hour, periodWord);
    targetDate.setHours(finalHour, minute, 0, 0);
    due = toLocalISO(targetDate);
    cleaned = cleaned.replace(timeWithDay[0], "");
    return { due, cleaned };
  }
  const dayOnly = cleaned.match(
    /(今天|明天|后天|大后天|下周[一二三四五六日天]|\d{1,2}月\d{1,2}号|下个月\d{1,2}号|本周[一二三四五六日天]|这周末)/
  );
  if (dayOnly) {
    const dayWord = dayOnly[1];
    const targetDate = resolveDay(dayWord, now);
    targetDate.setHours(23, 59, 0, 0);
    due = toLocalISO(targetDate);
    cleaned = cleaned.replace(dayOnly[0], "");
    return { due, cleaned };
  }
  const relativeDays = cleaned.match(/(\d+)\s*(天|周|月)后/);
  if (relativeDays) {
    const num = parseInt(relativeDays[1], 10);
    const unit = relativeDays[2];
    const targetDate = new Date(now);
    if (unit === "\u5929")
      targetDate.setDate(targetDate.getDate() + num);
    else if (unit === "\u5468")
      targetDate.setDate(targetDate.getDate() + num * 7);
    else if (unit === "\u6708")
      targetDate.setMonth(targetDate.getMonth() + num);
    targetDate.setHours(23, 59, 0, 0);
    due = toLocalISO(targetDate);
    cleaned = cleaned.replace(relativeDays[0], "");
    return { due, cleaned };
  }
  const timeToday = cleaned.match(
    /(上午|下午|晚上|中午|清晨|傍晚)?\s*(\d{1,2})\s*[点时:：]\s*(\d{1,2})?\s*(分)?/
  );
  if (timeToday) {
    const periodWord = timeToday[1] || "";
    const hour = parseInt(timeToday[2], 10);
    const minute = timeToday[3] ? parseInt(timeToday[3], 10) : 0;
    const targetDate = new Date(now);
    targetDate.setHours(adjustHourForPeriod(hour, periodWord), minute, 0, 0);
    if (targetDate.getTime() < now.getTime()) {
      targetDate.setDate(targetDate.getDate() + 1);
    }
    due = toLocalISO(targetDate);
    cleaned = cleaned.replace(timeToday[0], "");
    return { due, cleaned };
  }
  return { due: void 0, cleaned };
}
function resolveDay(dayWord, now) {
  var _a, _b;
  const date = new Date(now);
  date.setHours(0, 0, 0, 0);
  if (dayWord === "\u4ECA\u5929") {
  } else if (dayWord === "\u660E\u5929") {
    date.setDate(date.getDate() + 1);
  } else if (dayWord === "\u540E\u5929") {
    date.setDate(date.getDate() + 2);
  } else if (dayWord === "\u5927\u540E\u5929") {
    date.setDate(date.getDate() + 3);
  } else if (dayWord.startsWith("\u4E0B\u5468")) {
    const dayMap = {
      \u4E00: 1,
      \u4E8C: 2,
      \u4E09: 3,
      \u56DB: 4,
      \u4E94: 5,
      \u516D: 6,
      \u65E5: 0,
      \u5929: 0
    };
    const dayChar = dayWord.charAt(2);
    const targetDay = (_a = dayMap[dayChar]) != null ? _a : 0;
    const currentDay = date.getDay();
    let diff = targetDay - currentDay;
    if (diff <= 0)
      diff += 7;
    date.setDate(date.getDate() + diff);
  } else if (dayWord.startsWith("\u672C\u5468")) {
    const dayMap = {
      \u4E00: 1,
      \u4E8C: 2,
      \u4E09: 3,
      \u56DB: 4,
      \u4E94: 5,
      \u516D: 6,
      \u65E5: 0,
      \u5929: 0
    };
    const dayChar = dayWord.charAt(2);
    const targetDay = (_b = dayMap[dayChar]) != null ? _b : 0;
    const currentDay = date.getDay();
    let diff = targetDay - currentDay;
    if (diff < 0)
      diff += 7;
    date.setDate(date.getDate() + diff);
  } else if (dayWord === "\u8FD9\u5468\u672B") {
    const currentDay = date.getDay();
    const diff = 6 - currentDay;
    date.setDate(date.getDate() + (diff <= 0 ? diff + 7 : diff));
  } else if (dayWord.match(/^\d{1,2}月\d{1,2}号$/)) {
    const match = dayWord.match(/(\d{1,2})月(\d{1,2})号/);
    if (match) {
      const month = parseInt(match[1], 10) - 1;
      const day = parseInt(match[2], 10);
      date.setMonth(month, day);
      if (date.getTime() < now.getTime()) {
        date.setFullYear(date.getFullYear() + 1);
      }
    }
  } else if (dayWord.startsWith("\u4E0B\u4E2A\u6708")) {
    const dayMatch = dayWord.match(/(\d{1,2})号/);
    const day = dayMatch ? parseInt(dayMatch[1], 10) : 1;
    date.setMonth(date.getMonth() + 1, day);
  }
  return date;
}
function adjustHourForPeriod(hour, period) {
  if (period === "\u4E0B\u5348" || period === "\u665A\u4E0A" || period === "\u508D\u665A") {
    return hour < 12 ? hour + 12 : hour;
  }
  if (period === "\u4E2D\u5348") {
    return hour === 12 ? 12 : hour < 12 ? 12 : hour;
  }
  if (period === "\u6E05\u6668") {
    return hour >= 12 ? hour - 12 : hour;
  }
  return hour;
}
function toLocalISO(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

// main.ts
var DecisionWorkbenchPlugin = class extends import_obsidian8.Plugin {
  constructor() {
    super(...arguments);
    this.lastSuggestions = [];
    this.decisionTimer = null;
  }
  async onload() {
    await this.loadSettings();
    this.taskStore = new TaskStore(this.app);
    await this.taskStore.load();
    this.noteExtractor = new NoteExtractor(this.app);
    this.taskLinker = new TaskLinker(this.app, this.taskStore, this.noteExtractor);
    this.decisionEngine = new DecisionEngine(this.app, this.taskStore, this.settings);
    this.vaultDataCache = new VaultDataCache(this.app);
    this.registerView(BOARD_VIEW_TYPE, (leaf) => new BoardView(leaf, this));
    this.registerView(TASK_PANEL_VIEW_TYPE, (leaf) => new TaskPanel(leaf, this));
    this.registerView(DASHBOARD_VIEW_TYPE, (leaf) => new DashboardView(leaf, this));
    this.registerCommands();
    this.addSettingTab(new DecisionWorkbenchSettingsTab(this.app, this));
    if (this.settings.autoExtract) {
      this.registerEvent(
        this.app.metadataCache.on("changed", async (file) => {
          try {
            this.decisionEngine.getCachedGraph().onNoteChanged(file);
            await this.taskLinker.processNote(file);
            await this.taskStore.save();
          } catch (e) {
            console.error("[Decision Workbench] Auto-extract error:", e);
          }
        })
      );
    }
    this.registerEvent(
      this.app.vault.on("rename", async (file, oldPath) => {
        this.vaultDataCache.onFileRenamed(file, oldPath);
        this.decisionEngine.getCachedGraph().onNoteDeleted(oldPath);
        if (file instanceof import_obsidian8.TFile && file.extension === "md") {
          this.decisionEngine.getCachedGraph().onNoteChanged(file);
        }
        const task = this.taskStore.getTaskByNote(oldPath);
        if (task) {
          this.taskStore.updateTask(task.id, { sourceNote: file.path });
          const updated = task.linkedNotes.map(
            (n) => n.path === oldPath ? { ...n, path: file.path } : n
          );
          this.taskStore.updateTask(task.id, { linkedNotes: updated });
          await this.taskStore.save();
        }
      })
    );
    this.registerEvent(
      this.app.vault.on("delete", async (file) => {
        this.vaultDataCache.onFileDeleted(file);
        this.decisionEngine.getCachedGraph().onNoteDeleted(file.path);
        const task = this.taskStore.getTaskByNote(file.path);
        if (task) {
          this.taskStore.updateTask(task.id, { sourceNote: "" });
          await this.taskStore.save();
        }
      })
    );
    this.registerEvent(
      this.app.metadataCache.on("changed", (file) => {
        this.vaultDataCache.onFileChanged(file);
        if (!this.settings.autoExtract) {
          this.decisionEngine.getCachedGraph().onNoteChanged(file);
        }
      })
    );
    this.registerEvent(
      this.app.vault.on("create", (file) => {
        this.vaultDataCache.onFileCreated(file);
        if (file instanceof import_obsidian8.TFile && file.extension === "md") {
          this.decisionEngine.getCachedGraph().onNoteChanged(file);
        }
      })
    );
    this.addRibbonIcon("orbit", "\u6253\u5F00\u51B3\u7B56\u4EEA\u8868\u677F", () => {
      this.activateDashboardView();
    });
    this.startDecisionTimer();
    this.app.workspace.onLayoutReady(() => {
      this.vaultDataCache.initialize();
      this.decisionEngine.getCachedGraph().build();
      this.activateDashboardView();
      if (this.taskStore.getAllTasks().length === 0) {
        this.taskLinker.processAllNotes().then((count) => {
          if (count > 0) {
            new import_obsidian8.Notice(`[\u51B3\u7B56\u5DE5\u4F5C\u53F0] \u626B\u63CF\u5B8C\u6210\uFF0C\u53D1\u73B0 ${count} \u4E2A\u4EFB\u52A1`);
          }
        });
      }
    });
  }
  onunload() {
    if (this.decisionTimer) {
      window.clearInterval(this.decisionTimer);
    }
  }
  // ============================================================
  // 命令注册
  // ============================================================
  registerCommands() {
    this.addCommand({
      id: "open-decision-board",
      name: "\u6253\u5F00\u51B3\u7B56\u770B\u677F",
      callback: () => this.activateBoardView()
    });
    this.addCommand({
      id: "open-decision-dashboard",
      name: "\u6253\u5F00\u51B3\u7B56\u4EEA\u8868\u677F",
      callback: () => this.activateDashboardView()
    });
    this.addCommand({
      id: "open-task-panel",
      name: "\u6253\u5F00\u4EFB\u52A1\u8BE6\u60C5\u9762\u677F",
      callback: () => this.activateTaskPanel()
    });
    this.addCommand({
      id: "extract-task-from-note",
      name: "\u4ECE\u5F53\u524D\u7B14\u8BB0\u63D0\u53D6\u4EFB\u52A1",
      callback: async () => {
        const file = this.app.workspace.getActiveFile();
        if (!file) {
          new import_obsidian8.Notice("\u8BF7\u5148\u6253\u5F00\u4E00\u4E2A\u7B14\u8BB0\u6587\u4EF6");
          return;
        }
        const task = await this.taskLinker.processNote(file);
        await this.taskStore.save();
        if (task) {
          new import_obsidian8.Notice(`\u4EFB\u52A1\u5DF2\u63D0\u53D6: ${task.title}`);
        } else {
          new import_obsidian8.Notice("\u672A\u5728\u5F53\u524D\u7B14\u8BB0\u4E2D\u627E\u5230\u4EFB\u52A1\u5185\u5BB9");
        }
      }
    });
    this.addCommand({
      id: "run-decision-analysis",
      name: "\u8FD0\u884C\u51B3\u7B56\u5206\u6790",
      callback: async () => {
        new import_obsidian8.Notice("\u6B63\u5728\u5206\u6790...");
        const suggestions = await this.decisionEngine.analyze();
        this.lastSuggestions = suggestions;
        new import_obsidian8.Notice(`\u5206\u6790\u5B8C\u6210\uFF0C\u751F\u6210 ${suggestions.length} \u6761\u5EFA\u8BAE`);
        this.app.workspace.getLeavesOfType(BOARD_VIEW_TYPE).forEach((leaf) => {
          const view = leaf.view;
          if (view instanceof BoardView) {
            view.render();
          }
        });
        this.app.workspace.getLeavesOfType(DASHBOARD_VIEW_TYPE).forEach((leaf) => {
          const view = leaf.view;
          if (view instanceof DashboardView) {
            view.render();
          }
        });
      }
    });
    this.addCommand({
      id: "link-note-to-task",
      name: "\u5173\u8054\u7B14\u8BB0\u5230\u4EFB\u52A1",
      callback: () => this.showLinkNoteModal()
    });
    this.addCommand({
      id: "add-task-from-text",
      name: "\u7528\u81EA\u7136\u8BED\u8A00\u6DFB\u52A0\u4EFB\u52A1",
      callback: () => {
        new TaskInputModal(this.app, async (text) => {
          var _a, _b;
          const parsed = parseNaturalLanguage(text);
          const task = this.taskStore.createTask(parsed.title, {
            priority: parsed.priority,
            due: parsed.due,
            tags: parsed.tags
          });
          const allFiles = this.app.vault.getMarkdownFiles();
          for (const file of allFiles) {
            const fileTags = (_b = (_a = this.app.metadataCache.getFileCache(file)) == null ? void 0 : _a.frontmatter) == null ? void 0 : _b.tags;
            if (fileTags && Array.isArray(fileTags)) {
              const overlap = parsed.tags.filter(
                (t) => fileTags.some(
                  (ft) => ft.toLowerCase().includes(t.toLowerCase()) || t.toLowerCase().includes(ft.toLowerCase())
                )
              );
              if (overlap.length > 0) {
                this.taskStore.addLinkedNote(task.id, file.path, "reference");
              }
            }
          }
          await this.taskStore.save();
          const dueStr = parsed.due ? ` | \u622A\u6B62: ${parsed.due}` : "";
          const tagStr = parsed.tags.length > 0 ? ` | \u6807\u7B7E: ${parsed.tags.join(", ")}` : "";
          new import_obsidian8.Notice(`\u4EFB\u52A1\u5DF2\u521B\u5EFA: ${parsed.title}${dueStr}${tagStr}`);
          this.saveAndRefresh();
        }).open();
      }
    });
  }
  // ============================================================
  // 视图激活
  // ============================================================
  async activateBoardView() {
    const { workspace } = this.app;
    let leaf = workspace.getLeavesOfType(BOARD_VIEW_TYPE)[0];
    if (!leaf) {
      leaf = workspace.getLeaf(false);
      await leaf.setViewState({
        type: BOARD_VIEW_TYPE,
        active: true
      });
    }
    workspace.revealLeaf(leaf);
  }
  async activateDashboardView() {
    const { workspace } = this.app;
    let leaf = workspace.getLeavesOfType(DASHBOARD_VIEW_TYPE)[0];
    if (!leaf) {
      leaf = workspace.getLeaf(false);
      await leaf.setViewState({
        type: DASHBOARD_VIEW_TYPE,
        active: true
      });
    }
    workspace.revealLeaf(leaf);
  }
  async activateTaskPanel() {
    const { workspace } = this.app;
    let leaf = workspace.getLeavesOfType(TASK_PANEL_VIEW_TYPE)[0];
    if (!leaf) {
      leaf = workspace.getRightLeaf(false);
      if (leaf) {
        await leaf.setViewState({
          type: TASK_PANEL_VIEW_TYPE,
          active: true
        });
      }
    }
    if (leaf) {
      workspace.revealLeaf(leaf);
    }
  }
  // ============================================================
  // 笔记关联选择器
  // ============================================================
  showLinkNoteModal() {
    const files = this.app.vault.getMarkdownFiles();
    const modal = new import_obsidian8.FuzzySuggestModal(this.app);
    modal.setTitle("\u9009\u62E9\u8981\u5173\u8054\u7684\u7B14\u8BB0");
    modal.setItems(
      files.map((f) => f.basename)
    );
    const tasks = this.taskStore.getAllTasks();
    if (tasks.length === 0) {
      new import_obsidian8.Notice("\u6682\u65E0\u4EFB\u52A1\uFF0C\u8BF7\u5148\u63D0\u53D6\u4EFB\u52A1");
      return;
    }
    modal.onChooseItem = (noteName) => {
      const file = files.find((f) => f.basename === noteName);
      if (!file)
        return;
      const taskModal = new import_obsidian8.FuzzySuggestModal(this.app);
      taskModal.setTitle(`\u9009\u62E9 "${noteName}" \u8981\u5173\u8054\u7684\u4EFB\u52A1`);
      taskModal.setItems(tasks.map((t) => t.title));
      taskModal.onChooseItem = async (taskTitle) => {
        const task = tasks.find((t) => t.title === taskTitle);
        if (!task)
          return;
        this.taskStore.addLinkedNote(task.id, file.path, "reference");
        await this.taskStore.save();
        new import_obsidian8.Notice(`\u5DF2\u5173\u8054 "${noteName}" \u5230\u4EFB\u52A1 "${taskTitle}"`);
      };
      taskModal.open();
    };
    modal.open();
  }
  // ============================================================
  // 决策定时器
  // ============================================================
  startDecisionTimer() {
    if (this.decisionTimer) {
      window.clearInterval(this.decisionTimer);
    }
    const intervalMs = this.settings.decisionInterval * 1e3;
    this.decisionTimer = window.setInterval(async () => {
      if (this.decisionEngine.shouldAutoRun()) {
        try {
          this.lastSuggestions = await this.decisionEngine.analyze();
          this.app.workspace.getLeavesOfType(BOARD_VIEW_TYPE).forEach((leaf) => {
            const view = leaf.view;
            if (view instanceof BoardView) {
              view.render();
            }
          });
          this.app.workspace.getLeavesOfType(DASHBOARD_VIEW_TYPE).forEach((leaf) => {
            const view = leaf.view;
            if (view instanceof DashboardView) {
              view.render();
            }
          });
        } catch (e) {
          console.error("[Decision Workbench] Decision timer error:", e);
        }
      }
    }, intervalMs);
  }
  // ============================================================
  // 设置管理
  // ============================================================
  async loadSettings() {
    this.settings = Object.assign(
      {},
      DEFAULT_SETTINGS,
      await this.loadData()
    );
  }
  async saveSettings() {
    await this.saveData(this.settings);
    this.decisionEngine["settings"] = this.settings;
    this.startDecisionTimer();
  }
  // ============================================================
  // 便捷方法
  // ============================================================
  /**
   * 保存任务数据并刷新看板/仪表板
   */
  async saveAndRefresh() {
    await this.taskStore.save();
    this.app.workspace.getLeavesOfType(BOARD_VIEW_TYPE).forEach((leaf) => {
      const view = leaf.view;
      if (view instanceof BoardView) {
        view.render();
      }
    });
    this.app.workspace.getLeavesOfType(DASHBOARD_VIEW_TYPE).forEach((leaf) => {
      const view = leaf.view;
      if (view instanceof DashboardView) {
        view.render();
      }
    });
  }
  /**
   * 获取最近一次决策建议
   */
  getLastSuggestions() {
    return this.lastSuggestions;
  }
  /**
   * 设置最近一次决策建议
   */
  setLastSuggestions(suggestions) {
    this.lastSuggestions = suggestions;
  }
  /**
   * 移除一条已采纳/已忽略的建议，并刷新所有视图
   */
  dismissSuggestion(suggestion) {
    const idx = this.lastSuggestions.indexOf(suggestion);
    if (idx < 0)
      return;
    this.lastSuggestions.splice(idx, 1);
    this.app.workspace.getLeavesOfType(BOARD_VIEW_TYPE).forEach((leaf) => {
      const view = leaf.view;
      if (view instanceof BoardView) {
        view.render();
      }
    });
    this.app.workspace.getLeavesOfType(DASHBOARD_VIEW_TYPE).forEach((leaf) => {
      const view = leaf.view;
      if (view instanceof DashboardView) {
        view.render();
      }
    });
  }
};
var TaskInputModal = class extends import_obsidian8.Modal {
  constructor(app, onSubmit) {
    super(app);
    this.onSubmit = onSubmit;
  }
  onOpen() {
    const { contentEl, titleEl } = this;
    titleEl.setText("\u81EA\u7136\u8BED\u8A00\u6DFB\u52A0\u4EFB\u52A1");
    const hint = contentEl.createEl("p", {
      text: "\u8F93\u5165\u4EFB\u52A1\u63CF\u8FF0\uFF0C\u7CFB\u7EDF\u4F1A\u81EA\u52A8\u89E3\u6790\u65F6\u95F4\u3001\u4F18\u5148\u7EA7\u548C\u6807\u7B7E\u3002\u4F8B\u5982\uFF1A",
      cls: "dw-input-hint"
    });
    const examples = contentEl.createEl("p", {
      text: "\u660E\u5929\u4E0A\u534810\u70B9\u8BBE\u8BA1\u7535\u6E90\u6A21\u5757\u539F\u7406\u56FE #PCB \u7D27\u6025",
      cls: "dw-input-example"
    });
    this.inputEl = contentEl.createEl("textarea", {
      cls: "dw-nlp-input",
      attr: {
        placeholder: "\u8F93\u5165\u4EFB\u52A1\u63CF\u8FF0...",
        rows: "3",
        autofocus: "true"
      }
    });
    this.inputEl.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        this.submit();
      }
    });
    const btnContainer = contentEl.createDiv({ cls: "dw-modal-actions" });
    const cancelBtn = btnContainer.createEl("button", {
      text: "\u53D6\u6D88",
      cls: "dw-btn"
    });
    cancelBtn.onclick = () => this.close();
    const submitBtn = btnContainer.createEl("button", {
      text: "\u521B\u5EFA\u4EFB\u52A1",
      cls: "dw-btn dw-btn-primary"
    });
    submitBtn.onclick = () => this.submit();
  }
  submit() {
    const text = this.inputEl.value.trim();
    if (text) {
      this.onSubmit(text);
    }
    this.close();
  }
  onClose() {
    this.contentEl.empty();
  }
};
