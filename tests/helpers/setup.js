import { inviteUserToGroup, createGroup, draftSantaPairs, revealSantaPairs } from './admin.js';
import { faker } from '@faker-js/faker';
import { login, registerUser } from './login.js';

export async function createNewGroup(request) {
  const groupData = {
    users: {
      admin: {
        email: faker.internet.email(),
        password: 'test',
        name: faker.person.fullName(),
        address: {
          street: faker.location.street(),
          city: faker.location.city(),
          postalCode: faker.location.zipCode(),
          state: faker.location.state()
        }
      },
      user1: {
        email: faker.internet.email(),
        password: 'test',
        name: faker.person.fullName(),
        address: {
          street: faker.location.street(),
          city: faker.location.city(),
          postalCode: faker.location.zipCode(),
          state: faker.location.state()
        }
      },
      user2: {
        email: faker.internet.email(),
        password: 'test',
        name: faker.person.fullName(),
        address: {
          street: faker.location.street(),
          city: faker.location.city(),
          postalCode: faker.location.zipCode(),
          state: faker.location.state()
        }
      }
    },
    group: {
      name: faker.word.noun()
    }
  };
  const adminData = await registerUser(request, groupData.users.admin);
  groupData.users.admin.id = adminData.id;
  const user1Data = await registerUser(request, groupData.users.user1);
  groupData.users.user1.id = user1Data.id;
  const user2Data = await registerUser(request, groupData.users.user2);
  groupData.users.user2.id = user2Data.id;
  await login(request, groupData.users.admin.email, groupData.users.admin.password);
  await createGroup(request, groupData.group.name);
  await inviteUserToGroup(request, groupData.users.user1.email);
  await inviteUserToGroup(request, groupData.users.user2.email);
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
