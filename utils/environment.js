import dotenv from 'dotenv';

if (process.env.NODE_ENV === 'production') {
  const projectId = 'deductive-span-313911';
  const client = new SecretManagerServiceClient();

  const [mongodbUri, sendgridApi, sessionKey] = await Promise.all([
    client.accessSecretVersion({
      name: `projects/${projectId}/secrets/secretsanta-mongodb-url/versions/latest`
    }),
    client.accessSecretVersion({
      name: `projects/${projectId}/secrets/sendgrid-api/versions/latest`
    }),
    client.accessSecretVersion({
      name: `projects/${projectId}/secrets/session-cookie-key/versions/latest`,
    })
  ]);

  process.env.mongodbUri = mongodbUri.payload.data.toString();
  process.env.sendgridApi = sendgridApi.payload.data.toString();
  process.env.sessionKey = sessionKey.payload.data.toString();
} else {
  dotenv.config();
}