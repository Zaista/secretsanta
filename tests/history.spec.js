// @ts-check
import { test, expect } from '@playwright/test';
import { login, registerUser } from './helpers/login.js';
import { createRevealedGroup } from './helpers/setup.js';
import { faker } from '@faker-js/faker';

test.describe('history tests', () => {
  test('user can edit santa history', async ({ page }) => {
    const groupData = await createRevealedGroup(page.request);
    await login(
      page.request,
      groupData.users.admin.email,
      groupData.users.admin.password
    );
    await page.goto('/history');

    await expect(page).toHaveTitle('Secret Santa History');

    await expect(page.getByText('N/A')).toBeVisible();
    await page.locator('.bi-image').click();

    await page.locator('#locationCaptionEdit').click();
    await page.getByLabel('Update description:').fill('Random location');
    await page.getByText('Save').click();
    await expect(
      page.getByText('Year location was updated successfully')
    ).toBeVisible();
    await expect(page.locator('#locationTitle')).toHaveText('Random location');

    await page.locator('[data-id="descriptionEdit"]').nth(0).click();
    await page.getByLabel('Update description:').fill('Random gift');
    await page.getByText('Save').click();
    await expect(
      page.getByText('Gift description was updated successfully')
    ).toBeVisible();
    await expect(page.locator('[data-id="giftText"]').nth(0)).toHaveText(
      'Random gift'
    );

    await page.locator('#locationIcon').click();
    await page.getByText('Change image').click();
    await page.locator('#imageUpload').setInputFiles('tests/santaHouse.jpg');
    await page.getByText('Upload').click();
    await expect(
      page.getByText('Location image was uploaded successfully')
    ).toBeVisible();
    await expect(page.locator('#locationImage')).toHaveAttribute(
      'src',
      /data:image\/png/
    );

    await page.locator('[data-id="giftIcon"]').nth(0).click();
    await page.getByText('Change image').click();
    await page.locator('#imageUpload').setInputFiles('tests/santaGift.jpg');
    await page.getByRole('button', { name: 'Upload' }).click();
    await expect(
      page.getByText('Gift image was uploaded successfully')
    ).toBeVisible();
    await expect(page.locator('[data-id="giftImage"]').nth(0)).toHaveAttribute(
      'src',
      /data:image\/png/
    );

    await page.getByText('History').click();
    await expect(page.locator('[data-id="locationImage"]')).toHaveAttribute(
      'src',
      /history\/year\/api\/location-image\?id=/
    );
    await expect(page.getByText('Random location')).toBeVisible();
  });

  test('user with no group cannot access history page', async ({ page }) => {
    const user = {
      email: faker.internet.email(),
      password: faker.internet.password(),
    };
    await registerUser(page.request, user);

    await page.goto('/history');

    await expect(page).toHaveTitle('Secret Santa History');
    await expect(page.locator('#footerAlert')).toHaveText(
      'No recorded history'
    );
  });
});
