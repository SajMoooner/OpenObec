# File storage

`S3Storage(endpoint, accessKey, secretKey, bucket)` uses private path-style S3 requests, timeouts, streamed filesystem uploads and streamed downloads. `FileValidation` enforces PDF/PNG/JPEG signatures, MIME, safe display names and the 20 MiB bound. Parent ownership, the ten-file limit and metadata transactions live in common-api's `AttachmentStore`.

Find possible orphaned objects after an interrupted upload with the read-only reconciliation command, using the owning service's Mongo URI and current S3 environment variables:

```sh
.tools/venv/bin/python libs/java/file-storage/reconcile_orphans.py \
  --agenda faktury \
  --mongodb-uri 'mongodb://localhost:27017/openobec_invoices?replicaSet=rs-invoices&directConnection=true'
```

The command requires pymongo and boto3 (already used by infrastructure verification). It compares the selected agenda's private S3 prefix with **all** attachment metadata in its owning database, including logically deleted rows. Objects newer than one hour are ignored to avoid flagging in-flight uploads. JSON output contains candidate keys and sizes; it never mutates storage or prints credentials. Recheck after stopping uploads before an operator explicitly removes any confirmed orphan. Retry keys recorded in `storage_cleanup` after a failed compensation. Never delete an object still referenced by metadata, including retained deleted attachments.
