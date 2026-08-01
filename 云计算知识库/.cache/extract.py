import fitz, os, re, sys, json

VAULT = r"C:\Users\liang\ObsidianVault\云计算知识库\.cache"
BOOKS = [
    (r"E:\k8s学习书籍\Kubernetes零基础快速入门2021.3.pdf", "k8s-intro"),
    (r"E:\k8s学习书籍\Kubernetes权威指南_从Docker到Kubernetes实践全接触(第5版).pdf", "k8s-bible"),
    (r"E:\k8s学习书籍\Kubernetes修炼手册.pdf", "k8s-handbook"),
    (r"E:\k8s学习书籍\OpenStack-Rocky高可用集群部署.pdf", "openstack"),
    (r"E:\k8s学习书籍\Prometheus监控实战 (云计算与虚拟化技术丛书) .pdf", "prometheus"),
]

def safe(name):
    name = re.sub(r'[\\/:*?"<>|#]', '_', name)
    name = re.sub(r'\s+', ' ', name).strip()
    return name[:60]

def extract(path, key):
    out_dir = os.path.join(VAULT, key)
    os.makedirs(out_dir, exist_ok=True)
    doc = fitz.open(path)
    n = doc.page_count
    print(f"[{key}] pages={n} size={os.path.getsize(path)//1024//1024}MB", flush=True)

    # TOC -> chapter splits
    toc = doc.get_toc()
    toc = [t for t in toc if t[0] <= 2]  # use depth 1-2
    # build (title, start_page) sorted
    chapters = []
    for lvl, title, page in toc:
        chapters.append((lvl, title, max(0, page-1)))  # 0-based
    chapters.sort(key=lambda x: x[2])

    # full text
    full = []
    for i in range(n):
        full.append(doc[i].get_text())
    full_text = "\n".join(full)
    with open(os.path.join(out_dir, "full.txt"), "w", encoding="utf-8") as f:
        f.write(full_text)
    print(f"[{key}] full.txt = {len(full_text)//1024}KB", flush=True)

    # split by top-level chapters (depth==1), fallback to depth==2
    splits = [c for c in chapters if c[0] == 1] or [c for c in chapters if c[0] == 2]
    manifest = []
    if splits:
        # add synthetic end
        bounds = [(title, start) for _, title, start in splits]
        for idx, (title, start) in enumerate(bounds):
            end = bounds[idx+1][1] if idx+1 < len(bounds) else n
            chunk = "\n".join(full[start:end])
            fname = f"ch{idx+1:02d}_{safe(title)}.txt"
            with open(os.path.join(out_dir, fname), "w", encoding="utf-8") as f:
                f.write(chunk)
            manifest.append({"file": fname, "title": title, "pages": f"{start+1}-{end}", "chars": len(chunk)})
        print(f"[{key}] split into {len(manifest)} chapters", flush=True)
    else:
        print(f"[{key}] NO TOC -> single full.txt", flush=True)

    doc.close()
    # save manifest
    with open(os.path.join(out_dir, "manifest.json"), "w", encoding="utf-8") as f:
        json.dump({"pages": n, "chapters": manifest}, f, ensure_ascii=False, indent=2)
    return len(manifest)

if __name__ == "__main__":
    for path, key in BOOKS:
        if not os.path.exists(path):
            print("MISSING", path); continue
        try:
            extract(path, key)
        except Exception as e:
            print("ERR", key, repr(e), flush=True)
    print("DONE", flush=True)
