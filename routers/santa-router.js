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
  if (req.session.activeGroup !== undefined) {
    const santa = await getSanta(req.user._id, req.session.activeGroup._id);
    if (santa.length === 0) {
      return res.send({
        warning: 'Santa pairs not drafted yet for the next year',
      });
    }
    return res.send(santa[0]);
  } else {
    return res.send({ warning: 'No Secret Santa group selected' });
  }
});

export { santaRouter };
