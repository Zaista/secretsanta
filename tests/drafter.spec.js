// @ts-check
import { test, expect } from '@playwright/test';
import { ObjectId } from 'mongodb';
import { draftPairs } from '../utils/drafter.js';

function createUsers(count) {
  return Array.from({ length: count }, () => ({ _id: new ObjectId() }));
}

// converts drafted Map to a plain { santa: child } object of hex strings
function toPairs(santaPairs) {
  const pairs = {};
  santaPairs.forEach((child, santa) => {
    pairs[santa.toString()] = child.toString();
  });
  return pairs;
}

function expectSingleChain(users, pairs) {
  const ids = users.map((user) => user._id.toString());
  expect(Object.keys(pairs).sort()).toEqual([...ids].sort());
  expect(Object.values(pairs).sort()).toEqual([...ids].sort());

  // following santa -> child from any user should visit everyone before coming back
  let current = ids[0];
  for (let i = 0; i < ids.length; i++) {
    expect(pairs[current]).not.toEqual(current);
    current = pairs[current];
    if (i < ids.length - 1) expect(current).not.toEqual(ids[0]);
  }
  expect(current).toEqual(ids[0]);
}

test.describe('drafter tests', () => {
  test('drafts everyone into a single chain', () => {
    const users = createUsers(10);
    for (let i = 0; i < 20; i++) {
      expectSingleChain(users, toPairs(draftPairs(users, [])));
    }
  });

  test('does not draft groups with less than two users', () => {
    expect(draftPairs([], [])).toBeNull();
    expect(draftPairs(createUsers(1), [])).toBeNull();
  });

  test('respects multiple forbidden pairs per user in both directions', () => {
    const users = createUsers(6);
    const [a, b, c] = users.map((user) => user._id);
    const forbiddenPairs = [
      { userId: a, forbiddenPairId: b },
      { userId: a, forbiddenPairId: c },
    ];
    for (let i = 0; i < 20; i++) {
      const pairs = toPairs(draftPairs(users, forbiddenPairs));
      expectSingleChain(users, pairs);
      expect(pairs[a.toString()]).not.toEqual(b.toString());
      expect(pairs[a.toString()]).not.toEqual(c.toString());
      expect(pairs[b.toString()]).not.toEqual(a.toString());
      expect(pairs[c.toString()]).not.toEqual(a.toString());
    }
  });

  test('returns null when forbidden pairs make drafting impossible', () => {
    const users = createUsers(3);
    const forbiddenPairs = [
      { userId: users[1]._id, forbiddenPairId: users[2]._id },
    ];
    expect(draftPairs(users, forbiddenPairs)).toBeNull();
  });

  test('avoids pairs from last year', () => {
    const users = createUsers(8);
    const lastYear = toPairs(draftPairs(users, []));
    const previousPairs = Object.entries(lastYear).map(([santa, child]) => ({
      santaId: ObjectId.createFromHexString(santa),
      childId: ObjectId.createFromHexString(child),
    }));
    for (let i = 0; i < 20; i++) {
      const pairs = toPairs(draftPairs(users, [], previousPairs));
      expectSingleChain(users, pairs);
      for (const santa in pairs) {
        expect(pairs[santa]).not.toEqual(lastYear[santa]);
      }
    }
  });

  test('pairs from last year are forbidden only in the same direction', () => {
    // with three users the only chain that avoids a->b->c->a is the reverse one
    const users = createUsers(3);
    const [a, b, c] = users.map((user) => user._id);
    const previousPairs = [
      { santaId: a, childId: b },
      { santaId: b, childId: c },
      { santaId: c, childId: a },
    ];
    const pairs = toPairs(draftPairs(users, [], previousPairs));
    expect(pairs).toEqual({
      [a.toString()]: c.toString(),
      [c.toString()]: b.toString(),
      [b.toString()]: a.toString(),
    });
  });

  test('returns null when pairs from last year cannot be avoided', () => {
    const users = createUsers(2);
    const [a, b] = users.map((user) => user._id);
    const previousPairs = [
      { santaId: a, childId: b },
      { santaId: b, childId: a },
    ];
    expect(draftPairs(users, [], previousPairs)).toBeNull();
  });

  test('gives up on impossible large groups without hanging', () => {
    const users = createUsers(30);
    const forbiddenPairs = users
      .slice(1)
      .map((user) => ({ userId: users[0]._id, forbiddenPairId: user._id }));
    expect(draftPairs(users, forbiddenPairs)).toBeNull();
  });
});
