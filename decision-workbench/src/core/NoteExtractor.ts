// ============================================================
// NoteExtractor — 笔记信息提取器
// ============================================================
// 从 Obsidian 笔记中提取结构化数据：
// - frontmatter 中的 task 元数据
// - 正文中的 - [ ] / - [x] 待办事项
// - > [!decision] callout 决策块
// - 标签集合
// - wikilink 关联笔记
// ============================================================

import { App, TFile } from "obsidian";
import {
  ExtractedData,
  Subtask,
  DecisionRecord,
  TaskFrontmatter,
} from "../types";
import { readTaskMeta, readNoteTags, readNoteLinks } from "../utils/frontmatter";

export class NoteExtractor {
  private app: App;

  constructor(app: App) {
    this.app = app;
  }

  /**
   * 从指定笔记中提取所有结构化数据
   */
  async extract(file: TFile): Promise<ExtractedData> {
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
  extractFromCache(file: TFile): ExtractedData {
    const taskMeta = readTaskMeta(this.app, file);
    const tags = readNoteTags(this.app, file);
    const links = readNoteLinks(this.app, file);
    return {
      taskMeta,
      subtasks: [],
      decisions: [],
      tags,
      links,
    };
  }

  /**
   * 从正文提取待办事项
   * 匹配: - [ ] 和 - [x] 格式
   */
  extractSubtasks(content: string): Subtask[] {
    const regex = /^(\s*)- \[([ xX])\]\s+(.+)$/gm;
    const tasks: Subtask[] = [];
    let match: RegExpExecArray | null;
    let index = 0;

    while ((match = regex.exec(content)) !== null) {
      tasks.push({
        id: `st-${Date.now().toString(36)}-${index++}`,
        title: match[3].trim(),
        done: match[2].toLowerCase() === "x",
      });
    }

    return tasks;
  }

  /**
   * 从正文提取决策 callout 块
   * 匹配: > [!decision] ... 或 > [!决策] ...
   */
  extractDecisions(content: string): DecisionRecord[] {
    const decisions: DecisionRecord[] = [];
    const lines = content.split("\n");
    let inDecision = false;
    let decisionContent = "";
    let startLine = -1;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // 检测 callout 开始
      const calloutMatch = line.match(
        /^>\s*\[!(decision|决策|conclusion|结论)\]/i
      );
      if (calloutMatch) {
        inDecision = true;
        decisionContent = "";
        startLine = i;

        // 提取 callout 标题后的内容
        const afterBracket = line.replace(
          /^>\s*\[!(decision|决策|conclusion|结论)\]\s*/i,
          ""
        );
        if (afterBracket.trim()) {
          decisionContent += afterBracket.trim() + "\n";
        }
        continue;
      }

      // callout 内的续行
      if (inDecision) {
        if (line.startsWith(">") || line.trim() === "") {
          decisionContent += line.replace(/^>\s?/, "") + "\n";
        } else {
          // callout 结束
          if (decisionContent.trim()) {
            decisions.push({
              content: decisionContent.trim(),
              sourceLine: startLine,
            });
          }
          inDecision = false;
          decisionContent = "";
        }
      }
    }

    // 文件末尾的未关闭 callout
    if (inDecision && decisionContent.trim()) {
      decisions.push({
        content: decisionContent.trim(),
        sourceLine,
      });
    }

    return decisions;
  }

  /**
   * 检测笔记是否包含任务相关内容
   */
  hasTaskContent(file: TFile): boolean {
    const data = this.extractFromCache(file);
    return (
      data.taskMeta !== null ||
      data.tags.length > 0 ||
      data.links.length > 0
    );
  }

  /**
   * 批量提取库中所有包含任务内容的笔记
   */
  async extractAllMarkdown(): Promise<
    { file: TFile; data: ExtractedData }[]
  > {
    const files = this.app.vault.getMarkdownFiles();
    const results: { file: TFile; data: ExtractedData }[] = [];

    for (const file of files) {
      const data = this.extractFromCache(file);
      if (data.taskMeta || data.tags.length > 0) {
        results.push({ file, data });
      }
    }

    return results;
  }
}
