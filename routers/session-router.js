import express from 'express';
import fs from 'fs';
import passport from 'passport';
import LocalStrategy from 'passport-local';
import { getUserByEmailAndPassword, getUserById, checkEmail } from '../utils/loginPipeline.js';
import { sendEmail } from '../utils/environment.js';

const sessionRouter = express.Router();

// define the home page route
sessionRouter.get('/login', (req, res) => {
  if (req.user) return res.redirect('/');
  res.sendFile('public/login/santaLogin.html', { root: '.' });
});

sessionRouter.post('/api/login', passport.authenticate('local'), async (req, res) => {
  console.log(`User ${req.user.email} logged in`);
  req.session.activeGroup = req.user.groups[0];
  res.send({ success: 'Logged in' });
});

sessionRouter.get('/logout', (req, res, next) => {
  if (req.user) {
    console.log(`User ${req.user.email} logged out`);
    req.logout(function(err) {
      if (err) { return next(err); }
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
    const data = fs.readFileSync('./templates/password.html');
    emailText = data.toString()
      .replace(/{{name}}/, user.name)
      .replace(/{{password}}/, user.password);
  } else {
    const data = fs.readFileSync('./templates/unknown.html');
    emailText = data.toString();
  }

  const emailTemplate = {
    from: 'SecretSanta <secretsanta@jovanilic.com>',
    to: req.body.email,
    subject: 'Secret Santa Credentials',
    html: emailText
  };

  const emailStatus = await sendEmail(emailTemplate);

  if (emailStatus.success) {
    res.send({ success: `Email successfully sent to ${emailTemplate.to}` });
  } else {
    res.send({ error: `Error sending email: ${emailStatus.error}` });
  }
});

passport.use(
  new LocalStrategy(async function(email, password, done) {
    const user = await getUserByEmailAndPassword(email, password);
    if (user) {
      return done(null, user[0]);
    } else {
      return done(null, false);
    }
  })
);

passport.serializeUser(function(user, done) {
  done(null, user._id);
});

passport.deserializeUser(async function(_id, done) {
  const user = await getUserById(_id);
  if (user.length === 0) {
    done(null, null, { error: 'User not found' });
  } else {
    done(null, user[0]);
  }
});

export { sessionRouter, passport };
