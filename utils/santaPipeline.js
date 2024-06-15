import mongodb from 'mongodb';
import { getClient } from './database.js';

export async function getSanta(_id, groupId) {
  const pipeline = [
    {
      $match: {
        groupId: new mongodb.ObjectId(groupId),
        year: new Date().getFullYear() + 1,
      },
    },
    {
      $unwind: {
        path: '$gifts',
      },
    },
    {
      $match: {
        $expr: {
          $eq: [_id, '$gifts.santaId'],
        },
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'gifts.childId',
        foreignField: '_id',
        as: 'user',
      },
    },
    {
      $unwind: {
        path: '$user',
      },
    },
    {
      $project: {
        _id: '$user._id',
        name: '$user.name',
        address: '$user.address',
        year: '$year',
        imageUploaded: '$user.imageUploaded',
      },
    },
  ];

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
