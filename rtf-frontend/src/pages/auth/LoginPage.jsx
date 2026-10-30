import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import Button from '../../components/common/Button.jsx'
import GoogleButton from '../../components/common/GoogleButton.jsx'

export default function LoginPage() {
  const { login, loginWithGoogle, firebaseEnabled } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [googleLoading, setGoogleLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!email || !password) return setError('Invalid email or password.')
    try {
      const user = await login({ email, password })
      // SAFETY CHECK: Only navigate if the user object successfully returned
      if (user) {
        navigate(user.role === 'Admin' ? '/admin' : '/dashboard')
      }
    } catch (err) {
      setError(err.message || 'Invalid email or password.')
    }
  }

  async function handleGoogle() {
    setError('')
    setGoogleLoading(true)
    try {
      const user = await loginWithGoogle()
      // SAFETY CHECK: Only navigate if the user object successfully returned
      if (user) {
        navigate(user.role === 'Admin' ? '/admin' : '/dashboard')
      }
    } catch (err) {
      setError(err.message || 'Google sign-in failed.')
    } finally {
      setGoogleLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center bg-gray-50 px-4 py-10">

      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-[#D19A30]/40 p-8 sm:p-10">

        <h1 className="text-2xl font-bold text-[#D19A30] text-center mb-8">Welcome Back</h1>

        {error && <p className="text-sm text-red-600 mb-4 bg-red-50 rounded-md px-3 py-2 text-center">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-sm font-medium text-navy block mb-1">Email</label>
            <input
              type="email"
              placeholder="jane@example.com"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy transition-colors text-navy"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-navy block mb-1">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy transition-colors text-navy"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="flex justify-end">
            <Link to="/forgot-password" className="text-sm text-gray-500 hover:text-navy transition-colors">
              Forgot Password?
            </Link>
          </div>

          <Button type="submit" className="w-full py-2.5 text-base">
            Log In
          </Button>
        </form>

        <div className="flex items-center gap-3 my-6">
          <div className="h-px bg-gray-200 flex-1" />
          <span className="text-xs text-gray-400 uppercase tracking-wider font-medium">or continue with</span>
          <div className="h-px bg-gray-200 flex-1" />
        </div>

        <GoogleButton onClick={handleGoogle} disabled={googleLoading} />

        {!firebaseEnabled && (
          <p className="text-xs text-gray-400 mt-4 text-center leading-relaxed">
            Google sign-in needs Firebase config — see .env.example. Meanwhile email/password
            runs in local demo mode (an email containing "admin" opens the admin dashboard).
          </p>
        )}

        <p className="text-center text-sm text-gray-600 mt-8">
          Don't have an account? <Link to="/register" className="text-[#849A53] font-semibold hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  )
}