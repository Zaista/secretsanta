import { SecretManagerServiceClient } from '@google-cloud/secret-manager';
import dotenv from 'dotenv';

export async function loadEnv() {
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
        name: `projects/${projectId}/secrets/session-cookie-key/versions/latest`,
      })
    ]);

    process.env.mongodbUri = mongodbUri.payload.data.toString();
    process.env.sendgridApi = sendgridApi.payload.data.toString();
    process.env.sessionKey = sessionKey.payload.data.toString();
    console.log('Mongodb: ' + process.env.mongodbUri);
  } else {
    console.log('Environment variables loaded from the .env file');
    dotenv.config();
  }
}