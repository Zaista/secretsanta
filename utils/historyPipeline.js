import { getClient } from './database.js';
import { ObjectId } from 'mongodb';
import { getLogger } from './logger.js';

const log = getLogger('historyPipeline');

export async function getYearsByGroup(groupId) {
  const pipeline = [
    {
      $match: {
        groupId: groupId,
      },
    },
    {
      $project: {
        groupId: 0,
        gifts: 0,
      },
    },
    {
      $sort: { year: -1 },
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
    log.error('getYearsByGroup: ' + err);
    return null;
  }
}

export async function getGiftsByYear(groupId, yearId) {
  const pipeline = [
    {
      $match: {
        _id: ObjectId.createFromHexString(yearId),
        groupId: groupId,
        revealed: true,
      },
    },
    {
      $unwind: {
        path: '$gifts',
      },
    },
    {
      // match santaId and _id to get santa info
      $lookup: {
        from: 'users',
        localField: 'gifts.santaId',
        foreignField: '_id',
        as: 'santaUser',
      },
    },
    {
      // match childId and _id to get child info
      $lookup: {
        from: 'users',
        localField: 'gifts.childId',
        foreignField: '_id',
        as: 'childUser',
      },
    },
    {
      $unwind: {
        path: '$santaUser',
      },
    },
    {
      $unwind: {
        path: '$childUser',
      },
    },
    {
      $group: {
        _id: '$_id',
        year: {
          $first: '$$ROOT.year',
        },
        location: {
          $first: '$$ROOT.location',
        },
        imageUploaded: {
          $first: '$$ROOT.imageUploaded',
        },
        gifts: {
          $push: {
            santa: '$$ROOT.santaUser.name',
            santaEmail: '$$ROOT.santaUser.email',
            child: '$$ROOT.childUser.name',
            childEmail: '$$ROOT.childUser.email',
            gift: '$$ROOT.gifts.gift',
            imageUploaded: '$$ROOT.gifts.imageUploaded',
            giftId: '$$ROOT.gifts.giftId',
          },
        },
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
    log.error('getClient: ' + err);
    return null;
  }
}

export async function addDraftsForNextYear(groupId, santaPairs) {
  const document = {
    year: new Date().getFullYear() + 1,
    location: null,
    imageUploaded: false,
    gifts: [],
    groupId: groupId,
    revealed: false,
  };

  santaPairs.forEach((santa, child) => {
    const gift = {
      santaId: santa,
      childId: child,
      gift: null,
      giftId: new ObjectId(),
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
    log.error('addDraftsForNextYear: ' + err);
    return null;
  }
}

export async function isNextYearDrafted(groupId) {
  const client = await getClient();
  const query = {
    groupId: groupId,
    year: new Date().getFullYear() + 1,
  };

  try {
    const result = await client
      .db(process.env.database)
      .collection('history')
      .findOne(query);

    return !result;
  } catch (err) {
    log.error('isNextYearDrafted: ' + err);
    return null;
  }
}

export async function isLastYearRevealed(groupId) {
  const client = await getClient();
  const query = {
    groupId: groupId,
  };
  const options = {
    sort: { year: -1 },
    projection: { year: 1, revealed: 1 },
  };

  try {
    const result = await client
      .db(process.env.database)
      .collection('history')
      .findOne(query, options);

    return result?.revealed;
  } catch (err) {
    log.error('isLastYearRevealed: ' + err);
    return null;
  }
}

export async function setLastYearRevealed(groupId, year) {
  const client = await getClient();
  const filter = {
    groupId: groupId,
    year,
  };
  const update = { $set: { revealed: true } };

  try {
    return await client
      .db(process.env.database)
      .collection('history')
      .updateOne(filter, update);
  } catch (err) {
    log.error('setLastYearRevealed: ' + err);
    return null;
  }
}

export async function updateLocationImage(yearId) {
  const client = await getClient();
  const filter = { _id: ObjectId.createFromHexString(yearId) };
  const update = {
    $set: {
      imageUploaded: true,
    },
  };

  try {
    return await client
      .db(process.env.database)
      .collection('history')
      .updateOne(filter, update);
  } catch (err) {
    log.error('updateLocationImage: ' + err);
    return null;
  }
}

export async function updateGiftImage(yearId, giftId) {
  const client = await getClient();
  const filter = {
    _id: ObjectId.createFromHexString(yearId),
    'gifts.giftId': ObjectId.createFromHexString(giftId),
  };
  const update = {
    $set: {
      'gifts.$.imageUploaded': true,
    },
  };

  try {
    return await client
      .db(process.env.database)
      .collection('history')
      .updateOne(filter, update);
  } catch (err) {
    log.error('updateGiftImage: ' + err);
    return null;
  }
}

export async function updateGiftDescription(giftId, description) {
  const client = await getClient();
  const filter = { 'gifts.giftId': ObjectId.createFromHexString(giftId) };
  const update = {
    $set: {
      'gifts.$.gift': description,
    },
  };

  try {
    return await client
      .db(process.env.database)
      .collection('history')
      .updateOne(filter, update);
  } catch (err) {
    log.error('updateGiftDescription: ' + err);
    return null;
  }
}

export async function updateYearDescription(yearId, description) {
  const client = await getClient();
  const filter = { _id: ObjectId.createFromHexString(yearId) };
  const update = {
    $set: {
      location: description,
    },
  };

  try {
    return await client
      .db(process.env.database)
      .collection('history')
      .updateOne(filter, update);
  } catch (err) {
    log.error('updateYearDescription: ' + err);
    return null;
  }
}
