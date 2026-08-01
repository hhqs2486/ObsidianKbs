"""
批量分析所有知识库 / Batch Vault Analyzer
============================================
一键扫描三个 Obsidian 知识库，输出汇总。
"""

import subprocess
import sys
from pathlib import Path


VAULTS = [
    "C:/Users/liang/ObsidianKbs/Python知识库",
    "C:/Users/liang/ObsidianKbs/云计算知识库",
    "C:/Users/liang/ObsidianKbs/嵌入式软硬件开发知识库",
]

SCRIPT_DIR = Path(__file__).parent
ANALYZER = SCRIPT_DIR / "analyze_vault.py"


def main():
    for vault in VAULTS:
        vault_path = Path(vault)
        if not vault_path.exists():
            print(f"[SKIP] 路径不存在: {vault}")
            continue

        print(f"\n{'='*70}")
        subprocess.run(
            [sys.executable, str(ANALYZER), vault],
            check=False,
        )


if __name__ == "__main__":
    main()
