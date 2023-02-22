async function login (client, username, password) {
  const pipeline = [
    {
      $match: {
        username,
        password
      }
    }, {
      $project: {
        firstName: 1,
        lastName: 1,
        _id: 0
      }
    }];

  // TODO switch to findOne
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

async function checkEmail (client, email) {
  const query = { email };
  const options = { projection: { _id: 0 } };

  try {
    return await client
      .db(process.env.database)
      .collection('users')
      .findOne(query, options);
  } catch (err) {
    console.log('ERROR: ' + err.stack);
    return null;
  }
}

export default { login, checkEmail };
