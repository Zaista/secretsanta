// @ts-check
import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';
import { login, registerUser } from './helpers/login.js';
import { addUserToGroup, createGroup, draftSantaPairs } from './helpers/admin.js';

test.describe('home tests', () => {
  test('user can reveal his santa pair', async ({ page }) => {
    const adminUser = {
      email: faker.internet.email(),
      password: 'test'
    };
    await registerUser(page.request, adminUser);
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
    await draftSantaPairs(page.request);

    await page.goto('/');

    await expect(page.locator('#footerAlert')).toHaveText('Click the image to reveal your pair');

    const topSecretImage = await page.getByAltText('Top secret image');
    await expect(await topSecretImage.getAttribute('src')).toEqual('/resources/images/topSecret.png');

    await topSecretImage.click();
    await expect(async () => {
      await expect(await topSecretImage.getAttribute('src')).not.toEqual('/resources/images/topSecret.png');
    }).toPass();
  });

  test('user can create a new group', async ({ page }) => {
    const adminUser = {
      email: faker.internet.email(),
      password: 'test'
    };
    await registerUser(page.request, adminUser);
    await login(page.request, adminUser.email, adminUser.password);
    await page.goto('/');

    await page.getByRole('button', { name: 'N/A' }).click();
    await page.getByText('Create new group').click();

    await page.getByLabel('Enter the Secret Santa group name').fill(faker.word.noun());
    await page.getByRole('button', { name: 'Create' }).click();

    await expect(page.locator('#footerAlert')).toHaveText('New group created successfully');

    await expect(page.getByRole('heading', { name: 'Group settings' })).toBeVisible();
    await expect(page).toHaveTitle('Secret Santa Admin');
  });
});
