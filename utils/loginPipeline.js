import mongodb from 'mongodb';
import { getClient } from './database.js';

export async function login(email, password) {
  const client = await getClient();
  const query = { email, password };
  const options = { projection: { name: 1, email: 1 } };

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

export async function getById(_id) {
  const client = await getClient();
  const query = { _id: new mongodb.ObjectId(_id) };
  const options = { projection: { userId: 1, name: 1, email: 1, role: 1, groups: 1 } };

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

export async function checkEmail(email) {
  const client = await getClient();
  const query = { email };
  const options = { projection: { _id: 0 } };

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
