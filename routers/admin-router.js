import express from 'express';
import { getUsers } from '../utils/adminPipeline.js';

const adminRouter = express.Router();

// define the home page route
adminRouter.get('/admin', (req, res) => {
  if (!req.user) return res.status(401).redirect('/login');
  res.sendFile('public/santaAdmin.html', { root: '.' });
});

adminRouter.get('/api/users', async (req, res) => {
  if (!req.user) return res.status(401).send({ error: 'User not logged in' });
  const result = await getUsers();
  res.send(result);
});

export { adminRouter };
