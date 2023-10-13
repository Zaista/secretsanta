import express from 'express';
import { getSanta, getUserGroups } from '../utils/santaPipeline.js';

const santaRouter = express.Router();

// middleware that is specific to this router
santaRouter.use((req, res, next) => {
  next();
});

// define the home page route
santaRouter.get('/', (req, res) => {
  if (!req.user) return res.status(401).redirect('/login');
  res.sendFile('public/secretSanta.html', { root: '.' });
});

santaRouter.get('/api/santa', async (req, res) => {
  if (!req.user) return res.status(401).send({ error: 'User not logged in' });
  if (req.session.activeGroup !== undefined) { return res.send(await getSanta(req.user._id, req.session.activeGroup._id)); } else { return res.send([]); } // TODO show that user is not part of any group
});

santaRouter.get('/api/getUserGroups', async (req, res) => {
  if (!req.user) return res.status(401).send({ error: 'User not logged in' });
  const result = await getUserGroups(req.user._id);
  if (result) {
    return res.send(result);
  } else {
    res.status(500).send({ error: 'Failed fetching user groups' });
  }
});

export { santaRouter };
