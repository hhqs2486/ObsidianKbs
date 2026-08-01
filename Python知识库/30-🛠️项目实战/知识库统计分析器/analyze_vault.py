"""
知识库统计分析器 / Vault Stats Analyzer
==========================================
扫描 Obsidian vault，输出：笔记总数、分类统计、标签分布、
断链检测、无标签笔记、最近修改。

用法:
    python analyze_vault.py <vault路径>

示例:
    python analyze_vault.py "C:/Users/liang/ObsidianKbs/Python知识库"
"""

import os
import re
import sys
from pathlib import Path
from datetime import datetime
from collections import Counter, defaultdict

import yaml
from rich.console import Console
from rich.table import Table
from rich.panel import Panel
from rich.tree import Tree


console = Console()

# ---------- 配置 ----------
IGNORE_DIRS = {".obsidian", ".git", ".trash", "__pycache__", ".DS_Store"}
FRONTMATTER_PATTERN = re.compile(r"^---\s*\n(.*?)\n---", re.DOTALL)
CODE_BLOCK_PATTERN = re.compile(r"```[\s\S]*?```")
INLINE_CODE_PATTERN = re.compile(r"`[^`]+`")
WIKILINK_PATTERN = re.compile(r"\[\[([^\]|#]+?)(?:\|[^\]]+)?\]\]")


def parse_frontmatter(text: str) -> dict:
    """从 Markdown 文本中提取 YAML frontmatter."""
    match = FRONTMATTER_PATTERN.match(text)
    if not match:
        return {}
    try:
        return yaml.safe_load(match.group(1)) or {}
    except yaml.YAMLError:
        return {}


def extract_wikilinks(text: str) -> list[str]:
    """提取所有 [[双链]] 的目标笔记名，排除代码块内的."""
    # 先去掉代码块和行内代码，避免误匹配
    clean = CODE_BLOCK_PATTERN.sub("", text)
    clean = INLINE_CODE_PATTERN.sub("", clean)
    links = WIKILINK_PATTERN.findall(clean)
    # 过滤掉明显不是笔记名的（含空格过多、含特殊协议等）
    return [
        l.strip()
        for l in links
        if l.strip() and " " not in l and "://" not in l and not l.startswith("!")
    ]


def scan_vault(vault_path: str) -> dict:
    """扫描整个 vault，返回结构化数据."""
    vault = Path(vault_path)
    stats = {
        "vault_name": vault.name,
        "vault_path": str(vault),
        "total_notes": 0,
        "by_directory": defaultdict(int),
        "tags": Counter(),
        "all_wikilinks": [],
        "note_wikilinks": {},       # {note_stem: [linked_stems]}
        "note_tags": {},            # {note_stem: [tags]}
        "note_paths": {},           # {note_stem: full_path}  所有存在的笔记 stem
        "note_modified": {},        # {note_stem: mtime}
        "notes_without_tags": [],
        "notes_without_links": [],
    }

    for root, dirs, files in os.walk(vault_path):
        # 过滤忽略目录
        dirs[:] = [d for d in dirs if d not in IGNORE_DIRS]

        rel_root = Path(root).relative_to(vault)
        dir_key = str(rel_root) if str(rel_root) != "." else "(根目录)"

        for f in files:
            if not f.endswith(".md"):
                continue

            filepath = Path(root) / f
            stem = filepath.stem     # 不含 .md 的文件名
            # 用相对路径做唯一区分（同名笔记在不同目录）
            unique_key = str(Path(rel_root) / stem) if str(rel_root) != "." else stem
            stats["note_paths"][stem] = filepath     # stem → 只用第一个出现的
            stats["note_modified"][stem] = max(
                stats["note_modified"].get(stem, 0),
                os.path.getmtime(filepath),
            )
            stats["total_notes"] += 1
            stats["by_directory"][dir_key] += 1

            try:
                text = filepath.read_text(encoding="utf-8")
            except Exception:
                continue

            # 解析 frontmatter
            fm = parse_frontmatter(text)
            tags = fm.get("tags", [])
            if isinstance(tags, str):
                tags = [tags]
            stats["note_tags"][stem] = tags
            for t in tags:
                stats["tags"][t] += 1

            if not tags:
                stats["notes_without_tags"].append(stem)

            # 提取双链
            links = extract_wikilinks(text)
            stats["note_wikilinks"][stem] = links
            stats["all_wikilinks"].extend(links)

    return stats


def find_broken_links(stats: dict) -> list[tuple[str, str]]:
    """找出指向不存在笔记的双链."""
    existing = stats["note_paths"].keys()
    broken = []
    for source, targets in stats["note_wikilinks"].items():
        for t in targets:
            if t not in existing:
                broken.append((source, t))
    return broken


def find_orphan_notes(stats: dict) -> list[str]:
    """找出没有任何笔记链接到它的笔记（孤立笔记）."""
    all_targets = set()
    for targets in stats["note_wikilinks"].values():
        all_targets.update(targets)
    existing = set(stats["note_paths"].keys())
    # 被链接过的笔记
    linked_to = existing & all_targets
    orphans = existing - linked_to
    return sorted(orphans)


def get_top_dir(dir_key: str) -> str:
    """取目录顶层分类名，如 '10-🧠核心概念/语言核心' -> '10-🧠核心概念'"""
    return dir_key.split("/")[0] if "/" in dir_key else dir_key


def display_report(stats: dict, broken_links: list, orphan_notes: list):
    """用 rich 输出美化报告."""

    # ---- 面板头部 ----
    console.print()
    console.rule(f"[bold cyan]{stats['vault_name']} 知识库统计报告")
    console.print(f"路径: [dim]{stats['vault_path']}[/dim]")
    console.print(f"分析时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    console.print()

    # ---- 总览 ----
    overview = Table(title="📊 总览", title_style="bold white")
    overview.add_column("指标", style="cyan")
    overview.add_column("数值", style="green", justify="right")
    overview.add_row("总笔记数", str(stats["total_notes"]))
    overview.add_row("标签种类", str(len(stats["tags"])))
    overview.add_row("无标签笔记", str(len(stats["notes_without_tags"])))
    overview.add_row("断链数", str(len(broken_links)))
    overview.add_row("孤立笔记", str(len(orphan_notes)))
    console.print(overview)
    console.print()

    # ---- 按目录分类 ----
    # 合并到一级目录
    top_dirs = defaultdict(int)
    for d, count in stats["by_directory"].items():
        top_dirs[get_top_dir(d)] += count

    dir_table = Table(title="📁 按目录分布", title_style="bold white")
    dir_table.add_column("目录", style="cyan")
    dir_table.add_column("笔记数", style="green", justify="right")
    dir_table.add_column("占比", style="yellow", justify="right")
    dir_table.add_column("柱状图", style="magenta")
    total = stats["total_notes"]
    for d in sorted(top_dirs.keys()):
        count = top_dirs[d]
        pct = f"{count/total*100:.1f}%"
        bar = "◆" * max(1, count // max(1, total // 40))
        dir_table.add_row(d, str(count), pct, bar)
    console.print(dir_table)
    console.print()

    # ---- Top 10 标签 ----
    tag_table = Table(title="🏷️ Top 10 标签", title_style="bold white")
    tag_table.add_column("标签", style="cyan")
    tag_table.add_column("出现次数", style="green", justify="right")
    for tag, count in stats["tags"].most_common(10):
        tag_table.add_row(tag, str(count))
    console.print(tag_table)
    console.print()

    # ---- 断链 ----
    if broken_links:
        bl_table = Table(title="🔗 断链 (前 10)", title_style="bold red")
        bl_table.add_column("来源笔记", style="yellow")
        bl_table.add_column("→ 链接到(不存在)", style="red")
        for src, dst in broken_links[:10]:
            bl_table.add_row(src, dst)
        if len(broken_links) > 10:
            bl_table.add_row("...", f"还有 {len(broken_links)-10} 条断链")
        console.print(bl_table)
        console.print()
    else:
        console.print("[green]✅ 没有断链！[/green]")
        console.print()

    # ---- 无标签笔记 ----
    if stats["notes_without_tags"]:
        untagged = stats["notes_without_tags"]
        console.print(f"[yellow]⚠️  无标签笔记: {len(untagged)} 篇[/yellow]")
        if len(untagged) <= 15:
            for n in untagged:
                console.print(f"  [dim]- {n}[/dim]")
        else:
            for n in untagged[:10]:
                console.print(f"  [dim]- {n}[/dim]")
            console.print(f"  [dim]...还有 {len(untagged)-10} 篇[/dim]")
        console.print()

    # ---- 最近修改 ----
    recent = sorted(stats["note_modified"].items(), key=lambda x: x[1], reverse=True)[:5]
    rec_table = Table(title="🕐 最近修改 (Top 5)", title_style="bold white")
    rec_table.add_column("笔记", style="cyan")
    rec_table.add_column("修改时间", style="green")
    for stem, mtime in recent:
        dt = datetime.fromtimestamp(mtime).strftime("%Y-%m-%d %H:%M")
        rec_table.add_row(stem, dt)
    console.print(rec_table)

    console.rule("[bold cyan]报告结束")


def main():
    if len(sys.argv) < 2:
        console.print("[red]用法: python analyze_vault.py <vault路径>[/red]")
        sys.exit(1)

    vault_path = sys.argv[1]
    if not os.path.isdir(vault_path):
        console.print(f"[red]路径不存在: {vault_path}[/red]")
        sys.exit(1)

    with console.status("[cyan]正在扫描知识库..."):
        stats = scan_vault(vault_path)
        broken = find_broken_links(stats)
        orphans = find_orphan_notes(stats)

    display_report(stats, broken, orphans)


if __name__ == "__main__":
    main()
