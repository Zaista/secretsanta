import { getClient } from './database.js';
import mongodb from 'mongodb';

export async function getHistory(groupId) {
  const pipeline = [
    {
      $match: {
        groupId: new mongodb.ObjectId(groupId)
      }
    },
    {
      $unwind: {
        path: '$gifts'
      }
    },
    {
      // match santaId and _id to get santa info
      $lookup: {
        from: 'users',
        localField: 'gifts.santaId',
        foreignField: '_id',
        as: 'santaUser'
      }
    },
    {
      // match childId and _id to get child info
      $lookup: {
        from: 'users',
        localField: 'gifts.childId',
        foreignField: '_id',
        as: 'childUser'
      }
    },
    {
      $unwind: {
        path: '$santaUser'
      }
    },
    {
      $unwind: {
        path: '$childUser'
      }
    },
    {
      // filter only necessary fields
      $project: {
        year: 1,
        location: 1,
        location_image: 1,
        gift: '$gifts.gift',
        gift_image: '$gifts.gift_image',
        santa: '$santaUser.name',
        child: '$childUser.name'
      }
    },
    {
      $group: {
        _id: '$year',
        year: {
          $first: '$$ROOT.year'
        },
        location: {
          $first: '$$ROOT.location'
        },
        location_image: {
          $first: '$$ROOT.location_image'
        },
        gifts: {
          $push: {
            santa: '$$ROOT.santa',
            child: '$$ROOT.child',
            gift: '$$ROOT.gift',
            gift_image: '$$ROOT.gift_image'
          }
        }
      }
    },
    {
      $project: { _id: 0 }
    },
    {
      $sort: { year: -1 }
    }
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
