import express from 'express';
import dotenv from 'dotenv';
import mongodb from 'mongodb';
import fs from 'fs';
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';
import sgMail from '@sendgrid/mail';
import loginPipeline from './utils/loginPipeline.js';
import santaPipeline from './utils/santaPipeline.js';
import historyPipeline from './utils/historyPipeline.js';
import friendsPipeline from './utils/friendsPipeline.js';
import chatPipeline from './utils/chatPipeline.js';
import passport from 'passport';
import LocalStrategy from 'passport-local';
import session from 'cookie-session';

const app = express();
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

if (process.env.NODE_ENV === 'production') {
  const projectId = 'deductive-span-313911';
  const client = new SecretManagerServiceClient();

  const [mongodbUri, sendgridApi, sessionKey] = await Promise.all([
    client.accessSecretVersion({
      name: `projects/${projectId}/secrets/secretsanta-mongodb-url/versions/latest`
    }),
    client.accessSecretVersion({
      name: `projects/${projectId}/secrets/sendgrid-api/versions/latest`
    }),
    client.accessSecretVersion({
      name: `projects/${projectId}/secrets/session-cookie-key/versions/latest`,
    })
  ]);

  process.env.mongodbUri = mongodbUri.payload.data.toString();
  process.env.sendgridApi = sendgridApi.payload.data.toString();
  process.env.sessionKey = sessionKey.payload.data.toString();
} else {
  dotenv.config();
}

app.use(
  session({
    secret: process.env.sessionKey,
    resave: false,
    saveUninitialized: false,
  })
);

sgMail.setApiKey(process.env.sendgridApi);

const { MongoClient } = mongodb;
const client = new MongoClient(process.env.mongodbUri, {
  useUnifiedTopology: true
});

passport.use(
  new LocalStrategy(async function (username, password, done) {
    const user = await loginPipeline.login(client, username, password);
    if (user) {
      return done(null, user);
    } else {
      return done(null, false);
    }
  })
);

passport.serializeUser(function (user, done) {
  done(null, user._id);
});

passport.deserializeUser(async function (_id, done) {
  console.log('deserializing');
  const user = await loginPipeline.getById(client, _id);
  done(null, user);
});

app.use(passport.initialize());
app.use(passport.session());

// Listen to the App Engine-specified port, or 8080 otherwise
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server app listening at http://localhost:${PORT}`);
});

app.get('/', (req, res) => {
  if (!req.user) return res.status(401).redirect('/login');
  res.sendFile('public/secretSanta.html', { root: '.' });
});

app.get('/login', (req, res) => {
  if (req.user) return res.redirect('/');
  res.sendFile('public/santaLogin.html', { root: '.' });
});

app.post('/api/login', passport.authenticate('local'), async (req, res) => {
    res.send({ success: 'Logged in' });
});

app.get('/logout', (req, res) => {
  if (req.user) {
    console.log(`User ${req.user.firstName} logged out`);
    req.logout(function(err) {
      if (err) { return next(err); }
      res.redirect('/login');
    });
  }
  res.redirect('/login');
});

app.get('/api/santa', async (req, res) => {
  if (!req.user) return res.status(401).redirect('/login');
  const result = await santaPipeline.getSanta(client, req.user.firstName);
  if (result.length === 0) {
    res.send({ error: 'Some error' }); // TODO
  } else {
    res.send(result);
  }
});

app.get('/history', (req, res) => {
  res.sendFile('public/santaHistory.html', { root: '.' });
});

app.get('/api/history', async (req, res) => {
  const result = await historyPipeline.getHistory(client);
  res.send(result);
});

app.get('/friends', async (req, res) => {
  res.sendFile('public/santaFriends.html', { root: '.' });
});

app.get('/api/friends', async (req, res) => {
  const result = await friendsPipeline.getFriends(client);
  res.send(result);
});

app.get('/chat', async (req, res) => {
  res.sendFile('public/santaChat.html', { root: '.' });
});

app.get('/api/chat', async (req, res) => {
  const result = await chatPipeline.getChat(client);
  res.send(result);
});

app.post('/api/chat', async (req, res) => {
  let message;
  let emailText;
  let error = false;
  const queryInfo = await chatPipeline.sendMessage(client, req.body.email, req.body.message);
  if (queryInfo.ok !== 1) {
    message = 'Failed to ask the question. Contact the administrator.';
    error = true;
  } else {
    const data = fs.readFileSync('templates/question.html');
    emailText = data.toString().replace(/{{question}}/, req.body.message);

    // TODO wrap body if lines are longer than 70 characters
    // email_text = wordwrap($email_text, 70);

    const email = {
      to: req.body.email,
      from: {
        email: 'mail@jovanilic.com',
        name: 'SecretSanta'
      },
      subject: 'Secret Santa Question',
      html: emailText
    };
    sgMail.send(email).then(() => {
      console.log(`Email with question sent to ${req.body.email}`);
      message = 'Message posted in chat and email sent to the selected person.';
    }).catch((error) => {
      console.error(error);
      message = 'There was an error sending the email. Contact the administrator.';
      error = true;
    });
  }
  const output = { error, message };
  res.send(JSON.stringify(output));
});

app.post('/api/email', async (req, res) => {
  let message;
  let emailText;
  const error = false;
  const user = await loginPipeline.checkEmail(client, req.body.email);

  if (user) {
    const data = fs.readFileSync('templates/password.html');
    emailText = data.toString()
      .replace(/{{firstName}}/, user.firstName)
      .replace(/{{password}}/, user.password)
      .replace(/{{address}}/, user.address);
  } else {
    const data = fs.readFileSync('templates/unknown.html');
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
  sgMail.send(email).then(() => {
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
