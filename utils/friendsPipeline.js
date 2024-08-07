import { ObjectId } from 'mongodb';
import { getClient } from './database.js';
import { getLogger } from './logger.js';

const log = getLogger('friendsPipeline');

export async function getFriends(groupId) {
  const client = await getClient();
  const query = { 'groups.groupId': new ObjectId(groupId) };
  const options = { projection: { password: 0, chat: 0 } };

  try {
    return await client
      .db(process.env.database)
      .collection('users')
      .find(query, options)
      .toArray();
  } catch (err) {
    log.error('ERROR getFriends: ' + err.stack);
    return null;
  }
}

export async function getProfile(_id) {
  if (!ObjectId.isValid(_id)) {
    return null;
  }

  const client = await getClient();
  const query = { _id: new ObjectId(_id) };
  const options = { projection: { password: 0, chat: 0 } };

  try {
    return await client
      .db(process.env.database)
      .collection('users')
      .findOne(query, options);
  } catch (err) {
    log.error('ERROR getProfile: ' + err.stack);
    return null;
  }
}

export async function updateProfile(_id, friend) {
  const client = await getClient();
  const filter = { _id: new ObjectId(_id) };
  const update = {
    $set: {
      name: friend.name,
      description: friend.description,
      address: friend.address,
    },
  };

  try {
    return await client
      .db(process.env.database)
      .collection('users')
      .updateOne(filter, update);
  } catch (err) {
    log.error('ERROR updateProfile: ' + err.stack);
    return null;
  }
}

export async function updateProfileImage(_id) {
  const client = await getClient();
  const filter = { _id: new ObjectId(_id) };
  const update = {
    $set: {
      imageUploaded: true,
    },
  };

  try {
    return await client
      .db(process.env.database)
      .collection('users')
      .updateOne(filter, update);
  } catch (err) {
    log.error('ERROR updateProfileImage: ' + err.stack);
    return null;
  }
}
