// Self-init is safe on every restart and health requires a writable primary.
const name = process.env.REPLICA_SET;
const host = process.env.REPLICA_HOST;
try {
  rs.status();
} catch (error) {
  if (error.code !== 94) throw error;
  rs.initiate({_id: name, members: [{_id: 0, host: host + ':27017'}]});
}
if (!db.hello().isWritablePrimary) quit(1);
