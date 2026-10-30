
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../../services/api.js'
import { useAuth } from '../../context/AuthContext.jsx'
import { useProgress } from '../../context/ProgressContext.jsx'
import Button from '../../components/common/Button.jsx'
import logo from '../../assets/logo.png'

export default function CourseCompletePage() {
  const { id } = useParams()
  const { user, getToken } = useAuth()
  const { certificates } = useProgress()
  const [cert, setCert] = useState(null)
  const [course, setCourse] = useState(null)
  const [copyMsg, setCopyMsg] = useState('')

  useEffect(() => {
    // Find cert from the cached list first
    const found = certificates.find((c) => {
      const cid = c.course?.id || c.course
      return String(cid) === String(id)
    })
    if (found) setCert(found)

    // Also fetch the course for title display
    async function loadCourse() {
      try {
        const token = await getToken()
        const data = await api.getCourse(id, token)
        setCourse(data)
        // If cert not in cache yet, search myCertificates directly
        if (!found) {
          const certs = await api.myCertificates(token)
          const match = (Array.isArray(certs) ? certs : []).find((c) => {
            const cid = c.course?.id || c.course
            return String(cid) === String(id)
          })
          if (match) setCert(match)
        }
      } catch {}
    }
    loadCourse()
  }, [id, getToken, certificates])

  async function handleShare() {
    if (!cert) return
    const url = `${window.location.origin}/verify/${cert.verification_code}`
    await navigator.clipboard.writeText(url).catch(() => {})
    setCopyMsg('Link copied!')
    setTimeout(() => setCopyMsg(''), 2000)
  }

  const courseTitle = course?.title || cert?.course?.title || 'this course'
  const issuedDate  = cert?.issued_at ? new Date(cert.issued_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : ''

  return (
    <div className="max-w-md mx-auto px-4 py-10 text-center">
      {/* CHANGED: Swapped bright green bg/text for a clean solid navy block */}
      <div className="bg-navy text-white rounded-md py-3 mb-6 font-medium shadow-sm">
           Course Completed Successfully!
      </div>

      <div className="border-2 border-gold rounded-lg p-6 bg-white shadow-card mb-6">
        <img src={logo} alt="Raise Them Foundation" className="h-10 w-auto mx-auto mb-1" />
        <p className="text-xs text-gray-400 mb-4">RTF Academy · E-Learning Platform</p>

        <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Certificate of Completion</p>
        <p className="text-xs text-gray-500">This is to certify that</p>
        <p className="font-serif text-lg font-bold text-navy my-1">{user?.full_name || 'Learner'}</p>
        <p className="text-xs text-gray-500 mb-1">has successfully completed</p>
        <p className="font-semibold text-gold-dark my-1">{courseTitle}</p>

        {issuedDate && <p className="text-xs text-gray-400 mt-2">{issuedDate}</p>}
        {cert?.verification_code && (
          <p className="text-xs text-gray-400 font-mono mt-1">{cert.verification_code}</p>
        )}
      </div>

      {/* CHANGED: Replaced stacked buttons with a cleaner grid layout */}
      <div className="flex flex-col gap-3">
        <Link to="/certificates" className="w-full">
          <Button className="w-full">View All Certificates</Button>
        </Link>
        <div className="flex gap-3">
          <button onClick={handleShare} className="flex-1 border border-navy text-navy text-sm font-semibold py-2 rounded-md hover:bg-gray-50 transition-colors">
            {copyMsg || 'Share Certificate Link'}
          </button>
          <Link to="/dashboard" className="flex-1">
            <Button variant="outline" className="w-full">Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}