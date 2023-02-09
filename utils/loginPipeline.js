async function login(client, username, password) {

    const pipeline = [
    {
     '$match': {
       'username': username,
       'password': password
     }
    }, {
     '$project': {
       'firstName': 1,
       'lastName': 1,
       '_id': 0
     }
    }];

    // TODO switch to findOne
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

export default {login};