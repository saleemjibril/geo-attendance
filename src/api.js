// Leave unset in local dev to use CRA proxy (package.json → port 4000).
const API_BASE = process.env.REACT_APP_API_URL ?? ''

async function parseJsonResponse(response) {
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    const error = new Error(data.error || 'Request failed')
    error.status = response.status
    error.code = data.code
    error.details = data
    throw error
  }
  return data
}

export async function fetchVenueConfig() {
  const response = await fetch(`${API_BASE}/api/config`)
  return parseJsonResponse(response)
}

export async function lookupUser(externalId) {
  const encoded = encodeURIComponent(externalId.trim())
  const response = await fetch(`${API_BASE}/api/users/${encoded}`)
  return parseJsonResponse(response)
}

export async function checkIn(payload) {
  const response = await fetch(`${API_BASE}/api/check-in`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  return parseJsonResponse(response)
}
