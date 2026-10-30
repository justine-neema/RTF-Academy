import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import Button from '../../components/common/Button.jsx'
import GoogleButton from '../../components/common/GoogleButton.jsx'

export default function RegisterPage() {
  const { register, loginWithGoogle, firebaseEnabled } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ full_name: '', email: '', password: '', confirm: '', agree: false })
  const [error, setError] = useState('')
  const [googleLoading, setGoogleLoading] = useState(false)

  async function handleGoogle() {
    setError('')
    setGoogleLoading(true)
    try {
      await loginWithGoogle()
      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setGoogleLoading(false)
    }
  }

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!form.full_name) return setError('Full name is required.')
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return setError('Please enter a valid email address.')
    if (form.password.length < 8) return setError('Passwords must contain at least 8 characters.')
    if (form.password !== form.confirm) return setError('Passwords do not match.')
    if (!form.agree) return setError('Please agree to the Terms of Service.')

    await register({ full_name: form.full_name, email: form.email, password: form.password })
    navigate('/dashboard')
  }

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center bg-gray-50 px-4 py-10">

      {/* CHANGED: Card border is now gold */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-[#D19A30]/40 p-8 sm:p-10">

        {/* CHANGED: Title text is now gold */}
        <h1 className="text-2xl font-bold text-[#D19A30] text-center mb-8">Create Account</h1>

        {error && <p className="text-sm text-red-600 mb-4 bg-red-50 rounded-md px-3 py-2 text-center">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-sm font-medium text-navy block mb-1">Full Name</label>
            <input
              type="text"
              placeholder="Enter full name"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy transition-colors text-navy"
              value={form.full_name}
              onChange={(e) => update('full_name', e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-navy block mb-1">Email</label>
            <input
              type="email"
              placeholder="Enter email address"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy transition-colors text-navy"
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-navy block mb-1">Password</label>
            <input
              type="password"
              placeholder="Enter password"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy transition-colors text-navy"
              value={form.password}
              onChange={(e) => update('password', e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-navy block mb-1">Confirm Password</label>
            <input
              type="password"
              placeholder="Confirm password"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy transition-colors text-navy"
              value={form.confirm}
              onChange={(e) => update('confirm', e.target.value)}
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-600 mt-2">
            <input
              type="checkbox"
              checked={form.agree}
              onChange={(e) => update('agree', e.target.checked)}
              className="rounded border-gray-300 text-navy focus:ring-navy accent-navy"
            />
            I agree to the Terms of Service
          </label>

          <Button type="submit" className="w-full py-2.5 text-base">Sign Up</Button>
        </form>

        <div className="flex items-center gap-3 my-6">
          <div className="h-px bg-gray-200 flex-1" />
          <span className="text-xs text-gray-400 uppercase tracking-wider font-medium">or continue with</span>
          <div className="h-px bg-gray-200 flex-1" />
        </div>

        <GoogleButton onClick={handleGoogle} disabled={googleLoading} />

        {!firebaseEnabled && (
          <p className="text-xs text-gray-400 mt-4 text-center leading-relaxed">
            Google sign-in needs Firebase config — see .env.example.
          </p>
        )}

        <p className="text-center text-sm text-gray-600 mt-8">
          Already have an account? <Link to="/login" className="text-[#A88044] font-semibold hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  )
}