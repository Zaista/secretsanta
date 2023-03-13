import { getClient } from './database.js';

export async function getChat() {
  const pipeline = [
    {
      $lookup: {
        from: 'users',
        localField: 'userId',
        foreignField: 'userId',
        as: 'user'
      }
    },
    {
      $unwind: {
        path: '$user'
      }
    },
    {
      $project:
  {
    name: '$user.name',
    message: 1,
    timestamp: 1
  }
    }, {
      $sort: { timestamp: 1 }
    }];

  const client = await getClient();

  try {
    return await client
      .db(process.env.database)
      .collection('chat')
      .aggregate(pipeline)
      .toArray();
  } catch (err) {
    console.log('ERROR: ' + err.stack);
    return null;
  }
}

export async function sendMessage(message, userId) {
  const client = await getClient();
  const document = {message: message, userId: +userId, timestamp: new Date()};

  try {
    return await client
      .db(process.env.database)
      .collection('chat')
      .insertOne(document);
  } catch (err) {
    console.log('ERROR: ' + err.stack);
    return null;
  }
}
