
import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'
import { useProgress } from '../../context/ProgressContext.jsx'
import StatCard from '../../components/common/StatCard.jsx'
import ProgressBar from '../../components/common/ProgressBar.jsx'

function courseId(e) {
  return e.course && typeof e.course === 'object' ? e.course.id : e.course
}

export default function StudentDashboard() {
  const { user } = useAuth()
  const { enrollments, certificates } = useProgress()

  const active    = enrollments.filter((e) => !e.is_completed)
  const completed = enrollments.filter((e) => e.is_completed)

  return (
    <div className="animate-fade-in w-full">
      {/* Header */}
      <h1 className="text-2xl font-bold text-navy mb-6">
        Hi, {user?.full_name?.split(' ')[0] || 'Learner'}!
      </h1>

      {/* STAT CARDS - Now utilizing the updated StatCard component */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <StatCard value={active.length}       label="Active Courses" />
        <StatCard value={completed.length}    label="Completed" />
        <StatCard value={certificates.length} label="Certificates" />
      </div>

      {/* ACTIVE COURSES */}
      <section className="mb-10">
        <h2 className="text-lg font-bold text-navy mb-4">Continue Learning</h2>
        {enrollments.length === 0 ? (
          <div className="border border-dashed border-gray-300 rounded-xl p-8 text-center text-sm text-gray-500 bg-white">
            <p className="mb-3">You have not enrolled in any courses yet.</p>
            <Link to="/courses" className="inline-block bg-[#A88044] text-white px-6 py-2 rounded-lg font-semibold hover:bg-opacity-90 transition-all">
              Explore Courses
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {active.map((enr) => (
              <div key={enr.id} className="rounded-xl overflow-hidden shadow-sm border border-gray-200 bg-white">

                {/* Dark Navy Header inside the card */}
                <div className="bg-navy px-6 py-4 border-b border-navy">
                  <h3 className="text-white font-semibold text-sm">
                    {enr.course_title || (enr.course && typeof enr.course === 'object' ? enr.course.title : 'Course')}
                  </h3>
                </div>

                {/* Horizontal Flex Body */}
                <div className="px-6 py-5 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex-1 w-full">
                    {/* Utilizing the newly updated ProgressBar component */}
                    <ProgressBar
                      percent={enr.progress_percentage || 0}
                      showLabel={true}
                    />
                  </div>

                  <Link
                    to={`/learn/${courseId(enr)}`}
                    className="bg-navy text-white px-8 py-2.5 rounded-lg text-sm font-semibold hover:bg-opacity-90 transition-all text-center whitespace-nowrap shadow-sm"
                  >
                    Continue
                  </Link>
                </div>

              </div>
            ))}
          </div>
        )}
      </section>

      {/* COMPLETED COURSES */}
      {completed.length > 0 && (
        <section className="mb-10">
          <h2 className="text-lg font-bold text-navy mb-4">Completed Courses</h2>
          <div className="space-y-3">
            {completed.map((enr) => (
              <div key={enr.id} className="flex items-center gap-4 bg-white border border-[#D19A30]/40 shadow-sm rounded-xl px-6 py-4">
                <div className="w-8 h-8 rounded-full bg-[#D19A30]/15 flex items-center justify-center flex-shrink-0">
                  <span className="text-[#D19A30] font-bold">✓</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-navy">
                    {enr.course_title || (enr.course && typeof enr.course === 'object' ? enr.course.title : 'Course')}
                  </p>
                </div>
                <Link to="/certificates" className="text-sm font-semibold text-[#A88044] hover:underline">
                  View Certificate
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}