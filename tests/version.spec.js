// @ts-check
import { test, expect } from '@playwright/test';

test.describe('version tests', () => {
  test('version api returns the deployed commit', async ({ request }) => {
    const response = await request.get('/api/version');
    expect(response.ok()).toBeTruthy();
    const version = await response.json();
    expect(version.commit).toBeTruthy();
    expect(version).toHaveProperty('deployVersion');
  });

  test('footer shows the deployed commit', async ({ page }) => {
    const version = await (await page.request.get('/api/version')).json();
    await page.goto('/session/login');
    await expect(page.locator('#appVersion')).toContainText(version.commit);
  });
});
