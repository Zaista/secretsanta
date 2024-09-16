import { ObjectId } from 'mongodb';
import { getClient } from './database.js';
import { ROLES } from './roles.js';
import { getLogger } from './logger.js';

const log = getLogger('adminPipeline');

export async function getUsers(groupId) {
  const client = await getClient();
  const query = { 'groups.groupId': groupId };
  const options = {
    projection: { name: 1, email: 1 },
    sort: { name: 1 },
  };

  try {
    return await client.collection('users').find(query, options).toArray();
  } catch (err) {
    log.error('getUsers: ' + err);
    await client.close();
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
        'groups.groupId': groupId,
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
    return await client.collection('users').aggregate(pipeline).toArray();
  } catch (err) {
    log.error('getUsersAndRoles: ' + err);
    await client.close();
    return null;
  }
}

export async function checkIfUserExists(email) {
  const client = await getClient();
  const query = { email };

  try {
    return await client.collection('users').findOne(query);
  } catch (err) {
    log.error('checkIfUserExists: ' + err);
    await client.close();
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
    const result = await client.collection('users').updateOne(filter, update);
    if (result.acknowledged !== true || result.modifiedCount !== 1) {
      log.error('ERROR addUserToGroup: failed to add user to the group');
      return null;
    }
    return true;
  } catch (err) {
    log.error('addUserToGroup: ' + err);
    await client.close();
    return null;
  }
}

export async function removeUserFromGroup(userId, groupId) {
  const client = await getClient();
  const filter = { _id: userId };
  const update = {
    $pull: {
      groups: { groupId: groupId },
    },
  };

  try {
    const result = await client.collection('users').updateOne(filter, update);
    if (result.acknowledged !== true || result.modifiedCount !== 1) {
      log.error(
        'removeUserFromGroup: failed to remove the user from the group'
      );
      return null;
    }
    return true;
  } catch (err) {
    log.error('removeUserFromGroup: ' + err);
    await client.close();
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
    return await client.collection('users').insertOne(user);
  } catch (err) {
    log.error('addNewUser: ' + err);
    await client.close();
    return null;
  }
}

export async function createNewUser(user) {
  const client = await getClient();
  try {
    return await client.collection('users').insertOne(user);
  } catch (err) {
    log.error('createNewUser: ' + err);
    await client.close();
    return null;
  }
}

export async function updateUsersRoles(groupId, usersRoles) {
  const client = await getClient();
  try {
    let modifiedCount = 0;
    for (const userData of usersRoles) {
      const filter = {
        'groups.groupId': groupId,
        _id: userData._id,
      };
      const update = {
        $set: { 'groups.$.role': userData.role },
      };
      const result = await client.collection('users').updateOne(filter, update);
      if (result.modifiedCount !== 0) {
        modifiedCount += result.modifiedCount;
      }
    }
    return modifiedCount;
  } catch (err) {
    log.error('updateUsersRoles: ' + err);
    await client.close();
    return null;
  }
}

export async function getGroup(groupId) {
  const client = await getClient();
  const query = { _id: groupId };

  try {
    return await client.collection('groups').findOne(query);
  } catch (err) {
    log.error('getGroup: ' + err);
    await client.close();
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
    const result = await client.collection('groups').insertOne(group);

    if (result.acknowledged !== true) {
      log.error('ERROR createGroup: failed to create new group');
      return null;
    }
    group._id = result.insertedId;
    return group;
  } catch (err) {
    log.error('createGroup: ' + err);
    await client.close();
    return null;
  }
}

export async function updateGroup(groupId, groupData) {
  const client = await getClient();
  const filter = { _id: groupId };
  const update = {
    $set: groupData,
  };

  try {
    return await client.collection('groups').updateOne(filter, update);
  } catch (err) {
    log.error('updateGroup: ' + err);
    await client.close();
    return null;
  }
}

export async function deleteForbiddenPair(_id) {
  const client = await getClient();
  const filter = { _id: _id };

  try {
    return await client.collection('forbiddenPairs').deleteOne(filter);
  } catch (err) {
    log.error('deleteForbiddenPair: ' + err);
    await client.close();
    return null;
  }
}

export async function getForbiddenPairs(groupId) {
  const client = await getClient();
  const pipeline = [
    {
      $match: {
        groupId: groupId,
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
      .collection('forbiddenPairs')
      .aggregate(pipeline)
      .toArray();
  } catch (err) {
    log.error('getForbiddenPairs: ' + err);
    await client.close();
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
      groupId: groupId,
      userId: ObjectId.createFromHexString(forbiddenPair.forbiddenUser1Id),
      forbiddenPairId: ObjectId.createFromHexString(
        forbiddenPair.forbiddenUser2Id
      ),
    };

    return await client.collection('forbiddenPairs').insertOne(document);
  } catch (err) {
    log.error('createForbiddenPair: ' + err);
    await client.close();
    return null;
  }
}

async function findExistingPair(client, groupId, forbiddenPair) {
  return await client.collection('forbiddenPairs').findOne({
    groupId: groupId,
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
