import dotenv from 'dotenv';
import { sendRealMail } from './mail.js';
import { sendSandboxMail } from './mail-local.js';

export async function loadEnvironment() {
  if (process.env.profile !== 'production') {
    console.log('Environment variables loaded from the .env file');
    dotenv.config();
  }
}

export function sendEmail(emailTemplate) {
  if (process.env.profile === 'production') {
    return sendRealMail(emailTemplate);
  } else {
    return sendSandboxMail(emailTemplate);
  }
}
