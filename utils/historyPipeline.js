import { getClient } from './database.js';
import mongodb, { ObjectId } from 'mongodb';

export async function getYearsByGroup(groupId) {
  const pipeline = [
    {
      $match: {
        groupId: new mongodb.ObjectId(groupId)
      }
    },
    {
      $project: {
        groupId: 0,
        gifts: 0
      }
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

export async function getGiftsByYear(groupId, yearId) {
  const pipeline = [
    {
      $match: {
        _id: new mongodb.ObjectId(yearId),
        groupId: new mongodb.ObjectId(groupId),
        revealed: true
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
      $group: {
        _id: '$_id',
        year: {
          $first: '$$ROOT.year'
        },
        imageUploaded: {
          $first: '$$ROOT.imageUploaded'
        },
        gifts: {
          $push: {
            santa: '$$ROOT.santaUser.name',
            child: '$$ROOT.childUser.name',
            gift: '$$ROOT.gifts.gift',
            imageUploaded: '$$ROOT.gifts.imageUploaded',
            giftId: '$$ROOT.gifts.giftId'
          }
        }
      }
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

export async function addDraftsForNextYear(groupId, santaPairs) {
  const document = {
    year: new Date().getFullYear() + 1,
    location: null,
    location_image: null,
    gifts: [],
    groupId: new mongodb.ObjectId(groupId),
    revealed: false
  };

  santaPairs.forEach((santa, child) => {
    const gift = {
      santaId: new mongodb.ObjectId(santa),
      childId: new mongodb.ObjectId(child),
      gift: null,
      gift_image: null
    };
    document.gifts.push(gift);
  });

  const client = await getClient();

  try {
    return await client
      .db(process.env.database)
      .collection('history')
      .insertOne(document);
  } catch (err) {
    console.log('ERROR: ' + err.stack);
    return null;
  }
}

export async function isNextYearDrafted(groupId) {
  const client = await getClient();
  const query = {
    groupId: new mongodb.ObjectId(groupId),
    year: new Date().getFullYear() + 1
  };

  try {
    const result = await client
      .db(process.env.database)
      .collection('history')
      .findOne(query);

    return !result;
  } catch (err) {
    console.log('ERROR: ' + err.stack);
    return null;
  }
}

export async function isLastYearRevealed(groupId) {
  const client = await getClient();
  const query = {
    groupId: new mongodb.ObjectId(groupId)
  };
  const options = { sort: { year: -1 }, projection: { year: 1, revealed: 1 } };

  try {
    const result = await client
      .db(process.env.database)
      .collection('history')
      .findOne(query, options);

    return result?.revealed;
  } catch (err) {
    console.log('ERROR: ' + err.stack);
    return null;
  }
}

export async function setLastYearRevealed(groupId, year) {
  const client = await getClient();
  const filter = {
    groupId: new mongodb.ObjectId(groupId),
    year
  };
  const update = { $set: { revealed: true } };

  try {
    return await client
      .db(process.env.database)
      .collection('history')
      .updateOne(filter, update);
  } catch (err) {
    console.log('ERROR: ' + err.stack);
    return null;
  }
}

export async function updateLocationImage(yearId) {
  const client = await getClient();
  const filter = { _id: new ObjectId(yearId) };
  const update = {
    $set: {
      imageUploaded: true
    }
  };

  try {
    return await client
      .db(process.env.database)
      .collection('history')
      .updateOne(filter, update);
  } catch (err) {
    console.log('ERROR: ' + err.stack);
    return null;
  }
}

export async function updateGiftImage(yearId, giftId) {
  const client = await getClient();
  const filter = { _id: new ObjectId(yearId), 'gifts.giftId': new ObjectId(giftId) };
  const update = {
    $set: {
      'gifts.$.imageUploaded': true
    }
  };

  try {
    return await client
      .db(process.env.database)
      .collection('history')
      .updateOne(filter, update);
  } catch (err) {
    console.log('ERROR: ' + err.stack);
    return null;
  }
}

export async function updateGiftDescription(giftId, description) {
  const client = await getClient();
  const filter = { 'gifts.giftId': new ObjectId(giftId) };
  const update = {
    $set: {
      'gifts.$.gift': description
    }
  };

  try {
    return await client
      .db(process.env.database)
      .collection('history')
      .updateOne(filter, update);
  } catch (err) {
    console.log('ERROR: ' + err.stack);
    return null;
  }
}
