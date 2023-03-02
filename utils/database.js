import mongodb from 'mongodb';

export async function getClient() {
  const { MongoClient } = mongodb;

  const client = new MongoClient(process.env.mongodbUri, {
    useUnifiedTopology: true
  });

  return client;
}