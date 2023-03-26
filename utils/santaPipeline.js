import mongodb from 'mongodb';
import { getClient } from './database.js';

export async function getSanta(userId) {
  const pipeline = [
    {
      $match: {
        _id: new mongodb.ObjectId(userId)
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
        name: {
          $arrayElemAt: [
            '$child.name', 0
          ]
        },
        address: {
          $arrayElemAt: [
            '$child.address', 0
          ]
        },
        year: '$years.year',
        _id: 0,
        image: {
          $arrayElemAt: [
            '$child.image', 0
          ]
        }
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

export async function getUserGroups(userId) {
  const client = await getClient();
  const pipeline = [
                     {
                       '$match': {
                         '_id': userId
                       }
                     }, {
                       '$unwind': {
                         'path': '$groups'
                       }
                     }, {
                       '$project': {
                         'groupIds': {
                           '$toObjectId': '$groups'
                         },
                         '_id': 0
                       }
                     }, {
                       '$lookup': {
                         'from': 'groups',
                         'localField': 'groupIds',
                         'foreignField': '_id',
                         'as': 'group'
                       }
                     }, {
                       '$unwind': {
                         'path': '$group'
                       }
                     }, {
                       '$replaceRoot': {
                         'newRoot': '$group'
                       }
                     }
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
