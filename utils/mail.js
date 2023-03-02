import mail from '@sendgrid/mail';

mail.setApiKey(process.env.sendgridApi);

export { mail }