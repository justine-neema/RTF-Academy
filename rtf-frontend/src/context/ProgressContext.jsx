import { createContext, useContext, useCallback, useEffect, useState } from 'react'
import { useAuth } from './AuthContext.jsx'
import { api } from '../services/api.js'

const ProgressContext = createContext(null)

export function ProgressProvider({ children }) {
  const { user } = useAuth()
  const [enrollments, setEnrollments] = useState([])
  const [certificates, setCertificates] = useState([])
  const [loading, setLoading] = useState(true)

  const refreshEnrollments = useCallback(async () => {
    if (!user) return
    try {
      // api.js automatically handles the token
      const data = await api.listEnrollments()
      setEnrollments(Array.isArray(data) ? data : [])
    } catch (e) {
      console.error('Failed to refresh enrollments:', e)
    }
  }, [user])

  const refreshCertificates = useCallback(async () => {
    if (!user) return
    try {
      const data = await api.myCertificates()
      setCertificates(Array.isArray(data) ? data : [])
    } catch (e) {
      console.error('Failed to refresh certificates:', e)
    }
  }, [user])

  // Load data when user logs in
  useEffect(() => {
    async function loadData() {
      if (user) {
        setLoading(true)
        await Promise.all([refreshEnrollments(), refreshCertificates()])
      } else {
        setEnrollments([])
        setCertificates([])
      }
      setLoading(false)
    }
    loadData()
  }, [user, refreshEnrollments, refreshCertificates])

  function _getCourseId(e) {
    return e.course && typeof e.course === 'object' ? e.course.id : e.course
  }

  async function enroll(courseId) {
    const data = await api.enroll(courseId)
    await refreshEnrollments() // Refresh the list so the UI updates instantly
    return data
  }

  function isEnrolled(courseId) {
    return enrollments.some((e) => String(_getCourseId(e)) === String(courseId))
  }

  function getEnrollment(courseId) {
    return enrollments.find((e) => String(_getCourseId(e)) === String(courseId)) || null
  }

  async function completeLesson(lessonId) {
    const data = await api.completeLesson(lessonId)
    await refreshEnrollments()
    return data 
  }

  function allEnrollments() { 
    return enrollments 
  }

  return (
    <ProgressContext.Provider value={{
      enrollments, certificates, loading,
      refreshEnrollments, refreshCertificates,
      enroll, isEnrolled, getEnrollment, completeLesson, allEnrollments
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