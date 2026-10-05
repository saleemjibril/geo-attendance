import { Link } from 'react-router-dom'

export default function PublicLayout({ children }) {
  return (
    <>
      <header className="global-nav">
        <span className="global-nav__brand">Attendance</span>
        <nav className="global-nav__links" aria-label="Global">
          <Link className="global-nav__link" to="/admin/login">
            Admin
          </Link>
        </nav>
      </header>
      {children}
    </>
  )
}
