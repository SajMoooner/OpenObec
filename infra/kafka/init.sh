#!/bin/sh
set -eu
for topic in openobec.documents.v1 openobec.documents.v1.dlq; do
  /opt/kafka/bin/kafka-topics.sh --bootstrap-server kafka:29092 --create --if-not-exists \
    --topic "$topic" --partitions 3 --replication-factor 1 \
    --config retention.ms=604800000 --config retention.bytes=134217728 \
    --config segment.bytes=33554432
 done
/opt/kafka/bin/kafka-topics.sh --bootstrap-server kafka:29092 --describe
