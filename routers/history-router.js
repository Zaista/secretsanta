import express from 'express';
import { getHistory } from '../utils/historyPipeline.js';

const historyRouter = express.Router();

// define the home page route
historyRouter.get('/history', (req, res) => {
  res.sendFile('public/santaHistory.html', { root: '.' });
});

historyRouter.get('/api/history', async (req, res) => {
  const result = await getHistory();
  res.send(result);
});

export { historyRouter };