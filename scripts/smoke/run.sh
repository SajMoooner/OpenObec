#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
PYTHON="${PYTHON:-python3}"
if [[ -x "$ROOT/.tools/venv/bin/python" ]]; then PYTHON="$ROOT/.tools/venv/bin/python"; fi
cd "$ROOT"
exec "$PYTHON" -m unittest discover -s tests/integration -p 'test_*.py' -v
