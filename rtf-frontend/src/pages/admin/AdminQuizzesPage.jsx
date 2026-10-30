import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { adminQuizApi, api } from '../../services/api.js'
import { useAuth } from '../../context/AuthContext.jsx'

export default function AdminQuizzesPage() {
  const { getToken } = useAuth()
  const navigate = useNavigate()

  const [quizzes, setQuizzes] = useState([])
  const [courses, setCourses] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Track selected quiz for deletion modal
  const [quizToDelete, setQuizToDelete] = useState(null)

  useEffect(() => {
    async function loadData() {
      try {
        const token = await getToken()

        // Fetch quizzes and basic courses
        const [quizData, basicCourses] = await Promise.all([
          adminQuizApi.getQuizzes(token),
          api.listCourses(token)
        ])

        // Fetch full course data
        const fullCourses = await Promise.all(
          (Array.isArray(basicCourses) ? basicCourses : []).map(c => api.getCourse(c.id, token))
        )

        // Map module ID to course title
        const modCourseMap = {}
        fullCourses.forEach(course => {
          (course.modules || []).forEach(mod => {
            modCourseMap[mod.id] = course.title
          })
        })

        setCourses(modCourseMap)
        setQuizzes(quizData)
      } catch (err) {
        setError('Failed to load data.')
      }
      setLoading(false)
    }
    loadData()
  }, [getToken])

  // Execute actual deletion
  const confirmDelete = async () => {
    if (!quizToDelete) return

    try {
      const token = await getToken()
      await adminQuizApi.deleteQuiz(quizToDelete.id, token)
      setQuizzes(quizzes.filter(q => q.id !== quizToDelete.id))
    } catch (err) {
      alert('Failed to delete quiz.')
    }
    setQuizToDelete(null)
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-xl font-bold text-navy mb-1">Quiz Management</h1>
          <p className="text-gray-500 text-sm">Manage all module assessments.</p>
        </div>

        <button
          onClick={() => navigate('/admin/courses')}
          className="bg-navy text-white text-sm font-semibold px-4 py-2 rounded-md hover:bg-navy/90 transition-colors shadow-sm whitespace-nowrap"
        >
          Create Quiz in Course Builder
        </button>
      </div>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      {loading ? (
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow-card rounded-lg border border-[#D19A30]/50 w-full overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[#D19A30]/30">
              <thead className="bg-[#D19A30]/5">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-[#D19A30] uppercase tracking-wider w-1/4">Course</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-[#D19A30] uppercase tracking-wider w-1/4">Module</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-[#D19A30] uppercase tracking-wider w-1/4">Quiz Title</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-[#D19A30] uppercase tracking-wider">Questions</th>
                  <th className="px-6 py-3 text-right text-xs font-bold text-[#D19A30] uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-[#D19A30]/20">
                {quizzes.map((quiz) => (
                  <tr key={quiz.id}>
                    <td className="px-6 py-4 text-sm text-gray-500 align-top">
                      {courses[quiz.module] || 'Unknown Course'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 align-top">
                      {quiz.module_title}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-navy align-top">
                      {quiz.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 align-top">
                      {quiz.question_count || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium align-top">
                      <Link to={`/admin/quizzes/module/${quiz.module}`} className="text-[#D19A30] hover:text-yellow-600 mr-4">
                        Edit
                      </Link>
                      {/* Open custom modal instead of window.confirm */}
                      <button onClick={() => setQuizToDelete(quiz)} className="text-red-600 hover:text-red-900">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {quizzes.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                      No quizzes found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {quizToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-fade-in border border-gray-100">
            <div className="flex items-center gap-3 mb-4 text-red-600">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6h18"></path>
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
              </svg>
              <h2 className="text-lg font-bold text-navy">Delete Quiz?</h2>
            </div>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
              Are you sure you want to delete <span className="font-bold text-navy">"{quizToDelete.title}"</span>? This will permanently remove all questions associated with it. This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setQuizToDelete(null)}
                className="px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors shadow-sm"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}