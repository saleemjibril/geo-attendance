const TOKEN_KEY = 'attendance_admin_token'

export function getAdminToken() {
  return window.localStorage.getItem(TOKEN_KEY)
}

export function setAdminToken(token) {
  window.localStorage.setItem(TOKEN_KEY, token)
}

export function clearAdminToken() {
  window.localStorage.removeItem(TOKEN_KEY)
}

export function isAdminLoggedIn() {
  return Boolean(getAdminToken())
}
