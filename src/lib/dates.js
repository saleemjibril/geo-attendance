/** Local calendar date as YYYY-MM-DD (matches HTML date inputs). */
export function todayIsoDate(date = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

/** Monday as the first day of the week. */
export function startOfWeekIsoDate(date = new Date()) {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const weekday = d.getDay()
  const daysFromMonday = weekday === 0 ? 6 : weekday - 1
  d.setDate(d.getDate() - daysFromMonday)
  return todayIsoDate(d)
}

export function startOfMonthIsoDate(date = new Date()) {
  const d = new Date(date.getFullYear(), date.getMonth(), 1)
  return todayIsoDate(d)
}

export const DATE_RANGE_PRESET = {
  TODAY: 'today',
  WEEK: 'week',
  MONTH: 'month',
  CUSTOM: 'custom',
}

export function getDateRangeForPreset(preset) {
  const today = todayIsoDate()
  const now = new Date()

  switch (preset) {
    case DATE_RANGE_PRESET.TODAY:
      return { from: today, to: today }
    case DATE_RANGE_PRESET.WEEK:
      return { from: startOfWeekIsoDate(now), to: today }
    case DATE_RANGE_PRESET.MONTH:
      return { from: startOfMonthIsoDate(now), to: today }
    default:
      return null
  }
}

export function detectDateRangePreset(from, to) {
  if (!from || !to) return DATE_RANGE_PRESET.CUSTOM

  // Week/month before today — on Monday, "this week" and "today" share the same dates
  const week = getDateRangeForPreset(DATE_RANGE_PRESET.WEEK)
  if (from === week.from && to === week.to) {
    return DATE_RANGE_PRESET.WEEK
  }

  const month = getDateRangeForPreset(DATE_RANGE_PRESET.MONTH)
  if (from === month.from && to === month.to) {
    return DATE_RANGE_PRESET.MONTH
  }

  const today = getDateRangeForPreset(DATE_RANGE_PRESET.TODAY)
  if (from === today.from && to === today.to) {
    return DATE_RANGE_PRESET.TODAY
  }

  return DATE_RANGE_PRESET.CUSTOM
}

export function formatDateRangeLabel(from, to, preferredPreset) {
  const preset = preferredPreset ?? detectDateRangePreset(from, to)
  if (preset === DATE_RANGE_PRESET.TODAY) return 'Today'
  if (preset === DATE_RANGE_PRESET.WEEK) return 'This week'
  if (preset === DATE_RANGE_PRESET.MONTH) return 'This month'
  if (from || to) return `${from || '…'} → ${to || '…'}`
  return 'All time'
}
