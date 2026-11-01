"""Coordinated manual-stack dependency faults; restores every paused resource in finally.
Run only when browser tests are idle. Never resets data or publishes raw Kafka fixtures.
"""
import hashlib
import json
import os
from pathlib import Path
import signal
import subprocess
import sys
import time
import unittest
import uuid

import boto3
import requests
from pymongo import MongoClient

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / 'scripts/seed'))
from seed import payload, pdf_bytes
BASE = os.environ.get('API_BASE_URL', 'http://localhost:8080')
HEADERS = {'X-Obec-Id': 'zilina'}
COMPOSE = ['docker', 'compose', '-p', 'openobec', '-f', str(ROOT / 'compose.yaml')]


def compose(*arguments):
    subprocess.run(COMPOSE + list(arguments), cwd=ROOT, check=True, capture_output=True, text=True)


def wait_until(predicate, seconds=60):
    deadline = time.monotonic() + seconds
    while time.monotonic() < deadline:
        if predicate():
            return
        time.sleep(.2)
    raise AssertionError('Recovery condition did not become true within deadline')


class LiveDependencyFaults(unittest.TestCase):
    def test_owner_503_rolls_back_s3_retains_bytes_and_kafka_recovers_outbox(self):
        namespace = 'FAULT-' + uuid.uuid4().hex[:16]
        mongo = MongoClient(os.environ.get('MONGODB_INVOICES_URI', 'mongodb://localhost:27017/openobec_invoices?replicaSet=rs-invoices&directConnection=true'))
        db = mongo.get_default_database()
        response = requests.post(BASE + '/rest/v1/faktury', headers=HEADERS, json=payload('faktury', 0, namespace), timeout=30)
        self.assertEqual(201, response.status_code, response.text)
        identity = response.json()['data']['id']
        path = BASE + '/rest/v1/faktury/' + identity
        evidence = {'namespace': namespace, 'owned_id': identity}
        try:
            baseline = requests.get(path, headers=HEADERS, timeout=10).json()['data']
            row = json.loads((ROOT / '.run/processes.json').read_text())['contracts-service']
            command = subprocess.check_output(['ps', '-p', str(row['pid']), '-o', 'command='], text=True)
            self.assertIn(str(ROOT / 'services/contracts-service/target/contracts-service-0.1.0-SNAPSHOT.jar'), command)
            os.kill(row['pid'], signal.SIGSTOP)
            try:
                response = requests.post(path + '/update', headers=HEADERS,
                                         json={'predmet': 'Must roll back', 'suvisiace_zaznamy': [{'typ': 'zmluvy', 'id': 'zml_' + str(uuid.uuid4())}]}, timeout=15)
                self.assertEqual(503, response.status_code, response.text)
                self.assertEqual(baseline, requests.get(path, headers=HEADERS, timeout=10).json()['data'])
                rejected = payload('faktury', 1, namespace)
                rejected['suvisiace_zaznamy'] = [{'typ': 'zmluvy', 'id': 'zml_' + str(uuid.uuid4())}]
                response = requests.post(BASE + '/rest/v1/faktury', headers=HEADERS, json=rejected, timeout=15)
                self.assertEqual(503, response.status_code, response.text)
                response = requests.get(BASE + '/rest/v1/faktury', headers=HEADERS, params={'q': rejected['cislo']}, timeout=10)
                self.assertEqual([], response.json()['data'])
                evidence['owner_503'] = {'update_unchanged': True, 'create_absent': True, 'entity_version': baseline['entity_version']}
            finally:
                os.kill(row['pid'], signal.SIGCONT)

            blob = pdf_bytes('Owned dependency fault acceptance')
            response = requests.post(path + '/prilohy', headers=HEADERS, files={'file': ('retained.pdf', blob, 'application/pdf')}, timeout=40)
            self.assertEqual(201, response.status_code, response.text)
            attachment = response.json()['data']
            before = requests.get(path + '/prilohy', headers=HEADERS, timeout=10).json()
            compose('pause', 'rustfs')
            try:
                response = requests.post(path + '/prilohy', headers=HEADERS, files={'file': ('failed.pdf', pdf_bytes('Must fail'), 'application/pdf')}, timeout=45)
                self.assertEqual(503, response.status_code, response.text)
                self.assertEqual(before, requests.get(path + '/prilohy', headers=HEADERS, timeout=10).json())
                self.assertEqual(baseline, requests.get(path, headers=HEADERS, timeout=10).json()['data'])
            finally:
                compose('unpause', 'rustfs')
            response = requests.get(path + '/prilohy/' + attachment['id'] + '/download', headers=HEADERS, timeout=40)
            self.assertEqual(blob, response.content)
            self.assertEqual(attachment['sha256'], hashlib.sha256(response.content).hexdigest())
            metadata = db.attachments.find_one({'document_id': identity, 'id': attachment['id']}, {'object_key': 1})
            response = requests.post(path + '/prilohy/' + attachment['id'] + '/delete', headers=HEADERS, timeout=10)
            self.assertEqual(200, response.status_code, response.text)
            self.assertEqual(404, requests.get(path + '/prilohy/' + attachment['id'] + '/download', headers=HEADERS, timeout=10).status_code)
            s3 = boto3.client('s3', endpoint_url=os.environ.get('S3_ENDPOINT', 'http://localhost:9000'), aws_access_key_id=os.environ.get('S3_ACCESS_KEY', 'openobec-demo'), aws_secret_access_key=os.environ.get('S3_SECRET_KEY', 'openobec-local-demo-secret'), region_name='us-east-1')
            retained = s3.get_object(Bucket=os.environ.get('S3_BUCKET', 'openobec-documents'), Key=metadata['object_key'])['Body'].read()
            self.assertEqual(blob, retained)
            evidence['s3'] = {'failed_upload_status': 503, 'metadata_unchanged': True, 'recovered_sha256': attachment['sha256'], 'logically_deleted_blob_retained': True}

            wait_until(lambda: db.outbox.count_documents({'event.entity_id': identity, 'published_at': None}) == 0)
            compose('pause', 'kafka')
            try:
                response = requests.post(path + '/update', headers=HEADERS, json={'predmet': 'Kafka outage committed source data'}, timeout=10)
                self.assertEqual(200, response.status_code, response.text)
                version = response.json()['data']['entity_version']
                event_filter = {'event.entity_id': identity, 'event.entity_version': version}
                wait_until(lambda: db.outbox.count_documents({**event_filter, 'published_at': None, 'attempts': {'$gte': 1}, 'last_error': {'$type': 'string'}}) == 1, seconds=25)
                self.assertEqual('Kafka outage committed source data', requests.get(path, headers=HEADERS, timeout=10).json()['data']['predmet'])
                evidence['kafka'] = {'committed_version': version, 'pending_outbox_during_outage': True, 'publish_failure_recorded': True}
            finally:
                compose('unpause', 'kafka')
            wait_until(lambda: db.outbox.count_documents({**event_filter, 'published_at': {'$ne': None}}) == 1)

            def projected():
                response = requests.get(BASE + '/rest/v1/query/faktury/' + identity, headers=HEADERS, timeout=10)
                return response.status_code == 200 and response.json()['projection']['root_entity_version'] == version

            wait_until(projected)
            evidence['kafka']['published_and_projected_after_recovery'] = True
            (ROOT / '.run/fault-acceptance.json').write_text(json.dumps(evidence, indent=2) + '\n')
            print(json.dumps(evidence))
        finally:
            response = requests.post(path + '/delete', headers=HEADERS, timeout=30)
            mongo.close()
            self.assertIn(response.status_code, (200, 404), response.text)


if __name__ == '__main__':
    unittest.main()
