import mongodb, { ObjectId } from 'mongodb';
import { getClient } from './database.js';

export async function getChat(groupId) {
  const client = await getClient();
  const pipeline = [
    {
      $match: {
        groupId: new mongodb.ObjectId(groupId)
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'userId',
        foreignField: '_id',
        as: 'user'
      }
    },
    {
      $unwind: {
        path: '$user'
      }
    },
    {
      $project: {
        name: '$user.name',
        email: '$user.email',
        message: 1,
        timestamp: 1
      }
    }, {
      $sort: { timestamp: 1 }
    }];

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

export async function deleteChatMessage(_id) {
  const client = await getClient();
  const filter = { _id: new ObjectId(_id) };

  try {
    return await client
      .db(process.env.database)
      .collection('chat')
      .deleteOne(filter);
  } catch (err) {
    console.log('ERROR: ' + err.stack);
    return null;
  }
}

export async function sendMessage(message, userId, groupId) {
  const client = await getClient();
  const document = { message, userId: new mongodb.ObjectId(userId), groupId: new mongodb.ObjectId(groupId), timestamp: new Date() };
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
