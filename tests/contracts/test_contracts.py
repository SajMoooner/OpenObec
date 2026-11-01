"""Boundary checks for the published JSON-compatible OpenAPI YAML contract.

Run: python3 -m unittest discover -s tests/contracts -p 'test_*.py'.
No third-party Python packages are required.
"""
import json
from pathlib import Path
import re
import unittest

ROOT = Path(__file__).resolve().parents[2]
AGENDAS = {'faktury': 'Faktura', 'dodavatelske-faktury': 'DodavatelskaFaktura',
           'zmluvy': 'Zmluva', 'objednavky': 'Objednavka',
           'verejne-obstaravanie': 'VerejneObstaravanie', 'vzn': 'Vzn'}

class ContractTests(unittest.TestCase):
    def setUp(self):
        path = ROOT / 'contracts/openapi.yaml'
        self.assertTrue(path.is_file(), 'The published contracts/openapi.yaml contract is missing')
        self.api = json.loads(path.read_text())
        self.ops = [(p, m, o) for p, v in self.api['paths'].items()
                    for m, o in v.items() if m in {'get', 'post', 'put', 'delete', 'patch'}]
        self.schemas = self.api['components']['schemas']

    def test_exact_source_and_attachment_operations(self):
        self.assertEqual(len(self.ops), 70)
        expected = set()
        for agenda in AGENDAS:
            base = '/rest/v1/' + agenda
            expected.update({(base, 'get'), (base, 'post'), (base+'/{id}', 'get'),
                             (base+'/{id}/update', 'post'), (base+'/{id}/delete', 'post'),
                             (base+'/{id}/prilohy', 'get'), (base+'/{id}/prilohy', 'post'),
                             (base+'/{id}/prilohy/{file_id}/download', 'get'),
                             (base+'/{id}/prilohy/{file_id}/delete', 'post')})
            if agenda != 'vzn':
                expected.update({(base+'/{id}/suvislosti', 'get'),
                                 ('/rest/v1/query/'+agenda, 'get'),
                                 ('/rest/v1/query/'+agenda+'/{id}', 'get')})
        expected.add(('/rest/v1/vyber-zaznamov', 'get'))
        self.assertEqual({(p, m) for p, m, _ in self.ops}, expected)

    def test_unique_operation_ids(self):
        ids = [o['operationId'] for _, _, o in self.ops]
        self.assertEqual(len(ids), len(set(ids)))

    def test_query_service_has_sixteen_read_only_operations(self):
        query = [(p, m) for p, m, o in self.ops if o['x-service'] == 'query-api']
        self.assertEqual(len(query), 16)
        self.assertTrue(all(m == 'get' for _, m in query))
        for p, m, o in self.ops:
            if m != 'get': self.assertNotEqual(o['x-service'], 'query-api', p)
            if '/query/' in p or p.endswith('/suvislosti') or p.endswith('/vyber-zaznamov'):
                self.assertEqual(o['x-service'], 'query-api', p)
            self.assertNotIn('/internal/', p)

    def test_six_domain_schemas_retain_source_fields(self):
        for name in AGENDAS.values():
            self.assertIn(name, self.schemas)
            fields = self.schemas[name]['properties']
            self.assertTrue({'id', 'obec_id', 'cislo', 'predmet', 'zverejnene',
                             'created_at', 'updated_at'} <= fields.keys())
        self.assertIn('odberatel', self.schemas['Faktura']['properties'])
        self.assertNotIn('dodavatel', self.schemas['Faktura']['properties'])
        self.assertIn('dodavatel', self.schemas['DodavatelskaFaktura']['properties'])
        self.assertEqual(self.schemas['Vzn']['properties']['datum_schvalenia']['format'], 'date')
        self.assertTrue({'entity_version', 'suvisiace_zaznamy', 'mena', 'suma_s_dph'}.isdisjoint(
            self.schemas['Vzn']['properties']))

    def test_writes_are_strict_partial_updates_and_money_is_decimal_string(self):
        for name in AGENDAS.values():
            for suffix in ('Create', 'Update'):
                schema = self.schemas[name+suffix]
                self.assertFalse(schema['additionalProperties'])
                self.assertTrue({'id','obec_id','created_at','updated_at','entity_version'}.isdisjoint(schema['properties']))
            self.assertEqual(self.schemas[name+'Update']['minProperties'], 1)
            self.assertNotIn('required', self.schemas[name+'Update'])
        money = self.schemas['Money']
        self.assertEqual(money['type'], 'string')
        for good in ('0.00', '123.45'): self.assertRegex(good, money['pattern'])
        for bad in ('1.1', '-1.00', '1e2', '1.001'): self.assertNotRegex(bad, money['pattern'])

    def test_updates_do_not_apply_creation_defaults_to_omitted_fields(self):
        for name in AGENDAS.values():
            for field, value in self.schemas[name+'Update']['properties'].items():
                self.assertNotIn('default', value, name+'.'+field)

    def test_required_tenant_and_response_wrappers(self):
        for p, m, op in self.ops:
            self.assertIn({'$ref': '#/components/parameters/ObecId'}, op['parameters'], p)
            self.assertIn('400', op['responses'])
            if m == 'get': self.assertNotIn('requestBody', op)
            if p.endswith('/delete'): self.assertNotIn('requestBody', op)
        tenant = self.api['components']['parameters']['ObecId']
        self.assertEqual((tenant['name'], tenant['in'], tenant['required']), ('X-Obec-Id','header',True))
        self.assertEqual(tenant['schema']['enum'], ['zilina'])
        self.assertEqual(set(self.schemas['Error']['properties']), {'error'})
        self.assertIn('details', self.schemas['Error']['properties']['error']['required'])

    def test_all_local_references_resolve(self):
        def walk(value):
            if isinstance(value, dict):
                if '$ref' in value:
                    target = self.api
                    for part in value['$ref'].removeprefix('#/').split('/'):
                        self.assertIn(part, target, value['$ref']); target = target[part]
                for item in value.values(): walk(item)
            elif isinstance(value, list):
                for item in value: walk(item)
        walk(self.api)

    def test_events_are_full_snapshots_for_five_domains_only(self):
        event = json.loads((ROOT/'contracts/events/document-event.schema.json').read_text())
        self.assertEqual(set(event['required']), {'event_id','event_type','schema_version','entity_type',
            'entity_id','entity_version','obec_id','occurred_at','data'})
        self.assertEqual(set(event['properties']['entity_type']['enum']), set(AGENDAS)-{'vzn'})
        self.assertFalse(event['additionalProperties'])
        for branch in event['oneOf']:
            data = branch['properties']['data']
            self.assertTrue({'id','obec_id','entity_version','deleted','suvisiace_zaznamy'} <= set(data['required']))

if __name__ == '__main__': unittest.main()
