import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { useProgress } from '../../context/ProgressContext.jsx'
import { api } from '../../services/api.js'
import Button from '../../components/common/Button.jsx'

export default function CourseDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const { isEnrolled, enroll } = useProgress()
  const navigate = useNavigate()

  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [enrolling, setEnrolling] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const data = await api.getCourse(id)
        setCourse(data)
      } catch (err) {
        console.error(err)
        setError('Course not found.')
      }
      setLoading(false)
    }
    load()
  }, [id])

  async function handleEnroll() {
    if (!user) return navigate('/login')
    setEnrolling(true)
    setError('')
    
    try {
      // 1. Send the request to Django
      await enroll(id)
      
      // 2. THE ONLY CHANGE: Re-fetch the course so the modules unlock immediately
      const updatedCourse = await api.getCourse(id)
      setCourse(updatedCourse)

      // 3. If successful, navigate to the success page
      navigate(`/enrollment-success/${id}`)
    } catch (e) {
      console.error("Enrollment error:", e)
      setError(e.message || 'Enrollment failed. Please try again.')
    } finally {
      setEnrolling(false)
    }
  }

  if (loading) return <div className="py-16 text-center text-gray-400">Loading course...</div>
  if (error) return <p className="text-center py-16 text-red-500">{error}</p>
  if (!course) return null

  const totalLessons = course.modules?.reduce((sum, m) => sum + (m.lessons?.length || 0), 0) || 0
  const enrolled = isEnrolled(id)

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link to="/courses" className="text-sm text-navy mb-4 inline-block hover:underline">← Back to Courses</Link>
      
      <h1 className="text-2xl md:text-3xl font-bold text-navy mb-2">{course.title}</h1>
      <p className="text-sm text-gray-500 mb-6">
        {course.modules?.length || 0} modules · {totalLessons} lessons
      </p>

      {/* Show error message if enrollment fails */}
      {error && <p className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-md mb-4">{error}</p>}

      <div className="grid md:grid-cols-3 gap-6">
        {/* Left Column: Course Details */}
        <div className="md:col-span-2 space-y-6">
          {course.description && (
            <div className="border border-gray-100 rounded-lg p-5 bg-white shadow-card">
              <p className="font-semibold text-navy mb-2 text-lg">About this course</p>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                {course.description}
              </p>
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

        {/* Right Column: Syllabus & Action */}
        <aside className="md:col-span-1">
          <div className="border border-gray-100 rounded-lg p-5 bg-white shadow-card sticky top-24">
            
            {/* Enrollment Action */}
            <div className="mb-6 pb-6 border-b border-gray-100">
              {enrolled ? (
                <Button className="w-full" onClick={() => navigate(`/learn/${id}`)}>
                  Go to Course
                </Button>
              ) : (
                <Button className="w-full" onClick={handleEnroll} disabled={enrolling}>
                  {enrolling ? 'Enrolling...' : 'Enroll Now — Free'}
                </Button>
              )}
            </div>

            {/* Syllabus Preview */}
            <p className="font-semibold text-navy mb-4">Syllabus Preview</p>
            <div className="space-y-4">
              {course.modules?.map((m, idx) => (
                <div key={m.id}>
                  <div className="flex items-start gap-2 mb-2">
                    <span className="shrink-0 w-6 h-6 rounded-full bg-navy text-white text-xs flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <div>
                      <span className="font-medium text-navy block leading-tight">{m.title}</span>
                      <span className="text-xs text-gray-400">{m.lessons?.length || 0} lessons</span>
                    </div>
                  </div>
                  
                  {/* Read-only lesson list preview */}
                  <div className="ml-8 space-y-1.5 border-l-2 border-gray-100 pl-3">
                    {(m.lessons || []).slice(0, 3).map((lesson) => (
                      <p key={lesson.id} className="text-xs text-gray-500 truncate">
                        • {lesson.title}
                      </p>
                    ))}
                    {(m.lessons?.length || 0) > 3 && (
                      <p className="text-xs text-gray-400 italic">
                        + {m.lessons.length - 3} more lessons
                      </p>
                    )}
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