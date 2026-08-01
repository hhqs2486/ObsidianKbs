"""Step 5 — 把 compaction + memory 接进裸 agent loop，对比长任务表现。

模拟 60 轮：每 10 轮做一次滑动窗口压缩，并随时从长期记忆召回用户偏好。
"""
from __future__ import annotations

from common import estimate_tokens
from compactor import sliding_window_compact
from memory_store import add_memory, search_memory

WINDOW_BUDGET = 800
ROUNDS = 60


def main() -> None:
    add_memory("用户偏好 Python 3.11，禁用 pandas。")

    print(f"模拟 {ROUNDS} 轮 agent loop（带 compaction + memory）\n")

    bare_tokens = 0
    history = [{"role": "system", "content": "你是 coding agent。", "anchor": True}]

    for i in range(1, ROUNDS + 1):
        user_turn = {"role": "user", "content": f"第 {i} 轮任务：实现模块 {i}。"}
        asst_turn = {"role": "assistant", "content": f"模块 {i} 完成，写了 30 行代码。"}
        history.append(user_turn)
        history.append(asst_turn)
        bare_tokens += estimate_tokens(user_turn["content"]) + estimate_tokens(asst_turn["content"])

        if i % 10 == 0:
            history = sliding_window_compact(history, WINDOW_BUDGET)
            prefs = search_memory("Python 版本")
            print(f"轮 {i:>2}: 压缩后历史 {len(history)} 条；召回偏好: {prefs}")

    final_tokens = sum(estimate_tokens(m["content"]) for m in history)
    print(f"\n无压缩累计 token: ~{bare_tokens}")
    print(f"有压缩最终 token: ~{final_tokens}")
    print(f"节省: ~{bare_tokens - final_tokens} token（长任务关键收益）")


if __name__ == "__main__":
    main()
