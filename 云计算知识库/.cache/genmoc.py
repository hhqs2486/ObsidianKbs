import os, datetime

VAULT = r"C:\Users\liang\ObsidianKbs\云计算知识库"
MOC = os.path.join(VAULT, "50-🗺️索引MOC")

def notes_in(folder):
    root = os.path.join(VAULT, folder)
    out = []
    if os.path.isdir(root):
        for dp, _, fns in os.walk(root):
            for fn in fns:
                if fn.endswith(".md"):
                    out.append(fn[:-3])
    return sorted(out)

# ---- 各主题地图 ----
maps = {
    "容器与K8s地图": "10-🧠核心概念/容器与K8s",
    "OpenStack与虚拟化地图": "10-🧠核心概念/OpenStack与虚拟化",
    "监控与可观测性地图": "10-🧠核心概念/监控与可观测性",
    "网络存储与CI-CD地图": "10-🧠核心概念/网络存储与CI-CD",
    "基础与工具地图": "10-🧠核心概念/基础与工具",
}

for title, folder in maps.items():
    cards = notes_in(folder)
    lines = [
        "---",
        "类型: MOC",
        "tags: [MOC]",
        f"创建: 2026-07-21",
        "---",
        "",
        f"# {title}",
        "",
        "> 本主题全部概念卡索引。只放链接，点进去看详情。",
        "",
        f"**共 {len(cards)} 张概念卡**",
        "",
    ]
    # 按首字母/中文分组（简单二分：英文在前，中文在后）
    en = [c for c in cards if ord(c[0]) < 128]
    zh = [c for c in cards if ord(c[0]) >= 128]
    for grp, label in [(en, "A–Z"), (zh, "中文")]:
        if grp:
            lines.append(f"## {label}")
            for c in grp:
                lines.append(f"- [[{c}]]")
            lines.append("")
    open(os.path.join(MOC, title + ".md"), "w", encoding="utf-8").write("\n".join(lines))
    print("wrote", title, len(cards), "cards")

# ---- 开始这里 ----
tutorials = notes_in("20-📚资料库/教程")
projects = notes_in("30-🛠️项目实战")

start = [
    "---",
    "类型: MOC",
    "tags: [MOC]",
    "创建: 2026-07-21",
    "---",
    "",
    "# 开始这里 🚀",
    "",
    "> 云计算知识库总入口。新笔记出来后，回来加一条 `[[链接]]`，图谱才不会断。",
    "",
    "## 🧭 按主题地图走",
    "- [[容器与K8s地图]]（Pod / Deployment / Service / 控制平面 / 网络 / 安全 / Helm / Service Mesh）",
    "- [[OpenStack与虚拟化地图]]（Nova / Neutron / Cinder / Keystone / Ceph / 高可用集群）",
    "- [[监控与可观测性地图]]（Prometheus / PromQL / Alertmanager / Grafana）",
    "- [[网络存储与CI-CD地图]]（华为云 / ECS / VPC / OBS / CCE / Azure DevOps / Git / CI-CD）",
    "- [[基础与工具地图]]（sed / awk / 正则 / 网络爬虫 / 爬虫框架）",
    "",
    "## 📚 教程总览（来自 17 本资料）",
]
for t in tutorials:
    start.append(f"- [[{t}]]")
start += [
    "",
    "## 🛠️ 项目实战",
]
for p in projects:
    start.append(f"- [[{p}]]")
start += [
    "",
    "## 💡 提示",
    "- 不会用提示词？看 `99-📒提示词库/AI提示词库.md`",
    "- 笔记怎么写？看 `90-⚙️模板`",
    "- 卡住时：把现象贴给 AI，用排错助手提示词反推原因（可落入 `40-🐞问题排查`）",
    "- 中枢概念：[[Kubernetes]] [[云原生]] [[容器编排]] [[高可用]] [[可观测性]] [[微服务]]",
    "",
]
open(os.path.join(MOC, "开始这里.md"), "w", encoding="utf-8").write("\n".join(start))
print("wrote 开始这里, tutorials=", len(tutorials), "projects=", len(projects))
