async function getFriends (client) {
  const query = { active: true };
  const options = { projection: { _id: 0, password: 0 } };

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

export default { getFriends };