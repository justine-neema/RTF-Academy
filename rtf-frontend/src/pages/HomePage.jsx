import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../services/api.js'
import { useAuth } from '../context/AuthContext.jsx'

// Verified educational images without human faces
const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=600&q=80'
]

export default function HomePage() {
  const { getToken } = useAuth()
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const token = await getToken()
        const data = await api.listCourses(token)
        setCourses(Array.isArray(data) ? data.slice(0, 3) : [])
      } catch { setCourses([]) }
      setLoading(false)
    }
    load()
  }, [getToken])

  return (
    <div>
      <section className="bg-navy text-white">
        <div className="max-w-6xl mx-auto px-4 py-14 text-center">
          <h1 className="font-serif text-3xl md:text-4xl font-bold mb-3">Learn Without Limits</h1>
          <p className="max-w-xl mx-auto text-gray-300 mb-6">
            Access quality education, develop digital skills, and build your future through
            online learning designed for refugee youth and underserved communities.
          </p>
          <div className="flex justify-center gap-3 flex-wrap">
            <Link to="/register" className="bg-gold text-navy-dark font-semibold px-6 py-2.5 rounded-md">Start Learning</Link>
            <Link to="/courses" className="border border-gray-500 text-white px-6 py-2.5 rounded-md">Browse Courses</Link>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-xl font-bold text-navy mb-1">Featured Courses</h2>
        <p className="text-gray-500 text-sm mb-6">Free structured courses designed for refugee youth.</p>
        {loading ? (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
            {[1,2,3].map(i => <div key={i} className="h-48 bg-gray-100 rounded-lg animate-pulse" />)}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
            {courses.map((course, index) => (
              <div key={course.id} className="border border-gold rounded-lg overflow-hidden shadow-card bg-white">

                <img
                  src={course.thumbnail_url || FALLBACK_IMAGES[index % FALLBACK_IMAGES.length]}
                  alt={course.title}
                  className="h-36 w-full object-cover"
                  // Force fallback if primary URL breaks
                  onError={(e) => {
                    e.currentTarget.onerror = null
                    e.currentTarget.src = FALLBACK_IMAGES[index % FALLBACK_IMAGES.length]
                  }}
                />

                <div className="p-4">
                  <p className="font-semibold text-navy">{course.title}</p>
                  <p className="text-xs text-gray-500 mb-3">
                    {course.module_count || 0} modules · {course.total_lessons || 0} lessons
                  </p>
                  <Link to={`/courses/${course.id}`} className="inline-block bg-gold text-white text-xs font-semibold px-4 py-2 rounded-md">
                    Enroll Now
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="bg-gray-100 py-10">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-xl font-bold text-navy mb-4">Why Learn With Us?</h2>
          <p className="text-gray-600 mb-8">
            Raise Them Foundation provides accessible online education opportunities that help
            learners gain knowledge, practical skills, and certificates to support their personal and professional growth.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm font-semibold text-navy">
            {['Flexible Learning','Practical Skills','Progress Tracking','Verified Certificates'].map(t => (
              <div key={t} className="bg-white rounded-lg py-4 shadow-card">{t}</div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-navy-dark text-white py-12 text-center">
        <h2 className="font-serif text-2xl font-bold mb-4">Ready to Begin Your Learning Journey?</h2>
        <Link to="/register" className="bg-gold text-navy-dark font-semibold px-6 py-2.5 rounded-md">Create Free Account</Link>
      </section>
    </div>
  )
}