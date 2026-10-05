import { clearAdminToken, getAdminToken } from '../admin/auth'

const API_BASE = process.env.REACT_APP_API_URL ?? ''

async function parseJsonResponse(response) {
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    const error = new Error(data.error || 'Request failed')
    error.status = response.status
    error.code = data.code
    throw error
  }
  return data
}

function authHeaders() {
  const token = getAdminToken()
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

export async function adminLogin(username, password) {
  const response = await fetch(`${API_BASE}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })
  return parseJsonResponse(response)
}

export async function fetchAdminUsers({ from, to } = {}) {
  const params = new URLSearchParams()
  if (from) params.set('from', from)
  if (to) params.set('to', to)

  const query = params.toString()
  const response = await fetch(
    `${API_BASE}/api/admin/users${query ? `?${query}` : ''}`,
    { headers: authHeaders() }
  )

  if (response.status === 401) {
    clearAdminToken()
  }

  return parseJsonResponse(response)
}

export async function fetchAdminUserDetail(userId, { from, to } = {}) {
  const params = new URLSearchParams()
  if (from) params.set('from', from)
  if (to) params.set('to', to)

  const query = params.toString()
  const response = await fetch(
    `${API_BASE}/api/admin/users/${encodeURIComponent(userId)}${query ? `?${query}` : ''}`,
    { headers: authHeaders() }
  )

  if (response.status === 401) {
    clearAdminToken()
  }

  return parseJsonResponse(response)
}

export async function unbindAdminUserDevice(userId) {
  const response = await fetch(
    `${API_BASE}/api/admin/users/${encodeURIComponent(userId)}/device`,
    {
      method: 'DELETE',
      headers: authHeaders(),
    }
  )

  if (response.status === 401) {
    clearAdminToken()
  }

  return parseJsonResponse(response)
}
