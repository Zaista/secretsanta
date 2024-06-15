// @ts-check
import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';
import { login, registerUser } from './helpers/login.js';
import { inviteUserToGroup, updateGroup } from './helpers/admin.js';
import { createNewGroup } from './helpers/setup.js';

test.describe('email tests', () => {
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
});
