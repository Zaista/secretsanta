export function draftPairs(users, forbiddenPairs) {
  // prepare a drafting bucket of friends
  const friends = [];

  const forbiddenPairsMap = new Map();
  const santaPairs = new Map();

  users.forEach((user) => {
    friends.push(user._id.toString());
  });

  // transform array of forbidden pairs into a map, for ease of use
  forbiddenPairs.forEach((pair) => {
    if (forbiddenPairsMap.get(pair.userId.toString()) === undefined) {
      forbiddenPairsMap.set(pair.userId.toString(), [
        pair.forbiddenPairId.toString(),
      ]);
    } else {
      forbiddenPairsMap
        .get(pair.userId.toString())
        .push(pair.forbiddenPairId.toString());
    }
  });

  // pick one name randomly from the bucket to start with to be our current santa
  const first = friends.splice(
    Math.floor(Math.random() * friends.length),
    1
  )[0];
  let santa = first;
  let child;

  // then while there are still names in the bucket
  while (friends.length > 0) {
    // create a temporary list of potential children for current santa
    const temporaryList = Array(friends.length)
      .fill()
      .map((x, i) => i);
    while (temporaryList.length >= 0) {
      // if the list runs outs, tough luck
      if (temporaryList.length === 0) {
        return null;
      }

      // pick a child name from the temporary list
      const childIndex = temporaryList.splice(
        Math.floor(Math.random() * temporaryList.length),
        1
      )[0];
      child = friends[childIndex];

      // if you happen to pick up a forbidden pair, continue with other children in temporary list
      if (forbiddenPairsMap.get(santa)?.includes(child)) {
        continue;
      }
      if (forbiddenPairsMap.get(child)?.includes(santa)) {
        continue;
      }

      // if the pairing is valid, remove the child from the friends list as well
      const index = friends.indexOf(child);
      friends.splice(index, 1);

      // add the two pairs in the santaPairs list
      santaPairs.set(santa, child);

      // now a child gets to be santa
      santa = child;

      // break out of pooling for potential pair as you've found one, and start anew
      break;
    }
  }

  if (friends.length > 0) return null;

  // finally, set the last picked friend as a santa for the first one, unless it's forbidden
  if (
    forbiddenPairsMap.get(santa)?.includes(first) ||
    forbiddenPairsMap.get(first)?.includes(santa)
  ) {
    return null;
  }

  santaPairs.set(santa, first);

  return santaPairs;
}
