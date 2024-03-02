// @ts-check
import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';
import { login, registerUser } from './helpers/login.js';
import { createGroup, addUserToGroup, addForbiddenPair } from './helpers/admin.js';
import { createDraftedGroup } from './helpers/setup.js';

test.describe('admin tests', () => {
  test('admin can draft pairs', async ({ page }) => {
    const adminUser = {
      email: faker.internet.email(),
      password: faker.internet.password()
    };
    await registerUser(page.request, adminUser);
    await login(page.request, adminUser);
    const user1 = {
      email: faker.internet.email(),
      password: faker.internet.password()
    };
    const user2 = {
      email: faker.internet.email(),
      password: faker.internet.password()
    };
    await createGroup(page.request, faker.word.noun());
    await addUserToGroup(page.request, user1.email);
    await addUserToGroup(page.request, user2.email);

    await page.goto('/admin');

    await page.getByRole('button', { name: 'Draft' }).click();
    await expect(page.locator('#footerAlert')).toHaveText('Pairs successfully drafted');
  });

  test('admin can add forbidden pairs', async ({ page }) => {
    const groupData = await createDraftedGroup(page.request);
    await login(page.request, groupData.users.admin.email, groupData.users.admin.password);
    await page.goto('/admin');

    await page.getByRole('button', { name: 'Add new pair' }).click();
    await page.getByLabel('This user').selectOption(groupData.users.user1.id);
    await page.getByLabel('Will never be paired with').selectOption(groupData.users.user2.id);
    await page.getByRole('button', { name: 'Forbid' }).click();
    await expect(page.locator('#footerAlert')).toHaveText('Forbidden pair added');
  });

  test('admin cannot add forbidden pair again', async ({ page }) => {
    const groupData = await createDraftedGroup(page.request);
    console.log(groupData);
    const forbiddenPair = {
      forbiddenUser1Id: groupData.users.user1.id,
      forbiddenUser2Id: groupData.users.user2.id
    };
    await addForbiddenPair(page.request, forbiddenPair);
    await login(page.request, groupData.users.admin.email, groupData.users.admin.password);
    await page.goto('/admin');

    await page.getByRole('button', { name: 'Add new pair' }).click();
    await page.getByLabel('This user').selectOption(groupData.users.user1.id);
    await page.getByLabel('Will never be paired with').selectOption(groupData.users.user2.id);
    await page.getByRole('button', { name: 'Forbid' }).click();
    await expect(page.locator('#footerAlert')).toHaveText('Forbidden pair already exists.');
  });
});
