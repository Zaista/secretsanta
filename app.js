import express from 'express';
import './utils/environment.js';
import session from 'cookie-session';
import fs from 'fs';
import { ROLES } from './utils/roles.js';

// routers
import { santaRouter } from './routers/santa-router.js';
import { sessionRouter, passport } from './routers/session-router.js';
import { historyRouter } from './routers/history-router.js';
import { friendsRouter } from './routers/friends-router.js';
import { profileRouter } from './routers/profile-router.js';
import { chatRouter } from './routers/chat-router.js';
import { adminRouter } from './routers/admin-router.js';

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
app.engine('html', (filePath, options, callback) => {
  fs.readFile(filePath, (err, content) => {
    if (err) return callback(err);
    let rendered = content.toString();

    if (options.activeGroup === undefined || options.activeGroup.role !== ROLES.admin) {
      rendered = rendered.replace(/<!--adminStart-->(.|\n|\r)*<!--adminEnd-->/m, '');
    }

    if (filePath.includes('menu.html')) {
      options.groups.sort(
        (o1, o2) => (o1.name > o2.name) ? 1 : (o1.name < o2.name) ? -1 : 0
      );
      let groupOptions = '';
      options.groups.forEach(group => {
        groupOptions += `<li class="groupOp" value="${group._id}"><a class="dropdown-item" href="#">${group.name}</a></li>`;
      });
      rendered = rendered.replace('<!--groupOptions-->', groupOptions);

      if (options.activeGroup === undefined) { rendered = rendered.replace('<!--groupName-->', 'N/A'); } else { rendered = rendered.replace('<!--groupName-->', options.activeGroup.name); }
    }

    if (filePath.includes('santaProfile.html')) {
      rendered = rendered.replaceAll('{{isHidden}}', options.isCurrentUser ? '' : 'hidden');
      rendered = rendered.replace('{{isDisabled}}', options.isCurrentUser ? '' : 'disabled');
      rendered = rendered.replace('{{isPointer}}', options.isCurrentUser ? 'pointer' : '');
    }
    return callback(null, rendered);
  });
});
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
