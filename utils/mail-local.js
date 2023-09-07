import nodemailer from 'nodemailer';

let mailTransporter;

// Generate SMTP service account from ethereal.email
await nodemailer.createTestAccount((err, account) => {
  if (err) {
    console.error('Failed to create a testing account. ' + err.message);
  }

  mailTransporter = nodemailer.createTransport({
    host: account.smtp.host,
    port: account.smtp.port,
    secure: account.smtp.secure,
    auth: {
      user: account.user,
      pass: account.pass
    }
  });

  console.log('Configured test email account.');
});

export async function sendSandboxMail(emailTemplate) {
  return new Promise((resolve, reject) => {
    mailTransporter.sendMail(emailTemplate, (error, info) => {
      if (error) {
        reject(error);
      }

      console.log('Message sent: %s', info.messageId);
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
      resolve({ success: true });
    });
  });
}
