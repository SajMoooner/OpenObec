#!/usr/bin/env python3
"""Read-only inventory of private S3 objects missing owning attachment metadata.

Run with project .tools/venv/bin/python. No objects or metadata are deleted.
Retained blobs of logically deleted attachments are correctly treated as owned.
"""
import argparse
from datetime import datetime, timedelta, timezone
import json
import os

import boto3
from botocore.config import Config
from pymongo import MongoClient

AGENDAS = {"faktury", "dodavatelske-faktury", "zmluvy", "objednavky", "verejne-obstaravanie", "vzn"}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--agenda", choices=sorted(AGENDAS), required=True)
    parser.add_argument("--mongodb-uri", default=os.environ.get("MONGODB_URI"), required=not bool(os.environ.get("MONGODB_URI")))
    parser.add_argument("--grace-seconds", type=int, default=3600, help="Ignore recent objects that may be in-flight uploads (default: one hour)")
    args = parser.parse_args()
    if args.grace_seconds < 0:
        parser.error("grace-seconds must be nonnegative")
    s3 = boto3.client("s3", endpoint_url=os.environ.get("S3_ENDPOINT", "http://localhost:9000"), aws_access_key_id=os.environ.get("S3_ACCESS_KEY", "openobec-demo"), aws_secret_access_key=os.environ.get("S3_SECRET_KEY", "openobec-local-demo-secret"), region_name="us-east-1", config=Config(s3={"addressing_style": "path"}))
    bucket = os.environ.get("S3_BUCKET", "openobec-documents")
    cutoff = datetime.now(timezone.utc) - timedelta(seconds=args.grace_seconds)
    with MongoClient(args.mongodb_uri, serverSelectionTimeoutMS=3000) as mongo:
        db = mongo.get_default_database()
        # Do not filter deleted: logical deletion intentionally retains the blob.
        known = {row["object_key"] for row in db.attachments.find({"obec_id": "zilina"}, {"object_key": 1})}
        suspected = []
        for page in s3.get_paginator("list_objects_v2").paginate(Bucket=bucket, Prefix="zilina/" + args.agenda + "/"):
            for obj in page.get("Contents", []):
                if obj["Key"] not in known and obj["LastModified"] <= cutoff:
                    suspected.append({"object_key": obj["Key"], "size_bytes": obj["Size"], "last_modified": obj["LastModified"].isoformat()})
        print(json.dumps({"agenda": args.agenda, "obec_id": "zilina", "grace_seconds": args.grace_seconds, "orphan_count": len(suspected), "objects": suspected}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
