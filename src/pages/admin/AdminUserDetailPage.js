import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import AdminLayout from '../../components/AdminLayout'
import { fetchAdminUserDetail } from '../../api/admin'
import {
  DATE_RANGE_PRESET,
  formatDateRangeLabel,
  todayIsoDate,
} from '../../lib/dates'
import DateRangeFilter from './DateRangeFilter'
import './admin.css'

function formatDateTime(value) {
  if (!value) return '—'
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function readRangeFromParams(searchParams) {
  const from = searchParams.get('from')
  const to = searchParams.get('to')
  if (from && to) {
    return { from, to }
  }
  const today = todayIsoDate()
  return { from: today, to: today }
}

export default function AdminUserDetailPage() {
  const { userId } = useParams()
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

  const [detail, setDetail] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadDetail = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchAdminUserDetail(userId, { from, to })
      setDetail(data)
    } catch (err) {
      if (err.status === 401) {
        navigate('/admin/login', { replace: true })
        return
      }
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [from, to, navigate, userId])

  useEffect(() => {
    loadDetail()
  }, [loadDetail])

  const applyRange = useCallback(
    (nextFrom, nextTo, nextPeriod) => {
      setSearchParams({ from: nextFrom, to: nextTo })
      if (nextPeriod) {
        setPeriodLabel(nextPeriod)
      }
    },
    [setSearchParams]
  )

  const backQuery = new URLSearchParams({ from, to }).toString()
  const rangeLabel = formatDateRangeLabel(from, to, periodLabel)

  return (
    <AdminLayout
      title={detail?.user.name ?? 'User detail'}
      subtitle={detail ? `ID ${detail.user.externalId} · ${rangeLabel}` : rangeLabel}
      onSignOut={() => navigate('/admin/login', { replace: true })}
    >
      <p className="caption" style={{ marginBottom: 'var(--space-md)' }}>
        <Link className="text-link" to={`/admin?${backQuery}`}>
          ← Back to dashboard
        </Link>
      </p>

      {detail && (
        <div className="user-hero">
          <p className="user-hero__name">{detail.user.name}</p>
          <p className="user-hero__meta">
            <span translate="no">{detail.user.externalId}</span> · {detail.user.phone}
          </p>
        </div>
      )}

      <div className="stat-grid stat-grid--two">
        <article className="stat-card">
          <p className="stat-card__label">Days in period</p>
          <p className="stat-card__value">{detail?.attendanceCount ?? '—'}</p>
        </article>
        <article className="stat-card">
          <p className="stat-card__label">Phone</p>
          <p className="stat-card__value" style={{ fontSize: '21px' }}>
            {detail?.user.phone ?? '—'}
          </p>
        </article>
      </div>

      <DateRangeFilter from={from} to={to} onApplyRange={applyRange} />

      {error && (
        <p className="message message--error" role="alert">{error}</p>
      )}
      {loading && <p className="message message--muted">Loading…</p>}

      {!loading && detail && (
        <section className="table-section" aria-labelledby="attendance-table-title">
          <div className="section-head">
            <h2 id="attendance-table-title">Attendance history</h2>
            <span className="caption">{detail.attendance.length} records</span>
          </div>
          <div className="table-shell">
            <table className="data-table">
              <thead>
                <tr>
                  <th scope="col">Date</th>
                  <th scope="col">Marked at</th>
                  <th scope="col" className="num">Distance (m)</th>
                </tr>
              </thead>
              <tbody>
                {detail.attendance.length === 0 && (
                  <tr>
                    <td colSpan={3}>No attendance in this period.</td>
                  </tr>
                )}
                {detail.attendance.map((row) => (
                  <tr key={row.id}>
                    <td>{row.date}</td>
                    <td>{formatDateTime(row.markedAt)}</td>
                    <td className="num">{row.distanceMeters}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </AdminLayout>
  )
}
