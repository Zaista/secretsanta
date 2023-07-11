import express from 'express';
import { getUsers, getUsersAndRoles, updateUsersRoles, checkIfUserExists, addUserToGroup, createNewUser, getGroup, updateGroup, getForbiddenPairs, createForbiddenPair, deleteForbiddenPair } from '../utils/adminPipeline.js';
import fs from 'fs';
import { getMail } from '../utils/mail.js';
import { getHistory, addDraftsForNextYear, isNextYearDrafted, isLastYearRevealed, setLastYearRevealed } from '../utils/historyPipeline.js';
import { draftPairs } from '../utils/drafter.js';
import { ROLES } from '../utils/roles.js';

const adminRouter = express.Router();

// define the home page route
adminRouter.get('/admin', (req, res) => {
  if (!req.user) return res.status(401).redirect('/login');
  else if (req.session.activeGroup.role !== ROLES.admin) return res.status(401).redirect('/');
  res.sendFile('public/santaAdmin.html', { root: '.' });
});

adminRouter.get('/api/users', async (req, res) => {
  if (!req.user) return res.status(401).send({ error: 'User not logged in' });
  const result = await getUsersAndRoles(req.session.activeGroup._id);
  res.send(result);
});

adminRouter.post('/api/users', async (req, res) => {
  if (!req.user) return res.status(401).send({ error: 'User not logged in' });
  const modifiedCount = await updateUsersRoles(req.session.activeGroup._id, req.body.usersRoles);
  res.send({ success: `Modified ${modifiedCount} user(s)` });
});

adminRouter.post('/api/user', async (req, res) => {
  if (!req.user) return res.status(401).send({ error: 'User not logged in' });
  const user = await checkIfUserExists(req.body.email);
  const group = await getGroup(req.session.activeGroup._id);

  if (user) {
    const result = await addUserToGroup(req.session.activeGroup._id, req.body.email);
    if (result) {
      await sendWelcomeEmail(req.body.email, group.name);
    }
    return res.send({ success: `User ${req.body.email} added to group ${group.name}` });
  } else {
    const temporaryPassword = Math.random().toString(36).slice(2, 10);
    const result = await createNewUser(req.session.activeGroup._id, req.body.email, temporaryPassword);
    if (result.acknowledged) {
      await sendWelcomeEmail(req.body.email, group.name, temporaryPassword);
    }
    return res.send({ success: `New user created ${req.body.email} in group ${group.name}` });
  }
});

adminRouter.get('/api/group', async (req, res) => {
  if (!req.user) return res.status(401).send({ error: 'User not logged in' });
  const result = await getGroup(req.session.activeGroup._id);
  res.send(result);
});

adminRouter.post('/api/group', async (req, res) => {
  if (!req.user) return res.status(401).send({ error: 'User not logged in' });
  const result = await updateGroup(req.session.activeGroup._id, req.body);
  if (result.modifiedCount === 1) {
    req.session.activeGroup.name = req.body.name;
    return res.send({ success: 'Group updated' });
  }
  res.send({ error: 'Something went wrong' });
});

adminRouter.get('/api/forbidden', async (req, res) => {
  if (!req.user) return res.status(401).send({ error: 'User not logged in' });
  const result = await getForbiddenPairs(req.session.activeGroup._id);
  res.send(result);
});

adminRouter.post('/api/forbidden', async (req, res) => {
  if (!req.user) return res.status(401).send({ error: 'User not logged in' });
  const result = await createForbiddenPair(req.session.activeGroup._id, req.body);
  if (result.insertedId) return res.send({ success: 'Forbidden pair added' });
  res.send({ error: 'Something went wrong' });
});

adminRouter.post('/api/delete', async (req, res) => {
  if (!req.user) return res.status(401).send({ error: 'User not logged in' });
  const result = await deleteForbiddenPair(req.body._id);
  if (result.deletedCount === 1) return res.send({ success: 'The pair was successfully deleted' });
  // TODO remove the row from the table
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

adminRouter.get('/api/draft', async (req, res) => {
  if (!req.user) return res.status(401).send({ error: 'User not logged in' });
  const draftPossible = await isNextYearDrafted(req.session.activeGroup._id);
  if (draftPossible) {
    res.send({ success: 'Pairs can be drafted' });
  } else {
    res.send({ error: 'Next year pairs already drafted' });
  }
});

adminRouter.put('/api/draft', async (req, res) => {
  if (!req.user) return res.status(401).send({ error: 'User not logged in' });

  const draftPossible = await isNextYearDrafted(req.session.activeGroup._id);
  if (!draftPossible) {
    return res.send({ error: 'Next year pairs already drafted' });
  }

  console.log(`Drafting pairs for group ${req.session.activeGroup._id}`);

  const users = await getUsers(req.session.activeGroup._id);
  const forbiddenPairs = await getForbiddenPairs(req.session.activeGroup._id);
  const activeUsers = users.filter(user => user.active);
  const santaPairs = draftPairs(activeUsers, forbiddenPairs);
  if (!santaPairs) {
    console.log(`Unsuccessful draft for group ${req.session.activeGroup._id}`);
    return res.send({ error: 'Error matching pairs, try again or recheck forbidden pairs' });
  }

  const result = await addDraftsForNextYear(req.session.activeGroup._id, santaPairs);
  if (result.acknowledged) {
    res.send({ success: 'Pairs successfully drafted' });
  } else {
    res.send({ error: 'Error drafting new pairs' });
  }
});

adminRouter.get('/api/reveal', async (req, res) => {
  if (!req.user) return res.status(401).send({ error: 'User not logged in' });
  const yearRevealed = await isLastYearRevealed(req.session.activeGroup._id);
  if (yearRevealed) {
    res.send({ error: 'Last year already revealed' });
  } else if (yearRevealed === undefined) {
    res.send({ warning: 'No year drafted yet' });
  } else {
    res.send({ success: 'Year can be revealed' });
  }
});

adminRouter.put('/api/reveal', async (req, res) => {
  if (!req.user) return res.status(401).send({ error: 'User not logged in' });

  const history = await getHistory(req.session.activeGroup._id);
  if (history[0].revealed) {
    return res.send({ error: 'Year already revealed' });
  }

  const result = await setLastYearRevealed(req.session.activeGroup._id, history[0].year);

  if (result.acknowledged) {
    res.send({ success: 'Last year successfully revealed' });
  } else {
    res.send({ error: 'Error revealing the last year' });
  }
});

export { adminRouter };
