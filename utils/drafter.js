export function draftPairs(users) {
  // prepare a bucket of friends and forbidden pairs
  const friends = [];
  const forbiddenPairs = new Map();

  users.forEach(user => {
    friends.push(user._id.toString());

    const forbiddenUsers = [];
    user.forbiddenPairs?.forEach(pair => {
      forbiddenUsers.push(pair.toString());
    });
    forbiddenPairs.set(user._id.toString(), forbiddenUsers);
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
    if (forbiddenPairs.get(santa).includes(child)) { continue; }
    if (forbiddenPairs.get(child).includes(santa)) { continue; }

    // if the pairing is valid, remove the child from the friends group
    friends.splice(index, 1);

    // add the two pairs in the list
    santaPairs.set(santa, child);

    // now a child gets to be santa
    santa = child;

    // continue till all friends are picked
  }

  // finally, set the last picked friend as a santa for the first one, unless it's forbidden
  if (forbiddenPairs.get(santa).includes(first) || forbiddenPairs.get(first).includes(santa)) {
    return null;
  }

  santaPairs.set(santa, first);

  return santaPairs;
}
