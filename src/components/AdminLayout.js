import { Link } from 'react-router-dom'
import { clearAdminToken } from '../admin/auth'

export default function AdminLayout({
  title,
  subtitle,
  children,
  onSignOut,
}) {
  function signOut() {
    clearAdminToken()
    onSignOut?.()
  }

  return (
    <>
      <header className="global-nav">
        <Link className="global-nav__brand" to="/admin">
          Attendance
        </Link>
        <nav className="global-nav__links" aria-label="Global">
          <Link className="global-nav__link" to="/check-in">
            Check-in
          </Link>
          <button
            type="button"
            className="btn btn--dark-utility"
            onClick={signOut}
          >
            Sign out
          </button>
        </nav>
      </header>

      <div className="sub-nav-frosted">
        <div>
          <h1 className="sub-nav-frosted__title">{title}</h1>
          {subtitle && <p className="sub-nav-frosted__meta">{subtitle}</p>}
        </div>
      </div>

      <main className="page-content">{children}</main>
    </>
  )
}
