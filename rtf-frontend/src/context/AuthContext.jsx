import { createContext, useContext, useEffect, useState } from 'react'
import { api } from '../services/api.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // On app load, check if the user has a valid token
  useEffect(() => {
    async function loadUser() {
      const token = localStorage.getItem('access_token')
      if (token) {
        try {
          const profile = await api.me()
          setUser(profile)
        } catch (err) {
          console.error('Session expired or invalid', err)
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
        }
      }
      setLoading(false)
    }
    loadUser()
  }, [])

  async function login({ email, password }) {
    const data = await api.login(email, password)
    localStorage.setItem('access_token', data.access)
    localStorage.setItem('refresh_token', data.refresh)
    
    const profile = await api.me()
    setUser(profile)
    return profile
  }

  async function register({ full_name, email, password }) {
    await api.register({ full_name, email, password })
    return login({ email, password })
  }

  async function loginWithGoogle(googleToken) {
    // googleToken here is the credentialResponse.credential
    const data = await api.googleLogin(googleToken)
    
    localStorage.setItem('access_token', data.access)
    localStorage.setItem('refresh_token', data.refresh)
    
    const profile = await api.me()
    setUser(profile)
    return profile
}

  async function resetPassword(email) {
    throw new Error('Password reset via email is not configured on the backend yet.')
  }

  function logout() {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    setUser(null)
    window.location.href = '/login'
  }

  return (
    <AuthContext.Provider value={{ user, loading, register, login, loginWithGoogle, logout, resetPassword }}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}