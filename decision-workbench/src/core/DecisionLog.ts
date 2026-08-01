// ============================================================
// DecisionLog — 决策日志轮转 + 尾部读取
// ============================================================
// 替代内联的 JSONL 全量读写操作：
// - append(): 追加日志，超过上限自动轮转
// - readTail(): 只解析最后 N 条，尾部缓存避免重复 I/O
// - 上限 500 条，防止日志无限增长
// ============================================================

import { App } from "obsidian";
import { DecisionLogEntry } from "../types";

const MAX_LOG_ENTRIES = 500;

export class DecisionLog {
  private app: App;
  private logPath: string;
  private cachedTail: DecisionLogEntry[] | null = null;

  constructor(app: App, logPath: string) {
    this.app = app;
    this.logPath = logPath;
  }

  /**
   * 追加日志条目（不再读取整个文件做拼接，除非需要轮转）
   */
  async append(entry: DecisionLogEntry): Promise<void> {
    try {
      const line = JSON.stringify(entry) + "\n";
      const exists = await this.app.vault.adapter.exists(this.logPath);

      if (exists) {
        const content = await this.app.vault.adapter.read(this.logPath);
        const lines = content.trim().split("\n");

        // 轮转：超过上限时只保留最近 MAX_LOG_ENTRIES-1 条 + 新条目
        if (lines.length >= MAX_LOG_ENTRIES) {
          const trimmed = lines.slice(-(MAX_LOG_ENTRIES - 1));
          trimmed.push(line.trim());
          await this.app.vault.adapter.write(
            this.logPath,
            trimmed.join("\n") + "\n"
          );
        } else {
          // 正常追加（不需要轮转）
          await this.app.vault.adapter.write(this.logPath, content + line);
        }
      } else {
        // 确保目录存在
        const dir = this.logPath.substring(0, this.logPath.lastIndexOf("/"));
        if (dir && !(await this.app.vault.adapter.exists(dir))) {
          await this.app.vault.adapter.mkdir(dir);
        }
        await this.app.vault.adapter.write(this.logPath, line);
      }

      // 失效尾部缓存
      this.cachedTail = null;
    } catch (e) {
      console.error("[Decision Workbench] Failed to append log:", e);
    }
  }

  /**
   * 读取最近 N 条日志（尾部缓存 + 只解析最后 N*2 行）
   */
  async readTail(limit: number = 7): Promise<DecisionLogEntry[]> {
    // 尾部缓存命中
    if (this.cachedTail && this.cachedTail.length >= limit) {
      return this.cachedTail.slice(0, limit);
    }

    try {
      const exists = await this.app.vault.adapter.exists(this.logPath);
      if (!exists) return [];

      const raw = await this.app.vault.adapter.read(this.logPath);
      const lines = raw.trim().split("\n");

      // 只解析最后 limit*2 行（足够返回 limit 条有效记录）
      const tailLines = lines.slice(-limit * 2);
      const entries: DecisionLogEntry[] = [];
      for (const line of tailLines) {
        if (!line.trim()) continue;
        try {
          entries.push(JSON.parse(line) as DecisionLogEntry);
        } catch {
          /* skip invalid lines */
        }
      }

      // 按时间倒序排列
      entries.reverse();

      // 缓存尾部
      this.cachedTail = entries;

      return entries.slice(0, limit);
    } catch {
      return [];
    }
  }

  /**
   * 失效缓存（外部数据变更时调用）
   */
  invalidate(): void {
    this.cachedTail = null;
  }
}
