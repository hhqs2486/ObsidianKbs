#!/usr/bin/env bash
# Verify local git email matches GitHub contribution requirements.
set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

ok() { echo -e "${GREEN}✓${NC} $*"; }
warn() { echo -e "${YELLOW}!${NC} $*"; }
fail() { echo -e "${RED}✗${NC} $*"; }

echo "=== GitHub Contribution Setup Check ==="
echo

# git identity
email="$(git config user.email || true)"
name="$(git config user.name || true)"

if [[ -z "$email" ]]; then
  fail "git user.email is not set"
  echo "  Fix: git config --global user.email 'you@example.com'"
else
  ok "git user.email = $email"
fi

if [[ -z "$name" ]]; then
  warn "git user.name is not set"
else
  ok "git user.name = $name"
fi

if [[ "$email" == *"@users.noreply.github.com"* ]]; then
  ok "Using GitHub noreply email (counts toward contributions if enabled in settings)"
elif [[ "$email" == *"noreply"* ]]; then
  warn "Noreply address — confirm it appears in GitHub Settings → Emails"
else
  warn "Ensure '$email' is verified at https://github.com/settings/emails"
fi

echo
echo "--- GitHub CLI (optional) ---"
if command -v gh >/dev/null 2>&1; then
  if gh auth status >/dev/null 2>&1; then
    ok "gh authenticated as $(gh api user -q .login 2>/dev/null || echo '?')"
    echo
    echo "Profile: https://github.com/$(gh api user -q .login 2>/dev/null || echo 'YOUR_USERNAME')"
    echo "Emails:  https://github.com/settings/emails"
    echo "Private contributions: https://github.com/settings/profile"
  else
    warn "gh installed but not authenticated — run: gh auth login"
  fi
else
  warn "gh not installed — optional for repo stats: brew install gh"
fi
