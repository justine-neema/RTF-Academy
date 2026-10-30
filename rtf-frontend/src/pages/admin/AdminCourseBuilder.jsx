import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../services/api.js'
import { useAuth } from '../../context/AuthContext.jsx'
import Button from '../../components/common/Button.jsx'

// Updated Field component for cleaner focus states
function Field({ label, value, onChange, type = 'text', placeholder = '' }) {
  return (
    <div className="mb-4">
      <label className="block text-xs font-bold text-navy mb-1.5">{label}</label>
      {type === 'textarea'
        ? <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
            rows={4} className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm text-navy focus:outline-none focus:border-[#D19A30] focus:ring-1 focus:ring-[#D19A30] transition-colors" />
        : <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
            className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm text-navy focus:outline-none focus:border-[#D19A30] focus:ring-1 focus:ring-[#D19A30] transition-colors" />
      }
    </div>
  )
}

export default function AdminCourseBuilder() {
  const { getToken } = useAuth()
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  // activeTab replaces expandedCourse. 'new' shows the create form, an ID shows the course editor.
  const [activeTab, setActiveTab] = useState('new')

  // Track selected course for deletion modal
  const [courseToDelete, setCourseToDelete] = useState(null)

  const [newCourse, setNewCourse] = useState({ title: '', description: '', is_published: true, outcomes: '' })
  const [newModule, setNewModule] = useState({})
  const [newLesson, setNewLesson] = useState({})

  async function refresh() {
    const token = await getToken()
    const data = await api.listCourses(token)
    const full = await Promise.all(
      (Array.isArray(data) ? data : []).map((c) => api.getCourse(c.id, token))
    )
    setCourses(full)
  }

  useEffect(() => {
    refresh().catch((e) => setError(e.message)).finally(() => setLoading(false))
  }, [])

  async function handleCreateCourse() {
    if (!newCourse.title.trim()) return
    setSaving(true)
    try {
      const token = await getToken()
      const outcomesArray = newCourse.outcomes
        ? newCourse.outcomes.split('\n').map(line => line.trim()).filter(Boolean)
        : []

      const payload = {
        title: newCourse.title,
        description: newCourse.description,
        is_published: newCourse.is_published,
        outcomes: outcomesArray
      }

      await api.createCourse(payload, token)
      setNewCourse({ title: '', description: '', is_published: true, outcomes: '' })
      await refresh()
    } catch (e) { setError(e.message) }
    setSaving(false)
  }

  // Execute actual deletion
  async function confirmDeleteCourse() {
    if (!courseToDelete) return
    try {
      const token = await getToken()
      await api.deleteCourse(courseToDelete.id, token)
      setActiveTab('new') // Reset view to creation form after deleting
      await refresh()
    } catch (e) {
      setError(e.message)
    }
    setCourseToDelete(null)
  }

  async function handleCreateModule(courseId) {
    const title = (newModule[courseId] || '').trim()
    if (!title) return
    const course = courses.find((c) => c.id === courseId)
    const seq = (course?.modules?.length || 0) + 1
    setSaving(true)
    try {
      const token = await getToken()
      await api.createModule(courseId, { title, sequence_order: seq }, token)
      setNewModule((p) => ({ ...p, [courseId]: '' }))
      await refresh()
    } catch (e) { setError(e.message) }
    setSaving(false)
  }

  async function handleCreateLesson(moduleId, courseId) {
    const key = `${courseId}_${moduleId}`
    const state = newLesson[key] || {}
    if (!state.title?.trim()) return
    const course = courses.find((c) => c.id === courseId)
    const mod = (course?.modules || []).find((m) => m.id === moduleId)
    const seq = (mod?.lessons?.length || 0) + 1
    setSaving(true)
    try {
      const token = await getToken()
      await api.createLesson(moduleId, {
        title: state.title,
        text_content: state.text_content || '',
        video_s3_url: state.video_s3_url || null,
        sequence_order: seq,
        estimated_minutes: parseInt(state.estimated_minutes) || 10,
      }, token)
      setNewLesson((p) => ({ ...p, [key]: {} }))
      await refresh()
    } catch (e) { setError(e.message) }
    setSaving(false)
  }

  if (loading) return <p className="text-center py-16 text-gray-400">Loading workspace…</p>

  const activeCourse = courses.find(c => c.id === activeTab)
  // Fallback to 'new' if the activeTab ID somehow doesn't exist anymore
  if (!activeCourse && activeTab !== 'new') setActiveTab('new')

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] max-w-6xl mx-auto px-4 py-6 relative">

      {/* Header Area */}
      <div className="flex items-center justify-between mb-6 flex-shrink-0">
        <h1 className="text-2xl font-bold text-navy">Course Builder</h1>
        <Link to="/admin" className="text-sm font-semibold text-[#D19A30] hover:underline">
          ← Back to Dashboard
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4 flex-shrink-0 flex justify-between items-center">
          <span>{error}</span>
          <button onClick={() => setError('')} className="underline font-semibold">Dismiss</button>
        </div>
      )}

      {/* DUAL PANE WORKSPACE */}
      <div className="flex flex-col md:flex-row gap-6 flex-1 min-h-0 overflow-hidden">

        {/* LEFT SIDEBAR (Scrollable list of courses) */}
        <div className="md:w-72 flex flex-col gap-2 overflow-y-auto pr-2 pb-10 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">

          {/* Create New Course Button */}
          <button
            onClick={() => setActiveTab('new')}
            className={`text-left px-5 py-4 rounded-xl border transition-all duration-200 shadow-sm ${
              activeTab === 'new' 
                ? 'bg-[#D19A30] text-white border-[#D19A30]' 
                : 'bg-white text-[#D19A30] border-[#D19A30]/40 hover:bg-[#D19A30]/10'
            }`}
          >
            <span className="font-bold text-sm tracking-wide">+ Create New Course</span>
          </button>

          <div className="h-px bg-gray-200 my-2"></div>

          {/* Existing Courses List */}
          {courses.map((course) => (
            <button
              key={course.id}
              onClick={() => setActiveTab(course.id)}
              className={`text-left px-5 py-4 rounded-xl border transition-all duration-200 shadow-sm ${
                activeTab === course.id 
                  ? 'bg-navy text-white border-navy' 
                  : 'bg-white text-navy border-gray-200 hover:border-navy/30'
              }`}
            >
              <p className="font-bold text-sm truncate">{course.title}</p>
              <p className={`text-xs mt-1.5 font-medium ${activeTab === course.id ? 'text-gray-300' : 'text-gray-500'}`}>
                {(course.modules || []).length} modules · {(course.modules || []).reduce((s, m) => s + (m.lessons?.length || 0), 0)} lessons
              </p>
            </button>
          ))}
        </div>

        {/* RIGHT WORKSPACE (Scrollable forms) */}
        <div className="flex-1 bg-white border border-[#D19A30]/40 rounded-2xl shadow-card overflow-y-auto p-6 md:p-8 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">

          {/* VIEW: CREATE NEW COURSE */}
          {activeTab === 'new' && (
            <div className="max-w-2xl animate-fade-in">
              <h2 className="text-xl font-bold text-navy mb-6 border-b border-gray-100 pb-4">Draft a New Course</h2>

              <Field label="Course Title" value={newCourse.title} onChange={(v) => setNewCourse((p) => ({ ...p, title: v }))} placeholder="e.g., Introduction to Web Development" />
              <Field label="Description" value={newCourse.description} onChange={(v) => setNewCourse((p) => ({ ...p, description: v }))} type="textarea" placeholder="Brief overview of the course..." />
              <Field
                label="What You Will Learn (Outcomes)"
                value={newCourse.outcomes}
                onChange={(v) => setNewCourse((p) => ({ ...p, outcomes: v }))}
                type="textarea"
                placeholder="Enter each outcome on a new line...&#10;e.g., Build a complete React app&#10;Understand database architecture"
              />

              <label className="flex items-center gap-3 text-sm font-semibold text-navy mb-6 mt-4 p-3 bg-gray-50 rounded-lg border border-gray-100 w-fit">
                <input type="checkbox" checked={newCourse.is_published} onChange={(e) => setNewCourse((p) => ({ ...p, is_published: e.target.checked }))} className="w-4 h-4 text-navy accent-navy" />
                Publish immediately to learners
              </label>

              <Button onClick={handleCreateCourse} disabled={saving || !newCourse.title.trim()} className="px-8">
                {saving ? 'Creating...' : 'Create Course'}
              </Button>
            </div>
          )}

          {/* VIEW: EDIT EXISTING COURSE */}
          {activeTab !== 'new' && activeCourse && (
            <div className="animate-fade-in">
              {/* Header & Delete Button */}
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8 border-b border-gray-100 pb-6">
                <div>
                  <h2 className="text-2xl font-bold text-navy leading-tight">{activeCourse.title}</h2>
                  <p className="text-sm font-medium text-gray-500 mt-2">
                    {(activeCourse.modules || []).length} modules · {(activeCourse.modules || []).reduce((s, m) => s + (m.lessons?.length || 0), 0)} total lessons
                  </p>
                </div>

                {/* Open custom modal instead of window.confirm */}
                <button
                  onClick={() => setCourseToDelete(activeCourse)}
                  className="text-xs border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-lg font-bold transition-colors whitespace-nowrap shadow-sm"
                >
                  Delete Course
                </button>
              </div>

              {/* Modules List */}
              <div className="space-y-6">
                {(activeCourse.modules || []).map((mod) => {
                  const lessonKey = `${activeCourse.id}_${mod.id}`
                  const ls = newLesson[lessonKey] || {}
                  return (
                    <div key={mod.id} className="border border-[#D19A30]/30 bg-[#D19A30]/5 rounded-xl p-5 shadow-sm">

                      {/* Module header w/ quiz button */}
                      <div className="flex justify-between items-center mb-4">
                        <p className="font-bold text-lg text-navy flex items-center gap-2">
                          <span className="text-[#D19A30]">📦</span> {mod.title}
                        </p>
                        <Link
                          to={`/admin/quizzes/module/${mod.id}`}
                          className="text-xs font-semibold bg-white border border-[#D19A30] text-[#D19A30] hover:bg-[#D19A30] hover:text-white px-3 py-1.5 rounded-md transition-colors shadow-sm"
                        >
                          Manage Quiz
                        </Link>
                      </div>

                      {/* Existing Lessons */}
                      {mod.lessons?.length > 0 && (
                        <div className="space-y-2 mb-6">
                          {mod.lessons.map((l) => (
                            <div key={l.id} className="flex justify-between items-center bg-white border border-[#D19A30]/20 rounded-lg p-3 shadow-sm">
                              <span className="text-sm font-semibold text-navy truncate flex-1 pl-2 border-l-2 border-[#D19A30]">
                                {l.title}
                              </span>
                              <span className="text-xs font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded">
                                {l.estimated_minutes || 0}m
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Add New Lesson Form */}
                      <div className="bg-white border border-gray-200 rounded-xl p-5">
                        <p className="text-sm font-bold text-navy mb-4">Add New Lesson</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
                          <div className="md:col-span-2">
                            <Field label="Lesson Title" value={ls.title || ''} onChange={(v) => setNewLesson((p) => ({ ...p, [lessonKey]: { ...ls, title: v } }))} placeholder="e.g., Introduction to Components" />
                          </div>
                          <div className="md:col-span-2">
                            <Field label="Text Content" value={ls.text_content || ''} onChange={(v) => setNewLesson((p) => ({ ...p, [lessonKey]: { ...ls, text_content: v } }))} type="textarea" placeholder="Lesson written material..." />
                          </div>
                          <Field label="Video URL (Optional)" value={ls.video_s3_url || ''} onChange={(v) => setNewLesson((p) => ({ ...p, [lessonKey]: { ...ls, video_s3_url: v } }))} placeholder="https://..." />
                          <Field label="Duration (minutes)" value={ls.estimated_minutes || ''} onChange={(v) => setNewLesson((p) => ({ ...p, [lessonKey]: { ...ls, estimated_minutes: v } }))} type="number" placeholder="10" />
                        </div>
                        <Button onClick={() => handleCreateLesson(mod.id, activeCourse.id)} disabled={saving || !(ls.title || '').trim()} className="mt-2">
                          Add Lesson to Module
                        </Button>
                      </div>
                    </div>
                  )
                })}

                {/* Add New Module Form */}
                <div className="border border-dashed border-gray-300 bg-gray-50 rounded-xl p-6 text-center">
                  <p className="text-sm font-bold text-navy mb-4">Add a New Module</p>
                  <div className="flex max-w-md mx-auto gap-3">
                    <input
                      type="text"
                      placeholder="e.g., Module 1: Getting Started"
                      value={newModule[activeCourse.id] || ''}
                      onChange={(e) => setNewModule((p) => ({ ...p, [activeCourse.id]: e.target.value }))}
                      className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 text-sm font-medium text-navy focus:outline-none focus:border-[#D19A30] focus:ring-1 focus:ring-[#D19A30] shadow-sm"
                    />
                    <Button onClick={() => handleCreateModule(activeCourse.id)} disabled={saving || !(newModule[activeCourse.id] || '').trim()}>
                      Add Module
                    </Button>
                  </div>
                </div>

              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {courseToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-fade-in border border-gray-100">
            <div className="flex items-center gap-3 mb-4 text-red-600">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6h18"></path>
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
              </svg>
              <h2 className="text-lg font-bold text-navy">Delete Course?</h2>
            </div>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
              Are you sure you want to delete <span className="font-bold text-navy">"{courseToDelete.title}"</span>? This will permanently remove all modules, lessons, and content. This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setCourseToDelete(null)}
                className="px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteCourse}
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