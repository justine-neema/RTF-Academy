import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../services/api.js'
import logo from '../assets/logo.png'

export default function CertificateVerifyPage() {
  const { code } = useParams()
  const [result, setResult]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  useEffect(() => {
    async function verify() {
      try {
        const data = await api.verifyCertificate(code)
        setResult(data)
      } catch (e) {
        if (e.status === 404) {
          setResult({ valid: false })
        } else {
          setError(e.message || 'Verification failed.')
        }
      }
      setLoading(false)
    }
    verify()
  }, [code])

  if (loading) return <p className="text-center py-16 text-gray-400">Verifying certificate…</p>
  if (error)   return <p className="text-center py-16 text-red-500">{error}</p>

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <div className="text-center mb-6">
          <img src={logo} alt="Raise Them Foundation" className="h-10 w-auto mx-auto mb-2" />
          <p className="text-xs text-gray-400">Certificate Verification — RTF Academy</p>
        </div>

        {result?.valid ? (
          <div className="border-2 border-gold rounded-lg p-6 bg-white shadow-card text-center">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3 text-2xl">✓</div>
            <p className="text-green-700 font-semibold mb-4">This certificate is valid.</p>

            <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Certificate of Completion</p>
            <p className="font-serif text-lg font-bold text-navy my-1">{result.student_name}</p>
            <p className="text-xs text-gray-500 mb-1">has successfully completed</p>
            <p className="font-semibold text-navy">{result.course_title}</p>
            {result.issued_at && (
              <p className="text-xs text-gray-400 mt-2">
                Issued on {new Date(result.issued_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            )}
            <p className="text-xs font-mono text-gray-400 mt-2">{result.verification_code}</p>
          </div>
        ) : (
          <div className="border-2 border-red-200 rounded-lg p-6 bg-white shadow-card text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-3 text-2xl">✕</div>
            <p className="text-red-600 font-semibold mb-2">Certificate not found.</p>
            <p className="text-sm text-gray-500">
              The code <span className="font-mono font-semibold">{code}</span> does not match any certificate in our records.
              Please check the code and try again.
            </p>
          </div>
        )}

        <p className="text-center text-xs text-gray-400 mt-6">
          <Link to="/" className="underline">Visit RTF Academy</Link>
        </p>
      </div>
    </div>
  )
}
