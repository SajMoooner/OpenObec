#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"
if [[ "${OPENOBEC_DOCKER_ENV_READY:-}" != '1' ]]; then
  exec python3 "$ROOT/scripts/dev/docker_env.py" bash "$ROOT/scripts/dev/infra.sh" "$@"
fi
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
    python3 "$ROOT/scripts/dev/wait_init.py" "$ROOT/compose.yaml"
    ;;
  down) "${compose[@]}" down ;; # Named volumes deliberately survive.
  verify)
    PYTHON="${OPENOBEC_PYTHON:-python3}"
    for service in mongo-invoices mongo-supplier-invoices mongo-contracts mongo-orders mongo-procurement mongo-ordinances mongo-read; do
      "${compose[@]}" exec -T "$service" mongosh "mongodb://$service:27017/?directConnection=true" --quiet /opt/openobec/verify-transaction.js
    done
    # Resolve .env, shell overrides and defaults through the same Compose parser
    # used for startup. Keep credentials in memory rather than shell output.
    "$PYTHON" - "$ROOT/compose.yaml" <<'PYVERIFY'
import json, os, subprocess, sys
compose = ['docker', 'compose', '-p', 'openobec', '-f', sys.argv[1]]
config = json.loads(subprocess.check_output(compose + ['config', '--format', 'json'], text=True))
resolved = config['services']['rustfs-init']['environment']
environment = os.environ.copy()
for key in ('S3_ACCESS_KEY', 'S3_SECRET_KEY', 'S3_BUCKET'):
 # Canonical Compose output doubles literal dollars so it can be re-imported.
 # Undo that serialization escape once before passing the actual runtime value.
 environment[key] = resolved[key].replace('$$', '$')
for script in ('infra/mongo/verify-host.py', 'infra/kafka/verify.py', 'infra/rustfs/verify.py'):
 subprocess.run([sys.executable, script], env=environment, check=True)
PYVERIFY
    ;;
  status) "${compose[@]}" ps -a ;;
  logs) "${compose[@]}" logs --tail 100 ;;
  *) echo 'Usage: scripts/dev/infra.sh [up|down|verify|status|logs]' >&2; exit 2 ;;
esac
