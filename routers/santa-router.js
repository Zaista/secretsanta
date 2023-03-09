import express from 'express';
import { getSanta } from '../utils/santaPipeline.js';

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
  const result = await getSanta(req.user.firstName);
  if (result.length === 0) {
    res.send({ error: 'Some error' }); // TODO
  } else {
    res.send(result);
  }
});

export { santaRouter };
