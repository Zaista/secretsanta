// @ts-check
import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';
import { login, registerUser } from './helpers/login.js';
import { getSanta } from './helpers/santa.js';
import { createDraftedGroup } from './helpers/setup.js';

test.describe('home tests', () => {
  test('user can reveal his santa pair', async ({ page }) => {
    await createDraftedGroup(page.request);

    await page.goto('/');

    await expect(page.locator('#footerAlert')).toHaveText(
      'Click the image to reveal your pair'
    );

    const topSecretImage = await page.getByAltText('Top secret image');
    await expect(await topSecretImage.getAttribute('src')).toEqual(
      '/resources/images/topSecret.png'
    );

    await topSecretImage.click();
    await expect(topSecretImage.getAttribute('src')).not.toEqual(
      '/resources/images/topSecret.png'
    );

    const santa = await getSanta(page.request);
    expect(await page.locator('#santaName').textContent()).toContain(
      santa.name
    );
    expect(await page.locator('#santaEmail').textContent()).toContain(
      santa.email
    );
    expect(await page.locator('#santaStreet').textContent()).toContain(
      santa.address.street
    );
    expect(await page.locator('#santaCity').textContent()).toContain(
      santa.address.city
    );
    expect(await page.locator('#santaCity').textContent()).toContain(
      santa.address.postalCode
    );
  });

  test('user can create a new group', async ({ page }) => {
    const adminUser = {
      email: faker.internet.email(),
      password: 'test',
    };
    await registerUser(page.request, adminUser);
    await login(page.request, adminUser.email, adminUser.password);
    await page.goto('/');

    await page.getByRole('button', { name: 'N/A' }).click();
    await page.getByText('Create new group').click();

    await page
      .getByLabel('Enter the name of the Secret Santa group')
      .fill(faker.word.noun());
    await page.getByRole('button', { name: 'Create' }).click();

    await expect(page.locator('#footerAlert')).toHaveText(
      'New group created successfully'
    );

    await expect(
      page.getByRole('heading', { name: 'Group settings' })
    ).toBeVisible();
    await expect(page).toHaveTitle('Secret Santa Admin');
  });
});
