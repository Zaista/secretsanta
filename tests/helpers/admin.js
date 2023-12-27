export async function createGroup(request, name) {
  await request.post('admin/api/group/create', {
    form: { groupName: name }
  });
}

export async function addUserToGroup(request, email) {
  await request.post('admin/api/user', {
    form: { email }
  });
}
