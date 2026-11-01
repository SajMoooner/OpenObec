#!/usr/bin/env python3
"""Start only the OpenObec project; keep persistent volumes on ordinary stop."""
import json
import os
from pathlib import Path
import shutil
import signal
import socket
import subprocess
import sys
import time
import urllib.error
import urllib.request

ROOT = Path(__file__).resolve().parents[2]
RUN = ROOT / '.run'
COMPOSE = ['docker', 'compose', '-p', 'openobec', '-f', str(ROOT / 'compose.yaml'), '-f', str(ROOT / 'compose.apps.yaml')]
SOURCES = ['invoices-service', 'supplier-invoices-service', 'contracts-service', 'orders-service', 'procurement-service', 'ordinances-service']
JAVA = SOURCES + ['query-api', 'api-gateway', 'pairing-service']
PORTALS = ['marketing', 'citizen', 'office']
PORTS = dict(zip(SOURCES, range(8081, 8087)), **{'query-api': 8090, 'pairing-service': 8091, 'api-gateway': 8080, 'marketing': 3000, 'citizen': 3001, 'office': 3002})
MANIFEST = RUN / 'processes.json'
CHILDREN = {}


def run(command, **kwargs):
    return subprocess.run(command, cwd=ROOT, check=True, **kwargs)


def read_processes():
    return json.loads(MANIFEST.read_text()) if MANIFEST.exists() else {}


def process_state(pid):
    try:
        raw = subprocess.check_output(['ps', '-p', str(pid), '-o', 'stat=', '-o', 'lstart=', '-o', 'command='], text=True, env={**os.environ, 'LC_ALL': 'C', 'TZ': 'UTC'}).strip().split(None, 6)
        if len(raw) < 7 or raw[0].startswith('Z'):
            return None
        return {'started_at': ' '.join(raw[1:6]), 'command': raw[6]}
    except subprocess.CalledProcessError:
        return None


def owned_process(row):
    child = CHILDREN.get(row['pid'])
    if child is not None and child.poll() is not None:
        return False
    state = process_state(row['pid'])
    if not state:
        return False
    if row.get('started_at'):
        return row['started_at'] == state['started_at']
    return row['signature'] in state['command']


def start(name, command, environment):
    rows = read_processes()
    if name in rows and owned_process(rows[name]):
        return
    with socket.socket() as probe:
        probe.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        try:
            probe.bind(('127.0.0.1', PORTS[name]))
        except OSError:
            raise RuntimeError(f'Port {PORTS[name]} is already occupied. Stop the other launch mode before starting {name}.')
    RUN.mkdir(exist_ok=True)
    with (RUN / f'{name}.log').open('ab') as log:
        child = subprocess.Popen(command, cwd=ROOT, env=environment, stdin=subprocess.DEVNULL, stdout=log, stderr=subprocess.STDOUT, start_new_session=True)
    CHILDREN[child.pid] = child
    state = process_state(child.pid)
    if not state:
        child.wait()
        raise RuntimeError(f'{name} exited during startup. Inspect .run/{name}.log.')
    rows[name] = {'pid': child.pid, 'signature': str(command[-1]), 'started_at': state['started_at']}
    MANIFEST.write_text(json.dumps(rows, indent=2) + '\n')


def stop_manual():
    rows = read_processes()
    for name, row in rows.items():
        if owned_process(row):
            os.killpg(row['pid'], signal.SIGTERM)
    deadline = time.monotonic() + 12
    while time.monotonic() < deadline and any(owned_process(r) for r in rows.values()):
        time.sleep(.2)
    for row in rows.values():
        if owned_process(row):
            os.killpg(row['pid'], signal.SIGKILL)
    for row in rows.values():
        child = CHILDREN.pop(row['pid'], None)
        if child is not None:
            child.wait(timeout=5)
    if MANIFEST.exists():
        MANIFEST.unlink()


def healthy(name):
    path = '/actuator/health' if name in JAVA else '/'
    try:
        with urllib.request.urlopen(f'http://127.0.0.1:{PORTS[name]}{path}', timeout=4) as response:
            return response.status == 200
    except (urllib.error.URLError, TimeoutError, OSError):
        return False


def wait(names, seconds=150):
    deadline = time.monotonic() + seconds
    pending = set(names)
    while pending and time.monotonic() < deadline:
        pending = {name for name in pending if not healthy(name)}
        if pending:
            time.sleep(.5)
    if pending:
        raise RuntimeError('Services did not become ready: ' + ', '.join(sorted(pending)) + '. Inspect .run logs or docker compose logs.')


def needs_bootstrap():
    config = json.loads(subprocess.check_output(COMPOSE + ['config', '--format', 'json'], cwd=ROOT, text=True))
    read_uri = config['services']['query-api']['environment']['MONGODB_URI'].replace('$$', '$')
    script = "const m=db.projection_metadata.findOne({_id:'active:zilina'});quit(!m||m.generation==='initial'||m.ready!==true?3:0)"
    # Query/rebuild own this read database. Source databases are never read here.
    result = subprocess.run(COMPOSE + ['exec', '-T', 'mongo-read', 'mongosh', read_uri, '--quiet', '--eval', script], cwd=ROOT, stdout=subprocess.DEVNULL)
    if result.returncode not in (0, 3):
        raise RuntimeError('Cannot inspect read-generation readiness.')
    return result.returncode == 3


def host_environment(settings):
    environment = os.environ.copy()
    for key, value in settings.items():
        value = str(value).replace('$$', '$')
        for name, port in PORTS.items():
            value = value.replace(f'http://{name}:{port}', f'http://127.0.0.1:{port}')
        value = value.replace('kafka:29092', 'localhost:9092').replace('http://rustfs:9000', 'http://127.0.0.1:9000')
        for mongo, port in zip(['invoices', 'supplier-invoices', 'contracts', 'orders', 'procurement', 'ordinances', 'read'], range(27017, 27024)):
            value = value.replace(f'mongodb://mongo-{mongo}:27017/', f'mongodb://127.0.0.1:{port}/')
        if key == 'MONGODB_URI' and 'directConnection=' not in value:
            value += ('&' if '?' in value else '?') + 'directConnection=true'
        environment[key] = value
    environment['HOSTNAME'] = '127.0.0.1'
    local_jdk = ROOT / '.tools/jdk-21.0.9+10/Contents/Home'
    if not environment.get('JAVA_HOME') and local_jdk.is_dir():
        environment['JAVA_HOME'] = str(local_jdk)
    if environment.get('JAVA_HOME'):
        environment['PATH'] = environment['JAVA_HOME'] + '/bin:' + environment['PATH']
    return environment


def preflight(mode):
    rows = read_processes()
    allowed = set()
    if mode == 'manual':
        allowed = {PORTS[name] for name, row in rows.items() if name in PORTS and owned_process(row)}
    else:
        raw = subprocess.check_output(COMPOSE + ['ps', '--format', 'json'], cwd=ROOT, text=True).strip()
        containers = json.loads(raw) if raw.startswith('[') else [json.loads(line) for line in raw.splitlines() if line]
        for container in containers:
            if container.get('Service') in PORTS:
                allowed.update(p['PublishedPort'] for p in (container.get('Publishers') or []))
    deadline = time.monotonic() + 5
    while True:
        occupied = []
        for name, port in PORTS.items():
            if port in allowed:
                continue
            with socket.socket() as probe:
                probe.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
                try:
                    probe.bind(('127.0.0.1', port))
                except OSError:
                    occupied.append((name, port))
        if not occupied:
            return
        if time.monotonic() >= deadline:
            name, port = occupied[0]
            raise RuntimeError(f'Port {port} for {name} is occupied. Stop the other launch mode or app before starting OpenObec.')
        # Docker Desktop may release a removed host forward asynchronously.
        time.sleep(.2)


def up(mode, skip_build=False):
    preflight(mode)
    run([str(ROOT / 'scripts/dev/infra.sh'), 'up'])
    if mode == 'docker':
        if not skip_build:
            run(COMPOSE + ['build'], env={**os.environ, 'COMPOSE_PARALLEL_LIMIT': '2'})
        run(COMPOSE + ['up', '-d', '--wait', '--wait-timeout', '240'] + SOURCES + ['query-api', 'api-gateway'])
        if needs_bootstrap():
            run(COMPOSE + ['stop', 'pairing-service'])
            run(COMPOSE + ['run', '--rm', '--no-deps', 'pairing-service', 'rebuild'])
        run(COMPOSE + ['up', '-d', '--wait', '--wait-timeout', '240', 'pairing-service'] + PORTALS)
    else:
        config = json.loads(subprocess.check_output(COMPOSE + ['config', '--format', 'json'], cwd=ROOT, text=True))
        environments = {name: host_environment(config['services'][name]['environment']) for name in JAVA + PORTALS}
        java_environment = environments['api-gateway']
        version = subprocess.run(['java', '-version'], env=java_environment, capture_output=True, text=True)
        if version.returncode or 'version "21.' not in version.stderr:
            raise RuntimeError('Manual mode requires JDK21. Set JAVA_HOME to a JDK21 installation.')
        if not skip_build:
            run([str(ROOT / 'mvnw'), '-B', '-DskipTests', 'package'], env=java_environment)
            run(['pnpm', 'install', '--frozen-lockfile'])
            run(['pnpm', 'build'])
        for name in SOURCES + ['query-api', 'api-gateway']:
            jar = ROOT / f'services/{name}/target/{name}-0.1.0-SNAPSHOT.jar'
            start(name, ['java', '-jar', str(jar)], environments[name])
        wait(SOURCES + ['query-api', 'api-gateway'])
        if needs_bootstrap():
            row = read_processes().get('pairing-service')
            if row and owned_process(row):
                raise RuntimeError('Stop pairing before rebuilding the read generation: scripts/dev/down.sh manual')
            run(['java', '-jar', str(ROOT / 'services/pairing-service/target/pairing-service-0.1.0-SNAPSHOT.jar'), 'rebuild'], env=environments['pairing-service'])
        start('pairing-service', ['java', '-jar', str(ROOT / 'services/pairing-service/target/pairing-service-0.1.0-SNAPSHOT.jar')], environments['pairing-service'])
        for name in PORTALS:
            directory = ROOT / f'apps/{name}'
            standalone = directory / f'.next/standalone/apps/{name}'
            shutil.copytree(directory / '.next/static', standalone / '.next/static', dirs_exist_ok=True)
            shutil.copytree(directory / 'public', standalone / 'public', dirs_exist_ok=True)
            start(name, ['node', str(standalone / 'server.js')], environments[name])
        wait(['pairing-service'] + PORTALS)
    run([sys.executable, str(ROOT / 'scripts/seed/seed.py')])
    print('OpenObec ready: marketing http://localhost:3000 · citizens http://localhost:3001 · office http://localhost:3002', flush=True)


def main():
    action = sys.argv[1] if len(sys.argv) > 1 else 'doctor'
    mode = sys.argv[2] if len(sys.argv) > 2 else 'docker'
    if mode not in ('docker', 'manual'):
        raise RuntimeError('Choose docker or manual mode.')
    if action == 'up':
        up(mode, '--skip-build' in sys.argv[3:])
    elif action == 'down':
        if mode == 'manual':
            stop_manual()
        run(COMPOSE + ['down'])
        print('OpenObec stopped; persistent volumes preserved.')
    elif action == 'doctor':
        run(COMPOSE + ['config', '--quiet'])
        run(COMPOSE + ['ps', '-a'])
        for name in JAVA + PORTALS:
            print(f'{name}: {"ready" if healthy(name) else "not running or unavailable"} (127.0.0.1:{PORTS[name]})')
    else:
        raise RuntimeError('Usage: stack.py [up|down|doctor] [docker|manual] [--skip-build]')

if __name__ == '__main__':
    if os.environ.get('OPENOBEC_DOCKER_ENV_READY') != '1':
        os.execv(sys.executable, [sys.executable, str(ROOT / 'scripts/dev/docker_env.py'), sys.executable, str(Path(__file__).resolve()), *sys.argv[1:]])
    try:
        main()
    except (RuntimeError, subprocess.CalledProcessError) as failure:
        print(str(failure), file=sys.stderr)
        sys.exit(1)
