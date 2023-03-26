import express from 'express';
import { getUsers, getGroup, updateGroup } from '../utils/adminPipeline.js';

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

adminRouter.get('/api/group/:groupId', async (req, res) => {
  if (!req.user) return res.status(401).send({ error: 'User not logged in' });
  const result = await getGroup(req.params.groupId);
  res.send(result);
});

adminRouter.post('/api/group/:groupId', async (req, res) => {
  if (!req.user) return res.status(401).send({ error: 'User not logged in' });
  const result = await updateGroup(req.params.groupId, req.body);
  if (result.modifiedCount === 1) return res.send({error: false, message: 'Group updated'})
  res.send({error: true, message: 'Something went wrong'});
});

export { adminRouter };
