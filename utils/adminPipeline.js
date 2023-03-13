import { getClient } from './database.js';

export async function getUsers() {
  const client = await getClient();
  const options = {
    projection: { _id: 0, name: 1, email: 1, active: 1 },
    sort: { active: -1, userId: 1 }
  };

  try {
    return await client
      .db(process.env.database)
      .collection('users')
      .find({}, options)
      .toArray();
  } catch (err) {
    console.log('ERROR: ' + err.stack);
    return null;
  }
}
