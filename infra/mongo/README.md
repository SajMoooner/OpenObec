# MongoDB demo infrastructure

Seven MongoDB 8.0.17 single-node replica sets own separate named volumes. Each uses
at most 256 MiB WiredTiger cache inside a 512 MiB container. The readiness script
initializes an unconfigured replica set and requires a writable primary; it does
not reset an existing set. `scripts/dev/infra.sh down` preserves all volumes.

Docker hosts: `mongo-invoices`, `mongo-supplier-invoices`, `mongo-contracts`,
`mongo-orders`, `mongo-procurement`, `mongo-ordinances`, `mongo-read`, port 27017.
Their replica set names are `rs-` plus the host suffix; host ports are 27017–27023
in the same order. Host clients must use `directConnection=true` because the
replica sets advertise their Docker DNS identities. `.env.example` includes both
URI variants. Local-only demo databases have no authentication.

From the repository root:

```sh
scripts/dev/infra.sh up
python3 -m venv .tools/infra-check
.tools/infra-check/bin/pip install pymongo==4.15.4 kafka-python==2.2.15 boto3==1.40.65
OPENOBEC_PYTHON=.tools/infra-check/bin/python scripts/dev/infra.sh verify
```

Verification runs real commits and rollbacks against every MongoDB via Docker DNS
and host ports, both Kafka directions, and private S3 byte reads. It uses a small
`openobec_infra_verification` collection, one temporary Kafka topic and one probe
object. Only its uniquely owned probe records/topic/object are removed.
