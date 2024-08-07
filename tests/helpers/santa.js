export function getSanta(request) {
  return request.get('api/santa').then((result) => {
    return result.json();
  });
}
