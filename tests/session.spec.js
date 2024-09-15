// @ts-check
import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';
import { registerUser } from './helpers/login.js';

test.describe('session tests', () => {
  test('user can register', async ({ page }) => {
    await page.goto('/');

    await page.getByText('Register').click();

    const email = faker.internet.email();
    const password = faker.internet.password();
    await page.getByLabel('email').fill(email);
    await page.locator('#password').fill(password);
    await page.locator('#confirmPassword').fill(password);

    await page.getByRole('button', { name: 'Register' }).click();
    await expect(page.locator('#footerAlert')).toHaveText(
      'Registration completed successfully'
    );

    await expect(page).toHaveTitle(/Secret Santa/);
    await expect(page.locator('#unavailableImage')).toBeVisible();
  });

  test('user can login', async ({ request, page }) => {
    const user = {
      email: faker.internet.email(),
      password: faker.internet.password(),
    };
    await registerUser(request, user);

    await page.goto('/');
    await page.getByLabel('Santa email').fill(user.email);
    await page.getByLabel('Santa password').fill(user.password);
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page.locator('#footerAlert')).toHaveText(
      'No Secret Santa group selected'
    );

    await expect(page).toHaveTitle(/Secret Santa/);
    await expect(page.locator('#unavailableImage')).toBeVisible();
  });

  test('unknown user cannot login', async ({ page }) => {
    const user = {
      email: faker.internet.email(),
      password: faker.internet.password(),
    };

    await page.goto('/');
    await page.getByLabel('Santa email').fill(user.email);
    await page.getByLabel('Santa password').fill(user.password);

    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page.locator('#footerAlert')).toHaveText(
      'Email or password wrong'
    );
  });

  test('user can request password', async ({ request, page }) => {
    const user = {
      email: faker.internet.email(),
      password: faker.internet.password(),
    };
    await registerUser(request, user);

    await page.goto('/');

    await page.getByText('Forgot password').click();
    await page.getByLabel('Enter your email address').fill(user.email);
    await page.getByRole('button', { name: 'Email' }).click();

    await expect(page.locator('#footerAlert')).toHaveText(
      `Email successfully sent to ${user.email}`
    );
  });
});
