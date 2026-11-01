#!/usr/bin/env python3
"""Rebuild from authoritative HTTP exports, stopping only OpenObec pairing."""
import argparse
import importlib.util
import json
import os
from pathlib import Path
import signal
import subprocess
import time

ROOT = Path(__file__).resolve().parents[2]
spec = importlib.util.spec_from_file_location('openobec_stack', ROOT / 'scripts/dev/stack.py')
stack = importlib.util.module_from_spec(spec)
spec.loader.exec_module(stack)


def rebuild(mode):
    if mode == 'docker':
        stack.run(stack.COMPOSE + ['stop', 'pairing-service'])
        # Failure deliberately leaves pairing stopped and Query gated. Rerun after repair.
        stack.run(stack.COMPOSE + ['run', '--rm', '--no-deps', 'pairing-service', 'rebuild'])
        stack.run(stack.COMPOSE + ['up', '-d', '--wait', '--wait-timeout', '120', 'pairing-service'])
        return
    configuration = json.loads(subprocess.check_output(stack.COMPOSE + ['config', '--format', 'json'], cwd=ROOT, text=True))
    environment = stack.host_environment(configuration['services']['pairing-service']['environment'])
    # Explicit host overrides take precedence over the effective Compose defaults.
    for key in ('MONGODB_URI', 'KAFKA_BOOTSTRAP_SERVERS', 'OPENOBEC_EVENTS_TOPIC', 'OPENOBEC_EVENTS_DLQ',
                'PAIRING_CONSUMER_GROUP', 'INVOICES_SERVICE_URL', 'SUPPLIER_INVOICES_SERVICE_URL',
                'CONTRACTS_SERVICE_URL', 'ORDERS_SERVICE_URL', 'PROCUREMENT_SERVICE_URL'):
        if key in os.environ:
            environment[key] = os.environ[key]
    rows = stack.read_processes()
    row = rows.get('pairing-service')
    expected = str(ROOT / 'services/pairing-service/target/pairing-service-0.1.0-SNAPSHOT.jar')
    if row and stack.owned_process(row):
        if row['signature'] != expected:
            raise RuntimeError('Pairing process identity differs from this checkout; stop it explicitly before rebuilding.')
        os.kill(row['pid'], signal.SIGTERM)
        deadline = time.monotonic() + 15
        while stack.owned_process(row) and time.monotonic() < deadline:
            time.sleep(.2)
        if stack.owned_process(row):
            raise RuntimeError('Pairing did not stop; no rebuild was started.')
        del rows['pairing-service']
        stack.MANIFEST.write_text(json.dumps(rows, indent=2) + '\n')
    # RebuildRunner independently refuses a live Kafka consumer group, including untracked processes.
    stack.run([environment.get('JAVA_HOME', '') + '/bin/java' if environment.get('JAVA_HOME') else 'java', '-jar', expected, 'rebuild'], env=environment)
    stack.start('pairing-service', ['java', '-jar', expected], environment)
    stack.wait(['pairing-service'], seconds=120)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('mode', choices=('docker', 'manual'), nargs='?', default='docker')
    args = parser.parse_args()
    rebuild(args.mode)
    print('OpenObec rebuild verified and pairing ready. Old generations and snapshots retained.')


if __name__ == '__main__':
    main()
