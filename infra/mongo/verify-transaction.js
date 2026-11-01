const database = 'openobec_infra_verification';
// Create outside the transaction to avoid implicit collection creation races.
db.getSiblingDB(database).createCollection('transactions');
const session = db.getMongo().startSession();
const collection = session.getDatabase(database).transactions;
const id = new ObjectId();
session.startTransaction();
collection.insertOne({_id: id, verified: true});
session.commitTransaction();
if (!collection.findOne({_id: id, verified: true})) throw Error('Committed data missing');
session.startTransaction();
collection.updateOne({_id: id}, {$set: {verified: false}});
session.abortTransaction();
if (!collection.findOne({_id: id, verified: true})) throw Error('Rollback failed');
collection.deleteOne({_id: id});
session.endSession();
print('TRANSACTION_OK ' + process.env.REPLICA_SET);
