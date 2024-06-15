import mail from '@sendgrid/mail';

export async function sendRealMail(emailTemplate) {
  mail.setApiKey(process.env.sendgridApi);
  return await mail
    .send(emailTemplate)
    .then(() => {
      console.log(`Email with question sent to ${emailTemplate.to}`);
      return { success: true };
    })
    .catch((error) => {
      return { error };
    });
}
