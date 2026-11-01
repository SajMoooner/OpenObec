# RustFS demo infrastructure

RustFS 1.0.0-alpha.78 runs as user 10001 with persistent data/log volumes. A small
one-shot init container owns those mount roots before RustFS starts. The S3
endpoint is `http://rustfs:9000` inside Docker and `http://localhost:9000` on the
host. The console is `http://localhost:9001`; both host ports bind loopback.

`init.sh` waits for an authenticated S3 operation, then creates the private
`openobec-documents` bucket only if absent. Demo credentials are in `.env.example`.
AWS SDK clients use region `us-east-1` and path-style addressing. RustFS is capped
at 768 MiB. This pinned release is explicitly an upstream alpha used for the
local demo; it is not a production storage selection.

`verify.py` (boto3 1.40.65) checks bucket existence, host put/get, actual byte reads
through Docker DNS, and an anonymous 403. It removes only its uniquely owned probe
object. See the Mongo infrastructure README for the combined verification command.
