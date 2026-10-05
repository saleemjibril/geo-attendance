const STORAGE_KEY = 'attendance_device_token'

function createToken() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return null
}

export function getOrCreateDeviceToken() {
  const existing = window.localStorage.getItem(STORAGE_KEY)
  if (existing) {
    return existing
  }

  const token = createToken()
  if (!token) {
    throw new Error('This browser cannot create a secure device token')
  }

  window.localStorage.setItem(STORAGE_KEY, token)
  return token
}
