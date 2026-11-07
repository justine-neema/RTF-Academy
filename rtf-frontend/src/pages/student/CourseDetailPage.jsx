import { Link, useNavigate, useParams } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../../context/AuthContext.jsx'
import { useProgress } from '../../context/ProgressContext.jsx'
import { api } from '../../services/api.js'
import Button from '../../components/common/Button.jsx'
import { useState } from 'react'

export default function CourseDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const { isEnrolled, enroll } = useProgress()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [enrolling, setEnrolling] = useState(false)
  const [error, setError] = useState('')

  // React Query caches the course data instantly
  const { data: course, isLoading } = useQuery({
    queryKey: ['course', id],
    queryFn: () => api.getCourse(id),
    enabled: !!id,
  })

  async function handleEnroll() {
    if (!user) return navigate('/login')
    setEnrolling(true)
    setError('')
    
    try {
      await enroll(id)
      // Tell React Query to refresh the course so the modules unlock
      queryClient.invalidateQueries({ queryKey: ['course', id] })
      queryClient.invalidateQueries({ queryKey: ['enrollments'] })
      
      navigate(`/enrollment-success/${id}`)
    } catch (e) {
      setError(e.message || 'Enrollment failed. Please try again.')
    } finally {
      setEnrolling(false)
    }
  }

  if (isLoading) return <div className="py-16 text-center text-gray-400">Loading course...</div>
  if (error) return <p className="text-center py-16 text-red-500">{error}</p>
  if (!course) return null

  const totalLessons = course.modules?.reduce((sum, m) => sum + (m.lessons?.length || 0), 0) || 0
  const enrolled = isEnrolled(id)

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link to="/courses" className="text-sm text-navy mb-4 inline-block hover:underline">← Back to Courses</Link>
      
      <h1 className="text-2xl md:text-3xl font-bold text-navy mb-2">{course.title}</h1>
      <p className="text-sm text-gray-500 mb-6">{course.modules?.length || 0} modules · {totalLessons} lessons</p>

      {error && <p className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-md mb-4">{error}</p>}

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {course.description && (
            <div className="border border-gray-100 rounded-lg p-5 bg-white shadow-card">
              <p className="font-semibold text-navy mb-2 text-lg">About this course</p>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{course.description}</p>
            </div>
          )}
          {course.outcomes && course.outcomes.length > 0 && (
            <div className="border border-gray-100 rounded-lg p-6 bg-white shadow-card">
              <h2 className="font-semibold text-gray-500 mb-4">What You Will Learn</h2>
              <ul className="text-sm text-gray-800 space-y-4">
                {course.outcomes.map((outcome, idx) => (
                  <li key={idx} className="leading-snug flex gap-2">
                    <span className="text-[#D19A30] font-bold">✓</span> {outcome}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <aside className="md:col-span-1">
          <div className="border border-gray-100 rounded-lg p-5 bg-white shadow-card sticky top-24">
            <div className="mb-6 pb-6 border-b border-gray-100">
              {enrolled ? (
                <Button className="w-full" onClick={() => navigate(`/learn/${id}`)}>Go to Course</Button>
              ) : (
                <Button className="w-full" onClick={handleEnroll} disabled={enrolling}>
                  {enrolling ? 'Enrolling...' : 'Enroll Now — Free'}
                </Button>
              )}
            </div>
            <p className="font-semibold text-navy mb-4">Syllabus Preview</p>
            <div className="space-y-4">
              {course.modules?.map((m, idx) => (
                <div key={m.id}>
                  <div className="flex items-start gap-2 mb-2">
                    <span className="shrink-0 w-6 h-6 rounded-full bg-navy text-white text-xs flex items-center justify-center">{idx + 1}</span>
                    <div>
                      <span className="font-medium text-navy block leading-tight">{m.title}</span>
                      <span className="text-xs text-gray-400">{m.lessons?.length || 0} lessons</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}