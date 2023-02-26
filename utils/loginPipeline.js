import mongodb from 'mongodb';

async function login (client, username, password) {

  const query = { username: username, password: password };
  const options = { projection: {firstName: 1, lastName: 1} };

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

async function getById(client, _id) {
   const query = { _id: new mongodb.ObjectId(_id) };
   const options = { projection: {firstName: 1, lastName: 1} };

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

async function checkEmail (client, email) {
  const query = { email: email };
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

export default { login, checkEmail, getById };
