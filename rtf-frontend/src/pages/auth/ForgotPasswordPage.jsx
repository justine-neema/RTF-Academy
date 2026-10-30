import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import Button from '../../components/common/Button.jsx'

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth() // 1. Pull in your actual auth function
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // 2. Create a real submit handler
  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await resetPassword(email) // Calls Firebase
      setSent(true) // Only shows success if Firebase didn't throw an error
    } catch (err) {
      // Firebase will throw an error if the email doesn't exist or is invalid
      setError(err.message || 'Failed to send password reset email.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center bg-gray-50 px-4 py-10">

      {/* CHANGED: Card border is now gold */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-[#D19A30]/40 p-8 sm:p-10">

        {/* CHANGED: Title text is now gold */}
        <h1 className="text-2xl font-bold text-[#D19A30] text-center mb-8">Reset Your Password</h1>

        {/* Error Message Display */}
        {error && <p className="text-sm text-red-600 mb-4 bg-red-50 rounded-md px-3 py-2 text-center">{error}</p>}

        {sent ? (
          <div className="text-center">
            <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-4 mb-6">
              Password reset instructions have been sent to your email.
            </p>
            <Link to="/login" className="text-sm font-semibold text-[#A88044] hover:underline">
              Return to Log In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-sm font-medium text-navy block mb-1">Email Address</label>
              <input
                type="email"
                placeholder="jane@example.com"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy transition-colors text-navy"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full py-2.5 text-base" disabled={loading}>
              {loading ? 'Sending...' : 'Send Reset Link'}
            </Button>
          </form>
        )}

        {!sent && (
          <p className="text-center text-sm text-gray-600 mt-8">
            Remember your password? <Link to="/login" className="text-[#A88044] font-semibold hover:underline">Log in</Link>
          </p>
        )}
      </div>

    </div>
  )
}