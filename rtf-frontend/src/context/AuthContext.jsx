//
// import { createContext, useContext, useEffect, useState } from 'react'
// import {
//   createUserWithEmailAndPassword,
//   signInWithEmailAndPassword,
//   signInWithPopup,
//   signOut,
//   onAuthStateChanged,
//   sendPasswordResetEmail,
// } from 'firebase/auth'
// import { auth, googleProvider, firebaseEnabled } from '../services/firebase.js'
// import { api } from '../services/api.js'
//
// const AuthContext = createContext(null)
//
// // ─── Demo mode (Firebase not configured) ─────────────────────────────────────
// // Used during development before Firebase credentials are set up.
// // An email containing "admin" will be given the Admin role; anything else gets Student.
// function makeDemoUser(email, full_name = '') {
//   const role = email.toLowerCase().includes('admin') ? 'admin' : 'student'
//   return { uid: 'demo-' + email, email, full_name: full_name || email.split('@')[0], role, is_active: true, created_at: new Date().toISOString(), _demo: true }
// }
//
// // ─── Provider ─────────────────────────────────────────────────────────────────
// export function AuthProvider({ children }) {
//   const [user, setUser]       = useState(null)
//   const [loading, setLoading] = useState(true)
//
//   // Sync a Firebase user with the Django backend (JIT provisioning).
//   async function syncWithBackend(firebaseUser) {
//     try {
//       const token = await firebaseUser.getIdToken()
//       const profile = await api.me(token)
//       const merged = {
//         uid:        profile.uid,
//         email:      profile.email,
//         full_name:  profile.full_name,
//         role:       (profile.role || 'Student'),
//         created_at: profile.created_at,
//         is_active:  profile.is_active,
//         _firebaseUser: firebaseUser,
//       }
//       setUser(merged)
//       return merged
//     } catch (err) {
//       console.error('[RTF] Backend sync failed:', err)
//       return null
//     }
//   }
//
//   useEffect(() => {
//     if (!auth) {
//       // Firebase not configured — restore demo session from sessionStorage
//       try {
//         const saved = sessionStorage.getItem('rtf_demo_user')
//         if (saved) setUser(JSON.parse(saved))
//       } catch {}
//       setLoading(false)
//       return
//     }
//     const unsub = onAuthStateChanged(auth, async (fbUser) => {
//       if (fbUser) {
//         await syncWithBackend(fbUser)
//       } else {
//         setUser(null)
//       }
//       setLoading(false)
//     })
//     return unsub
//   }, [])
//
//   // ─── register ───────────────────────────────────────────────────────────────
//   async function register({ full_name, email, password }) {
//     if (!auth) {
//       // Demo mode
//       const demo = makeDemoUser(email, full_name)
//       setUser(demo)
//       sessionStorage.setItem('rtf_demo_user', JSON.stringify(demo))
//       return demo
//     }
//     const cred    = await createUserWithEmailAndPassword(auth, email, password)
//     const profile = await syncWithBackend(cred.user)
//     if (full_name) {
//       const token = await cred.user.getIdToken()
//       await api.updateProfile({ full_name }, token).catch(() => {})
//       setUser((prev) => (prev ? { ...prev, full_name } : prev))
//     }
//     return profile
//   }
//
//   // ─── login ──────────────────────────────────────────────────────────────────
//   async function login({ email, password }) {
//     if (!auth) {
//       // Demo mode — password not checked
//       const demo = makeDemoUser(email)
//       setUser(demo)
//       sessionStorage.setItem('rtf_demo_user', JSON.stringify(demo))
//       return demo
//     }
//     const cred = await signInWithEmailAndPassword(auth, email, password)
//     return syncWithBackend(cred.user)
//   }
//
//   // ─── loginWithGoogle ─────────────────────────────────────────────────────────
//   async function loginWithGoogle() {
//     if (!auth || !googleProvider) {
//       throw new Error('Firebase is not configured. Set VITE_FIREBASE_* in your .env file.')
//     }
//     const cred = await signInWithPopup(auth, googleProvider)
//     return syncWithBackend(cred.user)
//   }
//
//   // ─── resetPassword ───────────────────────────────────────────────────────────
//   async function resetPassword(email) {
//     if (!auth) throw new Error('Firebase is not configured.')
//     return sendPasswordResetEmail(auth, email)
//   }
//
//   // ─── logout ──────────────────────────────────────────────────────────────────
//   async function logout() {
//     sessionStorage.removeItem('rtf_demo_user')
//     setUser(null)
//
//     if (firebaseEnabled && auth) {
//       await signOut(auth)
//     }
//   }
//
//   // ─── getToken ────────────────────────────────────────────────────────────────
//   // Returns a real Firebase ID token, or null in demo mode.
//   // API calls made with null token will fail if the backend requires auth —
//   // configure Firebase for a fully working integration.
//   async function getToken() {
//     if (!auth?.currentUser) return null
//     return auth.currentUser.getIdToken()
//   }
//
//   return (
//     <AuthContext.Provider value={{ user, loading, register, login, loginWithGoogle, logout, resetPassword, getToken, firebaseEnabled }}>
//       {children}
//     </AuthContext.Provider>
//   )
// }
//
// export function useAuth() {
//   const ctx = useContext(AuthContext)
//   if (!ctx) throw new Error('useAuth must be inside AuthProvider')
//   return ctx
// }
import { createContext, useContext, useEffect, useState } from 'react'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  GoogleAuthProvider
} from 'firebase/auth'
import { auth, googleProvider, firebaseEnabled } from '../services/firebase.js'
import { api } from '../services/api.js'

const AuthContext = createContext(null)

// ─── Demo mode (Firebase not configured) ─────────────────────────────────────
// Used during development before Firebase credentials are set up.
// An email containing "admin" will be given the Admin role; anything else gets Student.
function makeDemoUser(email, full_name = '') {
  const role = email.toLowerCase().includes('admin') ? 'admin' : 'student'
  return { uid: 'demo-' + email, email, full_name: full_name || email.split('@')[0], role, is_active: true, created_at: new Date().toISOString(), _demo: true }
}

// ─── Provider ─────────────────────────────────────────────────────────────────
export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  // Sync a Firebase user with the Django backend (JIT provisioning).
  async function syncWithBackend(firebaseUser) {
    try {
      const token = await firebaseUser.getIdToken()
      const profile = await api.me(token)
      const merged = {
        uid:        profile.uid,
        email:      profile.email,
        full_name:  profile.full_name,
        role:       (profile.role || 'Student'),
        created_at: profile.created_at,
        is_active:  profile.is_active,
        _firebaseUser: firebaseUser,
      }
      setUser(merged)
      return merged
    } catch (err) {
      console.error('[RTF] Backend sync failed:', err)
      return null
    }
  }

  useEffect(() => {
    if (!auth) {
      // Firebase not configured — restore demo session from sessionStorage
      try {
        const saved = sessionStorage.getItem('rtf_demo_user')
        if (saved) setUser(JSON.parse(saved))
      } catch {}
      setLoading(false)
      return
    }
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        await syncWithBackend(fbUser)
      } else {
        setUser(null)
      }
      setLoading(false)
    })
    return unsub
  }, [])

  // ─── register ───────────────────────────────────────────────────────────────
  async function register({ full_name, email, password }) {
    if (!auth) {
      // Demo mode
      const demo = makeDemoUser(email, full_name)
      setUser(demo)
      sessionStorage.setItem('rtf_demo_user', JSON.stringify(demo))
      return demo
    }
    const cred    = await createUserWithEmailAndPassword(auth, email, password)
    const profile = await syncWithBackend(cred.user)
    if (full_name) {
      const token = await cred.user.getIdToken()
      await api.updateProfile({ full_name }, token).catch(() => {})
      setUser((prev) => (prev ? { ...prev, full_name } : prev))
    }
    return profile
  }

  // ─── login ──────────────────────────────────────────────────────────────────
  async function login({ email, password }) {
    if (!auth) {
      // Demo mode — password not checked
      const demo = makeDemoUser(email)
      setUser(demo)
      sessionStorage.setItem('rtf_demo_user', JSON.stringify(demo))
      return demo
    }
    const cred = await signInWithEmailAndPassword(auth, email, password)
    return syncWithBackend(cred.user)
  }

  // ─── loginWithGoogle ─────────────────────────────────────────────────────────
  async function loginWithGoogle() {
    if (!auth) {
      throw new Error('Firebase is not configured. Set VITE_FIREBASE_* in your .env file.')
    }

    const freshProvider = new GoogleAuthProvider()
    freshProvider.setCustomParameters({
      prompt: 'select_account'
    })

    const cred = await signInWithPopup(auth, freshProvider)
    return syncWithBackend(cred.user)
  }

  // ─── resetPassword ───────────────────────────────────────────────────────────
  async function resetPassword(email) {
    if (!auth) throw new Error('Firebase is not configured.')
    return sendPasswordResetEmail(auth, email)
  }

  // ─── logout ──────────────────────────────────────────────────────────────────
  async function logout() {
    sessionStorage.removeItem('rtf_demo_user')
    setUser(null)

    if (firebaseEnabled && auth) {
      await signOut(auth)
    }
  }

  // ─── getToken ────────────────────────────────────────────────────────────────
  // Returns a real Firebase ID token, or null in demo mode.
  // API calls made with null token will fail if the backend requires auth —
  // configure Firebase for a fully working integration.
  async function getToken() {
    if (!auth?.currentUser) return null
    return auth.currentUser.getIdToken()
  }

  return (
    <AuthContext.Provider value={{ user, loading, register, login, loginWithGoogle, logout, resetPassword, getToken, firebaseEnabled }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}