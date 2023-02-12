import express from 'express';
import dotenv from 'dotenv';
import mongodb from 'mongodb';
import {SecretManagerServiceClient} from '@google-cloud/secret-manager';
import loginPipeline from './utils/loginPipeline.js';
import santaPipeline from './utils/santaPipeline.js';
import historyPipeline from './utils/historyPipeline.js';
import friendsPipeline from './utils/friendsPipeline.js';
import chatPipeline from './utils/chatPipeline.js';

const app = express();
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({extended: true})); // for parsing application/x-www-form-urlencoded

if (process.env.NODE_ENV === 'production') {
  let projectId = 'deductive-span-313911';
  const client = new SecretManagerServiceClient();
  const [accessResponse] = await client.accessSecretVersion({
    name: `projects/${projectId}/secrets/secretsanta-mongodb-url/versions/latest`,
  });
  process.env.mongodb_uri = accessResponse.payload.data.toString('utf8');

  [accessResponse] = await client.accessSecretVersion({
    name: `projects/${projectId}/secrets/sendgrid-api/versions/latest`,
  });
  process.env.sendgrid_api = accessResponse.payload.data.toString('utf8');
} else {
  dotenv.config();
}

const {MongoClient} = mongodb;
const client = new MongoClient(process.env.mongodb_uri, {
    useUnifiedTopology: true,
});

// Listen to the App Engine-specified port, or 8080 otherwise
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server app listening at http://localhost:${PORT}`);
});

app.get('/', (req, res) => {
    res.sendFile('public/secretSanta.html', {root: '.'});
});

app.get('/login', (req, res) => {
    res.sendFile('public/santaLogin.html', {root: '.'});
});

app.get('/api/login', async (req, res) => {
    const result = await loginPipeline.login(client, req.query.username, req.query.password);
    if (result.length === 0) {
      res.send({error: 'Invalid username or password'});
    } else {
      // TODO handle login session
      res.send({success: 'Logged in'});
    }
});

app.get('/logout', (req, res) => {
    // TODO do a logout
    res.redirect('login');
});

app.get('/api/santa', async (req, res) => {
    const result = await santaPipeline.getSanta(client, req.query.username, req.query.password);
    if (result.length === 0) {
      res.send({error: 'Some error'}); // TODO
    } else {
      res.send(result);
    }
});

app.get('/history', (req, res) => {
    res.sendFile('public/santaHistory.html', {root: '.'});
});

app.get('/api/history', async (req, res) => {
    let result = await historyPipeline.getHistory(client);
    res.send(result);
});

app.get('/friends', async (req, res) => {
    res.sendFile('public/santaFriends.html', {root: '.'});
});

app.get('/api/friends', async (req, res) => {
    let result = await friendsPipeline.getFriends(client);
    res.send(result);
});

app.get('/chat', async (req, res) => {
    res.sendFile('public/santaChat.html', {root: '.'});
});

app.get('/api/chat', async (req, res) => {
    let result = await chatPipeline.getChat(client);
    res.send(result);
});

app.post('/api/chat', async (req, res) => {
    let userInfo = await chatPipeline.sendMessage(client, req.body.userId, req.body.message);
    
    let email_subject = 'A new question has been asked in Secret Santa chat!';
    
    let email_headers = 'From: secretsanta@jovanilic.com\r\n';
    email_headers += 'MIME-Version: 1.0\r\n';
    email_headers += 'Content-Type: text/html; charset=utf-8\r\n';
    
    let email_text = '<html><body>';
    email_text += '<p>Somebody asked you a question:</p>';
    email_text += `<p>${req.body.message}</p><br>`;
    email_text += '<p>Go to <a href="https://secretsanta.jovanilic.com/chat" target="_blank">SecretSanta</a> website and answer it!</p>';
    email_text += '<p>Merry shopping und Alles Gute zum Gechristmas :)</p>';
    email_text += '</body></html>';
    
    // TODO wrap body if lines are longer than 70 characters
    // email_text = wordwrap($email_text, 70);
    
    // TODO send email
    // mail($output->email, $email_subject, $email_text, $email_headers);
    
    let output = {};
    output.result = 'Message posted in chat and email sent to the selected person.';
    output.message = req.body.message;
    console.log(`info: email sent to ${userInfo.value.email}`);
    res.send(JSON.stringify(output));
});

app.get('/api/email', async (req, res) => {
  const sgMail = await import('@sendgrid/mail');
  sgMail.default.setApiKey(process.env.sendgrid_api);
  const msg = {
    to: 'ilicjovan89@gmail.com',
    from: 'mail@jovanilic.com',
    subject: 'Sending for Secret Santa',
    text: 'and easy to do anywhere, even with Node.js',
    html: '<strong>and easy to do anywhere, even with Node.js</strong>',
  }
  sgMail
    .default.send(msg)
    .then(() => {
      console.log('Email sent');
    })
    .catch((error) => {
      console.error(error)
    });
});

app.get('/stats', async (req, res) => {
    res.sendFile('public/santaStats.html', {root: '.'});
});