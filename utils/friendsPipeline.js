import mongodb from 'mongodb';
import { getClient } from './database.js';

export async function getFriends(groupId) {
  const client = await getClient();
  const query = { active: true, groups: new mongodb.ObjectId(groupId) };
  const options = { projection: { _id: 0, password: 0, chat: 0 } };

  try {
    return await client
      .db(process.env.database)
      .collection('users')
      .find(query, options)
      .toArray();
  } catch (err) {
    console.log('ERROR: ' + err.stack);
    return null;
  }
}

export async function getFriend(userId) {
  const client = await getClient();
  const query = { userId: +userId };
  const options = { projection: { _id: 0, password: 0, chat: 0 } };

  try {
    return await client
      .db(process.env.database)
      .collection('users')
      .findOne(query, options);
  } catch (err) {
    console.log('ERROR: ' + err.stack);
    return null;
  }
}

export async function updateFriend(friend) {
  const client = await getClient();
  const filter = { userId: +friend.userId };
  const update = {
    $set: {
      name: friend.name,
      description: friend.description,
      address: friend.address
    }
  };

  try {
    return await client
      .db(process.env.database)
      .collection('users')
      .updateOne(filter, update);
  } catch (err) {
    console.log('ERROR: ' + err.stack);
    return null;
  }
}
