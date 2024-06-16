// @ts-check
import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';
import { login } from './helpers/login.js';
import { sendMessage } from './helpers/chat.js';
import { createNewGroup } from './helpers/setup.js';

test.describe('chat tests', () => {
  let groupData;
  let page;

  test.beforeAll('setup', async ({ browser })=> {
    page = await browser.newPage();
    groupData = await createNewGroup(page.request);
  })

  test('user can send a message', async ({ page }) => {
    await login(
      page.request,
      groupData.users.user1.email,
      groupData.users.user1.password
    );
    await page.goto('/chat');
    await expect(page).toHaveTitle('Secret Santa Chat');

    await page.getByPlaceholder('Your message').fill(faker.word.words());
    await page.locator('#user').selectOption(groupData.users.user2.name);
    await page.getByRole('button', { name: 'Ask' }).click();

    await expect(page.locator('#footerAlert')).toHaveText(
      'Message posted in chat'
    );
    await expect(page.getByText('Just now...')).toBeVisible();
  });

  test('user can see received messages', async ({ page }) => {
    await login(
      page.request,
      groupData.users.user1.email,
      groupData.users.user1.password
    );
    const message = {
      userId: groupData.users.user2.id,
      email: groupData.users.user2.email,
      message: faker.word.words(10),
    };
    await sendMessage(page.request, message);

    await login(
      page.request,
      groupData.users.user2.email,
      groupData.users.user2.password
    );
    await page.goto('/chat');

    await expect(page.locator('[data-name="chatTo"]')).toContainText(groupData.users.user2.name);
    await expect(page.locator('[data-name="chatMessage"]')).toHaveText(message.message);
    await expect(page.locator('[data-name="chatFrom"]')).toHaveText('From: Anonymous');
  });
});
