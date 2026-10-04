import nodemailer from 'nodemailer';
import { getLogger } from './logger.js';

const log = getLogger('mail');
let mailTransporter;

// Any SMTP server (Brevo's smtp-relay.brevo.com in production). Port 587 upgrades
// to TLS with STARTTLS; set smtpSecure=true for implicit TLS, usually on port 465
function getTransporter() {
  if (!mailTransporter) {
    mailTransporter = nodemailer.createTransport({
      host: process.env.smtpHost,
      port: Number(process.env.smtpPort) || 587,
      secure: process.env.smtpSecure === 'true',
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
