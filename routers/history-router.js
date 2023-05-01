import express from 'express';
import { getHistory } from '../utils/historyPipeline.js';

const historyRouter = express.Router();

// define the home page route
historyRouter.get('/history', (req, res) => {
  if (!req.user) return res.status(401).redirect('/login');
  res.sendFile('public/santaHistory.html', { root: '.' });
});

historyRouter.get('/api/history', async (req, res) => {
  if (!req.user) return res.status(401).send({ error: 'User not logged in' });
  const history = await getHistory(req.query.groupId);
  if (!history[0]?.revealed) {
    history.splice(0, 1);
  }
  res.send(history);
});

export { historyRouter };
