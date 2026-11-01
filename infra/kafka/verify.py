"""Real host/internal metadata and both-direction message verification.
Install kafka-python==2.2.15 first. Uses one temporary owned topic, then deletes it.
"""
import subprocess
from uuid import uuid4
from kafka import KafkaAdminClient, KafkaConsumer, KafkaProducer
from kafka.admin import NewTopic
admin = KafkaAdminClient(bootstrap_servers='localhost:9092', request_timeout_ms=10000)
topic = 'openobec.infra-check.' + uuid4().hex
admin.create_topics([NewTopic(topic, num_partitions=1, replication_factor=1)])
compose = ['docker','compose','-p','openobec','-f','compose.yaml']
try:
    producer = KafkaProducer(bootstrap_servers='localhost:9092', acks='all', request_timeout_ms=10000)
    brokers = producer._metadata.brokers()
    assert {(b.host, b.port) for b in brokers} == {('localhost',9092)}, brokers
    producer.send(topic, b'host-to-internal').get(timeout=15)
    producer.close()
    result = subprocess.run(compose+['exec','-T','kafka','/opt/kafka/bin/kafka-console-consumer.sh','--bootstrap-server','kafka:29092','--topic',topic,'--from-beginning','--max-messages','1','--timeout-ms','15000'], check=True, capture_output=True, timeout=25)
    assert result.stdout.strip() == b'host-to-internal', result.stdout
    result = subprocess.run(compose+['exec','-T','kafka','/opt/kafka/bin/kafka-broker-api-versions.sh','--bootstrap-server','kafka:29092'], check=True, capture_output=True, timeout=25)
    assert b'kafka:29092' in result.stdout, result.stdout
    subprocess.run(compose+['exec','-T','kafka','/opt/kafka/bin/kafka-console-producer.sh','--bootstrap-server','kafka:29092','--topic',topic], input=b'internal-to-host\n', check=True, capture_output=True, timeout=25)
    consumer = KafkaConsumer(topic, bootstrap_servers='localhost:9092', auto_offset_reset='earliest', consumer_timeout_ms=10000, enable_auto_commit=False)
    seen = [message.value for message in consumer]
    consumer.close()
    assert seen == [b'host-to-internal', b'internal-to-host'], seen
    print('KAFKA_OK INTERNAL kafka:29092 EXTERNAL localhost:9092; two-way messages confirmed')
finally:
    admin.delete_topics([topic])
    admin.close()
