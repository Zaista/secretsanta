import express from 'express';
import { getFriends, getFriend, updateFriend } from '../utils/friendsPipeline.js';

const friendsRouter = express.Router();

// define the home page route
friendsRouter.get('/friends', async (req, res) => {
  if (!req.user) return res.status(401).redirect('/login');
  res.sendFile('public/santaFriends.html', { root: '.' });
});

friendsRouter.get('/friends/:userId', async (req, res) => {
  if (!req.user) return res.status(401).redirect('/login');
  res.sendFile('public/santaProfile.html', { root: '.' });
});

friendsRouter.get('/api/friends', async (req, res) => {
  if (!req.user) return res.status(401).send({ error: 'User not logged in' });
  const result = await getFriends(req.query.groupId);
  res.send(result);
});

friendsRouter.get('/api/friends/:userId', async (req, res) => {
  if (!req.user) return res.status(401).send({ error: 'User not logged in' });
  const result = await getFriend(req.params.userId);
  res.send(result);
});

friendsRouter.post('/api/friends/:userId', async (req, res) => {
  if (!req.user) return res.status(401).send({ error: 'User not logged in' });
  const result = await updateFriend(req.body);
  if (result.modifiedCount) {
    res.send({ message: 'Profile update successfully' });
  } else {
    res.send({ error: true, message: 'Failed to update the profile' });
  }
});

export { friendsRouter };
