import { useEffect } from 'react'

// Fires onLeave() whenever the learner switches tabs, minimizes, or the
// window loses focus — used by the assessment integrity wrapper.
export function useTabVisibility(onLeave) {
  useEffect(() => {
    function handleVisibility() {
      if (document.hidden) onLeave('tab_hidden')
    }
    function handleBlur() {
      onLeave('window_blur')
    }
    document.addEventListener('visibilitychange', handleVisibility)
    window.addEventListener('blur', handleBlur)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility)
      window.removeEventListener('blur', handleBlur)
    }
  }, [onLeave])
}
