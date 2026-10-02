// @ts-check
import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';
import { login, registerUser } from './helpers/login.js';
import {
  addForbiddenPair,
  draftSantaPairs,
  revealSantaPairs,
  removeForbiddenPair,
  removeUserFromGroup,
  setUserRole,
} from './helpers/admin.js';
import { createNewGroup, createDraftedGroup } from './helpers/setup.js';

// the dialogs open through bootstrap before the page script binds their
// buttons; the drafting status is shown only after that
async function waitForAdminPage(page) {
  await expect(page.getByText(/Santa pairs for year \d+ were/)).toBeVisible();
}

async function inviteUser(page, email) {
  await waitForAdminPage(page);
  await page.getByRole('button', { name: 'Invite new users' }).click();
  await page.getByLabel('Email address').fill(email);
  await page.getByRole('button', { name: 'Invite', exact: true }).click();
}

async function addForbiddenPairInDialog(page, user, forbiddenUser) {
  await waitForAdminPage(page);
  await page.getByRole('button', { name: 'Add new pair' }).click();
  await page
    .getByLabel('This user')
    .selectOption({ label: `${user.name} (${user.email})` });
  await page
    .getByLabel('Will never be paired with')
    .selectOption({ label: `${forbiddenUser.name} (${forbiddenUser.email})` });
  await page.getByRole('button', { name: 'Forbid' }).click();
}

function forbiddenPairRow(page, userName, forbiddenUserName) {
  return page
    .getByRole('row')
    .filter({ hasText: userName })
    .filter({ hasText: forbiddenUserName });
}

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

      await page.reload();
      await expect(page.getByLabel('Group name')).toHaveValue(updatedName);
      await expect(
        page.getByLabel('Email a user when invited to the group')
      ).toBeChecked();
      await expect(
        page.getByLabel('Email a user when chat message is received')
      ).toBeChecked();
      await expect(
        page.getByLabel('Email users when new year is drafted')
      ).toBeChecked();
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

      const email = faker.internet.email();
      await inviteUser(page, email);

      await expect(
        page.locator('[data-name="userEmail"]').getByText(email)
      ).toBeVisible();
      await expect(page.locator('#footerAlert')).toHaveText(
        `User '${email}' invited to the group: ${groupData.group.name}`
      );
      await expect(page.locator('#forbiddenUser1 option')).toContainText([
        email,
      ]);
      await expect(page.locator('#forbiddenUser2 option')).toContainText([
        email,
      ]);
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

      await inviteUser(page, user.email);

      await expect(
        page.locator('[data-name="userEmail"]').getByText(user.email)
      ).toBeVisible();
      await expect(page.locator('#footerAlert')).toHaveText(
        `User '${user.email}' invited to the group: ${groupData.group.name}`
      );
    });

    test('admin can make a user an admin', async ({ page }) => {
      const groupData = await createNewGroup(page.request);
      const { user1 } = groupData.users;
      await page.goto('/admin');

      const userSettings = page.locator('#user-settings');
      await userSettings
        .getByRole('row')
        .filter({ hasText: user1.email })
        .getByLabel('Role')
        .selectOption({ label: 'Admin' });
      await userSettings.getByRole('button', { name: 'Save changes' }).click();
      await expect(page.locator('#footerAlert')).toHaveText(
        'Modified 1 user(s)'
      );

      await page.reload();
      await expect(
        userSettings
          .getByRole('row')
          .filter({ hasText: user1.email })
          .getByLabel('Role')
      ).toHaveValue('admin');

      await login(page.request, user1.email, user1.password);
      await page.goto('/admin');
      await expect(
        page.getByRole('heading', { name: 'Group settings' })
      ).toBeVisible();
    });

    test('the only admin cannot make himself a user', async ({ page }) => {
      const groupData = await createNewGroup(page.request);
      const { admin } = groupData.users;
      await page.goto('/admin');

      const userSettings = page.locator('#user-settings');
      await userSettings
        .getByRole('row')
        .filter({ hasText: admin.email })
        .getByLabel('Role')
        .selectOption({ label: 'User' });
      await userSettings.getByRole('button', { name: 'Save changes' }).click();
      await expect(page.locator('#footerAlert')).toHaveText(
        'The group needs an admin, make another user an admin first'
      );

      await page.reload();
      await expect(
        userSettings
          .getByRole('row')
          .filter({ hasText: admin.email })
          .getByLabel('Role')
      ).toHaveValue('admin');
    });

    test('admin can make himself a user when another admin exists', async ({
      page,
    }) => {
      const groupData = await createNewGroup(page.request);
      const { admin, user1 } = groupData.users;
      await setUserRole(page.request, user1.id, 'admin');
      await page.goto('/admin');

      const userSettings = page.locator('#user-settings');
      await userSettings
        .getByRole('row')
        .filter({ hasText: admin.email })
        .getByLabel('Role')
        .selectOption({ label: 'User' });
      await userSettings.getByRole('button', { name: 'Save changes' }).click();
      await expect(page.locator('#footerAlert')).toHaveText(
        'Modified 1 user(s)'
      );

      // the session picks up the new role on the next request
      await page.goto('/admin');
      await expect(page).toHaveTitle('Secret Santa');
      await expect(
        page.getByRole('heading', { name: 'Group settings' })
      ).toBeHidden();
    });

    test('the only admin cannot remove himself from the group', async ({
      page,
    }) => {
      const groupData = await createNewGroup(page.request);
      const { admin } = groupData.users;
      await page.goto('/admin');

      await page
        .getByRole('row')
        .filter({ hasText: admin.email })
        .getByRole('button', { name: 'Remove from group' })
        .click();
      await page.getByRole('button', { name: 'Remove user' }).click();
      await expect(page.locator('#footerAlert')).toHaveText(
        'The group needs an admin, make another user an admin first'
      );

      await page.reload();
      await expect(
        page.getByRole('row').filter({ hasText: admin.email })
      ).toBeVisible();
    });

    test('user cannot remove users from the group', async ({ page }) => {
      const groupData = await createNewGroup(page.request);
      const { user1, user2 } = groupData.users;
      await login(page.request, user1.email, user1.password);

      // users have no UI for this, so the attempt goes through the API
      const response = await removeUserFromGroup(page.request, user2.id);
      expect(response.status()).toBe(403);

      await login(
        page.request,
        groupData.users.admin.email,
        groupData.users.admin.password
      );
      await page.goto('/admin');
      await expect(
        page.getByRole('row').filter({ hasText: user2.email })
      ).toBeVisible();
    });

    test('user cannot change roles', async ({ page }) => {
      const groupData = await createNewGroup(page.request);
      const { user1 } = groupData.users;
      await login(page.request, user1.email, user1.password);

      // users have no UI for this, so the attempt goes through the API
      const response = await page.request.post('admin/api/users', {
        form: {
          'usersRoles[0][_id]': user1.id,
          'usersRoles[0][role]': 'admin',
        },
      });
      expect(response.status()).toBe(403);

      await page.goto('/admin');
      await expect(page).toHaveTitle('Secret Santa');
      await expect(
        page.getByRole('heading', { name: 'Group settings' })
      ).toBeHidden();
    });
  });

  test.describe('drafting pairs tests', () => {
    test('admin can draft pairs', async ({ page }) => {
      await createNewGroup(page.request);
      const nextYear = new Date().getFullYear() + 1;

      await page.goto('/admin');
      await expect(
        page.getByText(`Santa pairs for year ${nextYear} were not drafted yet`)
      ).toBeVisible();

      await page.getByRole('button', { name: 'Draft' }).click();
      await expect(page.locator('#footerAlert')).toHaveText(
        'Pairs successfully drafted'
      );
      await expect(page.getByRole('button', { name: 'Draft' })).toBeDisabled();
      await expect(page.getByRole('button', { name: 'Reveal' })).toBeEnabled();

      await page.reload();
      await expect(
        page.getByText(
          `Santa pairs for year ${nextYear} were already drafted but the pairs were not yet revealed`
        )
      ).toBeVisible();
    });

    test('admin can reveal drafted pairs', async ({ page }) => {
      const groupData = await createDraftedGroup(page.request);

      await page.goto('/admin');

      await page.getByRole('button', { name: 'Reveal' }).click();
      await expect(page.locator('#footerAlert')).toHaveText(
        'Last year successfully revealed'
      );

      await page.goto('/history');
      // pairs are always drafted for the next year
      await expect(page.locator('[data-id="yearTitle"]')).toHaveText(
        String(new Date().getFullYear() + 1)
      );

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

      const { user1, user2 } = groupData.users;
      await addForbiddenPairInDialog(page, user1, user2);
      await expect(page.locator('#footerAlert')).toHaveText(
        'Forbidden pair added'
      );
      await expect(
        forbiddenPairRow(page, user1.name, user2.name)
      ).toBeVisible();

      await page.reload();
      await expect(
        forbiddenPairRow(page, user1.name, user2.name)
      ).toBeVisible();
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

      const { user1, user2 } = groupData.users;
      await addForbiddenPairInDialog(page, user1, user2);
      await expect(page.locator('#footerAlert')).toHaveText(
        'Forbidden pair already exists'
      );
      await expect(forbiddenPairRow(page, user1.name, user2.name)).toHaveCount(
        1
      );
    });

    test('admin can remove a forbidden pair', async ({ page }) => {
      const groupData = await createNewGroup(page.request);
      await login(
        page.request,
        groupData.users.admin.email,
        groupData.users.admin.password
      );
      const { admin, user1, user2 } = groupData.users;
      await addForbiddenPair(page.request, {
        forbiddenUser1Id: user1.id,
        forbiddenUser2Id: user2.id,
      });
      await addForbiddenPair(page.request, {
        forbiddenUser1Id: admin.id,
        forbiddenUser2Id: user2.id,
      });
      await login(page.request, admin.email, admin.password);
      await page.goto('/admin');

      const deletedPairRow = forbiddenPairRow(page, user1.name, user2.name);
      await deletedPairRow.locator('[data-name="pairDelete"]').click();
      await page.getByRole('button', { name: 'Delete pair' }).click();
      await expect(page.locator('#footerAlert')).toHaveText(
        'The forbidden pair was successfully deleted'
      );
      await expect(deletedPairRow).toBeHidden();

      await expect(
        forbiddenPairRow(page, admin.name, user2.name)
      ).toBeVisible();
      await expect(deletedPairRow).toBeHidden();
    });

    test('removing a user deletes their forbidden pairs', async ({ page }) => {
      const groupData = await createNewGroup(page.request);
      const { admin, user1, user2 } = groupData.users;
      await addForbiddenPair(page.request, {
        forbiddenUser1Id: user1.id,
        forbiddenUser2Id: user2.id,
      });
      await addForbiddenPair(page.request, {
        forbiddenUser1Id: admin.id,
        forbiddenUser2Id: user2.id,
      });
      await page.goto('/admin');
      const pairRows = page.locator('[data-name="pairRow"]');
      await expect(pairRows).toHaveCount(2);

      await page
        .getByRole('row')
        .filter({ hasText: user1.email })
        .getByRole('button', { name: 'Remove from group' })
        .click();
      await page.getByRole('button', { name: 'Remove user' }).click();
      await expect(page.locator('#footerAlert')).toContainText(
        `User '${user1.email}' removed from the group`
      );

      await expect(pairRows).toHaveCount(1);
      await expect(pairRows.locator('[data-name="pairUser"]')).toHaveText(
        admin.name
      );
      await expect(
        pairRows.locator('[data-name="pairForbiddenPair"]')
      ).toHaveText(user2.name);
      await expect(
        page.locator(`#forbiddenUser1 option[value="${user1.id}"]`)
      ).toHaveCount(0);

      await expect(
        forbiddenPairRow(page, admin.name, user2.name)
      ).toBeVisible();
      await expect(pairRows).toHaveCount(1);
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
