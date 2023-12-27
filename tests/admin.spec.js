// @ts-check
import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';
import { login, registerUser } from './helpers/login.js';
import { createGroup, addUserToGroup } from './helpers/admin.js';

test.describe('admin tests', () => {
  test('admin can draft pairs', async ({ page }) => {
    const adminUser = {
      email: faker.internet.email(),
      password: faker.internet.password()
    };
    await registerUser(page.request, adminUser.email, adminUser.password);
    await login(page.request, adminUser.email, adminUser.password);
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
});
