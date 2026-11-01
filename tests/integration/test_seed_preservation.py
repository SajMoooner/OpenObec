"""Seed reruns preserve actual edits/deletions through real source APIs."""
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest
import uuid

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / 'scripts/seed'))
from seed import AGENDAS, request
import urllib.error


class SeedPreservation(unittest.TestCase):
    def test_existing_user_edit_and_logical_delete_survive_rerun(self):
        with tempfile.TemporaryDirectory(prefix='openobec-seed-') as directory:
            manifest = Path(directory) / 'manifest.json'
            command = [sys.executable, str(ROOT / 'scripts/seed/seed.py'), '--manifest', str(manifest), '--prefix', 'OWNED-' + uuid.uuid4().hex[:16], '--count', '1']
            result = subprocess.run(command, capture_output=True, text=True)
            self.assertEqual(0, result.returncode, result.stdout + result.stderr)
            owned = json.loads(manifest.read_text())['records']
            try:
                invoice = 'faktury/' + owned['faktury'][0]['id']
                contract = 'zmluvy/' + owned['zmluvy'][0]['id']
                edited = request('POST', invoice + '/update', {'predmet': 'Používateľská úprava zostane zachovaná'})['data']
                request('POST', contract + '/delete')
                result = subprocess.run(command, capture_output=True, text=True)
                self.assertEqual(0, result.returncode, result.stdout + result.stderr)
                self.assertEqual(edited, request('GET', invoice)['data'])
                with self.assertRaises(urllib.error.HTTPError) as missing:
                    request('GET', contract)
                self.assertEqual(404, missing.exception.code)
                # It must not create another identity under the deleted stable number.
                rows = request('GET', 'zmluvy?q=' + owned['zmluvy'][0]['cislo'])['data']
                self.assertEqual([], rows)
            finally:
                for agenda in AGENDAS:
                    try:
                        request('POST', agenda + '/' + owned[agenda][0]['id'] + '/delete')
                    except urllib.error.HTTPError as error:
                        if error.code != 404:
                            raise


if __name__ == '__main__':
    unittest.main()
