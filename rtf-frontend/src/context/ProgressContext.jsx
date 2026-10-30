import { createContext, useContext, useCallback, useEffect, useState } from 'react'
import { useAuth } from './AuthContext.jsx'
import { api } from '../services/api.js'

const ProgressContext = createContext(null)

export function ProgressProvider({ children }) {
  const { user, getToken } = useAuth()
  const [enrollments, setEnrollments] = useState([])
  const [certificates, setCertificates] = useState([])

  const refreshEnrollments = useCallback(async () => {
    const token = await getToken()
    if (!token) return
    try {
      const data = await api.listEnrollments(token)
      setEnrollments(Array.isArray(data) ? data : [])
    } catch (e) {
      console.error('[RTF] refreshEnrollments failed:', e)
    }
  }, [getToken])

  const refreshCertificates = useCallback(async () => {
    const token = await getToken()
    if (!token) return
    try {
      const data = await api.myCertificates(token)
      setCertificates(Array.isArray(data) ? data : [])
    } catch (e) {
      console.error('[RTF] refreshCertificates failed:', e)
    }
  }, [getToken])

  // Reload whenever the logged-in user changes
  useEffect(() => {
    if (user) {
      refreshEnrollments()
      refreshCertificates()
    } else {
      setEnrollments([])
      setCertificates([])
    }
  }, [user, refreshEnrollments, refreshCertificates])

  function _getCourseId(e) {
    // enrollment.course can be a UUID string or a nested object
    return e.course && typeof e.course === 'object' ? e.course.id : e.course
  }

  async function enroll(courseId) {
    const token = await getToken()
    const data = await api.enroll(courseId, token)
    await refreshEnrollments()
    return data
  }

  function isEnrolled(courseId) {
    return enrollments.some((e) => String(_getCourseId(e)) === String(courseId))
  }

  function getEnrollment(courseId) {
    return enrollments.find((e) => String(_getCourseId(e)) === String(courseId)) || null
  }

  async function completeLesson(lessonId) {
    const token = await getToken()
    const data = await api.completeLesson(lessonId, token)
    await refreshEnrollments()
    return data  // { lesson_id, progress_percentage, course_completed, certificate_earned? }
  }

  function allEnrollments() { return enrollments }

  // Frontend-only integrity logging (no backend endpoint)
  function logIntegrityEvent(courseId, event) {
    console.log('[Integrity]', courseId, event)
  }

  return (
    <ProgressContext.Provider value={{
      enrollments, certificates,
      refreshEnrollments, refreshCertificates,
      enroll, isEnrolled, getEnrollment, completeLesson, allEnrollments, logIntegrityEvent,
    }}>
      {children}
    </ProgressContext.Provider>
  )
}

export function useProgress() {
  const ctx = useContext(ProgressContext)
  if (!ctx) throw new Error('useProgress must be inside ProgressProvider')
  return ctx
}
