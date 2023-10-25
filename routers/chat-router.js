import express from 'express';
import fs from 'fs';
import { getChat, sendMessage, deleteChatMessage } from '../utils/chatPipeline.js';
import { sendEmail } from '../utils/environment.js';
import { ROLES } from '../utils/roles.js';

const chatRouter = express.Router();

// define the home page route
chatRouter.get('/', (req, res) => {
  if (!req.user) return res.status(401).redirect('session/login');
  res.sendFile('public/chat/santaChat.html', { root: '.' });
});

chatRouter.get('/api/list', async (req, res) => {
  if (!req.user) return res.status(401).send({ error: 'User not logged in' });
  if (req.session.activeGroup !== undefined) {
    const result = await getChat(req.session.activeGroup._id);
    res.send(result);
  } else { return res.send([]); } // TODO show that user is not part of any group
});

// DELETE CHAT MESSAGE

chatRouter.post('/api/delete', async (req, res) => {
  if (!req.user) return res.status(401).send({ error: 'User not logged in' });
  if (req.session.activeGroup.role !== ROLES.admin) return res.send({ error: 'User not allowed to delete messages!' });
  const result = await deleteChatMessage(req.body._id);
  if (result.deletedCount === 1) return res.send({ success: 'The message was successfully deleted' });
  res.send({ error: 'Something went wrong' });
});

chatRouter.post('/api/send', async (req, res) => {
  if (!req.user) return res.status(401).send({ error: 'User not logged in' });
  let emailText;
  const queryInfo = await sendMessage(req.body.message, req.body.userId, req.session.activeGroup._id);
  if (queryInfo.acknowledged) { // TODO acknowledged does not mean updated
    const data = fs.readFileSync('./templates/question.html');
    emailText = data.toString().replace(/{{question}}/, req.body.message);

    // TODO wrap body if lines are longer than 70 characters
    // email_text = wordwrap($email_text, 70);

    const emailTemplate = {
      from: 'SecretSanta <secretsanta@jovanilic.com>',
      to: req.body.email,
      subject: 'Secret Santa Question',
      html: emailText
    };

    const emailStatus = await sendEmail(emailTemplate);

    if (emailStatus.success) {
      res.send({ success: `Message posted in chat and email sent to ${emailTemplate.to}` });
    } else {
      res.send({ error: `Error sending email: ${emailStatus.error}` });
    }
  } else {
    res.send({ error: 'Failed to ask the question. Contact the administrator' });
  }
});

export { chatRouter };
