// ============================================================
// NlpParser — 自然语言任务解析器
// ============================================================
// 将一句话解析为结构化任务元数据：
// - 时间表达式 → 截止日期 (ISO 格式)
// - 优先级关键词 → high/medium/low
// - #标签 → tags 数组
// - 剩余文本 → 任务标题
//
// 示例：
//   "明天上午10点设计电源模块原理图 #PCB 紧急"
//   → { title: "设计电源模块原理图", due: "2026-08-02T10:00", priority: "high", tags: ["PCB"] }
// ============================================================

import { ParsedTaskInput, Priority } from "../types";

// 需要获取当前日期，用注入的方式以便测试
export function parseNaturalLanguage(
  input: string,
  now: Date = new Date()
): ParsedTaskInput {
  let remaining = input.trim();

  // 1. 提取 #标签
  const tags: string[] = [];
  const tagRegex = /#([^\s#]+)/g;
  let tagMatch: RegExpExecArray | null;
  while ((tagMatch = tagRegex.exec(remaining)) !== null) {
    tags.push(tagMatch[1]);
  }
  remaining = remaining.replace(tagRegex, "").trim();

  // 2. 解析优先级
  const { priority, cleaned } = parsePriority(remaining);
  remaining = cleaned;

  // 3. 解析时间表达式 → 截止日期
  const { due, cleaned: cleanedTime } = parseDateTime(remaining, now);
  remaining = cleanedTime;

  // 4. 清理多余空格，剩余文本作为标题
  const title = remaining
    .replace(/\s+/g, " ")
    .replace(/^[\s,，、]+|[\s,，、]+$/g, "")
    .trim();

  return {
    title: title || "未命名任务",
    due,
    priority,
    tags,
  };
}

// ============================================================
// 优先级解析
// ============================================================

function parsePriority(text: string): {
  priority: Priority;
  cleaned: string;
} {
  let priority: Priority = "medium";
  let cleaned = text;

  const highKeywords = [
    "紧急",
    "非常重要",
    "高优先级",
    "critical",
    "urgent",
    "asap",
    "立即",
    "马上",
  ];
  const lowKeywords = [
    "低优先级",
    "不急",
    "有空再做",
    "low priority",
    "不紧急",
    "随便什么时候",
  ];
  const mediumKeywords = ["一般", "中等优先级", "medium", "normal"];

  // 高优先级检测
  for (const kw of highKeywords) {
    if (cleaned.toLowerCase().includes(kw.toLowerCase())) {
      priority = "high";
      cleaned = cleaned.replace(new RegExp(kw, "gi"), "");
      break;
    }
  }

  // 低优先级检测
  if (priority === "medium") {
    for (const kw of lowKeywords) {
      if (cleaned.toLowerCase().includes(kw.toLowerCase())) {
        priority = "low";
        cleaned = cleaned.replace(new RegExp(kw, "gi"), "");
        break;
      }
    }
  }

  // 中优先级显式标记（如果没有检测到高/低，但有中等关键词）
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

// ============================================================
// 时间表达式解析
// ============================================================

function parseDateTime(
  text: string,
  now: Date
): { due: string | undefined; cleaned: string } {
  let due: string | undefined;
  let cleaned = text;

  // 匹配模式优先级：精确时间 > 相对时间 > 日期描述

  // 模式 1: "明天上午10点" / "后天下午3点" / "今天晚上8点"
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

  // 模式 2: "明天" / "后天" / "下周三" / "下个月5号" (无具体时间)
  const dayOnly = cleaned.match(
    /(今天|明天|后天|大后天|下周[一二三四五六日天]|\d{1,2}月\d{1,2}号|下个月\d{1,2}号|本周[一二三四五六日天]|这周末)/
  );
  if (dayOnly) {
    const dayWord = dayOnly[1];
    const targetDate = resolveDay(dayWord, now);
    targetDate.setHours(23, 59, 0, 0); // 默认当天截止
    due = toLocalISO(targetDate);
    cleaned = cleaned.replace(dayOnly[0], "");
    return { due, cleaned };
  }

  // 模式 3: "X天后" / "X周后" / "X月后"
  const relativeDays = cleaned.match(/(\d+)\s*(天|周|月)后/);
  if (relativeDays) {
    const num = parseInt(relativeDays[1], 10);
    const unit = relativeDays[2];
    const targetDate = new Date(now);
    if (unit === "天") targetDate.setDate(targetDate.getDate() + num);
    else if (unit === "周") targetDate.setDate(targetDate.getDate() + num * 7);
    else if (unit === "月") targetDate.setMonth(targetDate.getMonth() + num);
    targetDate.setHours(23, 59, 0, 0);
    due = toLocalISO(targetDate);
    cleaned = cleaned.replace(relativeDays[0], "");
    return { due, cleaned };
  }

  // 模式 4: "上午10点" / "下午3点" / "晚上8点" (今天)
  const timeToday = cleaned.match(
    /(上午|下午|晚上|中午|清晨|傍晚)?\s*(\d{1,2})\s*[点时:：]\s*(\d{1,2})?\s*(分)?/
  );
  if (timeToday) {
    const periodWord = timeToday[1] || "";
    const hour = parseInt(timeToday[2], 10);
    const minute = timeToday[3] ? parseInt(timeToday[3], 10) : 0;
    const targetDate = new Date(now);
    targetDate.setHours(adjustHourForPeriod(hour, periodWord), minute, 0, 0);
    // 如果时间已过，设为明天
    if (targetDate.getTime() < now.getTime()) {
      targetDate.setDate(targetDate.getDate() + 1);
    }
    due = toLocalISO(targetDate);
    cleaned = cleaned.replace(timeToday[0], "");
    return { due, cleaned };
  }

  return { due: undefined, cleaned };
}

// ============================================================
// 日期词解析
// ============================================================

function resolveDay(dayWord: string, now: Date): Date {
  const date = new Date(now);
  date.setHours(0, 0, 0, 0);

  if (dayWord === "今天") {
    // 不变
  } else if (dayWord === "明天") {
    date.setDate(date.getDate() + 1);
  } else if (dayWord === "后天") {
    date.setDate(date.getDate() + 2);
  } else if (dayWord === "大后天") {
    date.setDate(date.getDate() + 3);
  } else if (dayWord.startsWith("下周")) {
    const dayMap: Record<string, number> = {
      一: 1, 二: 2, 三: 3, 四: 4, 五: 5, 六: 6, 日: 0, 天: 0,
    };
    const dayChar = dayWord.charAt(2);
    const targetDay = dayMap[dayChar] ?? 0;
    const currentDay = date.getDay();
    let diff = targetDay - currentDay;
    if (diff <= 0) diff += 7; // 下周，至少 7 天后
    date.setDate(date.getDate() + diff);
  } else if (dayWord.startsWith("本周")) {
    const dayMap: Record<string, number> = {
      一: 1, 二: 2, 三: 3, 四: 4, 五: 5, 六: 6, 日: 0, 天: 0,
    };
    const dayChar = dayWord.charAt(2);
    const targetDay = dayMap[dayChar] ?? 0;
    const currentDay = date.getDay();
    let diff = targetDay - currentDay;
    if (diff < 0) diff += 7;
    date.setDate(date.getDate() + diff);
  } else if (dayWord === "这周末") {
    const currentDay = date.getDay();
    const diff = 6 - currentDay; // 周六
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
  } else if (dayWord.startsWith("下个月")) {
    const dayMatch = dayWord.match(/(\d{1,2})号/);
    const day = dayMatch ? parseInt(dayMatch[1], 10) : 1;
    date.setMonth(date.getMonth() + 1, day);
  }

  return date;
}

// ============================================================
// 工具函数
// ============================================================

function adjustHourForPeriod(hour: number, period: string): number {
  if (period === "下午" || period === "晚上" || period === "傍晚") {
    return hour < 12 ? hour + 12 : hour;
  }
  if (period === "中午") {
    return hour === 12 ? 12 : hour < 12 ? 12 : hour;
  }
  if (period === "清晨") {
    return hour >= 12 ? hour - 12 : hour;
  }
  // 上午 / 默认
  return hour;
}

function toLocalISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}
