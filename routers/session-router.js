import express from 'express';
import fs from 'fs';
import passport from 'passport';
import LocalStrategy from 'passport-local';
import { serialize, deserialize } from 'bson';
import { getLogger } from '../utils/logger.js';
import {
  getUserByEmailAndPassword,
  getUserById,
  checkEmail,
} from '../utils/loginPipeline.js';
import { sendEmail } from '../utils/environment.js';
import { checkIfUserExists, createNewUser } from '../utils/adminPipeline.js';

const sessionRouter = express.Router();
const log = getLogger('session');

sessionRouter.get('/login', (req, res) => {
  if (req.user) return res.redirect('/');
  res.sendFile('public/login/santaLogin.html', { root: '.' });
});

sessionRouter.get('/register', (req, res) => {
  if (req.user) return res.redirect('/');
  res.sendFile('public/register/santaRegister.html', { root: '.' });
});

sessionRouter.post(
  '/api/login',
  passport.authenticate('local'),
  async (req, res) => {
    log.info(`User logged in:  ${req.user.email}`);
    req.session.activeGroup = req.user.groups[0];
    res.send({ success: 'Logged in' });
  }
);

sessionRouter.post('/api/register', async (req, res) => {
  const user = await checkIfUserExists(req.body.email);
  if (user) {
    return res.send({ error: 'Email already used' });
  }
  const result = await createNewUser(req.body);
  if (result !== null && result.insertedId) {
    log.info(`User registered: ${req.body.email}`);
    const temp = {
      _id: req.body._id,
      email: req.body.email,
      name: req.body.name,
    };
    req.login(temp, function (err) {
      if (!err) {
        return res.send({ success: 'User registered', id: temp._id });
      } else {
        return res.send({ error: 'Error during registration 2' });
      }
    });
  } else {
    res.send({ error: 'Error during registration' });
  }
});

sessionRouter.get('/logout', (req, res, next) => {
  if (req.session.activeGroup !== undefined) {
    delete req.session.activeGroup;
  }
  if (req.user) {
    log.info(`User logged out:  ${req.user.email}`);
    req.logout(function (err) {
      if (err) {
        return next(err);
      }
      return res.redirect('login');
    });
  } else {
    res.redirect('login');
  }
});

sessionRouter.post('/api/email', async (req, res) => {
  let emailText;
  const user = await checkEmail(req.body.email);

  if (user) {
    const data = fs.readFileSync('./templates/forgot-password-email.html');
    emailText = data
      .toString()
      .replace(/{{email}}/, user.email)
      .replace(/{{password}}/, user.password);
  } else {
    const data = fs.readFileSync('./templates/unknown-user-email.html');
    emailText = data.toString();
  }

  const emailTemplate = {
    from: 'SecretSanta <secretsanta@jovanilic.com>',
    to: req.body.email,
    subject: 'Secret Santa Credentials',
    html: emailText,
  };

  const emailStatus = await sendEmail(emailTemplate);

  if (emailStatus.success !== true) {
    return res.send({ error: `Error sending email: ${emailStatus.error}` });
  }
  return res.send({
    success: `Email successfully sent to ${emailTemplate.to}`,
    emailUrl: emailStatus.emailUrl,
  });
});

passport.use(
  new LocalStrategy(async function (email, password, done) {
    const user = await getUserByEmailAndPassword(email, password);
    if (user) {
      return done(null, user[0]);
    } else {
      return done(null, false);
    }
  })
);

passport.serializeUser(function (user, done) {
  const serializedUser = serialize(user);
  done(null, serializedUser);
});

passport.deserializeUser(async function (req, serializedUser, done) {
  const deserializedUser = deserialize(Buffer.from(serializedUser));
  const user = await getUserById(deserializedUser._id);
  if (user === null || user.length === 0) {
    done(null, null, { error: 'User not found' });
  } else {
    req.session.activeGroup = user[0].groups[0];
    done(null, user[0]);
  }
});

export { sessionRouter, passport };
