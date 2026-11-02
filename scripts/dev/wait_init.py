#!/usr/bin/env python3
"""Wait for infrastructure init jobs, including jobs that already exited."""
import json
import subprocess
import sys
import time

JOBS = ('kafka-init', 'rustfs-init')


def wait_init_jobs(compose, seconds=240):
    deadline = time.monotonic() + seconds
    pending = ', '.join(JOBS)
    while True:
        remaining = deadline - time.monotonic()
        if remaining <= 0:
            raise RuntimeError(f'Timed out waiting for infrastructure init: {pending}')
        # Older Compose wait implementations select only running containers.
        # ps -a includes quick jobs that finished during daemon health checks.
        raw = subprocess.check_output(
            compose + ['ps', '-a', '--format', 'json', *JOBS],
            text=True, timeout=remaining).strip()
        rows = json.loads(raw) if raw.startswith('[') else [json.loads(line) for line in raw.splitlines() if line]
        jobs = {}
        for row in rows:
            service = row['Service']
            if service not in JOBS or service in jobs:
                raise RuntimeError(f'Unexpected infrastructure init container: {service}')
            jobs[service] = row
        waiting = []
        for service, row in jobs.items():
            state, code = row.get('State'), row.get('ExitCode')
            if not state or type(code) is not int:
                raise RuntimeError(f'Invalid infrastructure init status: {service} ({state}, exit {code})')
            if state == 'dead' or (state == 'exited' and code != 0):
                raise RuntimeError(f'Infrastructure init failed: {service} ({state}, exit {code})')
            if state != 'exited':
                waiting.append(f'{service} ({state})')
        missing = [service for service in JOBS if service not in jobs]
        if missing:
            raise RuntimeError('Missing infrastructure init jobs: ' + ', '.join(missing))
        if not waiting:
            return
        pending = ', '.join(waiting)
        time.sleep(min(1, max(0, deadline - time.monotonic())))


if __name__ == '__main__':
    wait_init_jobs(['docker', 'compose', '-p', 'openobec', '-f', sys.argv[1]])
