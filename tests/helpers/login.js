export function registerUser(request, user) {
  return request.post('session/api/register', {
    data: user
  });
}

export function login(request, email, password) {
  return request.post('session/api/login', {
    data: { username: email, password }
  });
}
