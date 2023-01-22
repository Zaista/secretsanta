import express from 'express';
import dotenv from 'dotenv';
import mongodb from 'mongodb';
import historyPipeline from './utils/historyPipeline.js';
import friendsPipeline from './utils/friendsPipeline.js';
import chatPipeline from './utils/chatPipeline.js';

const app = express();
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({extended: true})); // for parsing application/x-www-form-urlencoded

dotenv.config();
console.log(process.env.mongodb_uri);

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
    email_text += '<p>Go to <a href="https://secretsanta.jovanilic.com/santachat.html" target="_blank">SecretSanta</a> website and answer it!</p>';
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

app.get('/stats', async (req, res) => {
    res.sendFile('public/santaStats.html', {root: '.'});
});