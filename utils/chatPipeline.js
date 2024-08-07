import { ObjectId } from 'mongodb';
import { getClient } from './database.js';
import { getLogger } from './logger.js';

const log = getLogger('chatRouter');

export async function getChat(groupId) {
  const client = await getClient();
  const pipeline = [
    {
      $match: {
        groupId: ObjectId.createFromHexString(groupId),
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'userId',
        foreignField: '_id',
        as: 'user',
      },
    },
    {
      $unwind: {
        path: '$user',
      },
    },
    {
      $project: {
        name: '$user.name',
        email: '$user.email',
        message: 1,
        timestamp: 1,
      },
    },
    {
      $sort: { timestamp: 1 },
    },
  ];

  try {
    return await client
      .db(process.env.database)
      .collection('chat')
      .aggregate(pipeline)
      .toArray();
  } catch (err) {
    log.error('ERROR getChat: ' + err.stack);
    return null;
  }
}

export async function deleteChatMessage(_id) {
  const client = await getClient();
  const filter = { _id: ObjectId.createFromHexString(_id) };

  try {
    return await client
      .db(process.env.database)
      .collection('chat')
      .deleteOne(filter);
  } catch (err) {
    log.error('ERROR deleteChatMessage: ' + err.stack);
    return null;
  }
}

export async function sendMessage(message, userId, groupId) {
  const client = await getClient();
  const document = {
    message,
    userId: ObjectId.createFromHexString(userId),
    groupId: ObjectId.createFromHexString(groupId),
    timestamp: new Date(),
  };
  try {
    return await client
      .db(process.env.database)
      .collection('chat')
      .insertOne(document);
  } catch (err) {
    log.error('ERROR sendMessage: ' + err.stack);
    return null;
  }
}
