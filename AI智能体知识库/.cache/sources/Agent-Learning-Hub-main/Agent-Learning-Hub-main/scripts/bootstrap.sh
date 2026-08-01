#!/usr/bin/env bash
# One-shot bootstrap: deps + smoke tests for Agent Learning Hub stages.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"
VENV="$ROOT/.venv"

echo "=== Agent Learning Hub Bootstrap ==="
echo "Root: $ROOT"
echo

if ! command -v python3 >/dev/null 2>&1; then
  echo "ERROR: python3 not found"
  exit 1
fi

PY="${PYTHON:-python3}"
echo "Python: $($PY --version)"

if [[ ! -d "$VENV" ]]; then
  echo ">> Creating venv at .venv"
  "$PY" -m venv "$VENV"
fi
# shellcheck disable=SC1091
source "$VENV/bin/activate"
PY="$VENV/bin/python"
echo "Using venv: $PY"

install_req() {
  local dir="$1"
  if [[ -f "$dir/requirements.txt" ]]; then
    echo
    echo ">> Installing $dir/requirements.txt"
    "$PY" -m pip install -q -r "$dir/requirements.txt"
  fi
}

install_req stage-1
install_req stage-2
install_req stage-4
install_req stage-6

echo
echo ">> Stage 1 smoke: step01_chat.py (dry import)"
(cd stage-1 && "$PY" -c "import common, tools; print('stage-1 ok')")

echo
echo ">> Stage 5 smoke: skill validation"
(cd stage-5 && "$PY" step04_run_smoke_cases.py)

echo
echo ">> Stage 7 smoke: eval runner"
(cd stage-7 && "$PY" scripts/eval_runner.py --tasks evals/tasks.csv --out evals/results.csv)

echo
echo ">> Stage 7: HTML eval report"
(cd stage-7 && "$PY" scripts/render_eval_report.py --results evals/results.csv --out evals/report.html)

echo
echo ">> Progress CLI"
"$PY" scripts/hub_progress.py status

echo
echo "=== Bootstrap complete ==="
echo "Next:"
echo "  ./scripts/check_github_setup.sh"
echo "  python3 scripts/hub_progress.py --help"
echo "  python3 scripts/scaffold_skill.py --help"
