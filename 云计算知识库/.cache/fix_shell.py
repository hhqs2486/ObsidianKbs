# -*- coding: utf-8 -*-
import os, json
import fitz

CACHE = r"C:\Users\liang\ObsidianVault\云计算知识库\.cache"
FOLDER = r"E:\云原生大礼包（资料）\11.PDF书籍&面试题\电子书\249个Shell脚本"

MISS = {
    "shell-249":        "1,【强推】249个拿来即用shell脚本.pdf",
    "shell-rumen-note": "2,Shell脚本编程入门笔记.pdf",
    "shell-base":       "3,Shell编程基础.pdf",
    "shell-spec":       "4,shell编写规范.pdf",
    "shell-master":     "5,Shell从入门到精通.pdf",
    "shell-base2":      "6,Shell脚本基础.pdf",
    "shell-100cases":   "7，100个Linux+Shell脚本经典案例.pdf",
    "shell-study":      "Shell脚本学习指南.pdf",
}

for key, fn in MISS.items():
    path = os.path.join(FOLDER, fn)
    if not os.path.exists(path):
        print(f"[MISS] {key}: {path}")
        continue
    try:
        d = fitz.open(path)
        n = d.page_count
        parts = []
        for pno in range(n):
            try:
                parts.append(d.load_page(pno).get_text("text").replace("\x00", ""))
            except Exception:
                parts.append("")
        d.close()
        full_text = "\n".join(parts)
        d2 = os.path.join(CACHE, key)
        os.makedirs(d2, exist_ok=True)
        with open(os.path.join(d2, "full.txt"), "w", encoding="utf-8") as f:
            f.write(full_text)
        avg = (len(full_text) / n) if n else 0
        manifest = {"key": key, "pages": n, "chapters": [],
                    "avg_bytes_per_page": round(avg, 1), "type": "pdf",
                    "quality": "TEXT" if avg > 700 else ("MIXED" if avg > 150 else "SCANNED")}
        json.dump(manifest, open(os.path.join(d2, "manifest.json"), "w", encoding="utf-8"),
                  ensure_ascii=False, indent=2)
        print(f"[OK] {key:18s} pages={n:4d} avgB/pg={avg:7.1f} {manifest['quality']}")
    except Exception as e:
        print(f"[ERR] {key}: {e}")
print("=== 补抽完成 ===")
