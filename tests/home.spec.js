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

    const topSecretImage = page.getByAltText('Top secret image');
    await expect(topSecretImage).toHaveAttribute(
      'src',
      '/resources/images/topSecret.png'
    );

    await topSecretImage.click();
    // the drafted users have no profile image
    await expect(topSecretImage).toHaveAttribute(
      'src',
      '/resources/images/placeholder.png'
    );

    const santa = await getSanta(page.request);
    await expect(
      page.getByRole('heading', { name: santa.name, exact: true })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: santa.email, exact: true })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: santa.address.street, exact: true })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', {
        name: `${santa.address.postalCode} ${santa.address.city}`,
        exact: true,
      })
    ).toBeVisible();
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

  test('user with no group cannot access home page', async ({ page }) => {
    const user = {
      email: faker.internet.email(),
      password: faker.internet.password(),
    };
    await registerUser(page.request, user);

    await page.goto('/');

    await expect(page).toHaveTitle('Secret Santa');
    await expect(page.locator('#footerAlert')).toHaveText(
      'No Secret Santa group selected'
    );
  });
});
