#!/usr/bin/env python3
"""gapcheck.py — 检测 Obsidian 仓库里的断链与孤岛笔记。

用法:
  python gapcheck.py --root <仓库根> [--scan 10-🧠核心概念 20-📚资料库 ...]

- 收集所有 [[link]]（支持 [[a|b]] 别名、[[a#sec]] 锚点），取 link 目标。
- 收集所有 .md 文件名（basename，不含扩展名）作为"已存在笔记"。
- 断链 gap = 被链接但没有对应文件的笔记。
- 孤岛 island = 存在但从未被任何笔记链接的文件（入口 MOC 属于正常孤岛）。

输出 gaps.json 并打印汇总。
"""
import os, re, argparse, json

LINK_RE = re.compile(r"\[\[([^\]]+)\]\]")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--root", required=True)
    ap.add_argument("--scan", nargs="*",
                    default=["10-🧠核心概念", "20-📚资料库", "30-🛠️项目实战",
                             "40-🐞问题排查", "50-🗺️索引MOC"])
    args = ap.parse_args()

    existing = set()
    for d in args.scan:
        root = os.path.join(args.root, d)
        if not os.path.isdir(root):
            continue
        for dp, _, fns in os.walk(root):
            for fn in fns:
                if fn.endswith(".md"):
                    existing.add(fn[:-3])

    links = {}
    for d in args.scan:
        root = os.path.join(args.root, d)
        if not os.path.isdir(root):
            continue
        for dp, _, fns in os.walk(root):
            for fn in fns:
                if not fn.endswith(".md"):
                    continue
                try:
                    txt = open(os.path.join(dp, fn), encoding="utf-8").read()
                except Exception:
                    continue
                for m in LINK_RE.findall(txt):
                    t = m.split("|")[0].split("#")[0].strip()
                    if t:
                        links.setdefault(t, set()).add(fn)

    gaps = {t: sorted(v) for t, v in links.items() if t not in existing}
    referenced = set(links.keys())
    islands = sorted(existing - referenced - set(gaps.keys()))

    print("existing notes:", len(existing))
    print("distinct link targets:", len(links))
    print("BROKEN LINKS:", len(gaps))
    for t in sorted(gaps):
        print(f"  [[{t}]]  <- {len(gaps[t])} file(s): {gaps[t][:6]}")
    print("ISLANDS:", len(islands))
    for i in islands:
        print("  ", i)

    out = os.path.join(args.root, ".cache", "gaps.json")
    os.makedirs(os.path.dirname(out), exist_ok=True)
    json.dump({"gaps": {k: list(v) for k, v in gaps.items()}, "islands": islands,
               "existing": sorted(existing)}, open(out, "w", encoding="utf-8"),
              ensure_ascii=False, indent=2)
    print("saved", out)


if __name__ == "__main__":
    main()
