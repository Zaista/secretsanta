import { ObjectId } from 'mongodb';

// upper bound on search steps, so an impossible combination of restrictions can't hang the server
const MAX_STEPS = 100000;

/**
 * Drafts santa pairs as a single chain in which every user is santa to the next one, and the last one is santa to the first.
 *
 * @param users list of users with _id
 * @param forbiddenPairs list of { userId, forbiddenPairId }, forbidden in both directions (e.g. married couples)
 * @param previousPairs list of { santaId, childId } from last year, forbidden only in the same direction
 * @returns Map of santa ObjectId -> child ObjectId, or null if no valid draft was found
 */
export function draftPairs(users, forbiddenPairs, previousPairs = []) {
  const friends = users.map((user) => user._id.toString());
  if (friends.length < 2) return null;

  // map of santa -> set of children that santa is not allowed to draft
  const forbiddenMap = new Map();
  const forbid = (santa, child) => {
    if (!forbiddenMap.has(santa)) forbiddenMap.set(santa, new Set());
    forbiddenMap.get(santa).add(child);
  };
  forbiddenPairs.forEach((pair) => {
    forbid(pair.userId.toString(), pair.forbiddenPairId.toString());
    forbid(pair.forbiddenPairId.toString(), pair.userId.toString());
  });
  previousPairs.forEach((pair) => {
    forbid(pair.santaId.toString(), pair.childId.toString());
  });
  const isAllowed = (santa, child) =>
    santa !== child && !forbiddenMap.get(santa)?.has(child);

  // quick check: everyone needs at least one possible child and at least one possible santa
  for (const friend of friends) {
    if (!friends.some((other) => isAllowed(friend, other))) return null;
    if (!friends.some((other) => isAllowed(other, friend))) return null;
  }

  // randomize the order, then search the chain with backtracking
  const shuffled = shuffle(friends);
  const first = shuffled[0];
  const chain = [first];
  const used = new Set([first]);
  let steps = 0;

  const extendChain = () => {
    if (++steps > MAX_STEPS) return false;
    const santa = chain[chain.length - 1];
    if (chain.length === shuffled.length) return isAllowed(santa, first);

    for (const child of shuffle(shuffled)) {
      if (used.has(child) || !isAllowed(santa, child)) continue;
      chain.push(child);
      used.add(child);
      if (extendChain()) return true;
      chain.pop();
      used.delete(child);
    }
    return false;
  };

  if (!extendChain()) return null;

  const santaPairs = new Map();
  chain.forEach((santa, i) => {
    const child = chain[(i + 1) % chain.length];
    santaPairs.set(
      ObjectId.createFromHexString(santa),
      ObjectId.createFromHexString(child)
    );
  });
  return santaPairs;
}

function shuffle(array) {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
