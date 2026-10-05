import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { setAdminToken, isAdminLoggedIn } from '../../admin/auth'
import { adminLogin } from '../../api/admin'
import PublicLayout from '../../components/PublicLayout'
import './admin.css'

export default function AdminLoginPage() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  if (isAdminLoggedIn()) {
    return <Navigate to="/admin" replace />
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const { token } = await adminLogin(username.trim(), password)
      setAdminToken(token)
      navigate('/admin', { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <PublicLayout>
      <div className="admin-login-wrap">
        <form className="utility-card admin-login-card" onSubmit={handleSubmit}>
          <p className="tagline">Admin</p>
          <h1 className="display-lg">Sign in</h1>
          <p className="lead" style={{ marginBottom: 'var(--space-lg)' }}>
            View attendance records and reports.
          </p>

          <label className="field">
            <span className="field__label">Username</span>
            <input
              className="field__input"
              name="username"
              autoComplete="username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </label>

          <label className="field">
            <span className="field__label">Password</span>
            <input
              className="field__input"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>

          {error && (
            <p className="message message--error" role="alert">{error}</p>
          )}

          <button
            type="submit"
            className="btn btn--primary btn--primary-full"
            disabled={submitting}
          >
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="caption" style={{ marginTop: 'var(--space-lg)' }}>
          <Link className="text-link" to="/check-in">Back to check-in</Link>
        </p>
      </div>
    </PublicLayout>
  )
}
