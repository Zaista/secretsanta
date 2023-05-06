import express from 'express';
import { getUsers, updateUsersRoleAndStatus, checkIfUserExists, addUserToGroup, createNewUser, getGroup, updateGroup, getForbiddenPairs, createForbiddenPair } from '../utils/adminPipeline.js';
import fs from 'fs';
import {getMail} from '../utils/mail.js';
import { addDraftsForNextYear, isNextYearDrafted } from '../utils/historyPipeline.js';
import { draftPairs } from '../utils/drafter.js'

const adminRouter = express.Router();

// define the home page route
adminRouter.get('/admin', (req, res) => {
  if (!req.user) return res.status(401).redirect('/login');
  res.sendFile('public/santaAdmin.html', { root: '.' });
});

adminRouter.get('/api/users', async (req, res) => {
  if (!req.user) return res.status(401).send({ error: 'User not logged in' });
  const result = await getUsers(req.query.groupId);
  res.send(result);
});

adminRouter.post('/api/users', async (req, res) => {
  if (!req.user) return res.status(401).send({ error: 'User not logged in' });
  const modifiedCount = await updateUsersRoleAndStatus(req.query.groupId, req.body.usersRoleAndStatus);
  res.send({ success: `Modified ${modifiedCount} user(s)` });
});

adminRouter.post('/api/user', async (req, res) => {
  if (!req.user) return res.status(401).send({ error: 'User not logged in' });
  const user = await checkIfUserExists(req.body.email);
  const group = await getGroup(req.body.groupId);

  if (user) {
    const result = await addUserToGroup(req.body.groupId, req.body.email);
    if (result) {
      await sendWelcomeEmail(req.body.email, group.name);
    }
    return res.send({ success: `User ${req.body.email} added to group ${group.name}` });
  } else {
    const temporaryPassword = Math.random().toString(36).slice(2, 10);
    const result = await createNewUser(req.body.groupId, req.body.email, temporaryPassword);
    if (result.acknowledged) {
      await sendWelcomeEmail(req.body.email, group.name, temporaryPassword);
    }
    return res.send({ success: `New user created ${req.body.email} in group ${group.name}` });
  }
});

adminRouter.get('/api/group/:groupId', async (req, res) => {
  if (!req.user) return res.status(401).send({ error: 'User not logged in' });
  const result = await getGroup(req.params.groupId);
  res.send(result);
});

adminRouter.post('/api/group/:groupId', async (req, res) => {
  if (!req.user) return res.status(401).send({ error: 'User not logged in' });
  const result = await updateGroup(req.params.groupId, req.body);
  if (result.modifiedCount === 1) return res.send({ error: false, message: 'Group updated' });
  res.send({ error: true, message: 'Something went wrong' });
});

adminRouter.get('/api/forbidden', async (req, res) => {
  if (!req.user) return res.status(401).send({ error: 'User not logged in' });
  const result = await getForbiddenPairs(req.query.groupId);
  res.send(result);
});

adminRouter.post('/api/forbidden', async (req, res) => {
  if (!req.user) return res.status(401).send({ error: 'User not logged in' });
  const result = await createForbiddenPair(req.query.groupId, req.body);
  if (result.modifiedCount === 1) return res.send({ success: 'Group updated' });
  res.send({ error: 'Something went wrong' });
});

async function sendWelcomeEmail(email, groupName, temporaryPassword) {
  const data = fs.readFileSync('./templates/user.html');
  let emailText = data.toString().replace(/{{groupName}}/, groupName);

  if (temporaryPassword) {
    emailText = emailText.replace(/{{temporaryPassword}}/, temporaryPassword);
  }

  const emailToSend = {
    to: email,
    from: {
      email: 'mail@jovanilic.com',
      name: 'SecretSanta'
    },
    subject: 'Welcome to Secret Santa',
    html: emailText
  };
  const mail = await getMail();
  mail.send(emailToSend).then(() => {
    console.log(`Welcome email sent to ${email}`);
  }).catch((error) => {
    console.error(`Error sending welcome email to the user: ${error}`);
  });
}

adminRouter.put('/api/draft', async (req, res) => {
  if (!req.user) return res.status(401).send({ error: 'User not logged in' });

  const draftPossible = await isNextYearDrafted(req.query.groupId);
  if (!draftPossible) {
    return res.send({error: 'Next year pairs already drafted'});
  }

  console.log(`Drafting pairs for group ${req.query.groupId}`);

  const users = await getUsers(req.query.groupId);
  const activeUsers = users.filter( user => {
    return user.active;
  });
  const santaPairs = draftPairs(activeUsers);
  if (!santaPairs) {
  console.log(`Unsuccessful draft for group ${req.query.groupId}`);
    return res.send({error: 'Error matching pairs, try again or recheck forbidden pairs'});
  }

  const result = await addDraftsForNextYear(req.query.groupId, santaPairs);

  if (result.acknowledged) {
    res.send({success: 'Pairs successfully drafted'});
  } else {
    res.send({error: 'Error drafting new pairs'});
  }
});

adminRouter.get('/api/draft', async (req, res) => {
  if (!req.user) return res.status(401).send({ error: 'User not logged in' });
  const draftPossible = await isNextYearDrafted(req.query.groupId);
  if (draftPossible) {
    res.send({success: 'Pairs can be drafted'});
  } else {
    res.send({error: 'Next year pairs already drafted'});
  }
});

export { adminRouter };
