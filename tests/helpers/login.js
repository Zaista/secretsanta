export function registerUser(request, user) {
  return request
    .post('session/api/register', {
      data: user,
    })
    .then((result) => {
      return result.json();
    });
}

export function login(request, email, password) {
  return request.post('session/api/login', {
    data: { username: email, password },
  });
}

export function forgotPassword(request, email) {
  return request.post('session/api/email', {
    data: { email },
  });
}
