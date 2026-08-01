"""Step 4 — 长期记忆：写入用户事实并召回。"""
from __future__ import annotations

from memory_store import add_memory, search_memory


def main() -> None:
    print("写入长期记忆...")
    add_memory("用户偏好 Python 3.11，禁用 pandas。")
    add_memory("项目负责人是小红，下周上线。")
    add_memory("用户喜欢带引用的回答。")

    print("\n召回测试：")
    for q in ["用哪个 Python 版本？", "谁负责项目？", "回答时要注意什么？"]:
        hits = search_memory(q)
        print(f"  Q: {q}")
        for h in hits:
            print(f"    -> {h}")

    print("\n记忆已持久化到 .stage9_memory.json，跨会话可用。")


if __name__ == "__main__":
    main()
