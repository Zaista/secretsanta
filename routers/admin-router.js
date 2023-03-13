import express from 'express';

const adminRouter = express.Router();

// define the home page route
adminRouter.get('/admin', (req, res) => {
  if (!req.user) return res.status(401).redirect('/login');
  res.sendFile('public/santaAdmin.html', { root: '.' });
});

adminRouter.get('/api/admin', async(req, res) => {
  if (!req.user) return res.status(401).send({ error: 'User not logged in' });
  const result = await getChat();
  res.send(result);
});

adminRouter.post('/api/admin', async(req, res) => {

});

export { adminRouter };
