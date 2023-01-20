async function getChat(client) {

    const stage1 = {
        '$unwind': {
            'path': '$chat'
        }
    };

    const stage2 = {
        '$addFields': {
            'chat.firstName': '$firstName'
        }
    }

    // match childId and userId to get child info
    const stage3 = {
        '$replaceRoot': {
            'newRoot': '$chat'
        }
    };

    const pipeline = [];
    pipeline.push(
        stage1,
        stage2,
        stage3
    );

    try {
        return await client
            .db(process.env.database)
            .collection('users')
            .aggregate(pipeline)
            .toArray()
    } catch (err) {
        console.log('ERROR: ' + err.stack);
        return null;
    }
}

async function sendMessage(client, userId, message) {

    const filter = {userId: parseInt(userId)};
    const update = {'$push': {chat: {message: message, timestamp: new Date()}}};

    try {
        return await client
            .db(process.env.database)
            .collection('users')
            .findOneAndUpdate(filter, update);
    } catch (err) {
        console.log('ERROR: ' + err.stack);
        return null;
    }
}

export default {getChat, sendMessage};