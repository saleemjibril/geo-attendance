import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import AdminLayout from '../../components/AdminLayout'
import { fetchAdminUsers } from '../../api/admin'
import {
  DATE_RANGE_PRESET,
  formatDateRangeLabel,
  todayIsoDate,
} from '../../lib/dates'
import DateRangeFilter from './DateRangeFilter'
import './admin.css'

function readRangeFromParams(searchParams) {
  const from = searchParams.get('from')
  const to = searchParams.get('to')
  if (from && to) {
    return { from, to }
  }
  const today = todayIsoDate()
  return { from: today, to: today }
}

export default function AdminDashboardPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [periodLabel, setPeriodLabel] = useState(DATE_RANGE_PRESET.TODAY)

  const { from, to } = readRangeFromParams(searchParams)

  useEffect(() => {
    if (!searchParams.get('from') || !searchParams.get('to')) {
      const today = todayIsoDate()
      setSearchParams({ from: today, to: today }, { replace: true })
    }
  }, [searchParams, setSearchParams])

  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadUsers = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchAdminUsers({ from, to })
      setUsers(data.users)
    } catch (err) {
      if (err.status === 401) {
        navigate('/admin/login', { replace: true })
        return
      }
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [from, to, navigate])

  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  const stats = useMemo(() => {
    const totalCheckIns = users.reduce((sum, u) => sum + u.attendanceCount, 0)
    const activeUsers = users.filter((u) => u.attendanceCount > 0).length
    return {
      registered: users.length,
      totalCheckIns,
      activeUsers,
    }
  }, [users])

  const applyRange = useCallback(
    (nextFrom, nextTo, nextPeriod) => {
      setSearchParams({ from: nextFrom, to: nextTo })
      if (nextPeriod) {
        setPeriodLabel(nextPeriod)
      }
    },
    [setSearchParams]
  )

  const rangeLabel = formatDateRangeLabel(from, to, periodLabel)

  return (
    <AdminLayout
      title="Dashboard"
      subtitle={`Reporting period: ${rangeLabel}`}
      onSignOut={() => navigate('/admin/login', { replace: true })}
    >
      <div className="stat-grid" aria-busy={loading}>
        <article className="stat-card">
          <p className="stat-card__label">Registered users</p>
          <p className="stat-card__value">{stats.registered}</p>
        </article>
        <article className="stat-card">
          <p className="stat-card__label">Attendance records</p>
          <p className="stat-card__value">{stats.totalCheckIns}</p>
        </article>
        <article className="stat-card">
          <p className="stat-card__label">Users with attendance</p>
          <p className="stat-card__value">{stats.activeUsers}</p>
        </article>
      </div>

      <DateRangeFilter from={from} to={to} onApplyRange={applyRange} />

      {error && (
        <p className="message message--error" role="alert">{error}</p>
      )}
      {loading && (
        <p className="message message--muted">Loading users…</p>
      )}

      {!loading && !error && (
        <section className="table-section" aria-labelledby="users-table-title">
          <div className="section-head">
            <h2 id="users-table-title">All users</h2>
            <span className="caption">{users.length} total</span>
          </div>
          <div className="table-shell">
            <table className="data-table">
              <thead>
                <tr>
                  <th scope="col">Name</th>
                  <th scope="col">ID</th>
                  <th scope="col">Phone</th>
                  <th scope="col" className="num">Days</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 && (
                  <tr>
                    <td colSpan={4}>No users yet.</td>
                  </tr>
                )}
                {users.map((user) => {
                  const detailParams = new URLSearchParams({ from, to })
                  const query = detailParams.toString()

                  return (
                    <tr key={user.id}>
                      <td>
                        <Link
                          className="text-link"
                          to={`/admin/users/${user.id}?${query}`}
                        >
                          {user.name}
                        </Link>
                      </td>
                      <td translate="no">{user.externalId}</td>
                      <td>{user.phone}</td>
                      <td className="num">{user.attendanceCount}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </AdminLayout>
  )
}
