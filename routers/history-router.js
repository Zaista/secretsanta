import express from 'express';
import { getGiftsByYear, getYearsByGroup } from '../utils/historyPipeline.js';

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
    const gifts = await getGiftsByYear(req.session.activeGroup._id, req.query._id);
    res.send({ year: req.query.year, gifts });
  } else { return res.send({ year: req.query.year, gifts: [] }); } // TODO show that user is not part of any group
});

export { historyRouter };
