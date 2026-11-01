# Kafka demo infrastructure

Apache Kafka 4.1.1 runs one KRaft broker/controller. Container clients bootstrap
`kafka:29092` (INTERNAL); host clients bootstrap `localhost:9092` (EXTERNAL).
Only port 9092 is published, bound to loopback. Advertised listeners match those
addresses. Heap is bounded at 384 MiB inside a 768 MiB container.

`init.sh` idempotently creates `openobec.documents.v1` and
`openobec.documents.v1.dlq`: three partitions, replication factor 1, seven-day
retention and at most 128 MiB per partition, with 32 MiB log segments. Auto topic
creation is disabled. This local broker is not a permanent event archive.

`verify.py` (kafka-python 2.2.15) checks actual advertised metadata and produces and
consumes through both listeners using a uniquely named temporary topic. See the
Mongo infrastructure README for the combined `scripts/dev/infra.sh verify` command.
