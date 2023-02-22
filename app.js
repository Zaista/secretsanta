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

const app = express();
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

if (process.env.NODE_ENV === 'production') {
  const projectId = 'deductive-span-313911';
  const client = new SecretManagerServiceClient();
  let [accessResponse] = await client.accessSecretVersion({
    name: `projects/${projectId}/secrets/secretsanta-mongodb-url/versions/latest`
  });
  process.env.mongodb_uri = accessResponse.payload.data.toString('utf8');

  [accessResponse] = await client.accessSecretVersion({
    name: `projects/${projectId}/secrets/sendgrid-api/versions/latest`
  });
  process.env.sendgrid_api = accessResponse.payload.data.toString('utf8');
} else {
  dotenv.config();
}

sgMail.setApiKey(process.env.sendgrid_api);

const { MongoClient } = mongodb;
const client = new MongoClient(process.env.mongodb_uri, {
  useUnifiedTopology: true
});

// Listen to the App Engine-specified port, or 8080 otherwise
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server app listening at http://localhost:${PORT}`);
});

app.get('/', (req, res) => {
  res.sendFile('public/secretSanta.html', { root: '.' });
});

app.get('/login', (req, res) => {
  res.sendFile('public/santaLogin.html', { root: '.' });
});

app.post('/api/login', async (req, res) => {
  const result = await loginPipeline.login(client, req.body.username, req.body.password);
  if (result.length === 0) {
    res.send({ error: 'Invalid username or password' });
  } else {
    // TODO handle login session
    res.send({ success: 'Logged in' });
  }
});

app.get('/logout', (req, res) => {
  // TODO do a logout
  res.redirect('login');
});

app.get('/api/santa', async (req, res) => {
  const result = await santaPipeline.getSanta(client, req.query.username, req.query.password);
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
      from: 'mail@jovanilic.com',
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
    from: 'mail@jovanilic.com',
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

app.get('/stats', async (req, res) => {
  res.sendFile('public/santaStats.html', { root: '.' });
});
