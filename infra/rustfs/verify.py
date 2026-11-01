"""Verify private S3 byte round trips via host and Docker DNS.
Install boto3==1.40.65 first. Only the uniquely owned probe object is deleted.
"""
import os
import subprocess
import urllib.request
import urllib.error
from uuid import uuid4
import boto3
from botocore.config import Config
bucket = os.getenv('S3_BUCKET','openobec-documents')
client = boto3.client('s3', endpoint_url='http://localhost:9000', region_name='us-east-1',
    aws_access_key_id=os.getenv('S3_ACCESS_KEY','openobec-demo'),
    aws_secret_access_key=os.getenv('S3_SECRET_KEY','openobec-local-demo-secret'),
    config=Config(s3={'addressing_style':'path'}, retries={'max_attempts':2}))
key = 'infra-verification/' + uuid4().hex
payload = b'%PDF-1.7\nOpenObec synthetic infrastructure probe\n'
client.head_bucket(Bucket=bucket)
try:
    client.put_object(Bucket=bucket, Key=key, Body=payload, ContentType='application/pdf')
    assert client.get_object(Bucket=bucket, Key=key)['Body'].read() == payload
    env = dict(os.environ, AWS_ACCESS_KEY_ID=os.getenv('S3_ACCESS_KEY','openobec-demo'),
        AWS_SECRET_ACCESS_KEY=os.getenv('S3_SECRET_KEY','openobec-local-demo-secret'))
    result = subprocess.run(['docker','compose','-p','openobec','-f','compose.yaml','run','--rm','--no-deps',
        '-e','AWS_ACCESS_KEY_ID','-e','AWS_SECRET_ACCESS_KEY','-e','AWS_DEFAULT_REGION=us-east-1',
        '--entrypoint','aws','rustfs-init','--endpoint-url','http://rustfs:9000','s3','cp',f's3://{bucket}/{key}','-','--no-progress'],
        env=env, capture_output=True, check=True, timeout=30)
    assert result.stdout == payload, result.stdout
    try:
        urllib.request.urlopen(f'http://localhost:9000/{bucket}/{key}', timeout=5)
        raise AssertionError('Private object allowed anonymous access')
    except urllib.error.HTTPError as error:
        assert error.code == 403, error.code
    print('S3_OK private bucket; host write/read and Docker DNS read match bytes')
finally:
    client.delete_object(Bucket=bucket, Key=key)
