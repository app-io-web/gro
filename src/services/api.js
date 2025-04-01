const BASE_URL = import.meta.env.VITE_NOCODB_URL
const TOKEN = import.meta.env.VITE_NOCODB_TOKEN

export async function apiGet(endpoint) {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      'xc-token': TOKEN
    }
  })
  return await res.json()
}

export async function apiPost(endpoint, body) {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'xc-token': TOKEN
    },
    body: JSON.stringify(body)
  })
  return await res.json()
}

export async function apiPatch(endpoint, body) {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'xc-token': TOKEN
    },
    body: JSON.stringify(body)
  })
  return await res.json()
}

export async function apiDelete(endpoint) {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'DELETE',
    headers: {
      'xc-token': TOKEN
    }
  })
  return await res.json()
}
