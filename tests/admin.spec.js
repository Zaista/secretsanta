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
  removeForbiddenPair,
} from './helpers/admin.js';
import { createNewGroup, createDraftedGroup } from './helpers/setup.js';

test.describe('admin tests', () => {
  test.describe('group settings tests', () => {
    test('admin can change group settings', async ({ page }) => {
      const groupData = await createNewGroup(page.request);
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

  test.describe('user group tests', () => {
    test('admin can invite a non existing user to the group', async ({
      page,
    }) => {
      const groupData = await createNewGroup(page.request);
      await login(
        page.request,
        groupData.users.admin.email,
        groupData.users.admin.password
      );
      await page.goto('/admin');

      await page.getByRole('button', { name: 'Invite new users' }).click();

      const email = faker.internet.email();
      await page.getByLabel('Email address').fill(email);
      await page.getByRole('button', { name: 'Invite', exact: true }).click();

      await expect(
        page.locator('[data-name="userEmail"]').getByText(email)
      ).toBeVisible();
      await expect(page.locator('#footerAlert')).toHaveText(
        `User '${email}' invited to the group: ${groupData.group.name}`
      );
    });

    test('admin can invite an existing user to the group', async ({ page }) => {
      const groupData = await createNewGroup(page.request);
      const user = {
        email: faker.internet.email(),
        password: faker.internet.password(),
      };
      await registerUser(page.request, user);
      await login(
        page.request,
        groupData.users.admin.email,
        groupData.users.admin.password
      );
      await page.goto('/admin');

      await page.getByRole('button', { name: 'Invite new users' }).click();

      await page.getByLabel('Email address').fill(user.email);
      await page.getByRole('button', { name: 'Invite', exact: true }).click();

      await expect(
        page.locator('[data-name="userEmail"]').getByText(user.email)
      ).toBeVisible();
      await expect(page.locator('#footerAlert')).toHaveText(
        `User '${user.email}' invited to the group: ${groupData.group.name}`
      );
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
      await expect(page.locator('[data-id="yearTitle"]')).toHaveText('2025');

      await page.locator('[data-id="yearTitle"]').click();

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
      const groupData = await createNewGroup(page.request);
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
        'Forbidden pair already exists'
      );
    });

    test('admin can remove a forbidden pair', async ({ page }) => {
      const groupData = await createNewGroup(page.request);
      await login(
        page.request,
        groupData.users.admin.email,
        groupData.users.admin.password
      );
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

      await page.locator('[data-name="pairDelete"]').click();
      await page.getByRole('button', { name: 'Delete pair' }).click();
      await expect(page.locator('#footerAlert')).toHaveText(
        'The forbidden pair was successfully deleted'
      );
    });

    test('forbidden pairs should not draft each other', async ({ page }) => {
      const groupData = await createNewGroup(page.request);
      const forbiddenPair = {
        forbiddenUser1Id: groupData.users.user1.id,
        forbiddenUser2Id: groupData.users.user2.id,
      };
      const pairResult = await addForbiddenPair(page.request, forbiddenPair);
      const draftFailedResult = await draftSantaPairs(page.request);
      expect(draftFailedResult).toHaveProperty('error');
      await removeForbiddenPair(page.request, pairResult.id);
      const draftSuccessfulResult = await draftSantaPairs(page.request);
      expect(draftSuccessfulResult).toHaveProperty('success');
    });

    test('multiple forbidden pairs should not draft each other', async ({
      page,
    }) => {
      const groupData = {
        users: {
          admin: {
            email: faker.internet.email(),
            password: 'test',
          },
          user2: {
            email: faker.internet.email(),
            password: 'test',
          },
          user3: {
            email: faker.internet.email(),
            password: 'test',
          },
          user4: {
            email: faker.internet.email(),
            password: 'test',
          },
          user5: {
            email: faker.internet.email(),
            password: 'test',
          },
          user6: {
            email: faker.internet.email(),
            password: 'test',
          },
          user7: {
            email: faker.internet.email(),
            password: 'test',
          },
          user8: {
            email: faker.internet.email(),
            password: 'test',
          },
          user9: {
            email: faker.internet.email(),
            password: 'test',
          },
          user10: {
            email: faker.internet.email(),
            password: 'test',
          },
        },
        group: {
          name: faker.word.noun(),
        },
      };

      await createNewGroup(page.request, groupData);
      const forbiddenPair1 = {
        forbiddenUser1Id: groupData.users.admin.id,
        forbiddenUser2Id: groupData.users.user2.id,
      };
      const forbiddenPair2 = {
        forbiddenUser1Id: groupData.users.user3.id,
        forbiddenUser2Id: groupData.users.user4.id,
      };
      const forbiddenPair3 = {
        forbiddenUser1Id: groupData.users.user5.id,
        forbiddenUser2Id: groupData.users.user6.id,
      };
      const forbiddenPair4 = {
        forbiddenUser1Id: groupData.users.user8.id,
        forbiddenUser2Id: groupData.users.user7.id,
      };
      const forbiddenPair5 = {
        forbiddenUser1Id: groupData.users.user10.id,
        forbiddenUser2Id: groupData.users.user9.id,
      };
      await addForbiddenPair(page.request, forbiddenPair1);
      await addForbiddenPair(page.request, forbiddenPair2);
      await addForbiddenPair(page.request, forbiddenPair3);
      await addForbiddenPair(page.request, forbiddenPair4);
      await addForbiddenPair(page.request, forbiddenPair5);
      let i = 0;
      while (i < 10) {
        const result = await draftSantaPairs(page.request);
        if ('success' in result) {
          break;
        }
        i++;
      }
      await revealSantaPairs(page.request);
      await page.goto('/history');
      await page.getByText('N/A').click();

      let santa = page
        .locator('*[data-id="santa"]')
        .filter({ hasText: groupData.users.admin.email });
      let parent = page.getByRole('row').filter({ has: santa });
      await expect(parent).not.toHaveText(groupData.users.user2.email);

      santa = page
        .locator('*[data-id="santa"]')
        .filter({ hasText: groupData.users.user2.email });
      parent = page.getByRole('row').filter({ has: santa });
      await expect(parent).not.toHaveText(groupData.users.admin.email);

      santa = page
        .locator('*[data-id="santa"]')
        .filter({ hasText: groupData.users.user3.email });
      parent = page.getByRole('row').filter({ has: santa });
      await expect(parent).not.toHaveText(groupData.users.user4.email);

      santa = page
        .locator('*[data-id="santa"]')
        .filter({ hasText: groupData.users.user4.email });
      parent = page.getByRole('row').filter({ has: santa });
      await expect(parent).not.toHaveText(groupData.users.user3.email);

      santa = page
        .locator('*[data-id="santa"]')
        .filter({ hasText: groupData.users.user5.email });
      parent = page.getByRole('row').filter({ has: santa });
      await expect(parent).not.toHaveText(groupData.users.user6.email);

      santa = page
        .locator('*[data-id="santa"]')
        .filter({ hasText: groupData.users.user6.email });
      parent = page.getByRole('row').filter({ has: santa });
      await expect(parent).not.toHaveText(groupData.users.user5.email);

      santa = page
        .locator('*[data-id="santa"]')
        .filter({ hasText: groupData.users.user7.email });
      parent = page.getByRole('row').filter({ has: santa });
      await expect(parent).not.toHaveText(groupData.users.user8.email);

      santa = page
        .locator('*[data-id="santa"]')
        .filter({ hasText: groupData.users.user8.email });
      parent = page.getByRole('row').filter({ has: santa });
      await expect(parent).not.toHaveText(groupData.users.user7.email);

      santa = page
        .locator('*[data-id="santa"]')
        .filter({ hasText: groupData.users.user9.email });
      parent = page.getByRole('row').filter({ has: santa });
      await expect(parent).not.toHaveText(groupData.users.user10.email);

      santa = page
        .locator('*[data-id="santa"]')
        .filter({ hasText: groupData.users.user10.email });
      parent = page.getByRole('row').filter({ has: santa });
      await expect(parent).not.toHaveText(groupData.users.user9.email);
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
