import { ObjectId } from 'mongodb';
import { getClient } from './database.js';
import { ROLES } from './roles.js';
import { getLogger } from './logger.js';

const log = getLogger('adminPipeline');

export async function getUsers(groupId) {
  const client = await getClient();
  const query = { 'groups.groupId': ObjectId.createFromHexString(groupId) };
  const options = {
    projection: { name: 1, email: 1 },
    sort: { name: 1 },
  };

  try {
    return await client
      .db(process.env.database)
      .collection('users')
      .find(query, options)
      .toArray();
  } catch (err) {
    log.error('ERROR getUsers: ' + err.stack);
    return null;
  }
}

export async function getUsersAndRoles(groupId) {
  const client = await getClient();

  const pipeline = [
    {
      $unwind: {
        path: '$groups',
      },
    },
    {
      $match: {
        'groups.groupId': ObjectId.createFromHexString(groupId),
      },
    },
    {
      $project: {
        email: 1,
        groups: 1,
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
    log.error('ERROR getUsersAndRoles: ' + err.stack);
    return null;
  }
}

export async function checkIfUserExists(email) {
  const client = await getClient();
  const query = { email };

  try {
    return await client
      .db(process.env.database)
      .collection('users')
      .findOne(query);
  } catch (err) {
    log.error('ERROR checkIfUserExists: ' + err.stack);
    return null;
  }
}

export async function addUserToGroup(groupId, email, role) {
  const client = await getClient();
  const filter = { email };
  const update = {
    $push: {
      groups: { groupId: groupId, role },
    },
  };

  try {
    const result = await client
      .db(process.env.database)
      .collection('users')
      .updateOne(filter, update);
    if (result.acknowledged !== true || result.modifiedCount !== 1) {
      log.error('ERROR addUserToGroup: failed to add user to the group');
      return null;
    }
    return true;
  } catch (err) {
    log.error('ERROR addUserToGroup: ' + err.stack);
    return null;
  }
}

export async function removeUserFromGroup(userId, groupId) {
  const client = await getClient();
  const filter = { _id: userId };
  const update = {
    $pull: {
      groups: { groupId: ObjectId.createFromHexString(groupId) },
    },
  };

  try {
    const result = await client
      .db(process.env.database)
      .collection('users')
      .updateOne(filter, update);
    if (result.acknowledged !== true || result.modifiedCount !== 1) {
      log.error(
        'ERROR removeUserFromGroup: failed to remove the user from the group'
      );
      return null;
    }
    return true;
  } catch (err) {
    log.error('ERROR removeUserFromGroup: ' + err.stack);
    return null;
  }
}

export async function addNewUser(groupId, email, password) {
  const client = await getClient();
  const user = {
    password,
    email,
    name: '',
    groups: [{ groupId: groupId, role: ROLES.user }],
    address: { street: '', city: '', postalCode: '', state: '' },
  };
  try {
    return await client
      .db(process.env.database)
      .collection('users')
      .insertOne(user);
  } catch (err) {
    log.error('ERROR addNewUser: ' + err.stack);
    return null;
  }
}

export async function createNewUser(user) {
  const client = await getClient();
  try {
    return await client
      .db(process.env.database)
      .collection('users')
      .insertOne(user);
  } catch (err) {
    log.error('ERROR createNewUser: ' + err.stack);
    return null;
  }
}

export async function updateUsersRoles(groupId, usersRoles) {
  const client = await getClient();
  try {
    let modifiedCount = 0;
    for (const userData of usersRoles) {
      const filter = {
        'groups.groupId': ObjectId.createFromHexString(groupId),
        _id: userData._id,
      };
      const update = {
        $set: { 'groups.$.role': userData.role },
      };
      const result = await client
        .db(process.env.database)
        .collection('users')
        .updateOne(filter, update);
      if (result.modifiedCount !== 0) {
        modifiedCount += result.modifiedCount;
      }
    }
    return modifiedCount;
  } catch (err) {
    log.error('ERROR updateUsersRoles: ' + err.stack);
    return null;
  }
}

export async function getGroup(groupId) {
  const client = await getClient();
  const query = { _id: ObjectId.createFromHexString(groupId) };

  try {
    return await client
      .db(process.env.database)
      .collection('groups')
      .findOne(query);
  } catch (err) {
    log.error('ERROR getGroup: ' + err.stack);
    return null;
  }
}

export async function createGroup(groupName) {
  const client = await getClient();
  const group = {
    name: groupName,
    userAddedNotification: false,
    messageSentNotification: false,
    yearDraftedNotification: false,
  };

  try {
    const result = await client
      .db(process.env.database)
      .collection('groups')
      .insertOne(group);

    if (result.acknowledged !== true) {
      log.error('ERROR createGroup: failed to create new group');
      return null;
    }
    group._id = result.insertedId;
    return group;
  } catch (err) {
    log.error('ERROR createGroup: ' + err.stack);
    return null;
  }
}

export async function updateGroup(groupId, groupData) {
  const client = await getClient();
  const filter = { _id: ObjectId.createFromHexString(groupId) };
  const update = {
    $set: groupData,
  };

  try {
    return await client
      .db(process.env.database)
      .collection('groups')
      .updateOne(filter, update);
  } catch (err) {
    log.error('ERROR updateGroup: ' + err.stack);
    return null;
  }
}

export async function deleteForbiddenPair(_id) {
  const client = await getClient();
  const filter = { _id: _id };

  try {
    return await client
      .db(process.env.database)
      .collection('forbiddenPairs')
      .deleteOne(filter);
  } catch (err) {
    log.error('ERROR deleteForbiddenPair: ' + err.stack);
    return null;
  }
}

export async function getForbiddenPairs(groupId) {
  const client = await getClient();
  const pipeline = [
    {
      $match: {
        groupId: ObjectId.createFromHexString(groupId),
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'userId',
        foreignField: '_id',
        as: 'user',
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'forbiddenPairId',
        foreignField: '_id',
        as: 'forbiddenPair',
      },
    },
    {
      $project: {
        user: { $first: '$user.name' },
        userEmail: { $first: '$user.email' },
        userId: { $first: '$user._id' },
        forbiddenPair: { $first: '$forbiddenPair.name' },
        forbiddenPairEmail: { $first: '$forbiddenPair.email' },
        forbiddenPairId: { $first: '$forbiddenPair._id' },
      },
    },
  ];

  try {
    return await client
      .db(process.env.database)
      .collection('forbiddenPairs')
      .aggregate(pipeline)
      .toArray();
  } catch (err) {
    log.error('ERROR getForbiddenPairs: ' + err.stack);
    return null;
  }
}

export async function createForbiddenPair(groupId, forbiddenPair) {
  const client = await getClient();
  try {
    const existingPair = await findExistingPair(client, groupId, forbiddenPair);
    if (existingPair) {
      // Forbidden pair already exists, handle accordingly
      return { error: 'Forbidden pair already exists.' };
    }

    const document = {
      groupId: ObjectId.createFromHexString(groupId),
      userId: ObjectId.createFromHexString(forbiddenPair.forbiddenUser1Id),
      forbiddenPairId: ObjectId.createFromHexString(
        forbiddenPair.forbiddenUser2Id
      ),
    };

    return await client
      .db(process.env.database)
      .collection('forbiddenPairs')
      .insertOne(document);
  } catch (err) {
    log.error('ERROR createForbiddenPair: ' + err.stack);
    return null;
  }
}

async function findExistingPair(client, groupId, forbiddenPair) {
  return await client
    .db(process.env.database)
    .collection('forbiddenPairs')
    .findOne({
      groupId: ObjectId.createFromHexString(groupId),
      $or: [
        {
          userId: ObjectId.createFromHexString(forbiddenPair.forbiddenUser1Id),
          forbiddenPairId: ObjectId.createFromHexString(
            forbiddenPair.forbiddenUser2Id
          ),
        },
        {
          userId: ObjectId.createFromHexString(forbiddenPair.forbiddenUser2Id),
          forbiddenPairId: ObjectId.createFromHexString(
            forbiddenPair.forbiddenUser1Id
          ),
        },
      ],
    });
}
