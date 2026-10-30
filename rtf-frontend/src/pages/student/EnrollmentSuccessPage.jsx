
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../../services/api.js'
import { useAuth } from '../../context/AuthContext.jsx'

export default function EnrollmentSuccessPage() {
  const { id } = useParams()
  const { getToken } = useAuth()
  const navigate = useNavigate()

  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const token = await getToken()
        const data = await api.getCourse(id, token)
        setCourse(data)
      } catch (e) {
        console.error('Failed to load course details', e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id, getToken])

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-400">Loading your summary...</div>
  }

  if (!course) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
        <p className="text-red-500 mb-4">Could not load course details.</p>
        <button onClick={() => navigate('/dashboard')} className="text-navy underline">Go to Dashboard</button>
      </div>
    )
  }

  // Dynamically calculate course stats directly from your backend data
  const moduleCount = course.modules?.length || 0
  const lessonCount = course.modules?.reduce((sum, m) => sum + (m.lessons?.length || 0), 0) || 0

  const totalMinutes = course.modules?.reduce((sum, m) =>
    sum + (m.lessons?.reduce((lSum, l) => lSum + (l.estimated_minutes || 0), 0) || 0), 0
  ) || 0
  const totalHours = Math.max(1, Math.round(totalMinutes / 60))

  return (
    <div className="max-w-md mx-auto px-6 py-16 flex flex-col items-center bg-white min-h-screen">

      {/* Checkmark Icon */}
      {/* Updated to Dark Gold with 20% opacity background */}
      <div className="w-28 h-28 bg-[#A88044]/20 rounded-full flex items-center justify-center mb-6">
        <svg className="w-14 h-14 text-[#A88044]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>

      {/* Success Headers */}
      <h1 className="text-2xl font-bold text-gray-900 mb-3">You're Enrolled!</h1>
      <p className="text-sm text-gray-600 mb-10 text-center leading-relaxed">
        You have successfully enrolled in <br />
        <span className="font-semibold text-gray-900">{course.title}</span>
      </p>

      {/* The Summary Card */}
      <div className="w-full border border-gray-200 rounded-xl p-6 mb-10 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-500 mb-5">Your Enrolment Summary</h2>

        <div className="space-y-4">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500 font-medium">Course</span>
            <span className="font-semibold text-gray-900 text-right max-w-[60%] truncate" title={course.title}>
              {course.title}
            </span>
          </div>

          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500 font-medium">Module</span>
            <span className="font-semibold text-gray-900">
              {moduleCount} Mod - {lessonCount} Les
            </span>
          </div>

          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500 font-medium">Duration</span>
            <span className="font-semibold text-gray-900">
              ~{totalHours} Hours
            </span>
          </div>

          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500 font-medium">Certification</span>
            {/* Updated text to Dark Gold */}
            <span className="font-semibold text-[#A88044]">Included On Completion</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="w-full space-y-4">
        <button
          onClick={() => navigate(`/learn/${course.id}`)}
          className="w-full py-4 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 shadow-sm"
        >
          Start Learning
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>

        <button
          onClick={() => navigate('/dashboard')}
          className="w-full py-4 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 hover:bg-gray-50 transition-colors shadow-sm"
        >
          Go to My Dashboard
        </button>
      </div>

    </div>
  )
}