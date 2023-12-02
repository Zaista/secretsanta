import express from 'express';
import {getGiftsByYear, getYearsByGroup, updateLocationImage} from '../utils/historyPipeline.js';
import {getLocationImageFromMinio, uploadLocationImageToMinio} from "../utils/minio.js";

const historyRouter = express.Router();

/* HISTORY ROUTER */
historyRouter.get('/', (req, res) => {
  if (!req.user) return res.status(401).redirect('session/login');
  res.sendFile('public/history/santaHistory.html', { root: '.' });
});

historyRouter.get('/api/list', async (req, res) => {
  if (!req.user) return res.status(401).send({ error: 'User not logged in' });
  if (req.session.activeGroup !== undefined) {
    const history = await getYearsByGroup(req.session.activeGroup._id);
    res.send(history.filter(item => item.revealed));
  } else { return res.send([]); } // TODO show that user is not part of any group
});

/* YEAR ROUTER */
historyRouter.get('/year', (req, res) => {
  if (!req.user) return res.status(401).redirect('session/login');
  res.sendFile('public/history/year/santaYear.html', { root: '.' });
});

historyRouter.get('/year/api/gifts', async (req, res) => {
  if (!req.user) return res.status(401).send({ error: 'User not logged in' });
  if (req.session.activeGroup !== undefined) {
    const yearGifts = await getGiftsByYear(req.session.activeGroup._id, req.query.id);
    res.send(yearGifts[0]);
  } else { return res.send({ year: req.query.year, gifts: [] }); } // TODO show that user is not part of any group
});

historyRouter.get('/year/api/location-image', async (req, res) => {
  if (!req.user) return res.status(401).send({ error: 'User not logged in' });
  try {
    const objectStream = await getLocationImageFromMinio(req.query.id);
    res.setHeader('Content-Type', 'image/jpeg');
    objectStream.pipe(res);
  } catch (e) {
    console.log('ERROR: ' + e.message);
    res.sendFile('public/resources/images/placeholder.png', { root: '.' });
  }
});

historyRouter.post('/year/api/location-image', async (req, res) => {
  if (!req.user) return res.status(401).send({ error: 'User not logged in' });
  const bitmap = Buffer.from(req.body.image.replace(/^data:image\/\w+;base64,/, ''), 'base64');
  try {
    await uploadLocationImageToMinio(req.query.id, bitmap);
    await updateLocationImage(req.query.id);
    res.send({ success: 'Year location image uploaded successfully' });
  } catch (e) {
    console.log('ERROR: ' + e.message);
    res.send({ error: 'Failed to upload the year location image' });
  }
});

export { historyRouter };
