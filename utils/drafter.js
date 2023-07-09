export function draftPairs(users, forbiddenPairs) {
  // prepare a bucket of friends and forbidden pairs
  const friends = [];
  const forbiddenPairsMap = new Map();

  users.forEach(user => {
    friends.push(user._id.toString());
  });

  forbiddenPairs.forEach(pair => {
    if (forbiddenPairsMap.get(pair.userId.toString()) === undefined) {
      forbiddenPairsMap.set(pair.userId.toString(), [pair.forbiddenPairId.toString()]);
    } else {
      forbiddenPairsMap.get(pair.userId.toString()).push(pair.forbiddenPairId.toString());
    }
  });

  // get an empty list where you will write secret santa pairs
  const santaPairs = new Map();

  // pick one name randomly from the bucket to start with
  const first = friends.splice(Math.floor(Math.random() * friends.length), 1)[0];
  let santa = first;

  // then for all the other friends, but set a limit
  let counter = 0;
  while (friends.length > 0) {
    // if limit is reached, break out
    counter += 1;
    if (counter > 30) {
      return null;
    }

    // pick a child, temporarily
    const index = Math.floor(Math.random() * friends.length);
    const child = friends[index];

    // check if you picked a forbidden pair, and if so try again
    if (forbiddenPairsMap.get(santa)?.includes(child)) { continue; }
    if (forbiddenPairsMap.get(child)?.includes(santa)) { continue; }

    // if the pairing is valid, remove the child from the friends group
    friends.splice(index, 1);

    // add the two pairs in the list
    santaPairs.set(santa, child);

    // now a child gets to be santa
    santa = child;

    // continue till all friends are picked
  }

  // finally, set the last picked friend as a santa for the first one, unless it's forbidden
  if (forbiddenPairsMap.get(santa)?.includes(first) || forbiddenPairsMap.get(first)?.includes(santa)) {
    return null;
  }

  santaPairs.set(santa, first);

  return santaPairs;
}
