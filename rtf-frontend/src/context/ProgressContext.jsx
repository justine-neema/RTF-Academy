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
    // 1. Call the API
    const data = await api.enroll(courseId)
    // 2. Refresh state so isEnrolled() becomes true
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
    const data = await api.completeLesson(lessonId)
    await refreshEnrollments()
    return data 
  }

  return (
    <ProgressContext.Provider value={{
      enrollments, certificates, loading,
      refreshEnrollments, refreshCertificates,
      enroll, isEnrolled, getEnrollment, completeLesson
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