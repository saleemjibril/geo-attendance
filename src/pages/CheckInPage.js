import { useCallback, useEffect, useState } from 'react'
import { checkIn, fetchVenueConfig, lookupUser } from '../api'
import CheckInModal from '../components/CheckInModal'
import PublicLayout from '../components/PublicLayout'
import { useGeolocation } from '../hooks/useGeolocation'
import './CheckInPage.css'

function formatAccuracy(meters) {
  if (meters == null) return '—'
  return `${Math.round(meters)} m`
}

export default function CheckInPage() {
  const geo = useGeolocation()
  const [venue, setVenue] = useState(null)
  const [venueError, setVenueError] = useState(null)

  const [externalId, setExternalId] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [userKnown, setUserKnown] = useState(null)
  const [lookupState, setLookupState] = useState('idle')

  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState(null)
  const [modal, setModal] = useState(null)

  useEffect(() => {
    fetchVenueConfig()
      .then((data) => {
        setVenue(data)
        if (!data.configured) {
          setVenueError(data.message)
        }
      })
      .catch(() => {
        setVenueError('Could not load venue settings. Is the API running?')
      })
  }, [])

  const runLookup = useCallback(async (id) => {
    const trimmed = id.trim()
    if (!trimmed) {
      setUserKnown(null)
      setLookupState('idle')
      return
    }

    setLookupState('loading')
    setFormError(null)
    try {
      const result = await lookupUser(trimmed)
      setUserKnown(result.exists)
      if (result.exists) {
        setName(result.user.name)
        setPhone(result.user.phone)
      } else {
        setName('')
        setPhone('')
      }
      setLookupState('done')
    } catch {
      setLookupState('error')
      setUserKnown(null)
    }
  }, [])

  useEffect(() => {
    const trimmed = externalId.trim()
    if (!trimmed) {
      setUserKnown(null)
      setLookupState('idle')
      return undefined
    }

    const timer = window.setTimeout(() => {
      runLookup(trimmed)
    }, 400)

    return () => window.clearTimeout(timer)
  }, [externalId, runLookup])

  async function handleSubmit(event) {
    event.preventDefault()
    setFormError(null)

    if (geo.status !== 'ready') {
      setFormError('Waiting for your location. Allow location access and try again.')
      return
    }

    setSubmitting(true)
    try {
      const result = await checkIn({
        externalId: externalId.trim(),
        name: userKnown ? undefined : name.trim(),
        phone: userKnown ? undefined : phone.trim(),
        latitude: geo.latitude,
        longitude: geo.longitude,
        accuracyMeters: geo.accuracyMeters,
      })
      setModal({ type: 'success', data: result })
      setExternalId('')
      setName('')
      setPhone('')
      setUserKnown(null)
      setLookupState('idle')
    } catch (err) {
      if (err.code === 'REGISTRATION_REQUIRED') {
        setUserKnown(false)
      }
      if (err.code === 'ALREADY_CHECKED_IN') {
        setModal({
          type: 'already',
          markedAt: err.details?.markedAt,
        })
        return
      }
      if (err.code === 'OUTSIDE_GEOFENCE') {
        setFormError(
          `${err.message} If you are testing from a laptop, the browser may be using an approximate (wrong) location — try on a phone at the venue with GPS enabled.`
        )
      } else {
        setFormError(err.message)
      }
    } finally {
      setSubmitting(false)
    }
  }

  const needsRegistration = userKnown === false
  const locationReady = geo.status === 'ready'
  const canSubmit =
    externalId.trim() &&
    locationReady &&
    venue?.configured &&
    !submitting &&
    (userKnown === true || (needsRegistration && name.trim() && phone.trim()))

  return (
    <PublicLayout>
      <section className="tile-light check-in-hero">
        <p className="tagline">Attendance</p>
        <h1 className="display-lg">Mark your attendance.</h1>
        <p className="lead check-in-hero__lead">
          Scan the QR code at the venue, allow location, then enter your ID.
        </p>
      </section>

      <div className="tile-parchment">
        <div className="check-in-stack page-content page-content--narrow">
          <section className="utility-card" aria-live="polite">
            <h2 className="check-in-card__title">Location</h2>
            {venue?.configured && (
              <p className="caption check-in-card__venue">
                {venue.venueName} · within {venue.radiusMeters} m
              </p>
            )}
            {venueError && (
              <p className="message message--error">{venueError}</p>
            )}
            {geo.status === 'loading' && (
              <p className="message message--muted">Getting your location…</p>
            )}
            {geo.error && (
              <p className="message message--error">{geo.error}</p>
            )}
            {locationReady && (
              <>
                <p className="message message--ok">
                  Location ready · accuracy {formatAccuracy(geo.accuracyMeters)}
                </p>
                <p className="coords" translate="no">
                  {geo.latitude.toFixed(6)}, {geo.longitude.toFixed(6)}
                </p>
              </>
            )}
            {venue?.geofenceEnforced === false && (
              <p className="message message--muted">
                Geofence is off for local development.
              </p>
            )}
            <button
              type="button"
              className="btn btn--pearl btn--primary-full"
              onClick={geo.refresh}
              disabled={geo.status === 'loading'}
            >
              {geo.status === 'loading' ? 'Refreshing…' : 'Refresh location'}
            </button>
          </section>

          <form className="utility-card" onSubmit={handleSubmit} noValidate>
            <h2 className="check-in-card__title">Your details</h2>

            <label className="field">
              <span className="field__label">ID</span>
              <input
                className="field__input"
                name="externalId"
                autoComplete="off"
                inputMode="text"
                required
                value={externalId}
                onChange={(e) => setExternalId(e.target.value)}
                placeholder="Employee or student ID"
              />
            </label>

            {lookupState === 'loading' && (
              <p className="message message--muted">Looking up ID…</p>
            )}
            {userKnown === true && (
              <p className="message message--ok">
                Welcome back, {name}. Confirm to mark attendance.
              </p>
            )}
            {needsRegistration && (
              <>
                <p className="message message--muted">
                  First time here? Complete your profile below.
                </p>
                <label className="field">
                  <span className="field__label">Full name</span>
                  <input
                    className="field__input"
                    name="name"
                    autoComplete="name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </label>
                <label className="field">
                  <span className="field__label">Phone number</span>
                  <input
                    className="field__input"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    inputMode="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+234…"
                  />
                </label>
              </>
            )}

            {formError && (
              <p className="message message--error" role="alert">{formError}</p>
            )}

            <button
              type="submit"
              className="btn btn--primary btn--primary-full"
              disabled={!canSubmit}
            >
              {submitting ? 'Submitting…' : 'Mark attendance'}
            </button>
          </form>
        </div>
      </div>

      <CheckInModal
        open={modal?.type === 'success'}
        title="Attendance recorded"
        onClose={() => setModal(null)}
      >
        {modal?.type === 'success' && (
          <p>
            <strong>{modal.data.user.name}</strong> ({modal.data.user.externalId})
            checked in at {modal.data.attendance.venueName}.
          </p>
        )}
      </CheckInModal>

      <CheckInModal
        open={modal?.type === 'already'}
        title="Already checked in"
        onClose={() => setModal(null)}
      >
        <p>
          Attendance has already been marked for today.
          {modal?.markedAt && (
            <>
              {' '}
              Recorded at{' '}
              {new Intl.DateTimeFormat(undefined, {
                dateStyle: 'medium',
                timeStyle: 'short',
              }).format(new Date(modal.markedAt))}
              .
            </>
          )}
        </p>
      </CheckInModal>
    </PublicLayout>
  )
}
