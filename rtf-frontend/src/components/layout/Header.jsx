import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import logo from '../../assets/logo.png'

export default function Header() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Define active layout
  const isAuthPage = ['/login', '/register', '/forgot-password'].includes(location.pathname)
  const isHomePage = location.pathname === '/'
  const isPublicLayout = isHomePage || isAuthPage

  // =========================================================
  // 1. PUBLIC HEADER
  // =========================================================
  if (isPublicLayout) {
    return (
      <header className="bg-white border-b border-gray-100 fixed top-0 w-full z-50 h-16 flex items-center">
        {/* Changed max-w-6xl to max-w-7xl and increased padding for desktop to push items apart */}
        <div className="max-w-7xl mx-auto px-4 md:px-8 w-full flex items-center justify-between">

          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="Raise Them Foundation" className="h-10 w-auto object-contain" />
          </Link>

          {isHomePage && (
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-navy">
              <Link to="/courses">Courses</Link>
            </nav>
          )}

          <div className="flex items-center gap-3">
            {user ? (
              <button onClick={() => { logout(); navigate('/') }} className="text-sm text-navy font-medium">
                Log out
              </button>
            ) : (
              <Link to="/login" className="text-sm text-navy font-medium">Sign In</Link>
            )}

            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-navy">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
          </div>

        </div>
      </header>
    )
  }

  // =========================================================
  // 2. DASHBOARD HEADER
  // =========================================================
  return (
    <header className="bg-navy fixed top-0 w-full z-50 h-16 flex items-center">

      <div className="hidden md:flex items-center justify-center w-64 flex-shrink-0">
        {/* Reduced vertical padding to py-1 */}
        <Link to="/" className="flex items-center bg-white px-4 py-1 rounded-full shadow-sm">
          {/* Increased height to h-10 and added object-contain */}
          <img src={logo} alt="Raise Them Foundation" className="h-10 w-auto object-contain" />
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-between px-6 md:pl-10 md:pr-6">

        <div className="flex items-center">
          {/* Reduced vertical padding to py-1 */}
          <Link to="/" className="flex items-center bg-white px-4 py-1 rounded-full shadow-sm mr-4 md:hidden">
            {/* Increased height to h-10 and added object-contain */}
            <img src={logo} alt="Raise Them Foundation" className="h-10 w-auto object-contain" />
          </Link>
        </div>

        <div className="flex items-center gap-5">
          {user ? (
             <button onClick={() => { logout(); navigate('/') }} className="text-sm text-white font-medium hover:text-gray-300 transition-colors">
               Log out
             </button>
          ) : (
             <Link to="/login" className="text-sm text-white font-medium hover:text-gray-300 transition-colors">
               Sign In
             </Link>
          )}

          <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white shadow-sm">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
        </div>

      </div>
    </header>
  )
}