// @ts-check
import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';
import { login, registerUser } from './helpers/login.js';
import { createNewGroup } from './helpers/setup.js';

test.describe('profile tests', () => {
  let groupData;
  let page;

  test.beforeAll('setup', async ({ browser }) => {
    page = await browser.newPage();
    groupData = await createNewGroup(page.request);
  });

  test('user can update his own profile', async ({ page }) => {
    await login(
      page.request,
      groupData.users.user1.email,
      groupData.users.user1.password
    );
    await page.goto('/profile');
    await expect(page).toHaveTitle('Secret Santa Profile');

    await expect(page.getByPlaceholder('Name')).toHaveValue(
      groupData.users.user1.name
    );
    await expect(page.getByPlaceholder('Description')).toHaveValue('');
    await expect(page.getByPlaceholder('Street')).toHaveValue(
      groupData.users.user1.address.street
    );
    await expect(page.getByPlaceholder('Postal code')).toHaveValue(
      groupData.users.user1.address.postalCode
    );
    await expect(page.getByPlaceholder('City')).toHaveValue(
      groupData.users.user1.address.city
    );
    await expect(page.getByPlaceholder('State')).toHaveValue(
      groupData.users.user1.address.state
    );
    await expect(page.getByLabel('Email')).toHaveValue(
      groupData.users.user1.email
    );
    await expect(page.getByLabel('Email')).toBeDisabled();

    await page.getByPlaceholder('Description').fill(faker.word.words());
    await page.getByRole('button', { name: 'Save changes' }).click();
    await expect(page.locator('#footerAlert')).toHaveText(
      'Profile updated successfully'
    );

    await page.locator('#image').click();
    await page.locator('#uploadImage').setInputFiles('tests/santaGift.jpg');
    await page.getByText('Upload image').click();
    await expect(
      page.getByText('Profile image updated successfully')
    ).toBeVisible();
    await expect(page.locator('#image')).toHaveAttribute(
      'src',
      /data:image\/png/
    );
  });

  test('admin can update other profiles', async ({ page }) => {
    await login(
      page.request,
      groupData.users.admin.email,
      groupData.users.admin.password
    );
    await page.goto('/friends');
    await page.getByText(groupData.users.user1.name).click();

    await expect(page.getByPlaceholder('Name')).toHaveValue(
      groupData.users.user1.name
    );
    await page.getByPlaceholder('Description').fill(faker.word.words());
    await page.getByRole('button', { name: 'Save changes' }).click();
    await expect(page.locator('#footerAlert')).toHaveText(
      'Profile updated successfully'
    );
  });

  test('user cannot update other profiles', async ({ page }) => {
    await login(
      page.request,
      groupData.users.user1.email,
      groupData.users.user1.password
    );
    await page.goto('/friends');
    await page.getByText(groupData.users.user2.name).click();

    await expect(page.getByPlaceholder('Name')).toHaveValue(
      groupData.users.user2.name
    );
    await expect(page.getByPlaceholder('Name')).toBeDisabled();
    await expect(page.getByPlaceholder('Description')).toBeDisabled();
    await expect(page.getByPlaceholder('Street')).toBeDisabled();
    await expect(page.getByPlaceholder('Postal code')).toBeDisabled();
    await expect(page.getByPlaceholder('City')).toBeDisabled();
    await expect(page.getByPlaceholder('State')).toBeDisabled();
    await expect(page.getByLabel('Email')).toBeDisabled();
    await expect(
      page.getByRole('button', { name: 'Save changes' })
    ).toBeHidden();
  });

  test('user with no group can see his profile', async ({ page }) => {
    const user = {
      email: faker.internet.email(),
      password: faker.internet.password(),
    };
    await registerUser(page.request, user);

    await page.goto('/profile');

    await expect(page).toHaveTitle('Secret Santa Profile');
    await expect(page.getByPlaceholder('Name')).toHaveValue('');
  });
});
