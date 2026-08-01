"""Step 1 — 认识上下文窗口与 token 成本。

不调模型，纯演示：一个长会话如何把 token 推过预算。
"""
from __future__ import annotations

from common import estimate_tokens

BUDGET = 2000  # 假设的上下文预算（token）


def simulate_session(turns: int = 40) -> None:
    total = 0
    print(f"模拟 {turns} 轮对话，预算 = {BUDGET} token\n")
    for i in range(1, turns + 1):
        user_msg = f"用户：第 {i} 轮，帮我处理任务 {i} 的细节。"
        asst_msg = f"助手：好的，任务 {i} 已记录，正在执行第 {i} 步验证。"
        total += estimate_tokens(user_msg) + estimate_tokens(asst_msg)
        flag = "  <-- 超预算！需要压缩" if total > BUDGET else ""
        if i <= 3 or total > BUDGET:
            print(f"轮 {i:>2}: 累计 ~{total} token{flag}")
    print("\n结论：不压缩，长会话必然撑爆窗口；这就是 context compaction 存在的理由。")


def main() -> None:
    simulate_session()


if __name__ == "__main__":
    main()
