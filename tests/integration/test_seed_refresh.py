"""Migration transport tests run offline; live preservation uses owned disposable IDs."""
from copy import deepcopy
import hashlib
import json
from pathlib import Path
import sys
import tempfile
import unittest
from unittest.mock import patch
sys.path.insert(0, str(Path(__file__).resolve().parents[2] / 'scripts/seed'))
import seed
import refresh

class RefreshTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.path = Path(self.tmp.name)/'manifest.json'
        self.manifest = {'schema_version': 1, 'obec_id': 'zilina', 'prefix': 'DEMO-2026', 'records': {a: [] for a in seed.AGENDAS}}
        self.sources, self.files, self.writes = {}, {}, []
        for a in seed.AGENDAS:
            target = a+'/owned-'+a
            r = seed.legacy_payload(a,0)
            r.update(id='owned-'+a, created_at='old', updated_at='old', obec_id='zilina')
            if a != 'vzn': r.update(entity_version=2 if a == 'zmluvy' else 1, suvisiace_zaznamy=[])
            if a in ('vzn','zmluvy'): r['platnost_do']=None
            self.sources[target]=r
            self.manifest['records'][a].append({'id':r['id'],'cislo':r['cislo'],'baseline_updated_at':'before-upload','state':'complete'})
            blob=seed.pdf_bytes(r['cislo'])
            self.files[target]=[{'id':'old-file','filename':'synteticky-dokument.pdf','sha256':hashlib.sha256(blob).hexdigest()}]
        self.sources['zmluvy/owned-zmluvy']['suvisiace_zaznamy']=[{'typ':a,'id':'owned-'+a} for a in ('faktury','dodavatelske-faktury','objednavky','verejne-obstaravanie')]
        seed.save(self.path,self.manifest)

    def transport(self, method, path, body=None):
        if method=='GET':
            return {'data':deepcopy(self.files[path[:-8]] if path.endswith('/prilohy') else self.sources[path])}
        self.writes.append(path)
        if path.endswith('/update'):
            row=self.sources[path[:-7]]
            row.update(body)
            row['updated_at']='new'
            if 'entity_version' in row: row['entity_version']+=1
            return {'data':deepcopy(row)}
        target, fid=path.split('/prilohy/')
        self.files[target]=[f for f in self.files[target] if f['id']!=fid.split('/')[0]]
        return {}

    def upload(self, target, blob, filename):
        self.files[target].append({'id':'replacement','filename':filename,'sha256':hashlib.sha256(blob).hexdigest()})

    def run_refresh(self, **kwargs):
        with patch.object(seed,'request',self.transport), patch.object(seed,'upload',self.upload), patch.object(seed,'wait_projection'):
            return refresh.refresh(self.path, **kwargs)

    def test_preview_and_apply_preserve_identity_extras_and_rerun(self):
        extra={'id':'user-file','filename':'notes.pdf','sha256':'unrelated'}
        self.files['faktury/owned-faktury'].append(extra)
        before=deepcopy(self.sources)
        preview=self.run_refresh()
        self.assertEqual(6,preview['counts']['eligible'])
        self.assertEqual(before,self.sources)
        self.assertEqual([],self.writes)
        result=self.run_refresh(apply=True)
        self.assertEqual(6,result['counts']['complete'])
        self.assertEqual(set(before),set(self.sources))
        self.assertIn(extra,self.files['faktury/owned-faktury'])
        self.assertEqual(before['zmluvy/owned-zmluvy']['suvisiace_zaznamy'],self.sources['zmluvy/owned-zmluvy']['suvisiace_zaznamy'])
        writes=len(self.writes)
        self.run_refresh(apply=True)
        self.assertEqual(writes,len(self.writes))

    def test_explicitly_proven_restored_legacy_version_requires_full_content_proof(self):
        self.sources['faktury/owned-faktury']['entity_version']=3
        with patch.object(refresh,'RESTORED_LEGACY_IDS',{'owned-faktury'}):
            self.assertEqual(6,self.run_refresh(apply=True)['counts']['complete'])

    def test_restored_identity_exception_does_not_allow_modified_attachment(self):
        self.sources['faktury/owned-faktury']['entity_version']=3
        self.files['faktury/owned-faktury'][0]['sha256']='user-changed'
        before=deepcopy(self.sources['faktury/owned-faktury'])
        with patch.object(refresh,'RESTORED_LEGACY_IDS',{'owned-faktury'}):
            self.assertEqual(1,self.run_refresh(apply=True)['counts']['preserved'])
        self.assertEqual(before,self.sources['faktury/owned-faktury'])

    def test_changed_field_relation_and_unknown_pdf_are_preserved(self):
        self.sources['faktury/owned-faktury']['predmet']='User edit'
        self.sources['zmluvy/owned-zmluvy']['suvisiace_zaznamy']=[]
        self.files['vzn/owned-vzn'][0]['sha256']='changed'
        before=deepcopy(self.sources)
        result=self.run_refresh(apply=True)
        self.assertEqual(3,result['counts']['preserved'])
        for a in ('faktury','zmluvy','vzn'):
            self.assertEqual(before[a+'/owned-'+a],self.sources[a+'/owned-'+a])

    def test_retry_after_upload_and_after_remote_update_does_not_duplicate(self):
        normal=self.transport
        failed=[False]
        def broken(method,path,body=None):
            result=normal(method,path,body)
            if path.endswith('/update') and not failed[0]:
                failed[0]=True
                raise RuntimeError('response lost after successful remote write')
            return result
        self.transport=broken
        with self.assertRaises(RuntimeError): self.run_refresh(apply=True)
        self.transport=normal
        self.run_refresh(apply=True)
        for files in self.files.values():
            self.assertEqual(1,len(files))
            self.assertEqual('replacement',files[0]['id'])

    def test_modified_original_pdf_during_interruption_is_preserved(self):
        original=self.upload
        def interrupted(target,blob,filename):
            original(target,blob,filename)
            raise RuntimeError('interrupted after upload')
        self.upload=interrupted
        with self.assertRaises(RuntimeError): self.run_refresh(apply=True)
        self.upload=original
        self.files['faktury/owned-faktury'][0]['sha256']='user-replacement'
        before=deepcopy(self.sources['faktury/owned-faktury'])
        self.run_refresh(apply=True)
        self.assertEqual(before,self.sources['faktury/owned-faktury'])
        self.assertEqual('user-replacement',self.files['faktury/owned-faktury'][0]['sha256'])

    def test_edit_after_partial_upload_and_after_completion_is_preserved(self):
        original=self.upload
        def interrupted(target,blob,filename):
            original(target,blob,filename)
            raise RuntimeError('interrupted')
        self.upload=interrupted
        with self.assertRaises(RuntimeError): self.run_refresh(apply=True)
        self.upload=original
        self.sources['faktury/owned-faktury']['predmet']='User while paused'
        self.run_refresh(apply=True)
        self.assertEqual('User while paused',self.sources['faktury/owned-faktury']['predmet'])
        self.sources['vzn/owned-vzn']['predmet']='User after complete'
        self.run_refresh(apply=True)
        self.assertEqual('User after complete',self.sources['vzn/owned-vzn']['predmet'])


class LiveRefreshPreservation(unittest.TestCase):
    """Real source/files/query APIs, disposable identities only; no reset or adoption."""
    def test_owned_refresh_preserves_edit_delete_extra_and_ordinary_rerun(self):
        import urllib.error
        import uuid
        with tempfile.TemporaryDirectory(prefix='openobec-realistic-live-') as directory:
            path=Path(directory)/'manifest.json'
            prefix='REFRESH-'+uuid.uuid4().hex[:14]
            manifest={'schema_version':1,'obec_id':'zilina','prefix':prefix,'records':{a:[] for a in seed.AGENDAS}}
            try:
                for a in seed.AGENDAS:
                    source=seed.request('POST',a,seed.legacy_payload(a,0,prefix))['data']
                    manifest['records'][a].append({'id':source['id'],'cislo':source['cislo'],'baseline_updated_at':source['updated_at'],'state':'complete'})
                for a in seed.AGENDAS:
                    target=a+'/'+manifest['records'][a][0]['id']
                    if a=='zmluvy':
                        source=seed.request('POST',target+'/update',{'suvisiace_zaznamy':refresh.refs(a,0,manifest)})['data']
                        manifest['records'][a][0]['baseline_updated_at']=source['updated_at']
                    seed.upload(target,seed.pdf_bytes(manifest['records'][a][0]['cislo']))
                seed.save(path,manifest)
                invoice='faktury/'+manifest['records']['faktury'][0]['id']
                supplier='dodavatelske-faktury/'+manifest['records']['dodavatelske-faktury'][0]['id']
                deleted='vzn/'+manifest['records']['vzn'][0]['id']
                seed.upload(invoice,seed.pdf_bytes('Owned extra attachment'),'user-note.pdf')
                extra=next(f for f in seed.request('GET',invoice+'/prilohy')['data'] if f['filename']=='user-note.pdf')
                edited=seed.request('POST',supplier+'/update',{'predmet':'Používateľská úprava ostáva'})['data']
                seed.request('POST',deleted+'/delete')
                result=refresh.refresh(path,apply=True)
                self.assertEqual({'eligible':0,'complete':4,'preserved':1,'missing':1},result['counts'])
                self.assertEqual(edited,seed.request('GET',supplier)['data'])
                self.assertIn(extra,seed.request('GET',invoice+'/prilohy')['data'])
                owned=json.loads(path.read_text())
                self.assertEqual(manifest['records']['faktury'][0]['id'],owned['records']['faktury'][0]['id'])
                before={a:seed.request('GET',a+'/'+owned['records'][a][0]['id'])['data'] for a in seed.AGENDAS if a!='vzn'}
                files={a:seed.request('GET',a+'/'+owned['records'][a][0]['id']+'/prilohy')['data'] for a in seed.AGENDAS if a!='vzn'}
                refresh.refresh(path,apply=True)
                seed.seed(path,prefix,1)
                for a in before:
                    target=a+'/'+owned['records'][a][0]['id']
                    self.assertEqual(before[a],seed.request('GET',target)['data'])
                    self.assertEqual(files[a],seed.request('GET',target+'/prilohy')['data'])
                with self.assertRaises(urllib.error.HTTPError) as missing: seed.request('GET',deleted)
                self.assertEqual(404,missing.exception.code)
            finally:
                for a in seed.AGENDAS:
                    for row in manifest['records'][a]:
                        try: seed.request('POST',a+'/'+row['id']+'/delete')
                        except urllib.error.HTTPError as error:
                            if error.code!=404: raise

if __name__=='__main__': unittest.main()
