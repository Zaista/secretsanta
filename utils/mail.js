import mail from '@sendgrid/mail';
import { getLogger } from './logger.js';

const log = getLogger('mail');

export async function sendRealMail(emailTemplate) {
  mail.setApiKey(process.env.sendgridApi);
  return await mail
    .send(emailTemplate)
    .then(() => {
      log.info(`Email with question sent to ${emailTemplate.to}`);
      return { success: true };
    })
    .catch((error) => {
      return { error };
    });
}
