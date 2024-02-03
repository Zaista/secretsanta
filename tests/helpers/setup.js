import { addUserToGroup, createGroup, draftSantaPairs, revealSantaPairs } from './admin.js';
import { faker } from '@faker-js/faker';
import { login, registerUser } from './login.js';

export async function createDraftedGroup(request) {
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
  await registerUser(request, groupData.users.admin);
  await registerUser(request, groupData.users.user1);
  await registerUser(request, groupData.users.user2);
  await login(request, groupData.users.admin.email, groupData.users.admin.password);
  await createGroup(request, groupData.group.name);
  await addUserToGroup(request, groupData.users.user1.email);
  await addUserToGroup(request, groupData.users.user2.email);
  await draftSantaPairs(request);
  return groupData;
}

export async function createRevealedGroup(request) {
  const groupData = await createDraftedGroup(request);
  await revealSantaPairs(request);
  return groupData;
}
