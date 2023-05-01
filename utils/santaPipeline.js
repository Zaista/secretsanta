import mongodb from 'mongodb';
import { getClient } from './database.js';

export async function getSanta(_id, groupId) {
  const pipeline = [{
    $match: {
      groupId: new mongodb.ObjectId(groupId),
      year: new Date().getFullYear() + 1
    }
  }, {
    $unwind: {
      path: '$gifts'
    }
  }, {
    $match: {
      $expr: {
        $eq: [
          _id,
          '$gifts.santaId'
        ]
      }
    }
  }, {
    $lookup: {
      from: 'users',
      localField: 'gifts.childId',
      foreignField: '_id',
      as: 'user'
    }
  }, {
    $unwind: {
      path: '$user'
    }
  }, {
    $project: {
      name: '$user.name',
      address: '$user.address',
      year: '$year',
      image: '$user.image'
    }
  }];

  const client = await getClient();

  try {
    return await client
      .db(process.env.database)
      .collection('history')
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
      $match: {
        _id: userId
      }
    }, {
      $unwind: {
        path: '$groups'
      }
    }, {
      $project: {
        groupIds: {
          $toObjectId: '$groups'
        },
        _id: 0
      }
    }, {
      $lookup: {
        from: 'groups',
        localField: 'groupIds',
        foreignField: '_id',
        as: 'group'
      }
    }, {
      $unwind: {
        path: '$group'
      }
    }, {
      $replaceRoot: {
        newRoot: '$group'
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
