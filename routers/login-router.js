import express from 'express';
import fs from 'fs';
import passport from 'passport';
import LocalStrategy from 'passport-local';
import { login, getById, checkEmail } from '../utils/loginPipeline.js';
import { getMail } from '../utils/mail.js';

const loginRouter = express.Router();

// define the home page route
loginRouter.get('/login', (req, res) => {
  if (req.user) return res.redirect('/');
  res.sendFile('public/santaLogin.html', { root: '.' });
});

loginRouter.post('/api/login', passport.authenticate('local'), async (req, res) => {
  console.log(`User ${req.user.email} logged in`);
  res.send({ success: 'Logged in' });
});

loginRouter.get('/logout', (req, res, next) => {
  if (req.user) {
    console.log(`User ${req.user.email} logged out`);
    req.logout(function(err) {
      if (err) { return next(err); }
      res.redirect('/login');
    });
  }
  res.redirect('/login');
});

loginRouter.post('/api/email', async (req, res) => {
  let message;
  let emailText;
  const error = false;
  const user = await checkEmail(req.body.email);

  if (user) {
    const data = fs.readFileSync('./templates/password.html');
    emailText = data.toString()
      .replace(/{{firstName}}/, user.firstName)
      .replace(/{{password}}/, user.password)
      .replace(/{{address}}/, user.address);
  } else {
    const data = fs.readFileSync('./templates/unknown.html');
    emailText = data.toString();
  }

  const email = {
    to: req.body.email,
    from: {
      email: 'mail@jovanilic.com',
      name: 'SecretSanta'
    },
    subject: 'Secret Santa Credentials',
    html: emailText
  };
  const mail = await getMail();
  mail.send(email).then(() => {
    console.log(`Email with credentials sent to ${req.body.email}`);
    message = 'Email sent';
  }).catch((error) => {
    console.error(error);
    message = 'There was an error sending the email. Contact the administrator.';
    error = true;
  });

  const output = { error, message };
  res.send(output);
});

passport.use(
  new LocalStrategy(async function(email, password, done) {
    const user = await login(email, password);
    if (user) {
      return done(null, user);
    } else {
      return done(null, false);
    }
  })
);

passport.serializeUser(function(user, done) {
  done(null, user._id);
});

passport.deserializeUser(async function(_id, done) {
  const user = await getById(_id);
  done(null, user);
});

export { loginRouter, passport };
