#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"
docker info >/dev/null 2>&1 || { echo 'Start Docker Desktop before running OpenObec.' >&2; exit 1; }
compose=(docker compose -p openobec -f "$ROOT/compose.yaml")
case "${1:-up}" in
  up)
    # A running project may safely be started again; check only ports not owned by it.
    python3 - "$("${compose[@]}" ps --format json)" <<'PY'
import json,socket,sys
raw=sys.argv[1].strip()
rows=json.loads(raw) if raw.startswith('[') else [json.loads(x) for x in raw.splitlines() if x]
owned={p['PublishedPort'] for row in rows for p in (row.get('Publishers') or [])}
for port in [*range(27017,27024),9092,9000,9001]:
 if port in owned: continue
 with socket.socket() as s:
  try: s.bind(('127.0.0.1',port))
  except OSError: sys.exit(f'Port {port} is busy. Stop the program using that port or adjust Compose before starting.')
PY
    "${compose[@]}" config --quiet
    "${compose[@]}" up -d
    # Compose --wait treats completed init jobs as failed unless another service
    # declares them as service_completed_successfully. Wait on daemons separately.
    "${compose[@]}" up -d --wait --wait-timeout 240 \
      mongo-invoices mongo-supplier-invoices mongo-contracts mongo-orders \
      mongo-procurement mongo-ordinances mongo-read kafka rustfs
    python3 - "$ROOT/compose.yaml" <<'PYWAIT'
import json, subprocess, sys
compose = ['docker', 'compose', '-p', 'openobec', '-f', sys.argv[1]]
subprocess.run(compose + ['wait', 'kafka-init', 'rustfs-init'], check=True, timeout=240)
raw = subprocess.check_output(compose + ['ps', '-a', '--format', 'json', 'kafka-init', 'rustfs-init'], text=True).strip()
rows = json.loads(raw) if raw.startswith('[') else [json.loads(x) for x in raw.splitlines() if x]
assert len(rows) == 2, 'Both infrastructure init jobs must exist'
for row in rows:
 if row['State'] != 'exited' or row['ExitCode'] != 0:
  sys.exit(f"Infrastructure init failed: {row['Service']} (exit {row['ExitCode']})")
PYWAIT
    ;;
  down) "${compose[@]}" down ;; # Named volumes deliberately survive.
  verify)
    PYTHON="${OPENOBEC_PYTHON:-python3}"
    for service in mongo-invoices mongo-supplier-invoices mongo-contracts mongo-orders mongo-procurement mongo-ordinances mongo-read; do
      "${compose[@]}" exec -T "$service" mongosh "mongodb://$service:27017/?directConnection=true" --quiet /opt/openobec/verify-transaction.js
    done
    "$PYTHON" infra/mongo/verify-host.py
    "$PYTHON" infra/kafka/verify.py
    "$PYTHON" infra/rustfs/verify.py
    ;;
  status) "${compose[@]}" ps -a ;;
  logs) "${compose[@]}" logs --tail 100 ;;
  *) echo 'Usage: scripts/dev/infra.sh [up|down|verify|status|logs]' >&2; exit 2 ;;
esac
