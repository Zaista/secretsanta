import nodemailer from 'nodemailer';
import { getLogger } from './logger.js';

const log = getLogger('mail');
let mailTransporter;

// SMTP relay (Brevo in production): smtp-relay.brevo.com on port 587 with STARTTLS
function getTransporter() {
  if (!mailTransporter) {
    mailTransporter = nodemailer.createTransport({
      host: process.env.smtpHost,
      port: 587,
      auth: {
        user: process.env.smtpUser,
        pass: process.env.smtpPass,
      },
    });
  }
  return mailTransporter;
}

export async function sendRealMail(emailTemplate) {
  return await getTransporter()
    .sendMail(emailTemplate)
    .then(() => {
      log.info(`Email with question sent to ${emailTemplate.to}`);
      return { success: true };
    })
    .catch((error) => {
      return { error };
    });
}
