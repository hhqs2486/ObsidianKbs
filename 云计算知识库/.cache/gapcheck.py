import os, re, json

VAULT = r"C:\Users\liang\ObsidianKbs\云计算知识库"
SCAN = ["10-🧠核心概念", "20-📚资料库", "30-🛠️项目实战", "40-🐞问题排查", "50-🗺️索引MOC"]

# existing note basenames (link targets resolve by basename in Obsidian)
existing = set()
for d in SCAN:
    root = os.path.join(VAULT, d)
    if not os.path.isdir(root): continue
    for dp, _, fns in os.walk(root):
        for fn in fns:
            if fn.endswith(".md"):
                existing.add(fn[:-3])

# collect links
link_re = re.compile(r"\[\[([^\]]+)\]\]")
links = {}  # target -> set of files containing it
for d in SCAN:
    root = os.path.join(VAULT, d)
    if not os.path.isdir(root): continue
    for dp, _, fns in os.walk(root):
        for fn in fns:
            if not fn.endswith(".md"): continue
            p = os.path.join(dp, fn)
            try:
                txt = open(p, encoding="utf-8").read()
            except Exception:
                continue
            for m in link_re.findall(txt):
                target = m.split("|")[0].split("#")[0].strip()
                if not target:
                    continue
                links.setdefault(target, set()).add(fn)

# gaps
gaps = {t: sorted(v) for t, v in links.items() if t not in existing}
print("existing notes:", len(existing))
print("distinct link targets:", len(links))
print("BROKEN LINKS (linked but no file):", len(gaps))
for t in sorted(gaps):
    print(f"  [[{t}]]  <- in {len(gaps[t])} file(s): {gaps[t][:6]}")

# islands (files never linked)
referenced = set(links.keys())
islands = sorted(existing - referenced - set(gaps.keys()))
print("\nISLANDS (files never linked, excluding gaps):", len(islands))
for i in islands:
    print("  ", i)

json.dump({"gaps": {k: list(v) for k,v in gaps.items()}, "islands": islands, "existing": sorted(existing)},
          open(os.path.join(VAULT, ".cache", "gaps.json"), "w", encoding="utf-8"),
          ensure_ascii=False, indent=2)
print("\nsaved gaps.json")
