import { useEffect, useState } from 'react'
import {
  DATE_RANGE_PRESET,
  detectDateRangePreset,
  getDateRangeForPreset,
} from '../../lib/dates'

export default function DateRangeFilter({ from, to, onApplyRange }) {
  const [draftFrom, setDraftFrom] = useState(from)
  const [draftTo, setDraftTo] = useState(to)
  const [period, setPeriod] = useState(() => detectDateRangePreset(from, to))

  useEffect(() => {
    setDraftFrom(from)
    setDraftTo(to)
    setPeriod(detectDateRangePreset(from, to))
  }, [from, to])

  function handlePresetChange(event) {
    const value = event.target.value
    setPeriod(value)

    if (value === DATE_RANGE_PRESET.CUSTOM) {
      return
    }

    const range = getDateRangeForPreset(value)
    if (range) {
      setDraftFrom(range.from)
      setDraftTo(range.to)
      onApplyRange(range.from, range.to, value)
    }
  }

  function handleApplyCustom() {
    setPeriod(DATE_RANGE_PRESET.CUSTOM)
    onApplyRange(draftFrom, draftTo, DATE_RANGE_PRESET.CUSTOM)
  }

  return (
    <div className="utility-card utility-card--flat filter-panel">
      <p className="filter-panel__title">Date range</p>
      <div className="filter-panel__grid">
        <label className="field">
          <span className="field__label">Period</span>
          <select
            className="field__input field__select"
            name="preset"
            value={period}
            onChange={handlePresetChange}
            aria-label="Date range period"
          >
            <option value={DATE_RANGE_PRESET.TODAY}>Today</option>
            <option value={DATE_RANGE_PRESET.WEEK}>This week</option>
            <option value={DATE_RANGE_PRESET.MONTH}>This month</option>
            <option value={DATE_RANGE_PRESET.CUSTOM}>Custom</option>
          </select>
        </label>
        <label className="field">
          <span className="field__label">From</span>
          <input
            className="field__input"
            type="date"
            name="from"
            value={draftFrom}
            onChange={(e) => {
              setDraftFrom(e.target.value)
              setPeriod(DATE_RANGE_PRESET.CUSTOM)
            }}
          />
        </label>
        <label className="field">
          <span className="field__label">To</span>
          <input
            className="field__input"
            type="date"
            name="to"
            value={draftTo}
            onChange={(e) => {
              setDraftTo(e.target.value)
              setPeriod(DATE_RANGE_PRESET.CUSTOM)
            }}
          />
        </label>
        <div className="filter-panel__action">
          <button
            type="button"
            className="btn btn--primary btn--compact"
            onClick={handleApplyCustom}
          >
            Apply filter
          </button>
        </div>
      </div>
    </div>
  )
}
