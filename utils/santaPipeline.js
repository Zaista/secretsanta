import { getClient } from './database.js';

export async function getSanta(firstName) {
  const pipeline = [
    {
      $match: {
        firstName
      }
    }, {
      $lookup: {
        from: 'history',
        localField: 'userId',
        foreignField: 'gifts.santaId',
        as: 'years'
      }
    }, {
      $unwind: {
        path: '$years'
      }
    }, {
      $unwind: {
        path: '$years.gifts'
      }
    }, {
      $match: {
        $expr: {
          $eq: [
            '$userId', '$years.gifts.santaId'
          ]
        }
      }
    }, {
      $lookup: {
        from: 'users',
        localField: 'years.gifts.childId',
        foreignField: 'userId',
        as: 'child'
      }
    }, {
      $project: {
        firstName: {
          $arrayElemAt: [
            '$child.firstName', 0
          ]
        },
        lastName: {
          $arrayElemAt: [
            '$child.lastName', 0
          ]
        },
        username: {
          $arrayElemAt: [
            '$child.username', 0
          ]
        },
        address: {
          $arrayElemAt: [
            '$child.address', 0
          ]
        },
        year: '$years.year',
        _id: 0
      }
    }, {
      $sort: {
        year: -1
      }
    }
  ];

  const client = await getClient();

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
