"""Real commit/rollback checks through all seven published host ports.
Install pymongo==4.15.4 in an isolated environment first.
"""
from uuid import uuid4
from pymongo import MongoClient
names = ['invoices','supplier-invoices','contracts','orders','procurement','ordinances','read']
for port, name in enumerate(names, 27017):
    client = MongoClient(f'mongodb://localhost:{port}/?replicaSet=rs-{name}&directConnection=true', serverSelectionTimeoutMS=5000)
    collection = client.openobec_infra_verification.transactions
    collection.update_one({'_id': 'bootstrap'}, {'$set': {'ready': True}}, upsert=True)
    key = str(uuid4())
    with client.start_session() as session:
        with session.start_transaction():
            collection.insert_one({'_id': key, 'verified': True}, session=session)
        assert collection.find_one({'_id': key})['verified']
        session.start_transaction()
        collection.update_one({'_id': key}, {'$set': {'verified': False}}, session=session)
        session.abort_transaction()
        assert collection.find_one({'_id': key})['verified']
    collection.delete_one({'_id': key})
    client.close()
    print(f'HOST_TRANSACTION_OK rs-{name} localhost:{port}')
