import nodemailer from 'nodemailer';
import { getLogger } from './logger.js';

const log = getLogger('mailLocal');
let mailTransporter;

// Generate SMTP service account from ethereal.email
await nodemailer.createTestAccount((err, account) => {
  if (err) {
    log.error('Failed to create a testing account. ' + err.message);
  }

  mailTransporter = nodemailer.createTransport({
    host: account.smtp.host,
    port: account.smtp.port,
    secure: account.smtp.secure,
    auth: {
      user: account.user,
      pass: account.pass,
    },
  });

  log.debug('Configured test email account.');
});

export async function sendSandboxMail(emailTemplate) {
  return new Promise((resolve, reject) => {
    mailTransporter.sendMail(emailTemplate, (error, info) => {
      if (error) {
        reject(error);
      }

      log.debug('Message sent: %s', info.messageId);
      log.debug('Preview URL: %s', nodemailer.getTestMessageUrl(info));
      resolve({
        success: true,
        emailUrl: nodemailer.getTestMessageUrl(info),
      });
    });
  });
}
