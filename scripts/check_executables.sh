#!/bin/bash
set -euo pipefail

# ───────────────────────────────────────────────────────────────
# 🔎 Executable Checker Script (Template)
# Add or remove executable paths below
# ───────────────────────────────────────────────────────────────

REQUIRED_EXECUTABLES=(
  # "./bin/my_binary"
  # "./tools/code_formatter"
  # "./scripts/setup.sh"
)

# ───────────────────────────────────────────────────────────────

echo "🔍 Checking required executables..."

for exe in "${REQUIRED_EXECUTABLES[@]}"; do
  if [[ ! -f "$exe" ]]; then
    echo "❌ '$exe' not found"
    exit 1
  fi

  if [[ ! -x "$exe" ]]; then
    echo "❌ '$exe' is not executable (missing chmod +x?)"
    exit 1
  fi

  echo "✅ '$exe' exists and is executable"
done

echo "🎉 All required executables passed."
