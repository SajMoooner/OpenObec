"""Explicit, resumable API-only refresh of manifest-owned, proven legacy fixtures.

No records are discovered/adopted by number. Preview is read-only. A source snapshot
and attachment metadata are saved before the first write; each side effect can be
recognized on retry. APIs do not support compare-and-swap: do not edit owned demo
records concurrently with this short maintenance operation.
"""
from copy import deepcopy
from datetime import datetime, timezone
import hashlib
import json
from pathlib import Path
import urllib.error
import seed
from realistic import VERSION, catalog, document_path

# This owned invoice has exact restored legacy content at source version 3.
# Controller authorized its refresh; complete field/ref/PDF proof
# still applies. This exception never relaxes resumable-write version checks.
RESTORED_LEGACY_IDS = {'fak_1f75c3a0-1859-4ecc-b7a4-a1d7e8f0a6c3'}

SERVER = {'id', 'obec_id', 'created_at', 'updated_at', 'entity_version'}


def refs(agenda, index, manifest):
    return ([{'typ': a, 'id': manifest['records'][a][index]['id']} for a in
             ('faktury', 'dodavatelske-faktury', 'objednavky', 'verejne-obstaravanie')]
            if agenda == 'zmluvy' and index < 2 else [])


def legacy_matches(source, agenda, index, manifest):
    expected = seed.legacy_payload(agenda, index, manifest['prefix'])
    if agenda != 'vzn': expected['suvisiace_zaznamy'] = refs(agenda,index,manifest)
    if agenda in ('zmluvy','vzn'): expected['platnost_do'] = None
    # Full editable fixture content, not the stale timestamp that predates upload.
    # Unknown/non-null additional editable fields indicate an uncertain user edit.
    expected_version = 2 if agenda == 'zmluvy' and index < 2 else 1
    if agenda != 'vzn' and source.get('entity_version') != expected_version and source['id'] not in RESTORED_LEGACY_IDS:
        return False
    return {k:v for k,v in source.items() if k not in SERVER} == expected


def equivalent_after(source, before, desired):
    expected=deepcopy(before)
    expected.update(desired)
    # A lost response may have committed exactly one source update. No subsequent
    # version is accepted, including a user edit which later restored the same text.
    if 'entity_version' in before and source.get('entity_version') != before['entity_version']+1:
        return False
    return {k:v for k,v in source.items() if k not in ('updated_at','entity_version')} == {k:v for k,v in expected.items() if k not in ('updated_at','entity_version')}


def inspect(manifest):
    rows=[]
    for agenda in seed.AGENDAS:
        for index, owned in enumerate(manifest['records'][agenda]):
            target=agenda+'/'+owned['id']
            try:
                source=seed.request('GET',target)['data']
                files=seed.request('GET',target+'/prilohy')['data']
            except urllib.error.HTTPError as error:
                if error.code!=404: raise
                rows.append({'agenda':agenda,'index':index,'id':owned['id'],'status':'missing','reason':'Owned identity was deleted'})
                continue
            status='eligible'
            reason='Exact legacy fields, relation graph and known fixture PDF'
            old_hash=hashlib.sha256(seed.pdf_bytes(owned['cislo'])).hexdigest()
            old_files=[f for f in files if f['filename']=='synteticky-dokument.pdf' and f['sha256']==old_hash]
            if owned.get('content_version')==VERSION:
                status='complete' if source==owned.get('source_baseline') else 'preserved'
                reason='Already refreshed' if status=='complete' else 'Source changed after refresh'
            elif not legacy_matches(source,agenda,index,manifest) or len(old_files)!=1:
                status='preserved'
                reason='Legacy source/relation/PDF proof differs; no overwrite'
            rows.append({'agenda':agenda,'index':index,'id':owned['id'],'status':status,'reason':reason,'source':source,'files':files,'legacy_files':old_files})
    return rows


def summary(rows, backup=None):
    counts={name:sum(r['status']==name for r in rows) for name in ('eligible','complete','preserved','missing')}
    return {'content_version':VERSION,'counts':counts,'backup':str(backup) if backup else None,
            'records':[{k:v for k,v in r.items() if k in ('agenda','id','status','reason')} for r in rows]}


def refresh(path, apply=False):
    path=Path(path)
    manifest=json.loads(path.read_text())
    if manifest.get('obec_id')!='zilina' or not manifest.get('prefix'):
        raise RuntimeError('Expected existing owned Žilina manifest')
    progress_path=path.with_name(path.stem+'-realistic-progress.json')
    if not apply:
        return summary(inspect(manifest))
    if progress_path.exists():
        progress=json.loads(progress_path.read_text())
        if progress['content_version']!=VERSION: raise RuntimeError('Unsupported refresh progress version')
        expected=[r['id'] for a in seed.AGENDAS for r in manifest['records'][a]]
        if expected!=progress['owned_ids']: raise RuntimeError('Manifest identities changed since backup')
    else:
        rows=inspect(manifest)
        timestamp=datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%S%fZ')
        backup=path.with_name(path.stem+'-before-realistic-'+timestamp+'.json')
        seed.save(backup,{'manifest':deepcopy(manifest),'records':rows})
        progress={'content_version':VERSION,'backup':str(backup),'owned_ids':[r['id'] for a in seed.AGENDAS for r in manifest['records'][a]],'records':rows}
        seed.save(progress_path,progress)
    for row in progress['records']:
        agenda,index=row['agenda'],row['index']
        owned=manifest['records'][agenda][index]
        target=agenda+'/'+owned['id']
        if row['status']=='preserved' and row['id'] in RESTORED_LEGACY_IDS and row['reason']=='Legacy source/relation/PDF proof differs; no overwrite':
            try:
                current=seed.request('GET',target)['data']
                files=seed.request('GET',target+'/prilohy')['data']
            except urllib.error.HTTPError as error:
                if error.code!=404: raise
                row.update(status='missing',reason='Owned identity deleted before restored-fixture retry')
                seed.save(progress_path,progress)
                continue
            if current==row['source'] and legacy_matches(current,agenda,index,manifest) and all(f in files for f in row['legacy_files']) and len(row['legacy_files'])==1:
                row.update(status='eligible',reason='Authorized exact restored legacy fixture; original snapshot retained')
                seed.save(progress_path,progress)
        if row['status'] in ('preserved','missing'): continue
        try: current=seed.request('GET',target)['data']
        except urllib.error.HTTPError as error:
            if error.code!=404: raise
            row.update(status='missing',reason='Owned identity deleted during refresh')
            seed.save(progress_path,progress)
            continue
        if row['status']=='complete':
            if current!=owned.get('source_baseline'):
                row.update(status='preserved',reason='Source changed after refresh')
                seed.save(progress_path,progress)
            continue
        desired=catalog(agenda,index,manifest['prefix'])
        before=row['source']
        after=row.get('updated_source')
        is_before=current==before
        is_after=current==after if after else equivalent_after(current,before,desired)
        if not is_before and not is_after:
            row.update(status='preserved',reason='Source changed since backup; stopped safely')
            seed.save(progress_path,progress)
            continue
        files=seed.request('GET',target+'/prilohy')['data']
        old_ids={f['id'] for f in row['legacy_files']}
        # On a fresh attempt a deleted/replaced original attachment is a user change.
        legacy_changed = any(f['id'] in old_ids and f not in row['legacy_files'] for f in files)
        if legacy_changed or (not row.get('retirement_started') and not all(f in files for f in row['legacy_files'])):
            row.update(status='preserved',reason='Original fixture PDF changed since backup')
            seed.save(progress_path,progress)
            continue
        blob=(document_path(agenda,index).read_bytes() if manifest['prefix']=='DEMO-2026' else seed.pdf_bytes('Record '+desired['cislo']))
        digest=hashlib.sha256(blob).hexdigest()
        row['upload_started']=True
        seed.save(progress_path,progress)
        if not any(f['sha256']==digest for f in files):
            seed.upload(target,blob,document_path(agenda,index).name)
        # Read again after upload; preserve an intervening source edit.
        current=seed.request('GET',target)['data']
        if is_before:
            if current!=before:
                row.update(status='preserved',reason='Source changed during upload; stopped safely')
                seed.save(progress_path,progress)
                continue
            current=seed.request('POST',target+'/update',desired)['data']
        elif (after is not None and current!=after) or not equivalent_after(current,before,desired):
            row.update(status='preserved',reason='Source changed during retry')
            seed.save(progress_path,progress)
            continue
        row['updated_source']=current
        seed.save(progress_path,progress)
        # Replacement is present before retiring only the demonstrably owned blob.
        files=seed.request('GET',target+'/prilohy')['data']
        if not any(f['sha256']==digest for f in files): raise RuntimeError('Replacement PDF missing after upload')
        row['retirement_started']=True
        seed.save(progress_path,progress)
        for file in files:
            if file['id'] in old_ids and file in row['legacy_files']:
                try: seed.request('POST',target+'/prilohy/'+file['id']+'/delete')
                except urllib.error.HTTPError as error:
                    if error.code!=404: raise
        final=seed.request('GET',target)['data']
        if final!=current:
            row.update(status='preserved',reason='Source changed while retiring fixture PDF')
            seed.save(progress_path,progress)
            continue
        owned.update(cislo=final['cislo'],baseline_updated_at=final['updated_at'],state='complete',content_version=VERSION,source_baseline=final)
        seed.save(path,manifest)
        row.update(status='complete',reason='Refreshed owned identity and verified replacement PDF')
        seed.save(progress_path,progress)
    seed.wait_projection(manifest)
    return summary(progress['records'],progress['backup'])
