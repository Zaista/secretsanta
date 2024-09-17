// @ts-check
import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';
import { login, registerUser } from './helpers/login.js';
import {
  createGroup,
  inviteUserToGroup,
  addForbiddenPair,
  draftSantaPairs,
  revealSantaPairs,
} from './helpers/admin.js';
import { createNewGroup, createDraftedGroup } from './helpers/setup.js';

test.describe('admin tests', () => {
  test.describe('group settings tests', () => {
    test('admin can change group settings', async ({ page }) => {
      const groupData = await createDraftedGroup(page.request);
      await login(
        page.request,
        groupData.users.admin.email,
        groupData.users.admin.password
      );
      await page.goto('/admin');

      await expect(page.locator('#groupName')).toHaveText(groupData.group.name);
      await expect(page.locator('#groupNameSettings')).toHaveValue(
        groupData.group.name
      );
      const updatedName = faker.word.noun();
      await page.getByLabel('Group name').fill(updatedName);
      await page.getByLabel('Email a user when invited to the group').check();
      await page
        .getByLabel('Email a user when chat message is received')
        .check();
      await page.getByLabel('Email users when new year is drafted').check();
      await page.locator('#groupButton').click();

      await expect(page.locator('#footerAlert')).toHaveText(
        'Group settings updated'
      );
      await expect(page.locator('#groupName')).toHaveText(updatedName);
    });
  });

  test.describe('drafting pairs tests', () => {
    test('admin can draft pairs', async ({ page }) => {
      const adminUser = {
        email: faker.internet.email(),
        password: faker.internet.password(),
      };
      await registerUser(page.request, adminUser);
      await login(page.request, adminUser);
      const user1 = {
        email: faker.internet.email(),
        password: faker.internet.password(),
      };
      const user2 = {
        email: faker.internet.email(),
        password: faker.internet.password(),
      };
      await createGroup(page.request, faker.word.noun());
      await inviteUserToGroup(page.request, user1.email);
      await inviteUserToGroup(page.request, user2.email);

      await page.goto('/admin');

      await page.getByRole('button', { name: 'Draft' }).click();
      await expect(page.locator('#footerAlert')).toHaveText(
        'Pairs successfully drafted'
      );
    });

    test('admin can reveal drafted pairs', async ({ page }) => {
      const groupData = await createDraftedGroup(page.request);

      await page.goto('/admin');

      await page.getByRole('button', { name: 'Reveal' }).click();
      await expect(page.locator('#footerAlert')).toHaveText(
        'Last year successfully revealed'
      );

      await page.goto('/history');
      await expect(page.locator('#yearTitle')).toHaveText('2025');

      await page.locator('#yearTitle').click();

      for (let user in groupData.users) {
        await expect(page.locator('tbody')).toContainText(
          groupData.users[user].name
        );
      }
    });
  });

  test.describe('forbidden pairs tests', () => {
    test('admin can add forbidden pairs', async ({ page }) => {
      const groupData = await createDraftedGroup(page.request);
      await login(
        page.request,
        groupData.users.admin.email,
        groupData.users.admin.password
      );
      await page.goto('/admin');

      await page.getByRole('button', { name: 'Add new pair' }).click();
      await page.getByLabel('This user').selectOption(groupData.users.user1.id);
      await page
        .getByLabel('Will never be paired with')
        .selectOption(groupData.users.user2.id);
      await page.getByRole('button', { name: 'Forbid' }).click();
      await expect(page.locator('#footerAlert')).toHaveText(
        'Forbidden pair added'
      );
    });

    test('admin cannot add forbidden pair again', async ({ page }) => {
      const groupData = await createDraftedGroup(page.request);
      const forbiddenPair = {
        forbiddenUser1Id: groupData.users.user1.id,
        forbiddenUser2Id: groupData.users.user2.id,
      };
      await addForbiddenPair(page.request, forbiddenPair);
      await login(
        page.request,
        groupData.users.admin.email,
        groupData.users.admin.password
      );
      await page.goto('/admin');

      await page.getByRole('button', { name: 'Add new pair' }).click();
      await page.getByLabel('This user').selectOption(groupData.users.user1.id);
      await page
        .getByLabel('Will never be paired with')
        .selectOption(groupData.users.user2.id);
      await page.getByRole('button', { name: 'Forbid' }).click();
      await expect(page.locator('#footerAlert')).toHaveText(
        'Forbidden pair already exists.'
      );
    });

    test('forbidden pairs should not draft each other', async ({ page }) => {
      const groupData = await createNewGroup(page.request);
      const forbiddenPair = {
        forbiddenUser1Id: groupData.users.user1.id,
        forbiddenUser2Id: groupData.users.user2.id,
      };
      await addForbiddenPair(page.request, forbiddenPair);
      await draftSantaPairs(page.request);
      await revealSantaPairs(page.request);
      await page.goto('/history');
      await page.getByText('N/A').click();
      await expect(
        page.getByRole('row', { name: groupData.users.user1.name }).first()
      ).not.toHaveText(groupData.users.user2.name);
    });
  });

  test.describe('admin access tests', () => {
    test('user cannot access admin page', async ({ page }) => {
      const groupData = await createNewGroup(page.request);
      await login(
        page.request,
        groupData.users.user1.email,
        groupData.users.user1.password
      );
      await page.goto('/admin');

      await expect(page).toHaveTitle('Secret Santa');
      await expect(page.getByRole('listitem', { name: 'Admin' })).toBeHidden();
    });

    test('user with no group cannot access admin page', async ({ page }) => {
      const user = {
        email: faker.internet.email(),
        password: faker.internet.password(),
      };
      await registerUser(page.request, user);

      await page.goto('/admin');

      await expect(page).toHaveTitle('Secret Santa');
      await expect(page.getByRole('listitem', { name: 'Admin' })).toBeHidden();
      await expect(page.locator('#footerAlert')).toHaveText(
        'No Secret Santa group selected'
      );
    });
  });
});
