import express from 'express';
import {
  getUsers,
  getUsersAndRoles,
  updateUsersRoles,
  checkIfUserExists,
  addUserToGroup,
  removeUserFromGroup,
  addNewUser,
  getGroup,
  updateGroup,
  createGroup,
  getForbiddenPairs,
  createForbiddenPair,
  deleteForbiddenPair
} from '../utils/adminPipeline.js';
import fs from 'fs';
import {
  addDraftsForNextYear,
  isNextYearDrafted,
  isLastYearRevealed,
  setLastYearRevealed,
  getYearsByGroup
} from '../utils/historyPipeline.js';
import { draftPairs } from '../utils/drafter.js';
import { ROLES } from '../utils/roles.js';
import { sendEmail } from '../utils/environment.js';

const adminRouter = express.Router();

// define the home page route
adminRouter.get('/', (req, res) => {
  if (!req.user) return res.status(401).redirect('session/login');
  else if (req.session.activeGroup.role !== ROLES.admin) return res.status(401).redirect('/');
  res.sendFile('public/admin/santaAdmin.html', { root: '.' });
});

// Secret Santa users

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
    const alreadyPartOfGroup = user.groups?.find(userGroup => userGroup.groupId.equals(group._id));
    if (alreadyPartOfGroup !== undefined) {
      return res.send({ error: 'User already part of the group' });
    }

    const result = await addUserToGroup(req.session.activeGroup._id, user.email, ROLES.user);
    if (result === true) {
      const emailStatus = await sendWelcomeEmail(user.email, group.name);
      if (emailStatus.success) {
        res.send({ success: `User ${req.body.email} added to group ${group.name}` });
      } else {
        res.send({ error: `Error adding user to the group: ${emailStatus.error}` });
      }
    }
  } else {
    const temporaryPassword = Math.random().toString(36).slice(2, 10);
    const result = await addNewUser(req.session.activeGroup._id, req.body.email, temporaryPassword);
    if (result.acknowledged) {
      const emailStatus = await sendWelcomeEmail(req.body.email, group.name, temporaryPassword);
      if (emailStatus.success) {
        res.send({ success: `Welcome email sent to ${req.body.email}` });
      } else {
        res.send({ error: `Error sending welcome email: ${emailStatus.error}` });
      }
    }
  }
});

adminRouter.post('/api/user/delete', async (req, res) => {
  if (!req.user) return res.status(401).send({ error: 'User not logged in' });
  const result = await removeUserFromGroup(req.body._id, req.session.activeGroup._id);
  if (result === null) {
    return res.send({ error: 'User could not be removed from the group' });
  }
  res.send({ success: `User ${req.body.email} removed from the group` });
});

// Secret Santa groups

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
  res.send({ error: 'Something went wrong when updating the group' });
});

adminRouter.post('/api/group/create', async (req, res) => {
  if (!req.user) return res.status(401).send({ error: 'User not logged in' });
  const group = await createGroup(req.body.groupName);
  if (group === null) {
    res.send({ error: 'Something went wrong during group creation' });
  }
  const result = await addUserToGroup(group._id, req.user.email, ROLES.admin);
  if (result === true) {
    req.session.activeGroup = { _id: group._id, name: group.name, role: ROLES.admin };
    return res.send({ success: 'Group created', groupId: group._id });
  }
  return res.send({ error: 'Something went wrong during group creation' });
});

// Secret Santa forbidden pairs

adminRouter.get('/api/forbidden', async (req, res) => {
  if (!req.user) return res.status(401).send({ error: 'User not logged in' });
  const result = await getForbiddenPairs(req.session.activeGroup._id);
  res.send(result);
});

adminRouter.post('/api/forbidden', async (req, res) => {
  if (!req.user) return res.status(401).send({ error: 'User not logged in' });
  const result = await createForbiddenPair(req.session.activeGroup._id, req.body);
  if (result.insertedId) {
    return res.send({ success: 'Forbidden pair added', id: result.insertedId });
  } else {
    return res.send({ error: 'Forbidden pair already exists in the group' });
  }
});

adminRouter.post('/api/forbidden/delete', async (req, res) => {
  if (!req.user) return res.status(401).send({ error: 'User not logged in' });
  const result = await deleteForbiddenPair(req.body._id);
  if (result.deletedCount === 1) return res.send({ success: 'The forbidden pair was successfully deleted' });
  res.send({ error: 'Something went wrong' });
});

// Secret Santa drafting and revealing

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
  const santaPairs = draftPairs(users, forbiddenPairs);
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

  const history = await getYearsByGroup(req.session.activeGroup._id);
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

async function sendWelcomeEmail(email, groupName, temporaryPassword) {
  const data = fs.readFileSync('./templates/user.html');
  let emailText = data.toString().replace(/{{groupName}}/, groupName);

  if (temporaryPassword) {
    emailText = emailText.replace(/{{temporaryPassword}}/, temporaryPassword);
  }

  const emailTemplate = {
    from: 'SecretSanta <secretsanta@jovanilic.com>',
    to: email,
    subject: 'Welcome to Secret Santa',
    html: emailText
  };

  return await sendEmail(emailTemplate);
}

export { adminRouter };
