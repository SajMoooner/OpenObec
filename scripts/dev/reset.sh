#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
if [[ "${1:-}" != '--confirm-reset-openobec' ]]; then
  echo 'Reset deletes ALL OpenObec documents, files and Kafka history. To request it explicitly: scripts/dev/reset.sh --confirm-reset-openobec' >&2
  exit 2
fi
python3 - "$ROOT" <<'PY'
import importlib.util,sys
from pathlib import Path
root=Path(sys.argv[1]);spec=importlib.util.spec_from_file_location('stack',root/'scripts/dev/stack.py');stack=importlib.util.module_from_spec(spec);spec.loader.exec_module(stack);stack.stop_manual()
PY
docker compose -p openobec -f "$ROOT/compose.yaml" -f "$ROOT/compose.apps.yaml" down --volumes
rm -f "$ROOT/.run/seed-manifest.json"
echo 'OpenObec demo data reset. Other Docker projects were not changed.'
