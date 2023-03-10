import mail from '@sendgrid/mail';

export async function getMail() {
  mail.setApiKey(process.env.sendgridApi);

  return mail;
}
