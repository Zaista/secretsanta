// @ts-check
import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';
import { forgotPassword, login, registerUser } from './helpers/login.js';
import { inviteUserToGroup, updateGroup } from './helpers/admin.js';
import { createDraftedGroup, createNewGroup } from './helpers/setup.js';
import { sendMessage } from './helpers/chat.js';

test.describe('email tests', () => {
  test('user should receive an email when forgot password is triggered', async ({
    page,
  }) => {
    const user = {
      email: faker.internet.email(),
      password: faker.internet.password(),
    };
    await registerUser(page.request, user);
    const response = await forgotPassword(page.request, user.email);
    const responseJson = await response.json();
    await expect(responseJson).toHaveProperty('emailUrl');
    await page.goto(responseJson.emailUrl);

    await expect(page).toHaveScreenshot('forgot-password-email.png', {
      mask: [
        page.locator('.mp_address_group').nth(1),
        page.locator('.datestring'),
        // Message-ID
        page.locator('#message-header div').nth(4).locator('span'),
        page.frameLocator('#message iframe').locator('#email-placeholder'),
        page.frameLocator('#message iframe').locator('#password-placeholder'),
      ],
      fullPage: true,
    });
  });

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
    await expect(resultWithoutUrl).not.toHaveProperty('emailUrl');

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
    await expect(resultWithUrl).toHaveProperty('emailUrl');
    await page.goto(resultWithUrl.emailUrl);

    await expect(page).toHaveScreenshot('invite-email.png', {
      mask: [
        page.locator('.mp_address_group').nth(1),
        page.locator('.datestring'),
        // Message-ID
        page.locator('#message-header div').nth(4).locator('span'),
        page.frameLocator('#message iframe').locator('#group-placeholder'),
        page.frameLocator('#message iframe').locator('#password-placeholder'),
      ],
      fullPage: true,
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
    await expect(resultWithoutUrl).not.toHaveProperty('emailUrl');

    const updatedGroupData = {
      name: groupData.group.name,
      userAddedNotification: true,
      messageSentNotification: false,
      yearDraftedNotification: false,
    };
    await updateGroup(page.request, updatedGroupData);

    const resultWithUrl = await inviteUserToGroup(page.request, user2);
    await expect(resultWithUrl).toHaveProperty('emailUrl');
    await page.goto(resultWithUrl.emailUrl);

    await expect(page).toHaveScreenshot('invite-email.png', {
      mask: [
        page.locator('.mp_address_group').nth(1),
        page.locator('.datestring'),
        // Message-ID
        page.locator('#message-header div').nth(4).locator('span'),
        page.frameLocator('#message iframe').locator('#group-placeholder'),
        page.frameLocator('#message iframe').locator('#password-placeholder'),
      ],
      fullPage: true,
    });
  });
});

test.describe('chat tests', () => {
  test('user should receive a chat email', async ({ page }) => {
    const defaultData = {
      users: {
        admin: {
          email: faker.internet.email(),
          password: 'test',
          name: faker.person.fullName(),
          address: {
            street: faker.location.street(),
            city: faker.location.city(),
            postalCode: faker.location.zipCode(),
            state: faker.location.state(),
          },
        },
        user1: {
          email: faker.internet.email(),
          password: 'test',
          name: faker.person.fullName(),
          address: {
            street: faker.location.street(),
            city: faker.location.city(),
            postalCode: faker.location.zipCode(),
            state: faker.location.state(),
          },
        },
        user2: {
          email: faker.internet.email(),
          password: 'test',
          name: faker.person.fullName(),
          address: {
            street: faker.location.street(),
            city: faker.location.city(),
            postalCode: faker.location.zipCode(),
            state: faker.location.state(),
          },
        },
      },
      group: {
        name: faker.word.noun(),
      },
    };
    const groupData = await createDraftedGroup(page.request, defaultData);
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
    const defaultData = {
      users: {
        admin: {
          email: faker.internet.email(),
          password: 'test',
          name: faker.person.fullName(),
          address: {
            street: faker.location.street(),
            city: faker.location.city(),
            postalCode: faker.location.zipCode(),
            state: faker.location.state(),
          },
        },
        user1: {
          email: faker.internet.email(),
          password: 'test',
          name: faker.person.fullName(),
          address: {
            street: faker.location.street(),
            city: faker.location.city(),
            postalCode: faker.location.zipCode(),
            state: faker.location.state(),
          },
        },
        user2: {
          email: faker.internet.email(),
          password: 'test',
          name: faker.person.fullName(),
          address: {
            street: faker.location.street(),
            city: faker.location.city(),
            postalCode: faker.location.zipCode(),
            state: faker.location.state(),
          },
        },
      },
      group: {
        name: faker.word.noun(),
      },
    };
    const groupData = await createNewGroup(page.request, defaultData);
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
    await expect(messageData).toHaveProperty('success');
    await expect(messageData).not.toHaveProperty('emailUrl');
  });
});
