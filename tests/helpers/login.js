export async function registerUser(request, email, password) {
  await request.post('session/api/register', {
    form: { email, password }
  });
  await request.get('session/logout');
}

export async function login(request, email, password) {
  await request.post('session/api/login', {
    form: { username: email, password }
  });
}
