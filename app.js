import express from 'express';
import './utils/environment.js';
import session from 'cookie-session';
import fs from 'fs';

// routers
import { loginRouter, passport } from './routers/login-router.js';
import { santaRouter } from './routers/santa-router.js';
import { historyRouter } from './routers/history-router.js';
import { friendsRouter } from './routers/friends-router.js';
import { chatRouter } from './routers/chat-router.js';
import { adminRouter } from './routers/admin-router.js';

const app = express();
app.use(express.static('./public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.use(
  session({
    secret: process.env.sessionKey,
    resave: false,
    saveUninitialized: false
  })
);

app.use(passport.initialize());
app.use(passport.session());

// template engine
app.engine('html', (filePath, options, callback) => {
  fs.readFile(filePath, (err, content) => {
    if (err) return callback(err);
    let rendered = content.toString();
    if (!options.isAdmin) {
      rendered = rendered.replace(/<!--adminStart-->(.|\n|\r)*<!--adminEnd-->/m, '');
    }

    if (options.groups) {
      let groupOptions = '';
      options.groups.forEach(group => {
        groupOptions += `<option value="${group._id}">${group.name}</option>`;
      });
      rendered = rendered.replace('<!--groupOptions-->', groupOptions);
    }
    return callback(null, rendered);
  });
});
app.set('views', './views');
app.set('view engine', 'html');

// page routers
app.use('/', loginRouter);
app.use('/', santaRouter);
app.use('/', historyRouter);
app.use('/', friendsRouter);
app.use('/', chatRouter);
app.use('/', adminRouter);

// view routers
app.use('/views/menu', (req, res) => {
  const options = {
    isAdmin: false,
    groups: req.user.groups
  };
  if (!req.user) return res.status(401).send({ error: 'User not logged in' });
  else if (req.user.role === 'admin') options.isAdmin = true;
  res.render('menu.html', options);
});

// Listen to the App Engine-specified port, or 8080 otherwise
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server app listening at http://localhost:${PORT}`);
});
