import { ObjectId } from 'mongodb';
import { getClient } from './database.js';
import { ROLES } from './roles.js';

export async function getUsers(groupId) {
  const client = await getClient();
  const query = { groups: new ObjectId(groupId) };
  const options = {
    projection: { name: 1, email: 1, active: 1, forbiddenPairs: 1 },
    sort: { active: -1, userId: 1 }
  };

  try {
    return await client
      .db(process.env.database)
      .collection('users')
      .find(query, options)
      .toArray();
  } catch (err) {
    console.log('ERROR: ' + err.stack);
    return null;
  }
}

export async function getUsersAndRoles(groupId) {
  const client = await getClient();

  const pipeline = [{
   $unwind: {
     path: '$groups'
   }
  }, {
   $match: {
     'groups.groupId': new ObjectId(groupId)
   }
  }, {
   $project: {
     name: 1,
     email: 1,
     groups: 1,
     active: 1
   }
  }];

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

export async function checkIfUserExists(email) {
  const client = await getClient();
  const query = { email };

  try {
    return await client
      .db(process.env.database)
      .collection('users')
      .findOne(query);
  } catch (err) {
    console.log('ERROR: ' + err.stack);
    return null;
  }
}

export async function addUserToGroup(groupId, email) {
  const client = await getClient();
  const filter = { email };
  const update = {
    $push: {
      groups: new ObjectId(groupId)
    }
  };

  try {
    return await client
      .db(process.env.database)
      .collection('users')
      .updateOne(filter, update);
  } catch (err) {
    console.log('ERROR: ' + err.stack);
    return null;
  }
}

export async function createNewUser(groupId, email, temporaryPassword) {
  const client = await getClient();
  const user = {
    password: temporaryPassword,
    email,
    active: true,
    role: ROLES.user,
    groups: [new ObjectId(groupId)]
  };
  try {
    return await client
      .db(process.env.database)
      .collection('users')
      .insertOne(user);
  } catch (err) {
    console.log('ERROR: ' + err.stack);
    return null;
  }
}

export async function updateUserRolesAndStatus(groupId, userRolesAndStatus) {
  const client = await getClient();
  try {
    let modifiedCount = 0;
    for (const userData of userRolesAndStatus) {
      const filter = {
        'groups.groupId': new ObjectId(groupId),
        _id: new ObjectId(userData._id)
      };
      const update = {
        $set: { 'groups.$.role': userData.role, active: userData.active === 'true' }
      };
      const result = await client.db(process.env.database).collection('users').updateOne(filter, update);
      if (result.modifiedCount !== 0) {
        modifiedCount += result.modifiedCount;
      }
    }
    return modifiedCount;
  } catch (err) {
    console.log('ERROR: ' + err.stack);
    return null;
  }
}

export async function getGroup(groupId) {
  const client = await getClient();
  const query = { _id: new ObjectId(groupId) };

  try {
    return await client
      .db(process.env.database)
      .collection('groups')
      .findOne(query);
  } catch (err) {
    console.log('ERROR: ' + err.stack);
    return null;
  }
}

export async function updateGroup(groupId, groupData) {
  const client = await getClient();
  const filter = { _id: new ObjectId(groupId) };
  const flag = (groupData.emailNotifications === 'true');
  const update = {
    $set: {
      name: groupData.name,
      emailNotifications: flag
    }
  };

  try {
    return await client
      .db(process.env.database)
      .collection('groups')
      .updateOne(filter, update);
  } catch (err) {
    console.log('ERROR: ' + err.stack);
    return null;
  }
}

export async function getForbiddenPairs(groupId) {
  const client = await getClient();
  const pipeline = [
    {
      $match: {
        'groups.groupId': new ObjectId(groupId)
      }
    }, {
      $lookup: {
        from: 'users',
        localField: 'forbiddenPairs',
        foreignField: '_id',
        as: 'match'
      }
    }, {
      $unwind: {
        path: '$match'
      }
    }, {
      $project: {
        _id: 0,
        forbiddenPair1: '$name',
        forbiddenPair2: '$match.name'
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

export async function createForbiddenPair(groupId, forbiddenPair) {
  const client = await getClient();
  try {
    const filter = {
      groups: new ObjectId(groupId),
      _id: new ObjectId(forbiddenPair.forbiddenUser1)
    };
    const update = {
      $push: { forbiddenPairs: new ObjectId(forbiddenPair.forbiddenUser2) }
    };
    return await client.db(process.env.database).collection('users').updateOne(filter, update);
  } catch (err) {
    console.log('ERROR: ' + err.stack);
    return null;
  }
}
