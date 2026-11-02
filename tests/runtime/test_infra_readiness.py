"""Init readiness must include fast jobs that exited before daemon health settled."""
import importlib.util
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import unittest
from types import SimpleNamespace
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[2]

spec = importlib.util.spec_from_file_location('openobec_wait_init', ROOT / 'scripts/dev/wait_init.py')
readiness = importlib.util.module_from_spec(spec)
spec.loader.exec_module(readiness)


class InfrastructureStartupTest(unittest.TestCase):
    def test_already_completed_jobs_start_successfully_with_array_or_json_lines(self):
        for output_format in ('array', 'lines'):
            with self.subTest(output_format=output_format), tempfile.TemporaryDirectory(prefix='openobec-init-') as directory:
                root = Path(directory)
                (root / 'scripts/dev').mkdir(parents=True)
                (root / 'bin').mkdir()
                for name in ('infra.sh', 'docker_env.py', 'wait_init.py'):
                    source = ROOT / 'scripts/dev' / name
                    if source.exists():
                        shutil.copy2(source, root / 'scripts/dev' / name)
                docker = root / 'bin/docker'
                # Stub only the unavailable engine boundary. Emulate Compose versions
                # where wait selects running containers and cannot see finished jobs.
                docker.write_text('#!' + sys.executable + '\n' + '''import json, os, sys
args = sys.argv[1:]
if args == ['info'] or 'config' in args or 'up' in args:
    sys.exit(0)
if 'wait' in args:
    sys.exit('no containers for project "openobec"')
if 'ps' not in args:
    sys.exit('unexpected Docker operation: ' + repr(args))
if '-a' not in args:
    print(json.dumps([{'Publishers': [{'PublishedPort': p} for p in [*range(27017, 27024), 9092, 9000, 9001]]}]))
else:
    rows = [{'ID': service + '-id', 'Name': 'openobec-' + service + '-1',
             'Project': 'openobec', 'Service': service, 'State': 'exited',
             'Health': '', 'ExitCode': 0, 'Publishers': None}
            for service in ('kafka-init', 'rustfs-init')]
    print(json.dumps(rows) if os.environ['INIT_FORMAT'] == 'array'
          else '\\n'.join(json.dumps(row) for row in rows))
''')
                docker.chmod(0o755)
                result = subprocess.run(['bash', str(root / 'scripts/dev/infra.sh'), 'up'],
                    env={**os.environ, 'PATH': str(root / 'bin') + os.pathsep + os.environ['PATH'],
                         'OPENOBEC_DOCKER_ENV_READY': '1', 'INIT_FORMAT': output_format},
                    capture_output=True, text=True, timeout=10)
                self.assertEqual(result.returncode, 0, result.stderr)


class InitReadinessTest(unittest.TestCase):
    compose = ['docker', 'compose', '-p', 'openobec', '-f', '/fixture/compose.yaml']

    @staticmethod
    def row(service, state='exited', code=0):
        return {'ID': service + '-id', 'Name': 'openobec-' + service + '-1',
                'Project': 'openobec', 'Service': service, 'State': state,
                'Health': '', 'ExitCode': code, 'Publishers': None}

    def wait(self, snapshots, seconds=3, error=None):
        # Keep all readiness decisions real; fake only Docker I/O and elapsed time.
        self.elapsed = 0
        self.observed = []
        snapshots = iter(snapshots)
        latest = ''

        def output(command, **kwargs):
            nonlocal latest
            self.observed.append((command, kwargs))
            if error:
                raise error
            latest = next(snapshots, latest)
            return latest

        def sleep(seconds):
            self.elapsed += seconds

        clock = SimpleNamespace(monotonic=lambda: self.elapsed, sleep=sleep)
        with patch.object(readiness, 'time', clock), \
                patch.object(readiness.subprocess, 'check_output', output):
            readiness.wait_init_jobs(self.compose, seconds=seconds)

    def test_created_and_running_jobs_wait_until_both_exit_successfully(self):
        self.wait([
            json.dumps([self.row('kafka-init', 'created'), self.row('rustfs-init', 'running')]),
            json.dumps([self.row('kafka-init', 'running'), self.row('rustfs-init')]),
            json.dumps([self.row('rustfs-init'), self.row('kafka-init')]),
        ])
        self.assertEqual(len(self.observed), 3, 'A nonterminal state must not count as initialized')
        self.assertGreater(self.elapsed, 0)

    def test_failed_job_aborts_without_waiting_for_running_peer(self):
        for failed in ('kafka-init', 'rustfs-init'):
            with self.subTest(failed=failed):
                rows = [self.row(name, 'exited' if name == failed else 'running',
                                 17 if name == failed else 0) for name in ('kafka-init', 'rustfs-init')]
                with self.assertRaisesRegex(RuntimeError, failed + '.*17'):
                    self.wait([json.dumps(rows)])
                self.assertEqual(self.elapsed, 0)

    def test_dead_job_is_a_failure_even_with_zero_exit_code(self):
        with self.assertRaisesRegex(RuntimeError, 'kafka-init.*dead'):
            self.wait([json.dumps([self.row('kafka-init', 'dead'), self.row('rustfs-init')])])
        self.assertEqual(self.elapsed, 0)

    def test_missing_job_fails_immediately_and_names_missing_service(self):
        for raw, missing in (('', 'kafka-init'), ('[]', 'kafka-init'),
                             (json.dumps([self.row('kafka-init')]), 'rustfs-init')):
            with self.subTest(raw=raw):
                with self.assertRaisesRegex(RuntimeError, 'Missing.*' + missing):
                    self.wait([raw])
                self.assertEqual(self.elapsed, 0)
                self.assertEqual(len(self.observed), 1)

    def test_two_rows_for_one_service_cannot_replace_the_other_job(self):
        with self.assertRaisesRegex(RuntimeError, 'kafka-init'):
            self.wait([json.dumps([self.row('kafka-init'), self.row('kafka-init')])])

    def test_nonterminal_jobs_exhaust_one_shared_deadline(self):
        for state in ('created', 'running', 'restarting', 'paused'):
            with self.subTest(state=state):
                with self.assertRaisesRegex(RuntimeError, 'Timed out.*kafka-init.*' + state):
                    self.wait([json.dumps([self.row('kafka-init', state), self.row('rustfs-init')])], seconds=2.5)
                self.assertEqual(self.elapsed, 2.5)
                for command, options in self.observed:
                    self.assertEqual(command, self.compose + ['ps', '-a', '--format', 'json', 'kafka-init', 'rustfs-init'])
                    self.assertGreater(options['timeout'], 0)
                    self.assertLessEqual(options['timeout'], 2.5)
                self.assertLess(self.observed[-1][1]['timeout'], self.observed[0][1]['timeout'])

    def test_compose_error_keeps_original_exit_code_and_stderr(self):
        failure = subprocess.CalledProcessError(23, self.compose + ['ps'], stderr='engine connection lost')
        with self.assertRaises(subprocess.CalledProcessError) as raised:
            self.wait([], error=failure)
        self.assertIs(raised.exception, failure)
        self.assertEqual(self.elapsed, 0)

    def test_hung_compose_command_keeps_timeout_failure(self):
        failure = subprocess.TimeoutExpired(self.compose + ['ps'], 3, stderr='daemon stalled')
        with self.assertRaises(subprocess.TimeoutExpired) as raised:
            self.wait([], error=failure)
        self.assertIs(raised.exception, failure)

    def test_malformed_compose_output_is_not_treated_as_success(self):
        with self.assertRaises(ValueError):
            self.wait(['not JSON'])

    def test_missing_exit_code_is_not_treated_as_success(self):
        row = self.row('kafka-init')
        del row['ExitCode']
        with self.assertRaisesRegex(RuntimeError, 'kafka-init'):
            self.wait([json.dumps([row, self.row('rustfs-init')])])


if __name__ == '__main__':
    unittest.main()
