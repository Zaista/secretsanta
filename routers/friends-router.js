import express from 'express';
import { getFriends } from '../utils/friendsPipeline.js';

const friendsRouter = express.Router();

// define the home page route
friendsRouter.get('/', async (req, res) => {
  if (!req.user) return res.status(401).redirect('session/login');
  res.sendFile('public/friends/santaFriends.html', { root: '.' });
});

friendsRouter.get('/api/list', async (req, res) => {
  if (!req.user) return res.status(401).send({ error: 'User not logged in' });
  if (req.session.activeGroup !== undefined) {
    const result = await getFriends(req.session.activeGroup._id);
    res.send(result);
  } else { return res.send([]); }
});

export { friendsRouter };
