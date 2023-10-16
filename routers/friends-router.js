import express from 'express';
import { getFriends, getProfile, updateProfile, updateProfileImage } from '../utils/friendsPipeline.js';
import { uploadProfileImage, getProfileImage } from "../utils/minio.js";

const friendsRouter = express.Router();

// define the home page route
friendsRouter.get('/friends', async (req, res) => {
  if (!req.user) return res.status(401).redirect('/login');
  res.sendFile('public/santaFriends.html', { root: '.' });
});

friendsRouter.get('/profile', async (req, res) => {
  if (!req.user) return res.status(401).redirect('/login');
  let isCurrentUser = false;
  if (req.query._id === undefined || req.user._id.toString() === req.query._id)
    isCurrentUser = true
  res.render('santaProfile.html', { isCurrentUser });
});

friendsRouter.get('/api/friends', async (req, res) => {
  if (!req.user) return res.status(401).send({ error: 'User not logged in' });
  if (req.session.activeGroup !== undefined) {
    const result = await getFriends(req.session.activeGroup._id);
    res.send(result);
  } else { return res.send([]); } // TODO show that user is not part of any group
});

friendsRouter.get('/api/profile', async (req, res) => {
  if (!req.user) return res.status(401).send({ error: 'User not logged in' });
  let userId = req.user._id;
  if (req.query._id !== 'null')
    userId = req.query._id;
  const friend = await getProfile(userId);
  if (friend === null)
    res.send({error: 'Profile not found'});
  else
    res.send(friend);
});

friendsRouter.post('/api/profile', async (req, res) => {
  if (!req.user) return res.status(401).send({ error: 'User not logged in' });
  const result = await updateProfile(req.user._id, req.body);
  if (result.modifiedCount) {
    res.send({ success: 'Profile updated successfully' });
  } else {
    res.send({ error: 'Failed to update the profile' });
  }
});

friendsRouter.get('/api/profile/image', async (req, res) => {
  if (!req.user) return res.status(401).send({ error: 'User not logged in' });
  try {
    const objectStream = await getProfileImage(req.query._id);
    res.setHeader('Content-Type', 'image/jpeg');
    objectStream.pipe(res);
  } catch (e) {
    console.log('ERROR: ' + e.message);
    res.sendFile('public/resources/images/placeholder.png', { root: '.' });
  }
});

friendsRouter.post('/api/profile/image', async (req, res) => {
  if (!req.user) return res.status(401).send({ error: 'User not logged in' });
  let bitmap = new Buffer(req.body.image.replace(/^data:image\/\w+;base64,/, ''), 'base64');
  try {
    const result = await uploadProfileImage(req.user._id, bitmap);
    await updateProfileImage(req.user._id);
    res.send({ success: 'Profile image updated successfully' });
  } catch (e) {
    console.log('ERROR: ' + e.message);
    res.send({ error: 'Failed to update the profile image' });
  }
});

export { friendsRouter };
