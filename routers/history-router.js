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
  if (req.session.activeGroup !== undefined) {
    const history = await getHistory(req.session.activeGroup._id);
    res.send(history.filter(item => item.revealed));
  } else { return res.send([]); } // TODO show that user is not part of any group
});

export { historyRouter };
