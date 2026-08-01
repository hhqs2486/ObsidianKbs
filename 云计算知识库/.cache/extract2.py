import fitz, os, re, json

VAULT = r"C:\Users\liang\ObsidianVault\云计算知识库\.cache"
BOOKS = [
    (r"E:\k8s学习书籍\Ceph运维手册.pdf", "ceph"),
    (r"E:\k8s学习书籍\Helm学习指南-Kubernetes上的应用程序管理2021-09-01.pdf", "helm-guide"),
    (r"E:\k8s学习书籍\Kubernetes CKA真题解析.pdf", "cka-jiexi"),
    (r"E:\k8s学习书籍\Kubernetes CKA考题.pdf", "cka-kaoti"),
    (r"E:\k8s学习书籍\azure-DevOps.pdf", "azure-devops"),
    (r"E:\k8s学习书籍\sed与awk(修订第三版).pdf", "sed-awk"),
    (r"E:\k8s学习书籍\华为云服务工程师实验指导手册.pdf", "huawei-cloud"),
    (r"E:\k8s学习书籍\基于Kubernetes的容器云平台实战2018年9月.pdf", "k8s-platform"),
    (r"E:\k8s学习书籍\容器 SDN 技术与微服务架构实践.pdf", "sdn-microservice"),
    (r"E:\k8s学习书籍\开源容器云OpenShift构建基于Kubernetes的企业应用云平台www.ebook23.com.pdf", "openshift"),
    (r"E:\k8s学习书籍\自己动手写网络爬虫.pdf", "crawler"),
    (r"E:\k8s学习书籍\轻松玩转Kubernetes实验指导V2.0(华为云微认证系列)2021.pdf", "k8s-lab"),
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
    toc = doc.get_toc()
    toc = [t for t in toc if t[0] <= 2]
    chapters = [(lvl, title, max(0, page-1)) for lvl, title, page in toc]
    chapters.sort(key=lambda x: x[2])
    full = [doc[i].get_text() for i in range(n)]
    full_text = "\n".join(full)
    with open(os.path.join(out_dir, "full.txt"), "w", encoding="utf-8") as f:
        f.write(full_text)
    avg = len(full_text) // n if n else 0
    print(f"[{key}] full.txt={len(full_text)//1024}KB avg={avg}B/page -> {'TEXT' if avg>800 else 'SCANNED?' if avg<300 else 'MIXED'}", flush=True)
    splits = [c for c in chapters if c[0] == 1] or [c for c in chapters if c[0] == 2]
    manifest = []
    if splits:
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
    with open(os.path.join(out_dir, "manifest.json"), "w", encoding="utf-8") as f:
        json.dump({"pages": n, "chapters": manifest, "avg_bytes_per_page": avg}, f, ensure_ascii=False, indent=2)
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
