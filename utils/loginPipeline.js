import mongodb from 'mongodb';
import { getClient } from './database.js';

export function getUserByEmailAndPassword(email, password) {
  const $match = {
    email: { $regex: new RegExp(email, 'i') },
    password,
  };

  return getUser($match);
}

export function getUserById(_id) {
  const $match = {
    _id: new mongodb.ObjectId(_id),
  };

  return getUser($match);
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

async function getUser($match) {
  const client = await getClient();
  const pipeline = [
    {
      $match,
    },
    {
      $lookup: {
        from: 'groups',
        localField: 'groups.groupId',
        foreignField: '_id',
        as: 'groupInfo',
      },
    },
    {
      $project: {
        name: 1,
        email: 1,
        'groupInfo.name': 1,
        'groupInfo._id': 1,
        'groupInfo.userAddedNotification': 1,
        'groupInfo.messageSentNotification': 1,
        'groupInfo.yearDraftedNotification': 1,
        groups: 1,
      },
    },
    {
      $project: {
        groups: {
          $map: {
            input: '$groupInfo',
            in: {
              $let: {
                vars: {
                  m: {
                    $arrayElemAt: [
                      {
                        $filter: {
                          input: '$groups',
                          cond: {
                            $eq: ['$$mb.groupId', '$$this._id'],
                          },
                          as: 'mb',
                        },
                      },
                      0,
                    ],
                  },
                },
                in: {
                  $mergeObjects: [
                    '$$this',
                    {
                      role: '$$m.role',
                    },
                  ],
                },
              },
            },
          },
        },
        email: 1,
        name: 1,
      },
    },
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
