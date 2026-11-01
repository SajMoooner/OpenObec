"""Coordinated live rebuild acceptance. Run separately while browser checks are idle.
The relay forwards unchanged real owner exports, then commits real concurrent writes.
No source business database reads, raw Kafka writes or historical cleanup.
"""
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
import json
import os
from pathlib import Path
import subprocess
import sys
import threading
import time
import unittest
import uuid

import requests
from pymongo import MongoClient

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / 'scripts/seed'))
from seed import payload
BASE = os.environ.get('API_BASE_URL', 'http://localhost:8080')
HEADERS = {'X-Obec-Id': 'zilina'}


class LiveRebuildRecovery(unittest.TestCase):
    def test_actual_export_replay_tombstone_and_immutable_old_snapshot(self):
        namespace = 'RECOVERY-' + uuid.uuid4().hex[:16]
        seed = json.loads((ROOT / '.run/seed-manifest.json').read_text())
        contract = seed['records']['zmluvy'][0]['id']
        owned = []
        mongo = MongoClient(os.environ.get('MONGODB_INVOICES_URI', 'mongodb://localhost:27017/openobec_invoices?replicaSet=rs-invoices&directConnection=true'))
        outbox = mongo.get_default_database()['outbox']

        def source(method, path, body=None):
            response = requests.request(method, BASE + '/rest/v1/' + path, headers=HEADERS, json=body, timeout=30)
            response.raise_for_status()
            return response.json() if response.content else None

        try:
            for index in range(2):
                body = payload('faktury', index, namespace)
                body['suvisiace_zaznamy'] = [{'typ': 'zmluvy', 'id': contract}]
                owned.append(source('POST', 'faktury', body)['data']['id'])
            deadline = time.monotonic() + 45
            while time.monotonic() < deadline:
                before = requests.get(BASE + '/rest/v1/query/faktury/' + owned[0], headers=HEADERS, params={'related_page_size': 1}, timeout=10)
                if before.status_code == 200 and before.json()['data']['pagination']['next_cursor']:
                    break
                time.sleep(.2)
            self.assertEqual(200, before.status_code, before.text)
            snapshot = before.json()
            cursor = snapshot['data']['pagination']['next_cursor']
            self.assertTrue(cursor)
            triggered = threading.Event()
            errors = []
            evidence = {}
            test = self

            class Relay(BaseHTTPRequestHandler):
                def log_message(self, *args):
                    pass

                def do_GET(self):
                    try:
                        # Freeze via the real HTTP owner first, forward its exact bytes unmodified.
                        response = requests.get('http://localhost:8081' + self.path, headers=HEADERS, timeout=30)
                        if self.path.startswith('/internal/v1/export') and not triggered.is_set():
                            triggered.set()
                            test.assertEqual(200, response.status_code, response.text)
                            test.assertEqual(503, requests.get(BASE + '/rest/v1/query/faktury', headers=HEADERS, timeout=10).status_code)
                            newer = source('POST', 'faktury/' + owned[0] + '/update', {'predmet': 'Concurrent authoritative recovery update'})['data']
                            source('POST', 'faktury/' + owned[1] + '/delete')
                            # Technical outbox metadata for precisely our two owned identities only.
                            deadline = time.monotonic() + 45
                            while time.monotonic() < deadline:
                                pending = outbox.count_documents({'event.entity_id': {'$in': owned}, 'published_at': None})
                                if pending == 0:
                                    break
                                time.sleep(.1)
                            test.assertEqual(0, pending)
                            evidence.update(snapshot_id=response.json()['snapshot_id'], updated_version=newer['entity_version'], deleted_id=owned[1])
                        self.send_response(response.status_code)
                        self.send_header('Content-Type', response.headers.get('Content-Type', 'application/json'))
                        self.end_headers()
                        self.wfile.write(response.content)
                    except Exception as error:
                        errors.append(repr(error))
                        self.send_error(500, str(error))

            server = ThreadingHTTPServer(('127.0.0.1', 0), Relay)
            thread = threading.Thread(target=server.serve_forever, daemon=True)
            thread.start()
            try:
                environment = dict(os.environ, INVOICES_SERVICE_URL='http://127.0.0.1:' + str(server.server_port))
                result = subprocess.run([sys.executable, str(ROOT / 'scripts/rebuild/rebuild.py'), 'manual'], cwd=ROOT, env=environment, capture_output=True, text=True, timeout=180)
                (ROOT / '.run/rebuild-acceptance.log').write_text(result.stdout + result.stderr)
                self.assertEqual([], errors)
                self.assertEqual(0, result.returncode, result.stdout + result.stderr)
                self.assertTrue(triggered.is_set())
                self.assertRegex(result.stdout, r'replayed=[1-9][0-9]*')
                current = source('GET', 'query/faktury/' + owned[0])
                self.assertEqual('Concurrent authoritative recovery update', current['data']['root']['zaznam']['predmet'])
                self.assertEqual(evidence['updated_version'], current['projection']['root_entity_version'])
                self.assertEqual(404, requests.get(BASE + '/rest/v1/query/faktury/' + owned[1], headers=HEADERS, timeout=10).status_code)
                continuation = requests.get(BASE + '/rest/v1/query/faktury/' + owned[0], headers=HEADERS,
                                            params={'related_page_size': 1, 'cursor': cursor}, timeout=10)
                self.assertEqual(200, continuation.status_code, continuation.text)
                self.assertEqual(snapshot['data']['root'], continuation.json()['data']['root'], 'old joined snapshot must retain old root after new generation activation')
                evidence.update(status='verified', owned_ids=owned, old_snapshot_root_version=snapshot['projection']['root_entity_version'], old_cursor_retained=True)
                (ROOT / '.run/rebuild-acceptance.json').write_text(json.dumps(evidence, indent=2) + '\n')
                print(json.dumps(evidence))
            finally:
                server.shutdown()
                server.server_close()
        finally:
            mongo.close()
            for identity in owned:
                response = requests.post(BASE + '/rest/v1/faktury/' + identity + '/delete', headers=HEADERS, timeout=30)
                self.assertIn(response.status_code, (200, 404), response.text)


if __name__ == '__main__':
    unittest.main()
