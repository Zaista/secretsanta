import mongodb from 'mongodb';

const { MongoClient } = mongodb;

const client = new MongoClient(process.env.mongodbUri, {
  useUnifiedTopology: true
});

export { client };