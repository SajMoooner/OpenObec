#!/usr/bin/env python3
"""Real cross-owner smoke/contract checks. Requires packaged jars and project venv."""
import json
import os
from pathlib import Path
import socket
import subprocess
import tempfile
import time
import urllib.error
import urllib.request
import uuid

import jsonschema
from pymongo import MongoClient

ROOT = Path(__file__).resolve().parents[6]
CONFIG = [
    ("invoices-service", "Faktura", "faktury", 27017, "invoices"),
    ("supplier-invoices-service", "DodavatelskaFaktura", "dodavatelske-faktury", 27018, "supplier-invoices"),
    ("contracts-service", "Zmluva", "zmluvy", 27019, "contracts"),
    ("orders-service", "Objednavka", "objednavky", 27020, "orders"),
    ("procurement-service", "VerejneObstaravanie", "verejne-obstaravanie", 27021, "procurement"),
    ("ordinances-service", "Vzn", "vzn", 27022, "ordinances"),
]
openapi = json.loads((ROOT / "contracts/openapi.yaml").read_text())
event_schema = json.loads((ROOT / "contracts/events/document-event.schema.json").read_text())
from referencing import Registry, Resource
from referencing.jsonschema import DRAFT202012
registry = Registry().with_resource("urn:openobec:openapi", Resource.from_contents(openapi, default_specification=DRAFT202012))
def validate_source(value, name):
    jsonschema.Draft202012Validator({"$ref": "urn:openobec:openapi#/components/schemas/" + name}, registry=registry, format_checker=jsonschema.FormatChecker()).validate(value)
run = uuid.uuid4().hex
processes, clients, urls, database_names = [], [], {}, {}
checks = 0
test_topic = "openobec.task2.live." + run
from kafka.admin import KafkaAdminClient, NewTopic
admin = KafkaAdminClient(bootstrap_servers="localhost:9092")
admin.create_topics([NewTopic(test_topic, num_partitions=1, replication_factor=1)])

def check(value, message):
    global checks
    assert value, message
    checks += 1

def call(agenda, method="GET", suffix="", data=None):
    body = None if data is None else json.dumps(data).encode()
    request = urllib.request.Request(urls[agenda] + "/rest/v1/" + agenda + suffix, data=body, method=method, headers={"X-Obec-Id": "zilina", "Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(request, timeout=10) as response:
            return response.status, json.load(response)
    except urllib.error.HTTPError as error:
        return error.code, json.load(error)

def fixture(name):
    schema = openapi["components"]["schemas"][name + "Create"]
    result = {}
    for field, spec in schema["properties"].items():
        if field in ("odberatel", "dodavatel", "zmluvna_strana"):
            value = {"nazov": "Syntetická organizácia", "ico": "12345678"}
        elif field == "suvisiace_zaznamy": value = []
        elif field == "zverejnene": value = False
        elif spec.get("default", "absent") is None: value = None
        elif field == "mena": value = "EUR"
        elif "suma" in field or "hodnota" in field:
            value = "12.00" if field == "suma_s_dph" else "2.00" if field == "suma_dph" else "10.00"
        elif field == "cpv": value = "45000000-7"
        elif field == "stav": value = "otvorene"
        elif spec.get("format") == "date": value = "2026-11-01"
        elif spec.get("format") == "date-time": value = "2026-11-01T10:00:00+01:00"
        else: value = "LIVE-" + field + "-" + run
        result[field] = value
    return result

try:
    with tempfile.TemporaryDirectory(prefix="openobec-live-") as logs:
        # Reserve ephemeral ports before building the owner URL matrix.
        reservations = []
        for _, _, agenda, _, _ in CONFIG:
            sock = socket.socket()
            sock.bind(("127.0.0.1", 0))
            reservations.append(sock)
            urls[agenda] = "http://127.0.0.1:" + str(sock.getsockname()[1])
        for sock in reservations: sock.close()
        owner_vars = dict(zip(["INVOICES_SERVICE_URL", "SUPPLIER_INVOICES_SERVICE_URL", "CONTRACTS_SERVICE_URL", "ORDERS_SERVICE_URL", "PROCUREMENT_SERVICE_URL"], [urls[c[2]] for c in CONFIG[:5]]))
        for service, _, agenda, mongo_port, replica in CONFIG:
            db_name = "task2_live_" + replica.replace("-", "_") + "_" + run
            database_names[agenda] = db_name
            clients.append(MongoClient(f"mongodb://localhost:{mongo_port}/?directConnection=true"))
            env = dict(os.environ, **owner_vars)
            env["OPENOBEC_EVENTS_TOPIC"] = test_topic
            env.update(SERVER_PORT=urls[agenda].rsplit(":", 1)[1], MONGODB_URI=f"mongodb://localhost:{mongo_port}/{db_name}?replicaSet=rs-{replica}&directConnection=true", JAVA_TOOL_OPTIONS="-Xms32m -Xmx160m")
            java = Path(os.environ.get("JAVA_HOME", str(ROOT / ".tools/jdk-21.0.9+10/Contents/Home"))) / "bin/java"
            log = open(Path(logs) / (service + ".log"), "w")
            processes.append(subprocess.Popen([str(java), "-jar", str(ROOT / f"services/{service}/target/{service}-0.1.0-SNAPSHOT.jar")], env=env, stdout=log, stderr=subprocess.STDOUT))
            log.close()
        deadline = time.monotonic() + 60
        for agenda, url in urls.items():
            while True:
                try:
                    with urllib.request.urlopen(url + "/actuator/health", timeout=2) as response:
                        if response.status == 200: break
                except Exception:
                    if time.monotonic() > deadline:
                        for p in Path(logs).glob("*.log"): print(p.name, p.read_text()[-4000:])
                        raise AssertionError("Service failed startup: " + agenda)
                    time.sleep(0.2)
        ids = {}
        for service, name, agenda, _, _ in CONFIG:
            status, response = call(agenda, "POST", data=fixture(name))
            check(status == 201, (agenda, status, response))
            validate_source(response, name + "Response")
            ids[agenda] = response["data"]["id"]
            check("deleted" not in response["data"] and "deleted_at" not in response["data"], "Internal fields leaked")
            status, listing = call(agenda)
            check(status == 200, listing)
            validate_source(listing, name + "List")
        chain = [("verejne-obstaravanie", "objednavky"), ("objednavky", "zmluvy"), ("zmluvy", "faktury"), ("dodavatelske-faktury", "zmluvy")]
        for source, target in chain:
            status, response = call(source, "POST", "/" + ids[source] + "/update", {"suvisiace_zaznamy": [{"typ": target, "id": ids[target]}]})
            check(status == 200, (source, target, response))
            check(response["data"]["entity_version"] == 2, response)
        # The unchanged target can disappear without blocking an unrelated source update.
        status, _ = call("faktury", "POST", "/" + ids["faktury"] + "/delete")
        check(status == 200, "Delete real referenced owner")
        status, response = call("zmluvy", "POST", "/" + ids["zmluvy"] + "/update", {"predmet": "Unrelated edit keeps deleted legacy target"})
        check(status == 200, response)
        status, response = call("objednavky", "POST", "/" + ids["objednavky"] + "/update", {"suvisiace_zaznamy": [{"typ": "faktury", "id": ids["faktury"]}]})
        check(status == 422 and response["error"]["details"][0]["code"] == "INVALID_REFERENCE", response)
        validate_source(response, "Error")
        # Stop actual owner process; a new reference must fail without changing the source.
        processes[2].terminate()
        processes[2].wait(timeout=15)
        before = call("verejne-obstaravanie", suffix="/" + ids["verejne-obstaravanie"])[1]["data"]
        status, response = call("verejne-obstaravanie", "POST", "/" + ids["verejne-obstaravanie"] + "/update", {"suvisiace_zaznamy": [{"typ": "zmluvy", "id": ids["zmluvy"]}]})
        check(status == 503, response)
        after = call("verejne-obstaravanie", suffix="/" + ids["verejne-obstaravanie"])[1]["data"]
        check(before == after, "Dependency failure must not save source patch")
        for index, (_, _, agenda, _, _) in enumerate(CONFIG):
            db = clients[index][database_names[agenda]]
            rows = list(db.outbox.find())
            if agenda == "vzn": check(not rows, "VZN must have no projection events")
            else:
                check(bool(rows), "Expected committed outbox events")
                for row in rows:
                    event = row["event"]
                    # BSON money values are exact Decimal128, JSON contract uses strings.
                    def wire(value):
                        from bson.decimal128 import Decimal128
                        if isinstance(value, Decimal128): return format(value.to_decimal(), ".2f")
                        if isinstance(value, dict): return {k: wire(v) for k, v in value.items()}
                        if isinstance(value, list): return [wire(v) for v in value]
                        return value
                    jsonschema.validate(wire(event), event_schema, format_checker=jsonschema.FormatChecker())
                    check(event["entity_id"] == event["data"]["id"] and event["entity_version"] == event["data"]["entity_version"], "Event identity agreement")
        print(f"PASS: {checks} real cross-service and schema checks; six executable applications, six isolated Mongo databases, actual owner HTTP and Kafka outboxes.")
finally:
    for process in processes:
        if process.poll() is None: process.terminate()
    for process in processes:
        try: process.wait(timeout=15)
        except subprocess.TimeoutExpired: process.kill(); process.wait()
    for index, client in enumerate(clients):
        agenda = CONFIG[index][2]
        client.drop_database(database_names[agenda])
        client.close()

    admin.delete_topics([test_topic])
    admin.close()
