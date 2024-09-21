export function createGroup(request, name) {
  return request.post('admin/api/group/create', {
    form: { groupName: name },
  });
}

export function updateGroup(request, groupData) {
  return request.post('admin/api/group', {
    data: groupData,
  });
}

export function inviteUserToGroup(request, email) {
  return request
    .post('admin/api/user', {
      form: { email },
    })
    .then((result) => {
      return result.json();
    });
}

export function draftSantaPairs(request) {
  return request.put('admin/api/draft').then((result) => {
    return result.json();
  });
}

export function addForbiddenPair(request, forbiddenPair) {
  return request
    .post('admin/api/forbidden', {
      form: forbiddenPair,
    })
    .then((result) => {
      return result.json();
    });
}

export function removeForbiddenPair(request, forbiddenPairId) {
  return request.post('admin/api/forbidden/delete', {
    data: { _id: forbiddenPairId },
  });
}

export function revealSantaPairs(request) {
  return request.put('admin/api/reveal');
}
