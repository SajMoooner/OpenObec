"""Seed readiness waits for live source versions, independently of graph validity."""
import importlib.util
from pathlib import Path
import unittest
from unittest.mock import patch
import urllib.error

ROOT = Path(__file__).resolve().parents[2]
spec = importlib.util.spec_from_file_location('seed_projection', ROOT / 'scripts/seed/seed.py')
seed = importlib.util.module_from_spec(spec)
spec.loader.exec_module(seed)


class SeedProjectionTest(unittest.TestCase):
    def manifest(self):
        return {'records': {a: [{'id': 'root', 'state': 'complete'}] if a == 'faktury' else [] for a in seed.AGENDAS}}

    def joined(self, version, status='ready'):
        return {'projection': {'status': status, 'root_entity_version': version, 'as_of': '2026-11-01T00:00:00Z', 'unresolved_references_count': 1 if status == 'pending' else 0},
                'data': {'root': {'typ': 'faktury', 'zaznam': None if version is None else {'id': 'root', 'entity_version': version}}, 'suvisiace_zaznamy': [], 'vazby': [], 'pagination': {'complete': True, 'next_cursor': None, 'total': 0, 'related_page_size': 100}}}

    def test_caught_up_pending_graph_is_delivered(self):
        def transport(method, path):
            return self.joined(2, 'pending') if path.startswith('query/') else {'data': {'id': 'root', 'entity_version': 2}}
        with patch.object(seed, 'request', transport), patch.object(seed.time, 'sleep'):
            seed.wait_projection(self.manifest(), seconds=.01)

    def test_missing_query_root_does_not_skip_a_live_source(self):
        calls = []
        def transport(method, path):
            if not path.startswith('query/'):
                return {'data': {'id': 'root', 'entity_version': 2}}
            calls.append(path)
            if len(calls) == 1:
                raise urllib.error.HTTPError(path, 404, 'Not found', {}, None)
            return self.joined(1 if len(calls) == 2 else 2)
        with patch.object(seed, 'request', transport), patch.object(seed.time, 'sleep'):
            seed.wait_projection(self.manifest(), seconds=1)
        self.assertEqual(3, len(calls), 'missing/stale projection must wait for event delivery')

    def test_pending_root_without_payload_keeps_waiting(self):
        calls = []
        def transport(method, path):
            if not path.startswith('query/'):
                return {'data': {'id': 'root', 'entity_version': 2}}
            calls.append(path)
            return self.joined(None, 'pending') if len(calls) == 1 else self.joined(2)
        with patch.object(seed, 'request', transport), patch.object(seed.time, 'sleep'):
            seed.wait_projection(self.manifest(), seconds=1)
        self.assertEqual(2, len(calls))

    def test_initial_link_target_must_arrive_even_when_owner_version_has_arrived(self):
        manifest = self.manifest()
        manifest['records']['zmluvy'] = [{'id': 'owner', 'state': 'complete'}]
        target_reads = []

        def transport(method, path):
            if not path.startswith('query/'):
                return {'data': {'id': path.split('/')[-1], 'entity_version': 2}}
            if path == 'query/zmluvy/owner':
                return self.joined(2, 'pending')
            target_reads.append(path)
            return self.joined(None, 'pending') if len(target_reads) == 1 else self.joined(2)

        with patch.object(seed, 'request', transport), patch.object(seed.time, 'sleep'):
            seed.wait_projection(manifest, seconds=1)
        self.assertEqual(2, len(target_reads), 'a caught-up owner cannot skip its undelivered seed target')
