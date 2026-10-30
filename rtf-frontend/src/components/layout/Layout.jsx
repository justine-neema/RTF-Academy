
import { Link, useLocation } from 'react-router-dom'
import Header from './Header.jsx'
import { useAuth } from '../../context/AuthContext.jsx'

export default function Layout({ children }) {
  const location = useLocation()
  const { user } = useAuth()

  // 1. Check if the user is an admin
  const isAdmin = user?.role === 'Admin'

  // 2. Build the links based on the user's role
  let navLinks = []

  if (isAdmin) {
    // ─── ADMIN LINKS ─────────────────────────────────────────────
    navLinks = [
      {
        name: 'Dashboard',
        path: '/admin',
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
          </svg>
        )
      },
      {
        name: 'Manage Courses',
        path: '/admin/courses',
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
            <line x1="12" y1="11" x2="16" y2="11" />
            <line x1="12" y1="15" x2="16" y2="15" />
          </svg>
        )
      },
      {
        name: 'Quizzes',
        path: '/admin/quizzes',
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 11l3 3L22 4" />
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
          </svg>
        )
      }
    ]
  } else {
    // ─── STUDENT / PUBLIC LINKS (100% UNTOUCHED) ─────────────────
    navLinks = [
      {
        name: 'Courses',
        path: '/courses',
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
          </svg>
        )
      },
      ...(user ? [
        {
          name: 'My Learning',
          path: '/dashboard',
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
            </svg>
          )
        },
        {
          name: 'Certificates',
          path: '/certificates',
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="8" r="7" />
              <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
            </svg>
          )
        }
      ] : [])
    ]
  }

  // Page layout definitions
  const isAuthPage = ['/login', '/register', '/forgot-password'].includes(location.pathname)
  const isHomePage = location.pathname === '/'

  // FIX: Force sidebar to only appear if a user is actively logged in
  const hasSidebar = !!user && !isAuthPage && !isHomePage

  // PUBLIC/FULL-WIDTH LAYOUT (For Home Page, Auth Pages, and Unauthenticated Users)
  if (!hasSidebar) {
    return (
      <div className={`min-h-screen pt-16 flex flex-col ${isAuthPage ? 'bg-gray-100' : 'bg-white'}`}>
        <Header />
        <main className="flex-1">{children}</main>
      </div>
    )
  }

  // DASHBOARD LAYOUT (With Sidebar and rounded white card)
  return (
    <div className="min-h-screen bg-navy flex flex-col md:flex-row pt-16">
      <Header />

      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex flex-col w-64 bg-navy fixed left-0 top-16 bottom-0 z-40">
        <nav className="flex-1 px-3 py-8 space-y-2">
          {navLinks.map((link) => {
            const isActive = link.path === '/admin'
              ? location.pathname === '/admin' || location.pathname === '/admin/'
              : location.pathname.startsWith(link.path)

            return (
              <Link
                key={link.name}
                to={link.path}
                className={`flex items-center gap-3 px-4 py-3 mx-2 rounded-xl transition-all duration-200 text-sm font-semibold tracking-wide ${
                  isActive 
                    ? 'bg-white text-navy shadow-sm' 
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                {link.icon}
                {link.name}
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* MOBILE BOTTOM NAV */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-navy border-t border-white/10 flex justify-around items-center h-16 z-50 pb-safe">
        {navLinks.map((link) => {
          const isActive = link.path === '/admin'
            ? location.pathname === '/admin' || location.pathname === '/admin/'
            : location.pathname.startsWith(link.path)

          return (
            <Link
              key={link.name}
              to={link.path}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
                isActive ? 'text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              {link.icon}
              <span className="text-[10px] font-medium">{link.name}</span>
            </Link>
          )
        })}
      </nav>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 md:ml-64 w-full bg-navy">
        <div className="bg-[#f9fafb] min-h-[calc(100vh-64px)] md:rounded-tl-[2rem] p-5 md:p-10 pb-24 md:pb-10 shadow-2xl overflow-hidden">
          <div className="max-w-5xl mx-auto w-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}