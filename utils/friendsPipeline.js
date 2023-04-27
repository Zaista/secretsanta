import mongodb from 'mongodb';
import { getClient } from './database.js';

export async function getFriends(groupId) {
  const client = await getClient();
  const query = { active: true, groups: new mongodb.ObjectId(groupId) };
  const options = { projection: { password: 0, chat: 0 } };

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

export async function getFriend(_id) {
  const client = await getClient();
  const query = { _id: new mongodb.ObjectId(_id) };
  const options = { projection: { password: 0, chat: 0 } };

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
  console.log(friend)
  const client = await getClient();
  const filter = { _id: new mongodb.ObjectId(friend._id) };
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
