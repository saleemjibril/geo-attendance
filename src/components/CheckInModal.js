import { useEffect, useRef } from 'react'
import './CheckInModal.css'

export default function CheckInModal({ open, title, children, onClose }) {
  const closeRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined

    closeRef.current?.focus()

    function onKeyDown(event) {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', onKeyDown)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = prevOverflow
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="check-in-modal">
      <button
        type="button"
        className="check-in-modal__backdrop"
        aria-label="Close dialog"
        onClick={onClose}
      />
      <div
        className="check-in-modal__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="check-in-modal-title"
      >
        <h2 id="check-in-modal-title" className="check-in-modal__title">
          {title}
        </h2>
        <div className="check-in-modal__body">{children}</div>
        <button
          ref={closeRef}
          type="button"
          className="btn btn--primary check-in-modal__close"
          onClick={onClose}
        >
          OK
        </button>
      </div>
    </div>
  )
}
