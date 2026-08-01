"""
Step 2 — RAGFlow：上传文档并解析（ingest）

需要：RAGFlow 服务 + RAGFLOW_API_KEY + RAGFLOW_BASE_URL
未配置时会提示使用 Step 3 的本地 fallback。

运行：python step02_ragflow_ingest.py
"""

from __future__ import annotations

from common import ragflow_enabled
from ragflow_helper import SAMPLE_DOCS_DIR, get_or_create_dataset, upload_sample_documents


def main() -> None:
    print("=== RAGFlow Ingest ===\n")
    print(f"样例文档目录: {SAMPLE_DOCS_DIR}")
    for path in sorted(SAMPLE_DOCS_DIR.glob("*.md")):
        print(f"  - {path.name}")

    if not ragflow_enabled():
        print(
            "\n[跳过] 未配置 RAGFlow。"
            "请复制 .env.example → .env，填写 RAGFLOW_BASE_URL 与 RAGFLOW_API_KEY。"
            "\nDocker 快速启动: https://github.com/infiniflow/ragflow"
            "\n\n未配置时 Step 3 会使用 sample_docs 本地关键词检索。"
        )
        return

    dataset = get_or_create_dataset()
    print(f"\nDataset: {dataset.name} (id={dataset.id})")

    # ✍️ 手写练习 2：改 upload 的文件列表，上传你自己的 md
    uploaded = upload_sample_documents(dataset)
    print(f"已上传 {len(uploaded)} 个文档，后台解析中（async_parse_documents）。")
    print("解析完成后运行: python step03_ragflow_retrieve.py")


if __name__ == "__main__":
    main()
