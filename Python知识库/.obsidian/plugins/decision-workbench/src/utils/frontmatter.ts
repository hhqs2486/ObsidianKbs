// ============================================================
// Frontmatter Read/Write Utilities
// ============================================================
// Obsidian 笔记 frontmatter 的安全读写工具。
// 回写时保留原有字段，仅更新 task 相关字段。
// ============================================================

import { App, TFile, parseYaml, stringifyYaml } from "obsidian";
import type { TaskFrontmatter } from "../types";

const TASK_KEY = "task";
const SUGGESTIONS_KEY = "decision-suggestions";

/**
 * 从文件缓存中安全读取 frontmatter task 字段
 */
export function readTaskMeta(app: App, file: TFile): TaskFrontmatter | null {
  const cache = app.metadataCache.getFileCache(file);
  if (!cache || !cache.frontmatter) return null;
  const task = cache.frontmatter[TASK_KEY];
  if (!task || typeof task !== "object") return null;
  return task as TaskFrontmatter;
}

/**
 * 从文件缓存中读取所有 frontmatter
 */
export function readAllFrontmatter(
  app: App,
  file: TFile
): Record<string, unknown> | null {
  const cache = app.metadataCache.getFileCache(file);
  if (!cache || !cache.frontmatter) return null;
  return cache.frontmatter as Record<string, unknown>;
}

/**
 * 读取笔记的所有标签（含 frontmatter tags 和行内 #tag）
 */
export function readNoteTags(app: App, file: TFile): string[] {
  const cache = app.metadataCache.getFileCache(file);
  if (!cache) return [];
  const tags: string[] = [];
  if (cache.frontmatter?.tags) {
    const fmTags = cache.frontmatter.tags;
    if (Array.isArray(fmTags)) {
      tags.push(...fmTags.map((t: unknown) => String(t)));
    } else if (typeof fmTags === "string") {
      tags.push(fmTags);
    }
  }
  if (cache.tags) {
    for (const t of cache.tags) {
      if (!tags.includes(t.tag)) tags.push(t.tag);
    }
  }
  return tags;
}

/**
 * 读取笔记的所有 wikilink 目标
 */
export function readNoteLinks(app: App, file: TFile): string[] {
  const cache = app.metadataCache.getFileCache(file);
  if (!cache || !cache.links) return [];
  return cache.links
    .map((l) => l.link)
    .filter((link, idx, arr) => arr.indexOf(link) === idx);
}

/**
 * 生成唯一任务 ID
 */
export function generateTaskId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).slice(2, 8);
  return `task-${timestamp}${random}`;
}

/**
 * 回写 frontmatter 到笔记文件。
 * 保留原有所有字段，仅更新 task 和 decision-suggestions 字段。
 *
 * 此函数手动解析 YAML 而非使用 Obsidian 的 processFrontmatter，
 * 因为我们需要精细控制回写格式。
 */
export async function updateFrontmatter(
  app: App,
  file: TFile,
  updates: {
    task?: TaskFrontmatter;
    suggestions?: string[];
    suggestionsGeneratedAt?: string;
  }
): Promise<void> {
  const content = await app.vault.read(file);
  const { frontmatter, body, start, end } = splitFrontmatter(content);

  let updatedFm: Record<string, unknown> = {};
  if (frontmatter) {
    try {
      updatedFm = parseYaml(frontmatter) as Record<string, unknown>;
    } catch {
      updatedFm = {};
    }
  }

  if (updates.task) {
    const existing = (updatedFm[TASK_KEY] ?? {}) as Record<string, unknown>;
    updatedFm[TASK_KEY] = { ...existing, ...updates.task };
  }

  if (updates.suggestions !== undefined) {
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

  const yamlStr = stringifyYaml(updatedFm).trim();
  const newContent =
    yamlStr.length > 0
      ? `---\n${yamlStr}\n---\n${body}`
      : body;

  await app.vault.modify(file, newContent);
}

/**
 * 将文件内容拆分为 frontmatter 和正文
 */
function splitFrontmatter(content: string): {
  frontmatter: string | null;
  body: string;
  start: number;
  end: number;
} {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (match) {
    return {
      frontmatter: match[1],
      body: match[2],
      start: 0,
      end: match[1].length + 8,
    };
  }
  return {
    frontmatter: null,
    body: content,
    start: -1,
    end: -1,
  };
}
