async function getHistory (client) {
  const stage1 = {
    $unwind: {
      path: '$gifts'
    }
  };

  // match santaId and userId to get santa info
  const stage2 = {
    $lookup: {
      from: 'users',
      localField: 'gifts.santaId',
      foreignField: 'userId',
      as: 'santaUser'
    }
  };

  // match childId and userId to get child info
  const stage3 = {
    $lookup: {
      from: 'users',
      localField: 'gifts.childId',
      foreignField: 'userId',
      as: 'childUser'
    }
  };

  const stage4 = {
    $unwind: {
      path: '$santaUser'
    }
  };

  const stage5 = {
    $unwind: {
      path: '$childUser'
    }
  };

  // filter only necessary fields
  const stage6 = {
    $project: {
      year: 1,
      location: 1,
      location_image: 1,
      gift: '$gifts.gift',
      gift_image: '$gifts.gift_image',
      santa: '$santaUser.firstName',
      child: '$childUser.firstName'
    }
  };

  const stage7 = {
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
  };

  const stage8 = {
    $project: { _id: 0 }
  };

  const stage9 = {
    $sort: { year: -1 }
  };

  const pipeline = [];
  pipeline.push(
    stage1,
    stage2,
    stage3,
    stage4,
    stage5,
    stage6,
    stage7,
    stage8,
    stage9
  );

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

export default { getHistory };
