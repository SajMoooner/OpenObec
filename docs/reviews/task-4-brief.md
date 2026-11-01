### Task 4: Gateway and complete runtime wiring

**Files:** `services/api-gateway/`, `compose.apps.yaml`, `scripts/dev/{up,down,doctor,reset}.sh`, root environment additions, gateway tests.

**Interfaces:** Gateway port 8080; six domains 8081–8086, query 8090, pairing actuator 8091. Routes only 70 known operations and health. Propagate X-Obec-Id, X-Request-Id; POST is never automatically retried. Memory limiter bounded, Retry-After on 429. Internal export paths never proxied. `compose.yaml` infra-only, `compose.apps.yaml` app overlay.

- [ ] Write failing route tests for selector/query/relations precedence, attachments, blocked internal paths, missing municipality and upstream failure error envelope.
- [ ] Implement Spring Cloud Gateway filters, request IDs, size/time limits and bounded limiter; run green tests.
- [ ] Wire independently built nine Java containers with health and host-only ports; verify all health endpoints and round-trip create/query through gateway.
- [ ] Implement diagnostic and explicit-confirmation reset scripts; standard up/down must preserve volumes. Commit.
