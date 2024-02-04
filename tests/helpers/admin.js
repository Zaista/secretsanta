export function createGroup(request, name) {
  return request.post('admin/api/group/create', {
    form: { groupName: name }
  });
}

export function addUserToGroup(request, email) {
  return request.post('admin/api/user', {
    form: { email }
  });
}

export function draftSantaPairs(request) {
  return request.put('admin/api/draft');
}

export function revealSantaPairs(request) {
  return request.put('admin/api/reveal');
}
