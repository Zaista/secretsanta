import {
  inviteUserToGroup,
  createGroup,
  draftSantaPairs,
  revealSantaPairs,
} from './admin.js';
import { faker } from '@faker-js/faker';
import { login, registerUser } from './login.js';

export function getDefaultData() {
  return {
    users: {
      admin: {
        email: faker.internet.email(),
        password: 'test',
        name: faker.person.fullName(),
        address: {
          street: faker.location.street(),
          city: faker.location.city(),
          postalCode: faker.location.zipCode(),
          state: faker.location.state(),
        },
      },
      user1: {
        email: faker.internet.email(),
        password: 'test',
        name: faker.person.fullName(),
        address: {
          street: faker.location.street(),
          city: faker.location.city(),
          postalCode: faker.location.zipCode(),
          state: faker.location.state(),
        },
      },
      user2: {
        email: faker.internet.email(),
        password: 'test',
        name: faker.person.fullName(),
        address: {
          street: faker.location.street(),
          city: faker.location.city(),
          postalCode: faker.location.zipCode(),
          state: faker.location.state(),
        },
      },
    },
    group: {
      name: faker.word.noun(),
    },
  };
}

export async function createNewGroup(request, groupData = getDefaultData()) {
  for (let user in groupData.users) {
    const userData = await registerUser(request, groupData.users[user]);
    groupData.users[user].id = userData.id;
  }
  await login(
    request,
    groupData.users.admin.email,
    groupData.users.admin.password
  );
  await createGroup(request, groupData.group.name);
  for (let user in groupData.users) {
    if (user === 'admin') {
      continue;
    }
    await inviteUserToGroup(request, groupData.users[user].email);
  }
  return groupData;
}

export async function createDraftedGroup(request) {
  const groupData = await createNewGroup(request);
  await draftSantaPairs(request);
  return groupData;
}

export async function createRevealedGroup(request) {
  const groupData = await createDraftedGroup(request);
  await revealSantaPairs(request);
  return groupData;
}
