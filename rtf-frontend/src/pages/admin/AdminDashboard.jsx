import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bar, BarChart, ResponsiveContainer, XAxis } from 'recharts'
import { useAuth } from '../../context/AuthContext.jsx'
import { ADMIN_STATS } from '../../data/mockData.js'
import ProgressBar from '../../components/common/ProgressBar.jsx'
import { api } from '../../services/api.js'
import { COURSES as MOCK_COURSES } from '../../data/mockData'

function AdminCourseForm({ onCreate }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [thumbnail, setThumbnail] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    const payload = { title, description, thumbnail_url: thumbnail }
    try {
      const res = await api.createCourse(payload).catch(() => null)
      if (res) onCreate(res)
      else onCreate({ id: Date.now(), title, description, thumbnail_url: thumbnail })
      setTitle(''); setDescription(''); setThumbnail('')
    } catch (err) {
      console.error('Create course failed', err)
      alert('Create failed')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full border rounded px-2 py-1" />
      <input placeholder="Thumbnail URL" value={thumbnail} onChange={(e) => setThumbnail(e.target.value)} className="w-full border rounded px-2 py-1" />
      <textarea placeholder="Short description" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full border rounded px-2 py-1" />
      <button className="bg-navy text-white px-3 py-1 rounded text-sm">Create Course</button>
    </form>
  )
}

export default function AdminDashboard() {
  const { user, getToken } = useAuth()
  const [stats, setStats]   = useState(null)
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState('')

  useEffect(() => {
    async function load() {
      try {
        const token = await getToken()
        const [s, r] = await Promise.all([
          api.adminStats(token),
          api.adminEnrollmentReport(token),
        ])
        setStats(s)
        setReport(r)
      } catch (e) {
        setError(e.message || 'Failed to load admin data.')
      }
      setLoading(false)
    }
    load()
  }, [getToken])

  if (loading) return <p className="text-center py-16 text-gray-400">Loading dashboard…</p>
  if (error)   return <p className="text-center py-16 text-red-500">{error}</p>

  const totalLearners   = stats?.learners?.students       ?? 0
  const activeCourses   = stats?.courses?.published       ?? 0
  const completionRate  = stats && stats.learners?.enrollments > 0
    ? Math.round((stats.learners.completed_enrollments / stats.learners.enrollments) * 100)
    : 0
  const certsIssued     = stats?.learners?.certificates_issued ?? 0
  const avgScore = stats?.assessments?.average_score
    ? Math.round(stats.assessments.average_score)
    : 0

  const courseRows = report?.results || []

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-navy">Hi {user?.full_name?.split(' ')[0] || 'Admin'}</h1>
      </div>

      <p className="font-semibold text-navy mb-3">Platform Overview</p>
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="border border-[#D19A30]/40 rounded-lg p-4 bg-white shadow-card">
          <p className="text-2xl font-bold text-navy">{totalLearners}</p>
          <p className="text-xs text-gray-500">Total Learners</p>
        </div>
        <div className="border border-[#D19A30]/40 rounded-lg p-4 bg-white shadow-card">
          <p className="text-2xl font-bold text-navy">{activeCourses}</p>
          <p className="text-xs text-gray-500">Active Courses</p>
        </div>
        <div className="border border-[#D19A30]/40 rounded-lg p-4 bg-white shadow-card">
          <p className="text-2xl font-bold text-navy">{completionRate}%</p>
          <p className="text-xs text-gray-500">Avg Completion Rate</p>
        </div>
        <div className="border border-[#D19A30]/40 rounded-lg p-4 bg-white shadow-card">
          <p className="text-2xl font-bold text-navy">{certsIssued}</p>
          <p className="text-xs text-gray-500">Certificates Issued</p>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="border border-[#D19A30]/40 rounded-lg p-4 bg-white shadow-card col-span-2">
            <p className="text-sm font-semibold text-navy mb-2">Content Overview</p>
            <div className="grid grid-cols-4 gap-2 text-center">
              {[
                { label: 'Modules',   value: stats.content?.modules   ?? 0 },
                { label: 'Lessons',   value: stats.content?.lessons   ?? 0 },
                { label: 'Quizzes',   value: stats.content?.quizzes   ?? 0 },
                { label: 'Avg Score', value: `${avgScore}%` },
              ].map((item) => (
                // CHANGED: The background is now solid gold!
                <div key={item.label} className="bg-[#D19A30] border border-[#D19A30] rounded-lg py-2 shadow-sm">
                  <p className="text-lg font-bold text-navy">{item.value}</p>
                  <p className="text-xs font-semibold text-navy">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Monthly enrolments chart */}
      <div className="border border-[#D19A30]/40 rounded-lg p-4 bg-white shadow-card mb-6">
        <div className="flex justify-between items-center mb-2">
          <p className="font-semibold text-navy text-sm">Monthly Enrolments</p>
          <span className="text-xs text-gray-400">Last 6 Months</span>
        </div>
        <ResponsiveContainer width="100%" height={140}>
          <BarChart data={ADMIN_STATS.monthly_enrollments}>
            <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
            <Bar dataKey="enrollments" fill="#0A192F" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Per-course performance */}
      {courseRows.length > 0 && (
        <div className="border border-[#D19A30]/40 rounded-lg p-4 bg-white shadow-card mb-6">
          <p className="font-semibold text-navy text-sm mb-3">Course Performance</p>
          <div className="space-y-3">
            {courseRows.map((c) => (
              <div key={c.course_id}>
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span className="truncate w-3/4">{c.title}</span>
                  <span>{Math.round(c.average_progress || 0)}%</span>
                </div>
                <ProgressBar percent={Math.round(c.average_progress || 0)} color="bg-[#D19A30]" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Enrollment report table */}
      {courseRows.length > 0 && (
        <div className="border border-[#D19A30]/40 rounded-lg p-4 bg-white shadow-card">
          <p className="font-semibold text-navy text-sm mb-3">Enrollment Report</p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-gray-400 border-b border-[#D19A30]/20">
                  <th className="text-left pb-2">Course</th>
                  <th className="text-center pb-2">Enrolled</th>
                  <th className="text-center pb-2">Completed</th>
                  <th className="text-center pb-2">Certs</th>
                </tr>
              </thead>
              <tbody>
                {courseRows.map((c) => (
                  <tr key={c.course_id} className="border-b border-gray-50">
                    <td className="py-2 text-navy font-medium truncate max-w-28">{c.title}</td>
                    <td className="py-2 text-center">{c.enrollments}</td>
                    <td className="py-2 text-center">{c.completed_enrollments}</td>
                    <td className="py-2 text-center">{c.certificates_issued}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {report?.summary && (
            <p className="text-xs text-gray-400 mt-3">
              Platform average progress: {Math.round(report.summary.average_progress || 0)}%
            </p>
          )}
        </div>
      )}
    </div>
  )
}