import { SecretManagerServiceClient } from '@google-cloud/secret-manager';
import dotenv from 'dotenv';
import { sendRealMail } from './mail.js';
import { sendSandboxMail } from './mail-local.js';

if (process.env.NODE_ENV === 'production') {
  console.log('Environment variables loaded from the secret manager');
  const projectId = 'deductive-span-313911';
  const secretManager = new SecretManagerServiceClient();

  const [mongodbUri, sendgridApi, sessionKey] = await Promise.all([
    secretManager.accessSecretVersion({
      name: `projects/${projectId}/secrets/secretsanta-mongodb-url/versions/latest`
    }),
    secretManager.accessSecretVersion({
      name: `projects/${projectId}/secrets/sendgrid-api/versions/latest`
    }),
    secretManager.accessSecretVersion({
      name: `projects/${projectId}/secrets/session-cookie-key/versions/latest`
    })
  ]);

  process.env.mongodbUri = mongodbUri[0].payload.data.toString();
  process.env.sendgridApi = sendgridApi[0].payload.data.toString();
  process.env.sessionKey = sessionKey[0].payload.data.toString();
} else {
  console.log('Environment variables loaded from the .env file');
  dotenv.config();
}

export function sendEmail(emailTemplate) {
  if (process.env.NODE_ENV === 'production') {
    return sendRealMail(emailTemplate);
  } else {
    return sendSandboxMail(emailTemplate);
  }
}
