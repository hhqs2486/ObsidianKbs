// ============================================================
// DashboardView — 沉浸式仪表板视图
// ============================================================
// 基于 Cosmic Garden Dashboard 设计理念，
// 复用 Decision Workbench 数据层（TaskStore、DecisionEngine、
// JSONL 日志、规则文件），呈现一个全屏沉浸式总览。
//
// 布局：
// - 顶部：时钟 + 日期 + 快速操作
// - 左栏：今日概览（KPI 环 + 迷你折线图）+ 快捷入口 + 最近笔记
// - 中央：浮动知识岛屿卡片（按文件夹分组）
// - 右栏：任务进度 + 标签云 + 决策建议摘要
// - 底部：导航条（看板/仪表板/任务面板）
// ============================================================

import { ItemView, WorkspaceLeaf, TFile, Notice } from "obsidian";
import DecisionWorkbenchPlugin from "../../main";
import { Task, DecisionLogEntry } from "../types";

export const DASHBOARD_VIEW_TYPE = "decision-dashboard";

// 文件夹别名映射（子串匹配：folder 名包含 key 即匹配）
const FOLDER_ALIASES: { key: string; alias: string }[] = [
  { key: "Python", alias: "Python 园" },
  { key: "云计算", alias: "云图域" },
  { key: "云图", alias: "云图域" },
  { key: "嵌入式", alias: "嵌入式坊" },
  { key: "信号与系统", alias: "信号塔" },
  { key: "信号", alias: "信号塔" },
  { key: "AI智能体", alias: "智能体舱" },
  { key: "智能体", alias: "智能体舱" },
  { key: "Agent", alias: "智能体舱" },
];

// 文件夹图标（子串匹配：folder 名包含 key 即使用对应图标）
const FOLDER_ICONS: { key: string; icon: string }[] = [
  { key: "Python", icon: "\u{1F40D}" },
  { key: "云", icon: "\u{2601}\u{FE0F}" },
  { key: "嵌入", icon: "\u{1F527}" },
  { key: "信号", icon: "\u{1F4E1}" },
  { key: "AI", icon: "\u{1F916}" },
  { key: "Agent", icon: "\u{1F916}" },
  { key: "智能", icon: "\u{1F916}" },
];

// 根据文件夹名查图标（子串匹配）
function pickFolderIcon(folderName: string): string {
  for (const { key, icon } of FOLDER_ICONS) {
    if (folderName.includes(key)) return icon;
  }
  return "\u{1F4C1}"; // 默认文件夹
}

// 根据文件夹名查别名（子串匹配）
function pickFolderAlias(folderName: string): string | null {
  for (const { key, alias } of FOLDER_ALIASES) {
    if (folderName.includes(key)) return alias;
  }
  return null;
}

interface VaultData {
  totalNotes: number;
  totalTags: number;
  tagCounts: Map<string, number>;
  folderStats: { folder: string; noteCount: number; subfolders: number }[];
  recentNotes: { path: string; mtime: number; name: string }[];
  tasksByStatus: { todo: number; inProgress: number; done: number };
  topPriorityTasks: Task[];
  overdueTasks: Task[];
  logEntries: DecisionLogEntry[];
  dailyNoteCounts: { date: string; count: number }[];
}

export class DashboardView extends ItemView {
  private plugin: DecisionWorkbenchPlugin;
  private clockEl?: HTMLElement;
  private clockTimer: number | null = null;

  // 渲染代际锁：每次 render() 自增，过时的渲染会因 generation 不匹配被丢弃
  private renderGeneration = 0;
  // 事件触发的渲染防抖定时器
  private renderDebounceTimer: number | null = null;

  constructor(leaf: WorkspaceLeaf, plugin: DecisionWorkbenchPlugin) {
    super(leaf);
    this.plugin = plugin;
  }

  getViewType(): string {
    return DASHBOARD_VIEW_TYPE;
  }

  getDisplayText(): string {
    return "决策仪表板";
  }

  getIcon(): string {
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
    // 自增 generation 使进行中的 render() 在写入 DOM 前失效
    this.renderGeneration++;
  }

  /**
   * 主渲染入口（带代际锁 + 延迟清空）
   */
  async render() {
    const myGen = ++this.renderGeneration;
    const container = this.containerEl.children[1] as HTMLElement;

    // 先采集数据，确认成功后再清空 DOM，避免 await 期间其他 render 抢占导致叠加
    const data = await this.collectVaultData();

    // 代际检查：如果在 await 期间有更新的 render 启动，丢弃本次
    if (myGen !== this.renderGeneration) return;

    // 数据准备好后再清空并写入
    container.empty();
    container.addClass("dw-dashboard-root");

    this.renderTopBar(container, data);
    this.renderBody(container, data);
    this.renderBottomNav(container);
  }

  /**
   * 防抖渲染：事件触发的 render 合并到 100ms 窗口
   */
  private scheduleRender() {
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
   * 扫描 vault + 任务库 + 决策日志，汇总仪表板所需数据
   */
  private async collectVaultData(): Promise<VaultData> {
    const files = this.app.vault.getMarkdownFiles();

    // 标签统计
    const tagCounts = new Map<string, number>();
    const folderMap = new Map<string, { noteCount: number; subfolders: Set<string> }>();

    for (const file of files) {
      // 文件夹归类
      const parts = file.path.split("/");
      const topFolder = parts.length > 1 ? parts[0] : "(根目录)";

      if (!folderMap.has(topFolder)) {
        folderMap.set(topFolder, { noteCount: 0, subfolders: new Set() });
      }
      const folderData = folderMap.get(topFolder)!;
      folderData.noteCount++;

      if (parts.length > 2) {
        folderData.subfolders.add(parts.slice(1, -1).join("/"));
      }

      // 标签
      const cache = this.app.metadataCache.getFileCache(file);
      const tags = cache?.frontmatter?.tags;
      if (tags) {
        const tagArr = Array.isArray(tags) ? tags : [tags];
        for (const t of tagArr) {
          const clean = String(t).replace(/^#/, "").trim();
          if (clean) {
            tagCounts.set(clean, (tagCounts.get(clean) ?? 0) + 1);
          }
        }
      }
      // 也收集 inline tags
      const inlineTags = cache?.tags;
      if (inlineTags) {
        for (const t of inlineTags) {
          const clean = t.tag.replace(/^#/, "").trim();
          if (clean) {
            tagCounts.set(clean, (tagCounts.get(clean) ?? 0) + 1);
          }
        }
      }
    }

    // 文件夹统计 → 排序
    const folderStats = [...folderMap.entries()]
      .map(([folder, data]) => ({
        folder,
        noteCount: data.noteCount,
        subfolders: data.subfolders.size,
      }))
      .sort((a, b) => b.noteCount - a.noteCount);

    // 最近修改的笔记
    const recentNotes = files
      .map((f) => ({
        path: f.path,
        mtime: f.stat.mtime,
        name: f.basename,
      }))
      .sort((a, b) => b.mtime - a.mtime)
      .slice(0, 8);

    // 任务统计
    const tasks = this.plugin.taskStore.getAllTasks();
    const todo = tasks.filter((t) => t.status === "todo").length;
    const inProgress = tasks.filter((t) => t.status === "in-progress").length;
    const done = tasks.filter((t) => t.status === "done").length;

    // 高优先级 + 超期任务
    const topPriorityTasks = tasks
      .filter((t) => t.status !== "done" && t.priority === "high")
      .slice(0, 5);

    const now = Date.now();
    const overdueTasks = tasks.filter((t) => {
      if (t.status === "done" || !t.due) return false;
      const due = new Date(t.due).getTime();
      return !isNaN(due) && due < now;
    });

    // 决策日志（最后 7 条）
    const logEntries = await this.readDecisionLog();

    // 每日笔记数（最近 14 天）
    const dailyNoteCounts = this.collectDailyNoteCounts(files);

    return {
      totalNotes: files.length,
      totalTags: tagCounts.size,
      tagCounts,
      folderStats,
      recentNotes,
      tasksByStatus: { todo, inProgress, done },
      topPriorityTasks,
      overdueTasks,
      logEntries,
      dailyNoteCounts,
    };
  }

  /**
   * 读取 JSONL 决策日志
   */
  private async readDecisionLog(): Promise<DecisionLogEntry[]> {
    try {
      const LOG_FILE = ".obsidian/plugins/decision-workbench/decision_log.jsonl";
      const exists = await this.app.vault.adapter.exists(LOG_FILE);
      if (!exists) return [];
      const raw = await this.app.vault.adapter.read(LOG_FILE);
      return raw
        .trim()
        .split("\n")
        .filter((l) => l.trim())
        .map((l) => JSON.parse(l) as DecisionLogEntry)
        .reverse()
        .slice(0, 7);
    } catch {
      return [];
    }
  }

  /**
   * 统计最近 14 天每天的笔记修改数
   */
  private collectDailyNoteCounts(
    files: TFile[]
  ): { date: string; count: number }[] {
    const days: { date: string; count: number }[] = [];
    const now = new Date();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      days.push({ date: dateStr, count: 0 });
    }

    for (const file of files) {
      const dateStr = new Date(file.stat.mtime).toISOString().slice(0, 10);
      const day = days.find((d) => d.date === dateStr);
      if (day) day.count++;
    }

    return days;
  }

  // ============================================================
  // 顶部栏
  // ============================================================

  private renderTopBar(container: HTMLElement, data: VaultData) {
    const topbar = container.createDiv({ cls: "dw-dash-topbar" });

    // 左侧：时钟
    const clockContainer = topbar.createDiv({ cls: "dw-dash-clock-wrap" });
    this.clockEl = clockContainer.createDiv({ cls: "dw-dash-clock" });
    this.updateClock();

    const dateEl = clockContainer.createDiv({ cls: "dw-dash-date" });
    dateEl.setText(this.formatDate(new Date()));

    // 中央：标题
    const titleWrap = topbar.createDiv({ cls: "dw-dash-title-wrap" });
    titleWrap.createDiv({ cls: "dw-dash-title" }).setText("Decision Workbench");
    const subtitle = titleWrap.createDiv({ cls: "dw-dash-subtitle" });
    subtitle.setText(
      `${data.totalNotes} 篇笔记 · ${data.tasksByStatus.todo + data.tasksByStatus.inProgress} 个活跃任务`
    );

    // 右侧：快速操作
    const actions = topbar.createDiv({ cls: "dw-dash-actions" });
    this.createQuickButton(actions, "\u{1F9E0} 运行分析", () =>
      this.runAnalysis()
    );
    this.createQuickButton(actions, "\u{1F4DD} 添加任务", () =>
      this.openTaskInput()
    );
    this.createQuickButton(actions, "\u{1F4CB} 看板", () =>
      this.plugin.activateBoardView()
    );
  }

  private createQuickButton(
    parent: HTMLElement,
    text: string,
    onClick: () => void
  ) {
    const btn = parent.createEl("button", { cls: "dw-dash-btn", text });
    btn.onClickEvent(onClick);
    return btn;
  }

  private startClock() {
    if (this.clockTimer) window.clearInterval(this.clockTimer);
    this.clockTimer = window.setInterval(() => this.updateClock(), 1000);
  }

  private updateClock() {
    if (!this.clockEl) return;
    const now = new Date();
    const h = String(now.getHours()).padStart(2, "0");
    const m = String(now.getMinutes()).padStart(2, "0");
    const s = String(now.getSeconds()).padStart(2, "0");
    this.clockEl.setText(`${h}:${m}:${s}`);
  }

  private formatDate(d: Date): string {
    const weekdays = ["日", "一", "二", "三", "四", "五", "六"];
    return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 星期${weekdays[d.getDay()]}`;
  }

  // ============================================================
  // 主体三栏布局
  // ============================================================

  private renderBody(container: HTMLElement, data: VaultData) {
    const body = container.createDiv({ cls: "dw-dash-body" });

    this.renderLeftRail(body, data);
    this.renderCenter(body, data);
    this.renderRightRail(body, data);
  }

  // ---- 左栏 ----

  private renderLeftRail(body: HTMLElement, data: VaultData) {
    const rail = body.createDiv({ cls: "dw-dash-rail dw-dash-rail--left" });

    // 今日概览
    this.renderOverviewCard(rail, data);

    // 迷你折线图
    this.renderMiniChart(rail, data.dailyNoteCounts);

    // 快捷入口
    this.renderQuickActions(rail);

    // 最近笔记
    this.renderRecentNotes(rail, data.recentNotes);
  }

  private renderOverviewCard(rail: HTMLElement, data: VaultData) {
    const card = rail.createDiv({ cls: "dw-dash-card" });
    card.createDiv({ cls: "dw-dash-card-title" }).setText("今日概览");

    const kpiGrid = card.createDiv({ cls: "dw-kpi-grid" });

    // 总笔记
    this.createKPI(kpiGrid, String(data.totalNotes), "笔记总数");

    // 标签
    this.createKPI(kpiGrid, String(data.totalTags), "标签种类");

    // 完成率
    const totalTasks =
      data.tasksByStatus.todo +
      data.tasksByStatus.inProgress +
      data.tasksByStatus.done;
    const completionRate =
      totalTasks > 0
        ? Math.round((data.tasksByStatus.done / totalTasks) * 100)
        : 0;
    this.createKPI(kpiGrid, `${completionRate}%`, "完成率");

    // 超期
    this.createKPI(
      kpiGrid,
      String(data.overdueTasks.length),
      "超期任务",
      data.overdueTasks.length > 0
    );

    // 进度环
    if (totalTasks > 0) {
      this.renderProgressRing(card, data.tasksByStatus, totalTasks);
    }
  }

  private createKPI(
    parent: HTMLElement,
    value: string,
    label: string,
    warn = false
  ) {
    const kpi = parent.createDiv({ cls: "dw-kpi-item" });
    if (warn) kpi.addClass("dw-kpi-item--warn");
    kpi.createDiv({ cls: "dw-kpi-value" }).setText(value);
    kpi.createDiv({ cls: "dw-kpi-label" }).setText(label);
  }

  private renderProgressRing(
    parent: HTMLElement,
    status: { todo: number; inProgress: number; done: number },
    total: number
  ) {
    const ringWrap = parent.createDiv({ cls: "dw-ring-wrap" });
    const svg = ringWrap.createSvg("svg");
    svg.setAttribute("viewBox", "0 0 120 120");
    svg.setAttribute("width", "100");
    svg.setAttribute("height", "100");

    const cx = 60;
    const cy = 60;
    const r = 45;

    // 背景圆
    const bgCircle = svg.createSvg("circle");
    bgCircle.setAttribute("cx", String(cx));
    bgCircle.setAttribute("cy", String(cy));
    bgCircle.setAttribute("r", String(r));
    bgCircle.setAttribute("fill", "none");
    bgCircle.setAttribute("stroke", "var(--background-modifier-border)");
    bgCircle.setAttribute("stroke-width", "8");

    // 进度圆弧
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

    // 中心文字
    const text = svg.createSvg("text");
    text.setAttribute("x", String(cx));
    text.setAttribute("y", String(cy + 8));
    text.setAttribute("text-anchor", "middle");
    text.setAttribute("font-size", "20");
    text.setAttribute("fill", "var(--text-normal)");
    text.setAttribute("font-weight", "bold");
    text.setText(`${Math.round(doneRatio * 100)}%`);

    // 图例
    const legend = ringWrap.createDiv({ cls: "dw-ring-legend" });
    legend.createSpan({ cls: "dw-legend-item" }).setText(
      `\u{2705} 完成 ${status.done}`
    );
    legend.createSpan({ cls: "dw-legend-item" }).setText(
      `\u{1F6E0} 进行 ${status.inProgress}`
    );
    legend.createSpan({ cls: "dw-legend-item" }).setText(
      `\u{1F4DD} 待办 ${status.todo}`
    );
  }

  private renderMiniChart(
    rail: HTMLElement,
    dailyCounts: { date: string; count: number }[]
  ) {
    const card = rail.createDiv({ cls: "dw-dash-card" });
    card.createDiv({ cls: "dw-dash-card-title" }).setText("近 14 天活跃度");

    if (dailyCounts.length === 0) return;

    const maxCount = Math.max(...dailyCounts.map((d) => d.count), 1);
    const chartWrap = card.createDiv({ cls: "dw-mini-chart-wrap" });

    const svg = chartWrap.createSvg("svg");
    svg.setAttribute("viewBox", "0 0 280 80");
    svg.setAttribute("width", "100%");
    svg.setAttribute("height", "60");

    const barWidth = 280 / dailyCounts.length;

    for (let i = 0; i < dailyCounts.length; i++) {
      const h = (dailyCounts[i].count / maxCount) * 60;
      const bar = svg.createSvg("rect");
      bar.setAttribute("x", String(i * barWidth + 2));
      bar.setAttribute("y", String(70 - h));
      bar.setAttribute("width", String(barWidth - 4));
      bar.setAttribute("height", String(h));
      bar.setAttribute("rx", "2");
      bar.setAttribute("fill", "var(--interactive-accent)");
      bar.setAttribute("opacity", "0.7");

      // tooltip via title
      const title = svg.createSvg("title");
      title.setText(`${dailyCounts[i].date}: ${dailyCounts[i].count} 篇`);
      bar.appendChild(title);
    }

    // 底部标签
    const labels = chartWrap.createDiv({ cls: "dw-chart-labels" });
    labels.createSpan({ cls: "dw-chart-label" }).setText(
      dailyCounts[0].date.slice(5)
    );
    labels.createSpan({ cls: "dw-chart-label" }).setText(
      dailyCounts[dailyCounts.length - 1].date.slice(5)
    );
  }

  private renderQuickActions(rail: HTMLElement) {
    const card = rail.createDiv({ cls: "dw-dash-card" });
    card.createDiv({ cls: "dw-dash-card-title" }).setText("快捷入口");

    const grid = card.createDiv({ cls: "dw-quick-grid" });

    const actions: { icon: string; label: string; onClick: () => void }[] = [
      {
        icon: "\u{1F9E0}",
        label: "决策分析",
        onClick: () => this.runAnalysis(),
      },
      {
        icon: "\u{1F4DD}",
        label: "添加任务",
        onClick: () => this.openTaskInput(),
      },
      {
        icon: "\u{1F4CB}",
        label: "看板视图",
        onClick: () => this.plugin.activateBoardView(),
      },
      {
        icon: "\u{1F4C1}",
        label: "规则文件",
        onClick: () => this.openRulesFile(),
      },
    ];

    for (const action of actions) {
      const btn = grid.createDiv({ cls: "dw-quick-btn" });
      btn.createDiv({ cls: "dw-quick-icon" }).setText(action.icon);
      btn.createDiv({ cls: "dw-quick-label" }).setText(action.label);
      btn.onClickEvent(action.onClick);
    }
  }

  private renderRecentNotes(
    rail: HTMLElement,
    notes: { path: string; name: string; mtime: number }[]
  ) {
    const card = rail.createDiv({ cls: "dw-dash-card" });
    card.createDiv({ cls: "dw-dash-card-title" }).setText("最近笔记");

    if (notes.length === 0) {
      card.createDiv({ cls: "dw-dash-empty" }).setText("暂无笔记");
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

  private formatRelativeTime(mtime: number): string {
    const diff = Date.now() - mtime;
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "刚刚";
    if (minutes < 60) return `${minutes} 分钟前`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} 小时前`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} 天前`;
    return new Date(mtime).toISOString().slice(0, 10);
  }

  // ---- 中央：浮动岛屿 ----

  private renderCenter(body: HTMLElement, data: VaultData) {
    const center = body.createDiv({ cls: "dw-dash-center" });

    const title = center.createDiv({ cls: "dw-dash-center-title" });
    title.setText("\u{1F331} 知识群岛");

    const islandsWrap = center.createDiv({ cls: "dw-dash-islands" });

    // 取笔记数前 6 的文件夹（避免溢出）
    const folders = data.folderStats.slice(0, 6);

    for (let i = 0; i < folders.length; i++) {
      const folder = folders[i];
      this.renderIsland(islandsWrap, folder, i);
    }

    if (folders.length === 0) {
      center.createDiv({ cls: "dw-dash-empty dw-dash-empty--large" }).setText(
        "暂无知识库文件夹"
      );
    }
  }

  private renderIsland(
    parent: HTMLElement,
    folder: { folder: string; noteCount: number; subfolders: number },
    index: number
  ) {
    const island = parent.createDiv({ cls: "dw-island" });
    island.style.animationDelay = `${index * 0.15}s`;

    const icon = pickFolderIcon(folder.folder);
    const alias = pickFolderAlias(folder.folder) ?? this.cleanFolderName(folder.folder);

    island.createDiv({ cls: "dw-island-icon" }).setText(icon);
    island.createDiv({ cls: "dw-island-name" }).setText(alias);
    island.createDiv({ cls: "dw-island-count" }).setText(
      `${folder.noteCount} 篇`
    );
    if (folder.subfolders > 0) {
      island.createDiv({ cls: "dw-island-sub" }).setText(
        `${folder.subfolders} 个子域`
      );
    }

    island.onClickEvent(() => {
      // 打开文件夹下第一篇笔记（或直接显示文件夹）
      const file = this.app.vault
        .getMarkdownFiles()
        .find((f) => f.path.startsWith(folder.folder + "/"));
      if (file) {
        this.app.workspace.openLinkText(file.path, "", false);
      } else {
        this.app.workspace.openLinkText(folder.folder, "", false);
      }
    });
  }

  private cleanFolderName(name: string): string {
    return name
      .replace(/知识库$/, "")
      .replace(/_\d+$/, "")
      .trim();
  }

  // ---- 右栏 ----

  private renderRightRail(body: HTMLElement, data: VaultData) {
    const rail = body.createDiv({ cls: "dw-dash-rail dw-dash-rail--right" });

    // 高优先级任务
    this.renderPriorityTasks(rail, data.topPriorityTasks, data.overdueTasks);

    // 决策建议摘要
    this.renderSuggestionsSummary(rail);

    // 标签云
    this.renderTagCloud(rail, data.tagCounts);

    // 决策日志
    this.renderDecisionLog(rail, data.logEntries);
  }

  private renderPriorityTasks(
    rail: HTMLElement,
    topTasks: Task[],
    overdue: Task[]
  ) {
    const card = rail.createDiv({ cls: "dw-dash-card" });
    card.createDiv({ cls: "dw-dash-card-title" }).setText("优先关注");

    if (overdue.length > 0) {
      const alert = card.createDiv({ cls: "dw-dash-alert" });
      alert.setText(`\u26A0\uFE0F ${overdue.length} 个任务已超期`);
    }

    const tasksToShow = [...overdue, ...topTasks].slice(0, 5);
    if (tasksToShow.length === 0) {
      card.createDiv({ cls: "dw-dash-empty" }).setText("暂无高优先级任务");
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

  private renderSuggestionsSummary(rail: HTMLElement) {
    const card = rail.createDiv({ cls: "dw-dash-card" });
    card.createDiv({ cls: "dw-dash-card-title" }).setText("决策建议");

    const suggestions = this.plugin.getLastSuggestions();

    if (suggestions.length === 0) {
      const empty = card.createDiv({ cls: "dw-dash-empty" });
      empty.setText("点击「运行分析」生成建议");
      const btn = card.createEl("button", {
        cls: "dw-dash-btn dw-dash-btn--full",
        text: "\u{1F9E0} 运行分析",
      });
      btn.onClickEvent(() => this.runAnalysis());
      return;
    }

    for (const sug of suggestions.slice(0, 4)) {
      const item = card.createDiv({ cls: "dw-sug-summary" });
      const dot = item.createDiv({ cls: "dw-sug-dot" });

      const typeColors: Record<string, string> = {
        "link-suggestion": "var(--text-accent)",
        "missing-link": "var(--text-accent)",
        "task-order": "var(--color-green, var(--text-success))",
        "priority-adjust": "var(--text-error)",
      };
      dot.style.background = typeColors[sug.type] ?? "var(--text-muted)";

      item.createDiv({ cls: "dw-sug-text" }).setText(sug.title);

      // 忽略按钮（×）：仅移除建议，不打开笔记
      const dismissBtn = item.createDiv({ cls: "dw-sug-dismiss-btn" });
      dismissBtn.setText("\u00D7");
      dismissBtn.onClickEvent((e: MouseEvent) => {
        e.stopPropagation();
        this.plugin.dismissSuggestion(sug);
      });

      // 点击建议项 = 采纳（打开笔记 + 移除建议）
      item.onClickEvent(() => {
        if (sug.relatedNotes.length > 0) {
          this.app.workspace.openLinkText(sug.relatedNotes[0], "", false);
        }
        this.plugin.dismissSuggestion(sug);
      });
    }
  }

  private renderTagCloud(rail: HTMLElement, tagCounts: Map<string, number>) {
    const card = rail.createDiv({ cls: "dw-dash-card" });
    card.createDiv({ cls: "dw-dash-card-title" }).setText("标签云");

    if (tagCounts.size === 0) {
      card.createDiv({ cls: "dw-dash-empty" }).setText("暂无标签");
      return;
    }

    const sorted = [...tagCounts.entries()].sort((a, b) => b[1] - a[1]);
    const maxCount = sorted[0]?.[1] ?? 1;
    const cloud = card.createDiv({ cls: "dw-tag-cloud" });

    for (const [tag, count] of sorted.slice(0, 30)) {
      const ratio = count / maxCount;
      const sizeClass =
        ratio > 0.7 ? "xl" : ratio > 0.4 ? "lg" : ratio > 0.2 ? "md" : "sm";

      const tagEl = cloud.createSpan({
        cls: `dw-cloud-tag dw-cloud-tag--${sizeClass}`,
      });
      tagEl.setText(tag);
      tagEl.onClickEvent(() => {
        this.app.internalPlugins.executeCommandById("global-search:open");
        setTimeout(() => {
          const searchEl = document.querySelector(
            ".search-input-container input"
          ) as HTMLInputElement;
          if (searchEl) {
            searchEl.value = `#${tag}`;
            searchEl.dispatchEvent(new Event("input"));
          }
        }, 100);
      });
    }
  }

  private renderDecisionLog(rail: HTMLElement, entries: DecisionLogEntry[]) {
    const card = rail.createDiv({ cls: "dw-dash-card" });
    card.createDiv({ cls: "dw-dash-card-title" }).setText("决策日志");

    if (entries.length === 0) {
      card.createDiv({ cls: "dw-dash-empty" }).setText("暂无分析记录");
      return;
    }

    for (const entry of entries) {
      const item = card.createDiv({ cls: "dw-log-entry" });

      const time = new Date(entry.ts);
      const timeStr = `${time.getMonth() + 1}/${time.getDate()} ${String(time.getHours()).padStart(2, "0")}:${String(time.getMinutes()).padStart(2, "0")}`;

      item.createDiv({ cls: "dw-log-time" }).setText(timeStr);
      item.createDiv({ cls: "dw-log-count" }).setText(
        `${entry.suggestions} 条建议`
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

  private renderBottomNav(container: HTMLElement) {
    const nav = container.createDiv({ cls: "dw-dash-nav" });

    const items: { icon: string; label: string; onClick: () => void; active?: boolean }[] = [
      {
        icon: "\u{1F331}",
        label: "仪表板",
        onClick: () => {},
        active: true,
      },
      {
        icon: "\u{1F4CB}",
        label: "看板",
        onClick: () => this.plugin.activateBoardView(),
      },
      {
        icon: "\u{1F9E0}",
        label: "分析",
        onClick: () => this.runAnalysis(),
      },
      {
        icon: "\u{1F4DD}",
        label: "加任务",
        onClick: () => this.openTaskInput(),
      },
      {
        icon: "\u2699\uFE0F",
        label: "设置",
        onClick: () => {
          this.app.setting.openTab();
          this.app.setting.openTabById("decision-workbench");
        },
      },
    ];

    for (const item of items) {
      const btn = nav.createDiv({ cls: "dw-nav-item" });
      if (item.active) btn.addClass("dw-nav-item--active");
      btn.createDiv({ cls: "dw-nav-icon" }).setText(item.icon);
      btn.createDiv({ cls: "dw-nav-label" }).setText(item.label);
      btn.onClickEvent(item.onClick);
    }
  }

  // ============================================================
  // 操作
  // ============================================================

  private async runAnalysis() {
    new Notice("正在分析...");
    const suggestions = await this.plugin.decisionEngine.analyze();
    this.plugin.setLastSuggestions(suggestions);
    new Notice(`分析完成，生成 ${suggestions.length} 条建议`);
    this.render();
  }

  private openTaskInput() {
    (this.app as any).commands.executeCommandById(
      "decision-workbench:add-task-from-text"
    );
  }

  private async openRulesFile() {
    const file = this.app.vault.getAbstractFileByPath("decision-rules.md");
    if (file && file instanceof TFile) {
      await this.app.workspace.openLinkText("decision-rules.md", "", false);
    } else {
      new Notice("规则文件未创建，请在设置中创建");
    }
  }

  // ============================================================
  // 事件
  // ============================================================

  private registerEvents() {
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
}
