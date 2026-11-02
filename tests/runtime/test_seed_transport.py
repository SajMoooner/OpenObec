"""Seed transport retries only explicit, pre-processing gateway throttling."""
from datetime import datetime, timezone
from email.message import Message
import io
import json
from pathlib import Path
import sys
import unittest
from unittest.mock import patch
import urllib.error

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / 'scripts/seed'))
import seed


class SeedTransportTest(unittest.TestCase):
    def error(self, code=429, retry_after='2'):
        headers = Message()
        headers['Content-Type'] = 'application/json'
        headers['X-Request-Id'] = 'rate-limit-request'
        if retry_after is not None:
            headers['Retry-After'] = retry_after
        return urllib.error.HTTPError('http://gateway/rest/v1/faktury', code,
                                      'gateway error', headers, io.BytesIO(b'{"error":"original"}'))

    def response(self, body=b'{"data":{"id":"owned"}}', content_type='application/json'):
        response = io.BytesIO(body)
        response.headers = {'Content-Type': content_type}
        return response

    def test_rejected_post_recovers_without_changing_the_write(self):
        rejected = self.error()
        response = self.response()
        attempts, sleeps = [], []

        def transport(req, timeout):
            attempts.append((req.method, req.full_url, req.data, dict(req.headers), timeout))
            if len(attempts) == 1:
                raise rejected
            return response

        with patch.object(seed.urllib.request, 'urlopen', transport), patch.object(seed.time, 'sleep', sleeps.append):
            result = seed.request('POST', 'faktury', {'predmet': 'Preserved write'})
        self.assertEqual({'data': {'id': 'owned'}}, result)
        self.assertEqual(2, len(attempts))
        self.assertEqual(attempts[0], attempts[1])
        self.assertEqual({'predmet': 'Preserved write'}, json.loads(attempts[1][2]))
        self.assertEqual([2], sleeps)
        self.assertTrue(rejected.closed, 'discarded rejection must release its connection')
        self.assertTrue(response.closed)

    def test_server_delay_supports_window_boundary_and_http_date(self):
        now = datetime(2026, 11, 2, tzinfo=timezone.utc).timestamp()
        for header, delay in [('60', 60), ('0', 0), ('Mon, 02 Nov 2026 00:00:07 GMT', 7)]:
            with self.subTest(header=header):
                rejected = self.error(retry_after=header)
                sleeps = []
                with patch.object(seed.urllib.request, 'urlopen', side_effect=[rejected, self.response()]), \
                        patch.object(seed.time, 'sleep', sleeps.append), patch.object(seed.time, 'time', return_value=now):
                    self.assertEqual({'data': {'id': 'owned'}}, seed.request('GET', 'faktury'))
                self.assertEqual([delay], sleeps)

    def test_missing_or_malformed_delay_has_bounded_fallback_and_preserves_final_error(self):
        for header in [None, '', 'not a date', '-1', '1.5']:
            with self.subTest(header=header):
                errors = [self.error(retry_after=header) for _ in range(3)]
                self.addCleanup(errors[-1].close)
                sleeps = []
                with patch.object(seed.urllib.request, 'urlopen', side_effect=errors) as transport, \
                        patch.object(seed.time, 'sleep', sleeps.append):
                    with self.assertRaises(urllib.error.HTTPError) as caught:
                        seed.request('GET', 'faktury')
                self.assertIs(errors[-1], caught.exception)
                self.assertEqual(3, transport.call_count)
                self.assertEqual([1, 2], sleeps)
                self.assertTrue(all(error.closed for error in errors[:-1]))
                self.assertFalse(caught.exception.closed)
                self.assertEqual(b'{"error":"original"}', caught.exception.read())
                self.assertEqual('rate-limit-request', caught.exception.headers['X-Request-Id'])

    def test_repeated_valid_throttling_stops_after_three_attempts(self):
        errors = [self.error(retry_after='60') for _ in range(3)]
        self.addCleanup(errors[-1].close)
        sleeps = []
        with patch.object(seed.urllib.request, 'urlopen', side_effect=errors) as transport, \
                patch.object(seed.time, 'sleep', sleeps.append):
            with self.assertRaises(urllib.error.HTTPError) as caught:
                seed.request('POST', 'faktury/owned/delete')
        self.assertIs(errors[-1], caught.exception)
        self.assertEqual(3, transport.call_count)
        self.assertEqual([60, 60], sleeps)
        self.assertFalse(caught.exception.closed)

    def test_excessive_server_delay_returns_original_error_without_retrying_early(self):
        for header in ['61', '999999999999999999999999', 'Tue, 03 Nov 2026 00:00:00 GMT']:
            with self.subTest(header=header):
                rejected = self.error(retry_after=header)
                self.addCleanup(rejected.close)
                with patch.object(seed.urllib.request, 'urlopen', side_effect=rejected) as transport, \
                        patch.object(seed.time, 'sleep') as sleep, patch.object(seed.time, 'time', return_value=1793577600):
                    with self.assertRaises(urllib.error.HTTPError) as caught:
                        seed.request('POST', 'faktury', {'predmet': 'No early retry'})
                self.assertIs(rejected, caught.exception)
                self.assertEqual(1, transport.call_count)
                sleep.assert_not_called()
                self.assertFalse(rejected.closed)

    def test_other_http_errors_and_ambiguous_mutation_failures_are_not_retried(self):
        failures = [self.error(code=code) for code in [400, 404, 409, 500, 503]]
        failures += [urllib.error.URLError('connection lost'), TimeoutError('response lost'), ConnectionResetError('reset')]
        for failure in failures:
            if isinstance(failure, urllib.error.HTTPError):
                self.addCleanup(failure.close)
            with self.subTest(failure=failure):
                with patch.object(seed.urllib.request, 'urlopen', side_effect=failure) as transport, \
                        patch.object(seed.time, 'sleep') as sleep:
                    with self.assertRaises(type(failure)) as caught:
                        seed.request('POST', 'faktury', {'predmet': 'Only once'})
                self.assertIs(failure, caught.exception)
                self.assertEqual(1, transport.call_count)
                sleep.assert_not_called()
                if isinstance(failure, urllib.error.HTTPError):
                    self.assertFalse(failure.closed)

    def test_upload_and_download_share_throttling_without_changing_binary_data(self):
        blob = b'%PDF-1.4\nexample\x00\xff'
        attempts = []

        def upload(req, timeout):
            attempts.append((req.method, req.full_url, req.data, dict(req.headers)))
            if len(attempts) == 1:
                raise self.error()
            return self.response()

        with patch.object(seed.urllib.request, 'urlopen', upload), patch.object(seed.time, 'sleep'):
            self.assertEqual({'data': {'id': 'owned'}}, seed.upload('faktury/owned', blob, 'evidence.pdf'))
        self.assertEqual(2, len(attempts))
        self.assertEqual(attempts[0], attempts[1])
        self.assertTrue(attempts[0][1].endswith('/faktury/owned/prilohy'))
        self.assertIn(blob, attempts[0][2])
        self.assertIn('multipart/form-data; boundary=', attempts[0][3]['Content-type'])
        with patch.object(seed.urllib.request, 'urlopen', side_effect=[self.error(), self.response(blob, 'application/pdf')]), \
                patch.object(seed.time, 'sleep'):
            self.assertEqual(blob, seed.request('GET', 'faktury/owned/prilohy/pdf/download'))

    def test_lost_successful_post_body_is_not_retried(self):
        response = self.response()
        with patch.object(response, 'read', side_effect=TimeoutError('body lost')), \
                patch.object(seed.urllib.request, 'urlopen', return_value=response) as transport, \
                patch.object(seed.time, 'sleep') as sleep:
            with self.assertRaises(TimeoutError):
                seed.request('POST', 'faktury', {'predmet': 'Possibly committed'})
        self.assertEqual(1, transport.call_count)
        sleep.assert_not_called()
        self.assertTrue(response.closed)


if __name__ == '__main__':
    unittest.main()
