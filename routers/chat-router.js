import express from 'express';
import fs from 'fs';
import { getChat, sendMessage } from '../utils/chatPipeline.js';
import { getMail } from '../utils/mail.js';

const chatRouter = express.Router();

// define the home page route
chatRouter.get('/chat', (req, res) => {
  if (!req.user) return res.status(401).redirect('/login');
  res.sendFile('public/santaChat.html', { root: '.' });
});

chatRouter.get('/api/chat', async (req, res) => {
  if (!req.user) return res.status(401).send({ error: 'User not logged in' });
  const result = await getChat();
  res.send(result);
});

chatRouter.post('/api/chat', async (req, res) => {
  if (!req.user) return res.status(401).send({ error: 'User not logged in' });
  let emailText;
  const queryInfo = await sendMessage(req.body.message, req.body.userId);
  if (queryInfo.acknowledged) { // TODO acknowledged does not mean updated
    const data = fs.readFileSync('./templates/question.html');
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
    const mail = await getMail();
    mail.send(email).then(() => {
      console.log(`Email with question sent to ${req.body.email}`);
      res.send({ error: false, message: 'Message posted in chat and email sent to the selected person' });
    }).catch((error) => {
      console.error(error);
      res.send({ error: true, message: 'There was an error sending the email. Contact the administrator' });
    });
  } else {
    res.send({ error: true, message: 'Failed to ask the question. Contact the administrator' });
  }
});

export { chatRouter };
