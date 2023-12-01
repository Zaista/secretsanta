// @ts-check
import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';

test('user can register and login', async ({ page }) => {
  await page.goto('/');

  await page.getByText('Register').click();

  const email = faker.internet.email();
  const password = faker.internet.password();
  await page.getByLabel('email').fill(email);
  await page.locator('#password').fill(password);
  await page.locator('#confirmPassword').fill(password);

  await page.getByRole('button', { name: 'Register' }).click();
  await expect(page.locator('#footerAlert')).toHaveText('Registration completed successfully');

  await expect(page).toHaveTitle(/Secret Santa/);
  await expect(page.locator('#unavailableImage')).toBeVisible();
});
