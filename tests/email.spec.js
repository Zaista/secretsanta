// @ts-check
import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';
import { login, registerUser } from './helpers/login.js';
import { inviteUserToGroup, updateGroup } from './helpers/admin.js';
import { createDraftedGroup, createNewGroup } from './helpers/setup.js';
import { sendMessage } from './helpers/chat.js';

test.describe('email tests', () => {

  test.describe('admin tests', () => {

    test('new user receives an email when invited to the group', async ({
      page,
    }) => {
      const groupData = await createNewGroup(page.request);

      await login(
        page.request,
        groupData.users.admin.email,
        groupData.users.admin.password
      );
      const resultWithoutUrl = await inviteUserToGroup(
        page.request,
        faker.internet.email()
      );
      const bodyWithoutUrl = await resultWithoutUrl.json();
      await expect(bodyWithoutUrl).not.toHaveProperty('emailUrl');

      const updatedGroupData = {
        name: groupData.group.name,
        userAddedNotification: true,
        messageSentNotification: false,
        yearDraftedNotification: false,
      };
      await updateGroup(page.request, updatedGroupData);

      const resultWithUrl = await inviteUserToGroup(
        page.request,
        faker.internet.email()
      );
      const bodyWithUrl = await resultWithUrl.json();
      await expect(bodyWithUrl).toHaveProperty('emailUrl');
      await page.goto(bodyWithUrl.emailUrl);

      await expect(page).toHaveScreenshot('invite-email.png', {
        maxDiffPixelRatio: 0.05,
        mask: [
          page.locator('.mp_address_group').nth(1),
          page.locator('.datestring'),
          // Message-ID
          page.locator('#message-header div').nth(4).locator('span'),
          page.frameLocator('[style]').locator('#group-placeholder'),
          page.frameLocator('[style]').locator('#password-placeholder'),
        ],
      });
    });

    test('existing user receives an email when invited to the group', async ({
      page,
    }) => {
      const groupData = await createNewGroup(page.request);
      const user1 = faker.internet.email();
      const user2 = faker.internet.email();
      await registerUser(page.request, user1);
      await registerUser(page.request, user2);

      await login(
        page.request,
        groupData.users.admin.email,
        groupData.users.admin.password
      );
      const resultWithoutUrl = await inviteUserToGroup(page.request, user1);
      const bodyWithoutUrl = await resultWithoutUrl.json();
      await expect(bodyWithoutUrl).not.toHaveProperty('emailUrl');

      const updatedGroupData = {
        name: groupData.group.name,
        userAddedNotification: true,
        messageSentNotification: false,
        yearDraftedNotification: false,
      };
      await updateGroup(page.request, updatedGroupData);

      const resultWithUrl = await inviteUserToGroup(page.request, user2);
      const bodyWithUrl = await resultWithUrl.json();
      await expect(bodyWithUrl).toHaveProperty('emailUrl');
      await page.goto(bodyWithUrl.emailUrl);

      await expect(page).toHaveScreenshot('invite-email.png', {
        maxDiffPixelRatio: 0.05,
        mask: [
          page.locator('.mp_address_group').nth(1),
          page.locator('.datestring'),
          // Message-ID
          page.locator('#message-header div').nth(4).locator('span'),
          page.frameLocator('[style]').locator('#group-placeholder'),
          page.frameLocator('[style]').locator('#password-placeholder'),
        ],
      });
    });
  })

  test.describe('chat tests', () => {

    test('user should receive a chat email', async ({ page }) => {
      const groupData = await createDraftedGroup(page.request);
      const updatedGroupData = {
        name: groupData.group.name,
        userAddedNotification: false,
        messageSentNotification: true,
        yearDraftedNotification: false,
      };
      await updateGroup(page.request, updatedGroupData);
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
      const messageData = await sendMessage(page.request, message);
      await page.goto(messageData.emailUrl);

      await expect(page.locator('#message-header')).toContainText(
        'Secret Santa Question'
      );
      await expect(page.locator('#message-header')).toContainText(
        '<secretsanta@jovanilic.com>'
      );
      await expect(page.locator('#message-header')).toContainText(message.email);
      await expect(
        page.frameLocator('#message iframe').locator('body')
      ).toContainText(message.message);
    });

    test('user should not receives a chat email', async ({ page }) => {
      const groupData = await createDraftedGroup(page.request);
      await login(
        page.request,
        groupData.users.user2.email,
        groupData.users.user2.password
      );
      const message = {
        userId: groupData.users.user1.id,
        email: groupData.users.user1.email,
        message: faker.word.words(10),
      };
      const messageData = await sendMessage(page.request, message);
      await expect(messageData).not.toHaveProperty('emailUrl');
    });
  })
});
