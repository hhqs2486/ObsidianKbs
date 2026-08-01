// ============================================================
// Similarity & Association Strength Utilities
// ============================================================
// 计算笔记之间的关联强度，用于自动建议关联笔记。
// 公式: similarity = tags_jaccard * 0.5 + link_distance * 0.3 + co_ref * 0.2
// ============================================================

/**
 * 计算两个集合的 Jaccard 相似度
 */
export function jaccardSimilarity<T>(setA: T[], setB: T[]): number {
  if (setA.length === 0 && setB.length === 0) return 0;
  const a = new Set(setA);
  const b = new Set(setB);
  let intersection = 0;
  for (const item of a) {
    if (b.has(item)) intersection++;
  }
  const union = a.size + b.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

/**
 * 标签相似度（支持嵌套标签的层级匹配）
 * 例: "PCB设计/电源" 和 "PCB设计/信号" 的父标签都是 "PCB设计"
 */
export function tagSimilarity(tagsA: string[], tagsB: string[]): number {
  if (tagsA.length === 0 || tagsB.length === 0) return 0;

  // 精确匹配
  const exactScore = jaccardSimilarity(tagsA, tagsB);

  // 父标签匹配（取每对标签的最长公共前缀）
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

/**
 * 最长公共前缀（以 / 分隔的标签段）
 */
function longestCommonPrefix(a: string, b: string): string {
  const partsA = a.split("/");
  const partsB = b.split("/");
  const common: string[] = [];
  for (let i = 0; i < Math.min(partsA.length, partsB.length); i++) {
    if (partsA[i] === partsB[i]) {
      common.push(partsA[i]);
    } else {
      break;
    }
  }
  return common.join("/");
}

/**
 * 链接距离倒数
 * 如果 A 直接链接 B，距离 = 1，倒数 = 1.0
 * 如果 A 通过 1 个中间节点链接 B，距离 = 2，倒数 = 0.5
 */
export function linkDistanceInverse(
  linksA: string[],
  linksB: string[],
  notePathA: string,
  notePathB: string
): number {
  // 直接互链
  if (linksA.includes(notePathB) || linksB.includes(notePathA)) {
    return 1.0;
  }
  // 有共同链接目标（距离 2）
  const common = linksA.filter((l) => linksB.includes(l));
  if (common.length > 0) {
    return 0.5;
  }
  return 0;
}

/**
 * 共同被引用次数（归一化）
 */
export function coReferenceScore(
  refByA: string[],
  refByB: string[]
): number {
  if (refByA.length === 0 || refByB.length === 0) return 0;
  const common = refByA.filter((r) => refByB.includes(r));
  const maxRefs = Math.max(refByA.length, refByB.length);
  return common.length / maxRefs;
}

/**
 * 综合关联强度
 */
export function associationStrength(
  tagsA: string[],
  tagsB: string[],
  linksA: string[],
  linksB: string[],
  notePathA: string,
  notePathB: string,
  refByA: string[] = [],
  refByB: string[] = []
): number {
  const tagScore = tagSimilarity(tagsA, tagsB) * 0.5;
  const linkScore = linkDistanceInverse(linksA, linksB, notePathA, notePathB) * 0.3;
  const refScore = coReferenceScore(refByA, refByB) * 0.2;
  return Math.min(1, tagScore + linkScore + refScore);
}

/**
 * 标签聚类：将笔记按标签相似度分组
 */
export interface TagCluster {
  tag: string;
  notes: { path: string; tags: string[] }[];
  unlinkedPairs: { from: string; to: string; similarity: number }[];
  similarity: number;
}

export function clusterByTags(
  notes: { path: string; tags: string[]; links: string[] }[]
): TagCluster[] {
  const tagToNotes: Record<string, { path: string; tags: string[]; links: string[] }[]> = {};

  for (const note of notes) {
    for (const tag of note.tags) {
      if (!tagToNotes[tag]) tagToNotes[tag] = [];
      tagToNotes[tag].push(note);
    }
  }

  const clusters: TagCluster[] = [];
  for (const [tag, noteList] of Object.entries(tagToNotes)) {
    if (noteList.length < 2) continue;

    const unlinkedPairs: TagCluster["unlinkedPairs"] = [];
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
              similarity: sim,
            });
          }
        }
      }
    }

    if (unlinkedPairs.length > 0) {
      const avgSim =
        unlinkedPairs.reduce((sum, p) => sum + p.similarity, 0) /
        unlinkedPairs.length;
      clusters.push({
        tag,
        notes: noteList.map((n) => ({ path: n.path, tags: n.tags })),
        unlinkedPairs,
        similarity: avgSim,
      });
    }
  }

  return clusters.sort((a, b) => b.similarity - a.similarity);
}
