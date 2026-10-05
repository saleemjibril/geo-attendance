import { useCallback, useEffect, useState } from 'react'

const defaultState = {
  status: 'idle',
  latitude: null,
  longitude: null,
  accuracyMeters: null,
  error: null,
}

export function useGeolocation({ watch = true } = {}) {
  const [state, setState] = useState(defaultState)

  const readPosition = useCallback((position) => {
    setState({
      status: 'ready',
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracyMeters: position.coords.accuracy,
      error: null,
    })
  }, [])

  const readError = useCallback((error) => {
    setState({
      status: 'error',
      latitude: null,
      longitude: null,
      accuracyMeters: null,
      error: error.message || 'Unable to read your location',
    })
  }, [])

  const refresh = useCallback(() => {
    if (!navigator.geolocation) {
      setState({
        status: 'error',
        latitude: null,
        longitude: null,
        accuracyMeters: null,
        error: 'Geolocation is not supported on this device',
      })
      return
    }

    setState((prev) => ({ ...prev, status: 'loading', error: null }))
    navigator.geolocation.getCurrentPosition(readPosition, readError, {
      enableHighAccuracy: true,
      timeout: 20_000,
      maximumAge: 10_000,
    })
  }, [readError, readPosition])

  useEffect(() => {
    refresh()
    if (!watch || !navigator.geolocation) {
      return undefined
    }

    const watchId = navigator.geolocation.watchPosition(readPosition, readError, {
      enableHighAccuracy: true,
      maximumAge: 15_000,
    })

    return () => navigator.geolocation.clearWatch(watchId)
  }, [readError, readPosition, refresh, watch])

  return { ...state, refresh }
}
