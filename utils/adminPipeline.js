import mongodb from 'mongodb';
import {getClient} from './database.js';

export async function getUsers(groupId) {
    const client = await getClient();
    const query = {groups: new mongodb.ObjectId(groupId)};
    const options = {
        projection: {name: 1, email: 1, active: 1, role: 1},
        sort: {active: -1}
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

export async function updateUsersRoleAndStatus(groupId, usersRoleAndStatus) {
    const client = await getClient();
    try {
        let modifiedCount = 0;
        for (let userData of usersRoleAndStatus) {
            const filter = {
                groups: new mongodb.ObjectId(groupId),
                _id: new mongodb.ObjectId(userData._id)
            };
            const update = {
                $set: {role: userData.role, active: userData.active === 'true'}
            }
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
    const query = {_id: new mongodb.ObjectId(groupId)};

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
    const filter = {_id: new mongodb.ObjectId(groupId)};
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
