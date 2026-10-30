
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { useProgress } from '../../context/ProgressContext.jsx'
import { api } from '../../services/api.js'
import ProgressBar from '../../components/common/ProgressBar.jsx'
import StatCard from '../../components/common/StatCard.jsx' // Imported our new Figma component!

function formatDate(d) {
  try { return new Date(d).toLocaleDateString() } catch { return d }
}

export default function CertificatesPage() {
  const { getToken } = useAuth()
  const { certificates, enrollments } = useProgress()
  const [downloading, setDownloading] = useState(null)
  const [copyMsg, setCopyMsg] = useState(null)

  const inProgress = enrollments.filter((e) => !e.is_completed)

  async function handleDownload(cert) {
    setDownloading(cert.id)
    try {
      const token = await getToken()
      const data = await api.downloadCertificate(cert.id, token)
      if (data?.pdf_url) {
        window.open(data.pdf_url, '_blank')
      } else {
        alert('PDF not yet available — your certificate is valid and can be verified using the code below.')
      }
    } catch (e) {
      if (e.status === 503) {
        alert('PDF generation is coming soon. Use your verification code for now: ' + cert.verification_code)
      } else {
        alert('Download failed: ' + e.message)
      }
    }
    setDownloading(null)
  }

  async function handleShare(cert) {
    const url = `${window.location.origin}/verify/${cert.verification_code}`
    await navigator.clipboard.writeText(url).catch(() => {})
    setCopyMsg(cert.id)
    setTimeout(() => setCopyMsg(null), 2000)
  }

  return (
    // Removed max-w wrapper to allow the layout card to define the width
    <div className="animate-fade-in w-full">
      <h1 className="text-2xl font-bold text-navy mb-6">My Certificates</h1>

      {/* TOP STAT CARDS - Now uses the updated component */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <StatCard value={certificates.length} label="Certificates Earned" />
        <StatCard value={inProgress.length} label="In Progress" />
      </div>

      {/* EARNED CERTIFICATES */}
      <section className="mb-10">
        <h2 className="text-lg font-bold text-navy mb-2">Earned Certificates</h2>
        {certificates.length === 0 ? (
          <p className="text-sm text-gray-500">Complete a course to earn your first certificate.</p>
        ) : (
          <div className="space-y-4">
            {certificates.map((cert) => (
              <div key={cert.id} className="border border-[#D19A30] rounded-xl p-6 bg-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-bold text-navy">{cert.course?.title || 'Course'}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Issued {cert.issued_at ? new Date(cert.issued_at).toLocaleDateString() : ''}
                  </p>
                  <p className="text-xs text-gray-500 font-mono mt-1 bg-gray-50 inline-block px-2 py-1 rounded border border-gray-100">
                    ID: {cert.verification_code}
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => handleDownload(cert)}
                    disabled={downloading === cert.id}
                    className="text-xs bg-navy text-white font-semibold px-4 py-2 rounded-lg disabled:opacity-50 hover:bg-opacity-90 transition-all"
                  >
                    {downloading === cert.id ? 'Loading…' : 'Download PDF'}
                  </button>
                  <button
                    onClick={() => handleShare(cert)}
                    className="text-xs border border-navy text-navy font-semibold px-4 py-2 rounded-lg hover:bg-gray-50 transition-all"
                  >
                    {copyMsg === cert.id ? 'Copied!' : 'Copy Link'}
                  </button>
                  <Link
                    to={`/course-complete/${cert.course?.id || ''}`}
                    className="text-xs text-[#D19A30] font-semibold underline self-center px-2"
                  >
                    View
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* COURSES IN PROGRESS - Matched to Figma */}
      <section>
        <h2 className="text-lg font-bold text-navy mb-4">Courses In Progress</h2>
        {inProgress.length === 0 ? (
          <p className="text-sm text-gray-500">No courses in progress.</p>
        ) : (
          <div className="space-y-4">
            {inProgress.map((enr) => (
              // Using a lighter opacity gold border to match your screenshot
              <div key={enr.id} className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-[#D19A30]/40 rounded-xl px-6 py-5 shadow-sm">

                {/* Course Title (Left aligned) */}
                <p className="text-sm font-semibold text-navy md:w-1/3 truncate">
                  {enr.course_title || (enr.course?.title) || 'Course'}
                </p>

                {/* Progress Bar (Center) */}
                <div className="flex-1 w-full">
                  {/* Note: showLabel is false because the Figma design puts the % on the right! */}
                  <ProgressBar percent={enr.progress_percentage || 0} showLabel={false} />
                </div>

                {/* Percentage Text (Right aligned) */}
                <span className="text-sm font-medium text-navy md:w-12 text-right">
                  {enr.progress_percentage || 0}%
                </span>

              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}