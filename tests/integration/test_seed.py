"""Live gateway acceptance. Requires the ordinary local stack, never resets data."""
import hashlib
import json
import os
from pathlib import Path
import subprocess
import unittest
import urllib.request

ROOT = Path(__file__).resolve().parents[2]
BASE = os.environ.get('API_BASE_URL', 'http://localhost:8080')
AGENDAS = ('faktury', 'dodavatelske-faktury', 'zmluvy', 'objednavky', 'verejne-obstaravanie', 'vzn')


def get(path):
    req = urllib.request.Request(BASE + '/rest/v1/' + path, headers={'X-Obec-Id': 'zilina'})
    with urllib.request.urlopen(req, timeout=30) as response:
        return response.read()


class SeedAcceptance(unittest.TestCase):
    def test_seed_has_twelve_per_agenda_branching_components_and_real_pdf(self):
        command = [os.sys.executable, str(ROOT / 'scripts/seed/seed.py')]
        result = subprocess.run(command, cwd=ROOT, capture_output=True, text=True)
        self.assertEqual(0, result.returncode, result.stdout + result.stderr)
        manifest = json.loads((ROOT / '.run/seed-manifest.json').read_text())
        for agenda in AGENDAS:
            records = manifest['records'][agenda]
            self.assertEqual(12, len(records))
            rows = [json.loads(get(agenda + '/' + row['id']))['data'] for row in records]
            self.assertTrue(any(row['zverejnene'] for row in rows))
            self.assertTrue(any(not row['zverejnene'] for row in rows))
            files = json.loads(get(agenda + '/' + records[0]['id'] + '/prilohy'))['data']
            self.assertTrue(files)
            blob = get(agenda + '/' + records[0]['id'] + '/prilohy/' + files[0]['id'] + '/download')
            self.assertTrue(blob.startswith(b'%PDF-1.4'))
            self.assertEqual(files[0]['sha256'], hashlib.sha256(blob).hexdigest())
        for index in (0, 1):
            root = manifest['records']['zmluvy'][index]['id']
            graph = json.loads(get('zmluvy/' + root + '/suvislosti'))['data']
            self.assertEqual('ready', graph['projection']['status'])
            self.assertGreaterEqual(len(graph['nodes']), 5)
            degree = {}
            for edge in graph['edges']:
                for node in (edge['from'], edge['to']):
                    key = (node['typ'], node['id'])
                    degree[key] = degree.get(key, 0) + 1
            self.assertGreaterEqual(max(degree.values()), 3)
        before = {a: [json.loads(get(a + '/' + r['id']))['data']['updated_at'] for r in manifest['records'][a]] for a in AGENDAS}
        result = subprocess.run(command, cwd=ROOT, capture_output=True, text=True)
        self.assertEqual(0, result.returncode, result.stdout + result.stderr)
        after = {a: [json.loads(get(a + '/' + r['id']))['data']['updated_at'] for r in manifest['records'][a]] for a in AGENDAS}
        self.assertEqual(before, after, 'ordinary rerun must not write existing seed records')


if __name__ == '__main__':
    unittest.main()
