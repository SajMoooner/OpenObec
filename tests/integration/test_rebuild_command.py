"""Rebuild entry-point must be reviewable without stopping any service."""
from pathlib import Path
import subprocess
import sys
import unittest

ROOT = Path(__file__).resolve().parents[2]


class RebuildCommand(unittest.TestCase):
    def test_rebuild_help_does_not_need_a_running_service(self):
        result = subprocess.run([sys.executable, str(ROOT / 'scripts/rebuild/rebuild.py'), '--help'], capture_output=True, text=True)
        self.assertEqual(0, result.returncode, result.stderr)
        self.assertIn('manual', result.stdout)
        self.assertIn('docker', result.stdout)


if __name__ == '__main__':
    unittest.main()
