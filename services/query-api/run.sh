#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
if [[ -z "${JAVA_HOME:-}" && -d "$ROOT/.tools/jdk-21.0.9+10/Contents/Home" ]]; then
  export JAVA_HOME="$ROOT/.tools/jdk-21.0.9+10/Contents/Home"
fi
if [[ -n "${JAVA_HOME:-}" ]]; then export PATH="$JAVA_HOME/bin:$PATH"; fi
if [[ ! -f "$ROOT/services/query-api/target/query-api-0.1.0-SNAPSHOT.jar" ]]; then
  "$ROOT/mvnw" -f "$ROOT/pom.xml" -B -pl services/query-api -am -DskipTests package
fi
exec java -jar "$ROOT/services/query-api/target/query-api-0.1.0-SNAPSHOT.jar" "$@"
