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
  const pipeline = [

    {
      $match:
          {
            _id: new mongodb.ObjectId(_id)
          }
    },
    {
      $lookup:
          {
            from: 'groups',
            localField: 'groups',
            foreignField: '_id',
            as: 'groups'
          }
    },
    {
      $project:
          {
            name: 1,
            email: 1,
            role: 1,
            'groups.name': 1,
            'groups._id': 1
          }
    },
    { $set: {
        'groups': {
          $sortArray: {
            input: '$groups',
            sortBy: { name: 1 }
          }
        }
      }}
  ];

  try {
    return await client
      .db(process.env.database)
      .collection('users')
      .aggregate(pipeline)
      .toArray();
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
