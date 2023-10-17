import mongodb from 'mongodb';

const database = (function() {
  let instance;

  function createClient() {
    const { MongoClient } = mongodb;

    return new MongoClient(process.env.mongodbUri);
  }

  return {
    getClient: function() {
      if (!instance) {
        instance = createClient();
      }

      return instance;
    }
  };
})();

export async function getClient() {
  return database.getClient();
}
