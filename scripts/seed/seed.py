#!/usr/bin/env python3
"""Two-pass, API-only fictional municipal seed. Existing owned records are never rewritten."""
import argparse
import hashlib
import json
import os
from pathlib import Path
import time
import urllib.error
import urllib.request
import uuid
import sys
sys.path.insert(0, str(Path(__file__).resolve().parent))
from realistic import catalog, document_path, VERSION

ROOT = Path(__file__).resolve().parents[2]
AGENDAS = ('faktury', 'dodavatelske-faktury', 'zmluvy', 'objednavky', 'verejne-obstaravanie', 'vzn')
BASE = os.environ.get('API_BASE_URL', 'http://localhost:8080').rstrip('/')


def request(method, path, body=None, content_type='application/json'):
    if isinstance(body, dict):
        body = json.dumps(body, ensure_ascii=False).encode()
    req = urllib.request.Request(BASE + '/rest/v1/' + path, data=body, method=method,
                                 headers={'X-Obec-Id': 'zilina', 'Content-Type': content_type})
    with urllib.request.urlopen(req, timeout=30) as response:
        data = response.read()
        return json.loads(data) if 'json' in response.headers.get('Content-Type', '') and data else data


def pdf_bytes(label='OpenObec synthetic demonstration document'):
    """A real one-page PDF with readable text, xref and trailer (no external package)."""
    label = label.encode('ascii', 'replace').decode().replace('\\', '\\\\').replace('(', '\\(').replace(')', '\\)')
    stream = f'BT /F1 16 Tf 50 770 Td ({label}) Tj 0 -30 Td (Synthetic data - no real personal information.) Tj ET'.encode()
    objects = [b'<< /Type /Catalog /Pages 2 0 R >>', b'<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
               b'<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
               b'<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>', b'<< /Length ' + str(len(stream)).encode() + b' >>\nstream\n' + stream + b'\nendstream']
    output = bytearray(b'%PDF-1.4\n')
    offsets = [0]
    for index, obj in enumerate(objects, 1):
        offsets.append(len(output))
        output.extend(f'{index} 0 obj\n'.encode() + obj + b'\nendobj\n')
    xref = len(output)
    output.extend(f'xref\n0 {len(offsets)}\n0000000000 65535 f \n'.encode())
    for offset in offsets[1:]:
        output.extend(f'{offset:010d} 00000 n \n'.encode())
    output.extend(f'trailer\n<< /Size {len(offsets)} /Root 1 0 R >>\nstartxref\n{xref}\n%%EOF\n'.encode())
    return bytes(output)


def upload(path, blob, filename='synteticky-dokument.pdf'):
    boundary = 'OpenObec' + uuid.uuid4().hex
    body = (f'--{boundary}\r\nContent-Disposition: form-data; name="file"; filename="{filename}"\r\nContent-Type: application/pdf\r\n\r\n'.encode()
            + blob + f'\r\n--{boundary}--\r\n'.encode())
    return request('POST', path + '/prilohy', body, 'multipart/form-data; boundary=' + boundary)


def legacy_payload(agenda, index, prefix='DEMO-2026'):
    row = {'cislo': f'{prefix}-{AGENDAS.index(agenda) + 1:02d}-{index + 1:03d}',
           'predmet': ['Obnova mestskej knižnice', 'Výsadba stromov v parku', 'Údržba verejného osvetlenia', 'Oprava chodníkov'][index % 4] + f' – syntetický záznam {index + 1}',
           'zverejnene': index % 3 != 2}
    party = {'nazov': f'Syntetický dodávateľ {index + 1}', 'ico': f'{90000000 + index:08d}'}
    if agenda in ('faktury', 'dodavatelske-faktury'):
        row.update({('odberatel' if agenda == 'faktury' else 'dodavatel'): party, 'datum_vystavenia': '2026-10-01', 'datum_splatnosti': '2026-10-31', 'suma_bez_dph': '100.00', 'suma_dph': '23.00', 'suma_s_dph': '123.00', 'mena': 'EUR'})
    elif agenda == 'zmluvy':
        row.update(zmluvna_strana=party, datum_podpisu='2026-09-01', datum_ucinnosti='2026-10-01', suma_s_dph='1230.00', mena='EUR')
    elif agenda == 'objednavky':
        row.update(dodavatel=party, datum_objednania='2026-10-01', termin_dodania='2026-10-31', suma_s_dph='123.00', mena='EUR')
    elif agenda == 'verejne-obstaravanie':
        row.update(nazov=row['predmet'], cpv='45000000-7', predpokladana_hodnota_bez_dph='1000.00', mena='EUR', lehota_predkladania='2026-12-01T12:00:00Z', stav='otvorene')
    else:
        row.update(nazov=f'Syntetické VZN {index + 1}', datum_schvalenia='2026-09-01', datum_ucinnosti='2026-10-01')
    return row


def payload(agenda, index, prefix='DEMO-2026'):
    return catalog(agenda, index, prefix)


def save(path, manifest):
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_suffix(path.suffix + '.tmp')
    temporary.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n')
    temporary.replace(path)


def wait_projection(manifest, seconds=90):
    deadline = time.monotonic() + seconds
    pending = {(a, r['id']) for a in AGENDAS[:-1] for r in manifest['records'][a] if r.get('state') != 'deleted'}
    while pending and time.monotonic() < deadline:
        for agenda, identity in list(pending):
            try:
                source = request('GET', agenda + '/' + identity)['data']
            except urllib.error.HTTPError as error:
                if error.code == 404:
                    pending.remove((agenda, identity))
                    continue
                if error.code == 503:
                    continue
                raise
            try:
                joined = request('GET', 'query/' + agenda + '/' + identity)
                root = joined['data']['root']['zaznam']
                # Every live seed root must arrive, including the initial linked targets.
                # Graph "pending" can persist after a user deletes a referenced target.
                if root and root['entity_version'] >= source['entity_version']:
                    pending.remove((agenda, identity))
            except urllib.error.HTTPError as error:
                if error.code not in (202, 404, 503):
                    raise
            except KeyError:
                pass
        if pending:
            time.sleep(.3)
    if pending:
        raise RuntimeError(f'Projection did not catch up: {sorted(pending)}')


def seed(path, prefix='DEMO-2026', count=12):
    manifest = json.loads(path.read_text()) if path.exists() else {'schema_version': 1, 'obec_id': 'zilina', 'prefix': prefix, 'records': {a: [] for a in AGENDAS}}
    if manifest['prefix'] != prefix or manifest['obec_id'] != 'zilina':
        raise RuntimeError('Manifest identity does not match requested seed')
    # Pass one: own identities, persisted immediately; never adopt a number collision.
    for agenda in AGENDAS:
        rows = manifest['records'][agenda]
        for index in range(count):
            if index < len(rows):
                continue
            data = request('POST', agenda, payload(agenda, index, prefix))['data']
            rows.append({'id': data['id'], 'cislo': data['cislo'], 'baseline_updated_at': data['updated_at'], 'state': 'created'})
            save(path, manifest)
    # Pass two: only unfinished records whose source state still equals our last write.
    for agenda in AGENDAS:
        for index, row in enumerate(manifest['records'][agenda]):
            if row['state'] in ('complete', 'deleted', 'preserved'):
                continue
            target = agenda + '/' + row['id']
            try:
                current = request('GET', target)['data']
            except urllib.error.HTTPError as error:
                if error.code != 404:
                    raise
                row['state'] = 'deleted'
                save(path, manifest)
                continue
            if current['updated_at'] != row['baseline_updated_at']:
                row['state'] = 'preserved'
                save(path, manifest)
                continue
            if index < 2 and agenda == 'zmluvy':
                refs = [{'typ': a, 'id': manifest['records'][a][index]['id']} for a in ('faktury', 'dodavatelske-faktury', 'objednavky', 'verejne-obstaravanie')]
                current = request('POST', target + '/update', {'suvisiace_zaznamy': refs})['data']
                row['baseline_updated_at'] = current['updated_at']
                save(path, manifest)
            blob = document_path(agenda, index).read_bytes() if prefix == 'DEMO-2026' else pdf_bytes(row['cislo'])
            files = request('GET', target + '/prilohy')['data']
            if not any(f['sha256'] == hashlib.sha256(blob).hexdigest() for f in files):
                upload(target, blob, document_path(agenda, index).name if prefix == 'DEMO-2026' else 'synteticky-dokument.pdf')
            row['state'] = 'complete'
            row['content_version'] = VERSION
            row['source_baseline'] = request('GET', target)['data']
            save(path, manifest)
    wait_projection(manifest)
    return manifest


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--manifest', type=Path, default=ROOT / '.run/seed-manifest.json')
    parser.add_argument('--prefix', default='DEMO-2026')
    parser.add_argument('--count', type=int, default=12)
    parser.add_argument('--refresh-realistic', action='store_true', help='Preview controlled migration of manifest-owned legacy fixtures')
    parser.add_argument('--apply', action='store_true', help='Apply the explicit refresh after ownership checks')
    args = parser.parse_args()
    if not 1 <= args.count <= 12:
        parser.error('count must be 1..12')
    if args.refresh_realistic:
        from refresh import refresh
        print(json.dumps(refresh(args.manifest, apply=args.apply), ensure_ascii=False))
        return
    if args.apply:
        parser.error('--apply requires --refresh-realistic')
    manifest = seed(args.manifest, args.prefix, args.count)
    print(json.dumps({'seed': 'ready', 'records': {a: len(r) for a, r in manifest['records'].items()}, 'manifest': str(args.manifest)}))


if __name__ == '__main__':
    main()
