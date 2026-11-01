"""Concrete live fixtures for every checked-in OpenAPI operation (70)."""
import base64
import hashlib
import json
import os
from pathlib import Path
import sys
import time
import unittest
import uuid

import jsonschema
import requests

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / 'scripts/seed'))
from seed import AGENDAS, payload, pdf_bytes

BASE = os.environ.get('API_BASE_URL', 'http://localhost:8080').rstrip('/')
HEADERS = {'X-Obec-Id': 'zilina'}


class ContractHttpAcceptance(unittest.TestCase):
    def test_all_seventy_operations_return_contract_valid_concrete_fixtures(self):
        spec = json.loads((ROOT / 'contracts/openapi.yaml').read_text())
        evidence = []
        owned = {}
        namespace = 'ACCEPT-' + uuid.uuid4().hex[:16]

        def call(method, template, *, identity=None, file_id=None, body=None, query=None, files=None):
            path = template.replace('{id}', identity or '').replace('{file_id}', file_id or '')
            response = requests.request(method, BASE + path, headers=HEADERS, json=body, params=query, files=files, timeout=30)
            operation = spec['paths'][template][method.lower()]
            self.assertIn(str(response.status_code), operation['responses'], response.text)
            self.assertIn(response.status_code, (200, 201, 204), operation['operationId'] + ' ' + response.text)
            contract = operation['responses'][str(response.status_code)]
            fixture = {'operation_id': operation['operationId'], 'method': method, 'path': path, 'query': query, 'request_json': body,
                       'status': response.status_code, 'headers': dict(response.headers)}
            if response.content and 'json' in response.headers.get('Content-Type', ''):
                data = response.json()
                schema = contract['content']['application/json']['schema']
                jsonschema.Draft202012Validator({**schema, 'components': spec['components']}, format_checker=jsonschema.FormatChecker()).validate(data)
                fixture['response_json'] = data
            elif response.content:
                self.assertEqual('application/pdf', response.headers['Content-Type'])
                self.assertEqual(blob, response.content)
                fixture['response_base64'] = base64.b64encode(response.content).decode()
                fixture['sha256'] = hashlib.sha256(response.content).hexdigest()
            evidence.append(fixture)
            return response

        blob = pdf_bytes('OpenObec live contract acceptance')
        try:
            for agenda in AGENDAS:
                base = '/rest/v1/' + agenda
                response = call('POST', base, body=payload(agenda, 0, namespace))
                identity = response.json()['data']['id']
                owned[agenda] = identity
                self.assertEqual(base + '/' + identity, response.headers['Location'])
                call('GET', base, query={'q': namespace})
                call('GET', base + '/{id}', identity=identity)
                call('POST', base + '/{id}/update', identity=identity, body={'predmet': 'Aktualizovaný syntetický akceptačný záznam'})
                attached = call('POST', base + '/{id}/prilohy', identity=identity, files={'file': ('acceptance.pdf', blob, 'application/pdf')}).json()['data']
                self.assertEqual(hashlib.sha256(blob).hexdigest(), attached['sha256'])
                call('GET', base + '/{id}/prilohy', identity=identity)
                call('GET', base + '/{id}/prilohy/{file_id}/download', identity=identity, file_id=attached['id'])
                call('POST', base + '/{id}/prilohy/{file_id}/delete', identity=identity, file_id=attached['id'])
            for agenda in AGENDAS[:-1]:
                identity = owned[agenda]
                deadline = time.monotonic() + 60
                while time.monotonic() < deadline:
                    r = requests.get(BASE + '/rest/v1/query/' + agenda + '/' + identity, headers=HEADERS, timeout=10)
                    if r.status_code == 200 and r.json()['projection']['root_entity_version'] == requests.get(BASE + '/rest/v1/' + agenda + '/' + identity, headers=HEADERS, timeout=10).json()['data']['entity_version']:
                        break
                    time.sleep(.2)
                self.assertEqual(200, r.status_code, r.text)
                call('GET', '/rest/v1/query/' + agenda, query={'q': namespace})
                call('GET', '/rest/v1/query/' + agenda + '/{id}', identity=identity)
                call('GET', '/rest/v1/' + agenda + '/{id}/suvislosti', identity=identity)
            call('GET', '/rest/v1/vyber-zaznamov', query={'zdroj_typ': 'faktury', 'typ': 'zmluvy', 'q': namespace})
            for agenda, identity in list(owned.items()):
                call('POST', '/rest/v1/' + agenda + '/{id}/delete', identity=identity)
                del owned[agenda]
            expected = {operation['operationId'] for path in spec['paths'].values() for operation in path.values()}
            self.assertEqual(70, len(expected))
            self.assertEqual(expected, {row['operation_id'] for row in evidence})
            output = ROOT / '.run/contract-fixtures.json'
            output.parent.mkdir(exist_ok=True)
            output.write_text(json.dumps({'namespace': namespace, 'operation_count': len(evidence), 'fixtures': evidence}, ensure_ascii=False, indent=2) + '\n')
            print(f'70 concrete HTTP fixtures validated: {output}')
        finally:
            # Only records created by this run; normal source deletion emits real tombstones.
            for agenda, identity in owned.items():
                requests.post(BASE + '/rest/v1/' + agenda + '/' + identity + '/delete', headers=HEADERS, timeout=30).raise_for_status()


if __name__ == '__main__':
    unittest.main()
