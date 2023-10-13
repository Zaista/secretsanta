import express from 'express';
import { getFriends, getFriend, updateFriend } from '../utils/friendsPipeline.js';

const friendsRouter = express.Router();

// define the home page route
friendsRouter.get('/friends', async (req, res) => {
  if (!req.user) return res.status(401).redirect('/login');
  res.sendFile('public/santaFriends.html', { root: '.' });
});

friendsRouter.get('/friends/:_id', async (req, res) => {
  if (!req.user) return res.status(401).redirect('/login');
  res.render('santaProfile.html', { currentUser: req.user._id.toString() === req.params._id });
});

friendsRouter.get('/api/friends', async (req, res) => {
  if (!req.user) return res.status(401).send({ error: 'User not logged in' });
  if (req.session.activeGroup !== undefined) {
    const result = await getFriends(req.session.activeGroup._id);
    res.send(result);
  } else { return res.send([]); } // TODO show that user is not part of any group
});

friendsRouter.get('/api/friends/:_id', async (req, res) => {
  if (!req.user) return res.status(401).send({ error: 'User not logged in' });
  const result = await getFriend(req.params._id);
  res.send(result);
});

friendsRouter.post('/api/friends/:_id', async (req, res) => {
  if (!req.user) return res.status(401).send({ error: 'User not logged in' });
  const result = await updateFriend(req.body);
  if (result.modifiedCount) {
    res.send({ success: 'Profile update successfully' });
  } else {
    res.send({ error: 'Failed to update the profile' });
  }
});

export { friendsRouter };
