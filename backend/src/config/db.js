const { MongoClient } = require('mongodb');

let db = null;

async function connectDB() {
  const client = new MongoClient(process.env.MONGO_URI);
  await client.connect();
  db = client.db(process.env.DB_NAME || 'EventTicketDB');
  console.log(`✅ MongoDB connected: ${process.env.DB_NAME || 'EventTicketDB'}`);
  return db;
}

function getDB() {
  if (!db) throw new Error('Database not initialized. Call connectDB() first.');
  return db;
}

module.exports = { connectDB, getDB };
