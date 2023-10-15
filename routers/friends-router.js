import express from 'express';
import { getFriends, getFriend, updateFriend } from '../utils/friendsPipeline.js';
import { uploadProfileImage, getProfileImage } from "../utils/minio.js";

const friendsRouter = express.Router();

// define the home page route
friendsRouter.get('/friends', async (req, res) => {
  if (!req.user) return res.status(401).redirect('/login');
  res.sendFile('public/santaFriends.html', { root: '.' });
});

friendsRouter.get('/friends/friend', async (req, res) => {
  if (!req.user) return res.status(401).redirect('/login');
  res.render('santaProfile.html', { currentUser: req.user._id.toString() === req.query._id });
});

friendsRouter.get('/api/friends', async (req, res) => {
  if (!req.user) return res.status(401).send({ error: 'User not logged in' });
  if (req.session.activeGroup !== undefined) {
    const result = await getFriends(req.session.activeGroup._id);
    res.send(result);
  } else { return res.send([]); } // TODO show that user is not part of any group
});

friendsRouter.get('/api/friends/friend', async (req, res) => {
  if (!req.user) return res.status(401).send({ error: 'User not logged in' });
  const friend = await getFriend(req.query._id);
  res.send(friend);
});

friendsRouter.post('/api/friends/friend', async (req, res) => {
  if (!req.user) return res.status(401).send({ error: 'User not logged in' });
  const result = await updateFriend(req.body);
  if (result.modifiedCount) {
    res.send({ success: 'Profile updated successfully' });
  } else {
    res.send({ error: 'Failed to update the profile' });
  }
});

friendsRouter.get('/api/friends/friend/image', async (req, res) => {
  if (!req.user) return res.status(401).send({ error: 'User not logged in' });
  try {
    const objectStream = await getProfileImage(req.query._id);
    res.setHeader('Content-Type', 'image/jpeg');
    objectStream.pipe(res);
  } catch (e) {
    res.sendFile('public/resources/images/placeholder.png', { root: '.' });
  }
});

friendsRouter.post('/api/profile/image', async (req, res) => {
  if (!req.user) return res.status(401).send({ error: 'User not logged in' });
  let bitmap = new Buffer(req.body.image.replace(/^data:image\/\w+;base64,/, ''), 'base64');
  const result = await uploadProfileImage(req.user._id, bitmap);
  if (result.etag) {
    res.send({ success: 'Profile image updated successfully' });
  } else {
    res.send({ error: 'Failed to update the profile image' });
  }
});

export { friendsRouter };
