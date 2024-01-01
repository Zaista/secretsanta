import express from 'express';
import { loadEnvironment } from './utils/environment.js';
import session from 'cookie-session';
import { renderer } from './utils/renderer.js';

// routers
import { santaRouter } from './routers/santa-router.js';
import { sessionRouter, passport } from './routers/session-router.js';
import { historyRouter } from './routers/history-router.js';
import { friendsRouter } from './routers/friends-router.js';
import { profileRouter } from './routers/profile-router.js';
import { chatRouter } from './routers/chat-router.js';
import { adminRouter } from './routers/admin-router.js';

await loadEnvironment();

const app = express();
app.use(express.static('./public', { redirect: false }));
app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: '20mb' })); // for parsing application/x-www-form-urlencoded

app.use(
  session({
    secret: process.env.sessionKey,
    resave: false,
    saveUninitialized: false
  })
);

app.use(passport.initialize());
app.use(passport.session());

// register regenerate & save until passport v0.6 is fixed
app.use(function(request, response, next) {
  if (request.session && !request.session.regenerate) {
    request.session.regenerate = (cb) => {
      cb();
    };
  }
  if (request.session && !request.session.save) {
    request.session.save = (cb) => {
      cb();
    };
  }
  next();
});

// template engine
app.engine('html', renderer);
app.set('views', './public');
app.set('view engine', 'html');

// page routers
app.use('/', santaRouter);
app.use('/session', sessionRouter);
app.use('/history', historyRouter);
app.use('/friends', friendsRouter);
app.use('/profile', profileRouter);
app.use('/chat', chatRouter);
app.use('/admin', adminRouter);

// view routers
app.use('/modules/menu', (req, res) => {
  if (!req.user) return res.status(401).send({ error: 'User not logged in' });
  const options = {
    groups: req.user.groups,
    activeGroup: req.session.activeGroup
  };
  res.render('modules/menu.html', options);
});

app.use('/modules/footer', (req, res) => {
  res.render('modules/footer.html');
});

app.use('/api/setActiveGroup', (req, res) => {
  req.session.activeGroup = req.user.groups.filter(group => group._id.toString() === req.query.groupId)[0];
  res.send({ success: 'Group changed' });
});

app.use(function(req, res) {
  res.status(404).sendFile('public/not-found/santa404.html', { root: '.' });
});

// Listen to the App Engine-specified port, or 8080 otherwise
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server app listening at http://localhost:${PORT}`);
});
