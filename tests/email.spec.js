// @ts-check
import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';
import { forgotPassword, login, registerUser } from './helpers/login.js';
import {
  draftSantaPairs,
  inviteUserToGroup,
  updateGroup,
} from './helpers/admin.js';
import { createDraftedGroup, createNewGroup } from './helpers/setup.js';
import { sendMessage } from './helpers/chat.js';

// compare only the email content, not the ethereal.email page around it, which changes independently
async function expectEmailScreenshot(page, name, maskedSelectors) {
  const email = page.frameLocator('#message iframe');
  await expect(email.locator('body')).toHaveScreenshot(name, {
    mask: maskedSelectors.map((selector) => email.locator(selector)),
  });
}

// user-entered text must show up in emails as typed, not be read as HTML or as $ replacement patterns
const htmlText = '<b>Elves</b> & "co" $\' $&';

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

    await expectEmailScreenshot(page, 'forgot-password-email.png', [
      '#email-placeholder',
      '#password-placeholder',
    ]);
  });

  test('unknown user should receive an email when forgot password is triggered', async ({
    page,
  }) => {
    const response = await forgotPassword(page.request, faker.internet.email());
    const responseJson = await response.json();
    await expect(responseJson).toHaveProperty('emailUrl');
    await page.goto(responseJson.emailUrl);

    const email = page.frameLocator('#message iframe');
    await expect(
      email.getByText('Did you perhaps sign up with a different email')
    ).toBeVisible();
    await expectEmailScreenshot(page, 'unknown-user-email.png', []);
  });

  test('password reset email shows a password with HTML characters as typed', async ({
    page,
  }) => {
    const user = { email: faker.internet.email(), password: htmlText };
    await registerUser(page.request, user);
    const response = await forgotPassword(page.request, user.email);
    const responseJson = await response.json();
    await page.goto(responseJson.emailUrl);

    const email = page.frameLocator('#message iframe');
    await expect(email.getByText(htmlText, { exact: true })).toBeVisible();
  });

  test('invite email shows a group name with HTML characters as typed', async ({
    page,
  }) => {
    const groupData = await createNewGroup(page.request);
    await login(
      page.request,
      groupData.users.admin.email,
      groupData.users.admin.password
    );
    await updateGroup(page.request, {
      name: htmlText,
      userAddedNotification: true,
      messageSentNotification: false,
      yearDraftedNotification: false,
    });
    const result = await inviteUserToGroup(
      page.request,
      faker.internet.email()
    );
    await page.goto(result.emailUrl);

    const email = page.frameLocator('#message iframe');
    await expect(email.getByText(htmlText, { exact: true })).toBeVisible();
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

    await expectEmailScreenshot(page, 'invite-email.png', [
      '#group-placeholder',
      '#password-placeholder',
    ]);
  });

  test('existing user receives an email when invited to the group', async ({
    page,
  }) => {
    const groupData = await createNewGroup(page.request);
    const user1 = {
      email: faker.internet.email(),
      password: faker.internet.password(),
    };
    const user2 = {
      email: faker.internet.email(),
      password: faker.internet.password(),
    };
    await registerUser(page.request, user1);
    await registerUser(page.request, user2);

    await login(
      page.request,
      groupData.users.admin.email,
      groupData.users.admin.password
    );
    const resultWithoutUrl = await inviteUserToGroup(page.request, user1.email);
    await expect(resultWithoutUrl).not.toHaveProperty('emailUrl');

    const updatedGroupData = {
      name: groupData.group.name,
      userAddedNotification: true,
      messageSentNotification: false,
      yearDraftedNotification: false,
    };
    await updateGroup(page.request, updatedGroupData);

    const resultWithUrl = await inviteUserToGroup(page.request, user2.email);
    await expect(resultWithUrl).toHaveProperty('emailUrl');
    await page.goto(resultWithUrl.emailUrl);

    // existing users keep their own password, so the email has none
    const email = page.frameLocator('#message iframe');
    await expect(email.getByText('temporary password')).toBeHidden();
    await expectEmailScreenshot(page, 'existing-user-invite-email.png', [
      '#group-placeholder',
    ]);
  });

  test('users receive an email when the year is drafted', async ({ page }) => {
    const groupData = await createNewGroup(page.request);
    await login(
      page.request,
      groupData.users.admin.email,
      groupData.users.admin.password
    );
    await updateGroup(page.request, {
      name: groupData.group.name,
      userAddedNotification: false,
      messageSentNotification: false,
      yearDraftedNotification: true,
    });

    const result = await draftSantaPairs(page.request);
    await page.goto(result.emailUrl);

    const email = page.frameLocator('#message iframe');
    await expect(
      email.getByText(groupData.group.name, { exact: true })
    ).toBeVisible();
    await expect(
      email.getByText(String(new Date().getFullYear() + 1), { exact: true })
    ).toBeVisible();
    await expectEmailScreenshot(page, 'year-drafted-email.png', [
      '#group-placeholder',
      '#year-placeholder',
    ]);
  });

  test('users do not receive an email when the year is drafted with notifications off', async ({
    page,
  }) => {
    await createNewGroup(page.request);

    const result = await draftSantaPairs(page.request);

    await expect(result).toEqual({ success: 'Pairs successfully drafted' });
  });
});

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
      // fixed text keeps the screenshot stable: random words can wrap onto another line
      message: 'What size of gloves do you wear?',
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
    const email = page.frameLocator('#message iframe');
    await expect(email.getByText(message.message)).toBeVisible();
    await expect(
      email.getByText(groupData.group.name, { exact: true })
    ).toBeVisible();
    await expectEmailScreenshot(page, 'chat-email.png', ['#group-placeholder']);
  });

  test('chat email shows a message with HTML characters as typed', async ({
    page,
  }) => {
    const groupData = await createNewGroup(page.request);
    await login(
      page.request,
      groupData.users.admin.email,
      groupData.users.admin.password
    );
    await updateGroup(page.request, {
      name: groupData.group.name,
      userAddedNotification: false,
      messageSentNotification: true,
      yearDraftedNotification: false,
    });
    const messageData = await sendMessage(page.request, {
      userId: groupData.users.user1.id,
      message: htmlText,
    });
    await page.goto(messageData.emailUrl);

    const email = page.frameLocator('#message iframe');
    await expect(email.getByText(htmlText, { exact: true })).toBeVisible();
  });

  test('chat email goes to the group member, not to an address in the request', async ({
    page,
  }) => {
    const groupData = await createNewGroup(page.request);
    await login(
      page.request,
      groupData.users.admin.email,
      groupData.users.admin.password
    );
    await updateGroup(page.request, {
      name: groupData.group.name,
      userAddedNotification: false,
      messageSentNotification: true,
      yearDraftedNotification: false,
    });
    const otherEmail = faker.internet.email();
    const messageData = await sendMessage(page.request, {
      userId: groupData.users.user1.id,
      email: otherEmail,
      message: faker.word.words(10),
    });
    await page.goto(messageData.emailUrl);

    await expect(page.locator('#message-header')).toContainText(
      groupData.users.user1.email
    );
    await expect(page.locator('#message-header')).not.toContainText(otherEmail);
  });

  test('user should not receives a chat email', async ({ page }) => {
    const groupData = await createNewGroup(page.request);
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
