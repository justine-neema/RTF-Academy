import { useCallback, useEffect, useRef, useState } from 'react'
import { useTabVisibility } from '../../hooks/useTabVisibility.js'

/**
 * Wraps an assessment/quiz with lightweight academic-integrity measures.
 * This is a deterrent, not a lockdown browser — it's meant to discourage
 * casual copy-pasting into an AI tool / looking up answers, and to give
 * facilitators a simple, transparent flag on submissions worth a second look.
 *
 * It intentionally does NOT: record the screen, access the camera/mic,
 * block the browser back button, or silently report anything — the
 * learner sees exactly what is being tracked, via the banner below.
 */
export default function QuizIntegrityWrapper({ children, onViolation, maxWarnings = 3 }) {
  const [violations, setViolations] = useState([])
  const [dismissed, setDismissed] = useState(false)
  const warningTimeout = useRef(null)
  const [showWarning, setShowWarning] = useState(false)

  const registerViolation = useCallback(
    (type) => {
      setViolations((prev) => {
        const next = [...prev, { type, at: Date.now() }]
        return next
      })
      setShowWarning(true)
      onViolation?.(type)
      clearTimeout(warningTimeout.current)
      warningTimeout.current = setTimeout(() => setShowWarning(false), 4000)
    },
    [onViolation]
  )

  useTabVisibility(registerViolation)

  useEffect(() => {
    function blockCopyPaste(e) {
      e.preventDefault()
      registerViolation(e.type) // 'copy' | 'paste' | 'cut'
    }
    function blockContextMenu(e) {
      e.preventDefault()
    }
    document.addEventListener('copy', blockCopyPaste)
    document.addEventListener('paste', blockCopyPaste)
    document.addEventListener('cut', blockCopyPaste)
    document.addEventListener('contextmenu', blockContextMenu)
    return () => {
      document.removeEventListener('copy', blockCopyPaste)
      document.removeEventListener('paste', blockCopyPaste)
      document.removeEventListener('cut', blockCopyPaste)
      document.removeEventListener('contextmenu', blockContextMenu)
    }
  }, [registerViolation])

  const flagged = violations.length >= maxWarnings

  return (
    <div className="integrity-lock relative">
      {!dismissed && (
        <div className="bg-blue-50 border border-blue-100 text-blue-800 text-xs rounded-md px-3 py-2 mb-4 flex items-start justify-between gap-3">
          <p>
            <strong>Academic Integrity Notice:</strong> this assessment tracks copy/paste attempts
            and tab switches. Please answer using only your own knowledge. Facilitators may review
            flagged attempts.
          </p>
          <button onClick={() => setDismissed(true)} className="text-blue-500 shrink-0">✕</button>
        </div>
      )}

      {showWarning && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-md px-3 py-2 mb-4">
          ⚠ Activity outside the quiz was detected ({violations.length}/{maxWarnings} warnings). Repeated
          activity will flag this submission for facilitator review.
        </div>
      )}

      {flagged && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-md px-3 py-2 mb-4">
          This attempt has been flagged for review due to repeated activity outside the quiz. You can
          still submit — a facilitator will follow up if needed.
        </div>
      )}

      {children({ violations, flagged })}
    </div>
  )
}
