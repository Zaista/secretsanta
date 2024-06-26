import express from 'express';
import {
  getProfile,
  updateProfile,
  updateProfileImage,
} from '../utils/friendsPipeline.js';
import { uploadImageToMinio, getImageFromMinio } from '../utils/minio.js';

const profileRouter = express.Router();

// define the home page route
profileRouter.get('/', async (req, res) => {
  if (!req.user) return res.status(401).redirect('session/login');
  let isCurrentUser = false;
  if (req.query.id === undefined || req.user._id.toString() === req.query.id) {
    isCurrentUser = true;
  }
  res.render('profile/santaProfile.html', { isCurrentUser });
});

profileRouter.get('/api/list', async (req, res) => {
  if (!req.user) return res.status(401).send({ error: 'User not logged in' });
  let userId = req.user._id;
  if (req.query.id !== 'null') {
    userId = req.query.id;
  }
  const friend = await getProfile(userId);
  if (friend === null) {
    res.send({ error: 'Profile not found' });
  } else {
    res.send(friend);
  }
});

profileRouter.post('/api/update', async (req, res) => {
  if (!req.user) return res.status(401).send({ error: 'User not logged in' });
  let userId = req.user._id;
  if (req.query.id) {
    userId = req.query.id;
  }
  const result = await updateProfile(userId, req.body);
  if (result.modifiedCount) {
    res.send({ success: 'Profile updated successfully' });
  } else {
    res.send({ error: 'Failed to update the profile' });
  }
});

profileRouter.get('/api/image', async (req, res) => {
  if (!req.user) return res.status(401).send({ error: 'User not logged in' });
  try {
    const objectStream = await getImageFromMinio(req.query.id);
    res.setHeader('Content-Type', 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
    objectStream.pipe(res);
  } catch (e) {
    console.log('ERROR: ' + e.message);
    res.sendFile('public/resources/images/placeholder.png', { root: '.' });
  }
});

profileRouter.post('/api/image', async (req, res) => {
  if (!req.user) return res.status(401).send({ error: 'User not logged in' });
  const bitmap = Buffer.from(
    req.body.image.replace(/^data:image\/\w+;base64,/, ''),
    'base64'
  );
  try {
    let userId = req.user._id;
    if (req.query.id) {
      userId = req.query.id;
    }
    await uploadImageToMinio(userId, bitmap);
    await updateProfileImage(userId);
    res.send({ success: 'Profile image updated successfully' });
  } catch (e) {
    console.log('ERROR: ' + e.message);
    res.send({ error: 'Failed to update the profile image' });
  }
});

export { profileRouter };
