export function jsonRequest(url: string, init?: RequestInit) {
  return new Request(url, {
    ...init,
    headers: {
      'content-type': 'application/json',
      ...(init?.headers || {}),
    },
  })
}
