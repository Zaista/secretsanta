// @ts-check
import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';
import { login } from './helpers/login.js';
import { sendMessage } from './helpers/chat.js';
import { createDraftedGroup } from './helpers/setup.js';
import { updateGroup } from './helpers/admin.js';

test.describe('chat tests', () => {
  test('user can send a message', async ({ page }) => {
    const groupData = await createDraftedGroup(page.request);
    await login(page.request, groupData.users.user1.email, groupData.users.user1.password);
    await page.goto('/chat');

    await expect(page).toHaveTitle('Secret Santa Chat');

    await page.getByPlaceholder('Your message').fill(faker.word.words());
    await page.locator('#user').selectOption(groupData.users.user2.name);
    await page.getByRole('button', { name: 'Ask' }).click();

    await expect(page.locator('#footerAlert')).toHaveText(`Message posted in chat and email sent to ${groupData.users.user2.email}`);
    await expect(page.getByText('Just now...')).toBeVisible();
  });

  test('user should receive a chat email', async ({ page }) => {
    const groupData = await createDraftedGroup(page.request);
    const updatedGroupData = {
      name: groupData.group.name,
      userAddedNotification: false,
      messageSentNotification: true,
      yearDraftedNotification: false
    };
    await updateGroup(page.request, updatedGroupData);
    await login(page.request, groupData.users.user1.email, groupData.users.user1.password);
    const message = {
      userId: groupData.users.user2.id,
      email: groupData.users.user2.email,
      message: faker.word.words(10)
    };
    const messageData = await sendMessage(page.request, message);
    await page.goto(messageData.emailUrl);

    await expect(page.locator('#message-header')).toContainText('Secret Santa Question');
    await expect(page.locator('#message-header')).toContainText('<secretsanta@jovanilic.com>');
    await expect(page.locator('#message-header')).toContainText(message.email);
    await expect(page.frameLocator('#message iframe').locator('body')).toContainText(message.message);
  });

  test('user should not receives a chat email', async ({ page }) => {
    const groupData = await createDraftedGroup(page.request);
    await login(page.request, groupData.users.user2.email, groupData.users.user2.password);
    const message = {
      userId: groupData.users.user1.id,
      email: groupData.users.user1.email,
      message: faker.word.words(10)
    };
    const messageData = await sendMessage(page.request, message);
    await expect(messageData).not.toHaveProperty('emailUrl');
  });
});
