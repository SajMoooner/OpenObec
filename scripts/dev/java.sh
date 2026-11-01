#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
if ! command -v java >/dev/null 2>&1 || ! java -version 2>&1 | head -1 | grep -Eq 'version "21[.]'; then
  echo 'OpenObec requires JDK 21. Set JAVA_HOME and PATH to your JDK 21 installation.' >&2
  exit 1
fi
if [[ $# -eq 0 ]]; then
  exec "$ROOT/mvnw" -f "$ROOT/pom.xml" verify
fi
MODULE="$1"
shift
if [[ ! "$MODULE" =~ ^[a-z][a-z0-9-]*$ || ! -f "$ROOT/services/$MODULE/pom.xml" ]]; then
  echo 'Usage: scripts/dev/java.sh [service-name [Maven arguments...]]' >&2
  exit 2
fi
exec "$ROOT/mvnw" -f "$ROOT/services/$MODULE/pom.xml" spring-boot:run "$@"
