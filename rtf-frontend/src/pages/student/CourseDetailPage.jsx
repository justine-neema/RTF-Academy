import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { useProgress } from '../../context/ProgressContext.jsx'
import { api } from '../../services/api.js'
import { COURSES as MOCK_COURSES } from '../../data/mockData'
import Button from '../../components/common/Button.jsx'

export default function CourseDetailPage() {
  const { id } = useParams()
  const { user, getToken } = useAuth()
  const { isEnrolled, enroll } = useProgress()
  const navigate = useNavigate()

  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [enrolling, setEnrolling] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const token = await getToken()
        const data = await api.getCourse(id, token)
        setCourse(data)
      } catch {
        setError('Course not found.')
      }
      setLoading(false)
    }
    load()
  }, [id, getToken])

  async function handleEnroll() {
    if (!user) return navigate('/login')
    setEnrolling(true)
    try {
      await enroll(id)
      navigate(`/enrollment-success/${id}`)
    } catch (e) {
      setError(e.message || 'Enrollment failed.')
    }
    setEnrolling(false)
  }

  if (loading) return <div className="py-16 text-center text-gray-400">Loading course…</div>
  if (error) return <p className="text-center py-16 text-red-500">{error}</p>
  if (!course) return null

  const totalLessons = (course.modules || []).reduce((sum, m) => sum + (m.lessons?.length || 0), 0)
  const enrolled = isEnrolled(id)

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link to="/courses" className="text-sm text-navy mb-4 inline-block">← Back to Courses</Link>
      <h1 className="text-2xl md:text-3xl font-bold text-navy mb-2">{course.title}</h1>
      <p className="text-sm text-gray-500 mb-6">
        {course.modules?.length || 0} modules · {totalLessons} lessons
      </p>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Left Column: Course Details */}
        <div className="md:col-span-2">
          {course.description && (
            <div className="border border-gray-100 rounded-lg p-5 mb-4 bg-white shadow-card">
              <p className="font-semibold text-navy mb-2 text-lg">About this course</p>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                {course.description}
              </p>
            </div>
          )}

          {/* Corrected: What You will Learn Card (Matches Mockup) */}
          {course.outcomes && course.outcomes.length > 0 && (
            <div className="border border-gray-100 rounded-lg p-6 mb-4 bg-white shadow-card">
              <h2 className="font-semibold text-gray-500 mb-4">What You will Learn</h2>
              <ul className="text-sm text-gray-800 space-y-4">
                {course.outcomes.map((outcome, idx) => (
                  <li key={idx} className="leading-snug">
                    {outcome}
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
                  {enrolling ? 'Enrolling…' : 'Enroll Now — Free'}
                </Button>
              )}
            </div>

            {/* Syllabus Preview */}
            <p className="font-semibold text-navy mb-4">Syllabus Preview</p>
            <div className="space-y-4">
              {(course.modules || []).map((m, idx) => (
                <div key={m.id} className="text-sm">
                  <div className="flex items-start gap-2 mb-2">
                    <span className="shrink-0 w-6 h-6 rounded-full bg-navy text-white text-xs flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <div>
                      <span className="font-medium text-navy block leading-tight">{m.title}</span>
                      <span className="text-xs text-gray-400">{m.lessons?.length || 0} lessons</span>
                    </div>
                  </div>

                  {/* Read-only lesson list (Preview) */}
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

//triggering rebuild