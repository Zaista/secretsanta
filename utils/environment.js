import dotenv from 'dotenv';
import { convert } from 'html-to-text';
import { sendRealMail } from './mail.js';
import { sendSandboxMail } from './mail-local.js';
import { getLogger } from './logger.js';

const log = getLogger('environment');

export async function loadEnvironment() {
  if (process.env.profile !== 'production') {
    log.debug('Environment variables loaded from the .env file');
    dotenv.config();
  }
}

export function sendEmail(emailTemplate) {
  const email = {
    from: process.env.smtpFrom || 'SecretSanta <secretsanta@jovanilic.com>',
    // plain-text alternative for text-only clients; HTML-only mail also scores worse with spam filters
    text: emailTemplate.html && toPlainText(emailTemplate.html),
    ...emailTemplate,
  };
  if (process.env.profile === 'production') {
    return sendRealMail(email);
  } else {
    return sendSandboxMail(email);
  }
}

function toPlainText(html) {
  return convert(html, {
    wordwrap: 72,
    selectors: [
      { selector: 'img', format: 'skip' },
      // emails lay out with tables; render each row as a line instead of one run-on paragraph
      { selector: 'table', format: 'block' },
      { selector: 'tr', format: 'block' },
      { selector: 'th', format: 'inline' },
      { selector: 'td', format: 'inline' },
    ],
  });
}
