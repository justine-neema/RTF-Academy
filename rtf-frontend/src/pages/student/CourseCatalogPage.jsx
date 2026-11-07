import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query' // <-- NEW
import { api } from '../../services/api.js'
import { useProgress } from '../../context/ProgressContext.jsx'

const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=600&q=80'
]

export default function CourseCatalogPage() {
  const { isEnrolled } = useProgress()

  // React Query fetches, caches, and handles errors automatically
  const { data: courses = [], isLoading, error } = useQuery({
    queryKey: ['courses'],
    queryFn: () => api.listCourses(),
  })

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-xl font-bold text-navy mb-1">Courses</h1>
      <p className="text-gray-500 text-sm mb-6">Browse available programs and enroll for free.</p>

      {error && <p className="text-red-500 text-sm mb-4">Failed to load courses. Please refresh.</p>}

      {isLoading ? (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
          {[1,2,3].map(i => <div key={i} className="h-48 bg-gray-100 rounded-lg animate-pulse" />)}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
          {courses.map((course, index) => (
            <div key={course.id} className="border border-[#D19A30] rounded-lg overflow-hidden shadow-card bg-white">
              <img
                  src={course.thumbnail_url || FALLBACK_IMAGES[index % FALLBACK_IMAGES.length]}
                  alt={course.title}
                  className="h-36 w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.onerror = null
                    e.currentTarget.src = FALLBACK_IMAGES[index % FALLBACK_IMAGES.length]
                  }}
                />
              <div className="p-4">
                <p className="font-semibold text-navy">{course.title}</p>
                <p className="text-xs text-gray-500 mb-1 line-clamp-2">{course.description}</p>
                <p className="text-xs text-gray-400 mb-3">{course.module_count || 0} modules · {course.total_lessons || 0} lessons</p>

                {isEnrolled(course.id) ? (
                  <Link to={`/learn/${course.id}`} className="inline-block bg-[#D19A30] text-navy hover:bg-opacity-90 transition-opacity text-xs font-semibold px-4 py-2 rounded-md">
                    Continue Learning
                  </Link>
                ) : (
                  <Link to={`/courses/${course.id}`} className="inline-block bg-navy text-white hover:bg-opacity-90 transition-opacity text-xs font-semibold px-4 py-2 rounded-md">
                    View Course
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}