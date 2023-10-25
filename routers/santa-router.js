import express from 'express';
import { getSanta } from '../utils/santaPipeline.js';

const santaRouter = express.Router();

// define the home page route
santaRouter.get('/', (req, res) => {
  if (!req.user) return res.status(401).redirect('session/login');
  res.sendFile('public/home/secretSanta.html', { root: '.' });
});

santaRouter.get('/api/santa', async (req, res) => {
  if (!req.user) return res.status(401).send({ error: 'User not logged in' });
  if (req.session.activeGroup !== undefined) { return res.send(await getSanta(req.user._id, req.session.activeGroup._id)); } else { return res.send([]); } // TODO show that user is not part of any group
});

export { santaRouter };
