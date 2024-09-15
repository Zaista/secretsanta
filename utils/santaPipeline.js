import { getClient } from './database.js';
import { getLogger } from './logger.js';

const log = getLogger('santaPipeline');

export async function getSanta(_id, groupId) {
  const pipeline = [
    {
      $match: {
        groupId: groupId,
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
        email: '$user.email',
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
    log.error('getSanta: ' + err);
    return null;
  }
}
