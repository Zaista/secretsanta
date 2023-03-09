import express from 'express';
import { getFriends } from '../utils/friendsPipeline.js';

const friendsRouter = express.Router();

// define the home page route
friendsRouter.get('/friends', async (req, res) => {
  if (!req.user) return res.status(401).redirect('/login');
  res.sendFile('public/santaFriends.html', { root: '.' });
});

friendsRouter.get('/api/friends', async (req, res) => {
  if (!req.user) return res.status(401).send({error: 'User not logged in'});
  const result = await getFriends();
  res.send(result);
});

export { friendsRouter };