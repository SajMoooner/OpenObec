#!/bin/sh
set -eu
export AWS_ACCESS_KEY_ID="$S3_ACCESS_KEY"
export AWS_SECRET_ACCESS_KEY="$S3_SECRET_KEY"
export AWS_DEFAULT_REGION=us-east-1
export AWS_EC2_METADATA_DISABLED=true
attempt=0
until aws --endpoint-url http://rustfs:9000 s3api list-buckets >/dev/null 2>&1; do
  attempt=$((attempt + 1))
  [ "$attempt" -lt 60 ] || { echo 'RustFS did not become ready' >&2; exit 1; }
  sleep 2
done
if ! aws --endpoint-url http://rustfs:9000 s3api head-bucket --bucket "$S3_BUCKET" >/dev/null 2>&1; then
  aws --endpoint-url http://rustfs:9000 s3api create-bucket --bucket "$S3_BUCKET"
fi
# New buckets are private by default. Never apply a public-read policy.
aws --endpoint-url http://rustfs:9000 s3api head-bucket --bucket "$S3_BUCKET"
