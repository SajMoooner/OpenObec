"""Exercise verifier configuration with real Compose parsing and no network actions."""
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[2]
KEYS = ('S3_ACCESS_KEY', 'S3_SECRET_KEY', 'S3_BUCKET')
DEFAULTS = dict(zip(KEYS, ('openobec-demo', 'openobec-local-demo-secret', 'openobec-documents')))


class InfrastructureConfigurationTests(unittest.TestCase):
    def verify_fixture(self, dotenv, overrides):
        with tempfile.TemporaryDirectory(prefix='openobec-config-test-') as directory:
            root = Path(directory)
            (root/'scripts/dev').mkdir(parents=True)
            (root/'bin').mkdir()
            shutil.copy2(ROOT/'scripts/dev/infra.sh', root/'scripts/dev/infra.sh')
            shutil.copy2(ROOT/'scripts/dev/docker_env.py', root/'scripts/dev/docker_env.py')
            shutil.copy2(ROOT/'compose.yaml', root/'compose.yaml')
            (root/'.env').write_text(dotenv)
            # Use actual Compose .env/config resolution; stub only engine/network actions.
            docker = root/'bin/docker'
            docker.write_text('#!' + sys.executable + '\n' + '''import os, sys
if sys.argv[1:] == ['info'] or 'exec' in sys.argv[1:]:
    sys.exit(0)
os.execv(os.environ['OPENOBEC_TEST_DOCKER'], sys.argv)
''')
            docker.chmod(0o755)
            for service in ('mongo', 'kafka', 'rustfs'):
                (root/'infra'/service).mkdir(parents=True)
            (root/'infra/mongo/verify-host.py').write_text('')
            (root/'infra/kafka/verify.py').write_text('')
            # Client stand-in records the configuration passed to the host verifier.
            # The capture stays in the temporary fixture; credentials never go to logs.
            (root/'infra/rustfs/verify.py').write_text('''import json, os
from pathlib import Path
values = {key: os.getenv(key, default) for key, default in %r.items()}
Path(os.environ['OPENOBEC_VERIFY_CAPTURE']).write_text(json.dumps(values))
''' % DEFAULTS)
            env = os.environ.copy()
            for name in (*KEYS, 'COMPOSE_FILE', 'COMPOSE_ENV_FILES', 'COMPOSE_PROJECT_NAME',
                         'COMPOSE_PROFILES', 'COMPOSE_DISABLE_ENV_FILE'):
                env.pop(name, None)
            env.update(PATH=str(root/'bin')+os.pathsep+os.environ['PATH'],
                       OPENOBEC_TEST_DOCKER=shutil.which('docker'),
                       OPENOBEC_PYTHON=sys.executable,
                       OPENOBEC_VERIFY_CAPTURE=str(root/'capture.json'))
            env.update(overrides)
            result = subprocess.run(['bash', 'scripts/dev/infra.sh', 'verify'], cwd=root,
                                    env=env, capture_output=True, text=True, timeout=30)
            self.assertEqual(result.returncode, 0, result.stderr)
            captured = json.loads((root/'capture.json').read_text())
            for credential in ('fixture-access', 'fixture secret $literal # marker',
                               'exported-access', 'exported-secret'):
                self.assertNotIn(credential, result.stdout + result.stderr)
            return captured

    def test_dotenv_credentials_and_bucket_reach_host_verification(self):
        actual = self.verify_fixture("S3_ACCESS_KEY=fixture-access\n"
            "S3_SECRET_KEY='fixture secret $literal # marker'\nS3_BUCKET=fixture-bucket\n", {})
        self.assertEqual(actual, dict(zip(KEYS,
            ('fixture-access', 'fixture secret $literal # marker', 'fixture-bucket'))))

    def test_explicit_environment_overrides_dotenv_without_erasing_other_values(self):
        actual = self.verify_fixture('S3_ACCESS_KEY=fixture-access\n'
            'S3_SECRET_KEY=dotenv-secret\nS3_BUCKET=fixture-bucket\n',
            {'S3_ACCESS_KEY':'exported-access', 'S3_SECRET_KEY':'exported-secret $one $$two'})
        self.assertEqual(actual, dict(zip(KEYS,
            ('exported-access', 'exported-secret $one $$two', 'fixture-bucket'))))

    def test_compose_defaults_apply_when_configuration_is_absent(self):
        self.assertEqual(self.verify_fixture('', {}), DEFAULTS)


if __name__ == '__main__':
    unittest.main()
