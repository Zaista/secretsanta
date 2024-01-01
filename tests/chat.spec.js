// @ts-check
import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';
import { login } from './helpers/login.js';
import { createDraftedGroup } from './helpers/setup.js';

test.describe('chat tests', () => {
  test('user can send a message', async ({ page }) => {
    const groupData = await createDraftedGroup(page.request);
    await login(page.request, groupData.users.user1.email, groupData.users.user1.password);
    await page.goto('/chat');

    await expect(page).toHaveTitle('Secret Santa Chat');

    await page.getByPlaceholder('Your message').fill(faker.word.words());
    await page.locator('#user').selectOption(groupData.users.user2.name);
    await page.getByRole('button', { name: 'Ask' }).click();

    await expect(page.locator('#footerAlert')).toHaveText(`Message posted in chat and email sent to ${groupData.users.user2.email}`);
    await expect(page.getByText('Just now...')).toBeVisible();
  });
});
