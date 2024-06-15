export function sendMessage(request, message) {
  return request
    .post('chat/api/send', {
      form: message,
    })
    .then((result) => {
      return result.json();
    });
}
