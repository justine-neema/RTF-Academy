
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

// NEW Master Layout
import Layout from '../components/layout/Layout.jsx'
import Footer from '../components/layout/Footer.jsx'
import ProtectedRoute from '../components/layout/ProtectedRoute.jsx'

// Public pages
import HomePage              from '../pages/HomePage.jsx'
import LoginPage             from '../pages/auth/LoginPage.jsx'
import RegisterPage          from '../pages/auth/RegisterPage.jsx'
import ForgotPasswordPage    from '../pages/auth/ForgotPasswordPage.jsx'
import CertificateVerifyPage from '../pages/CertificateVerifyPage.jsx'

// Student pages
import CourseCatalogPage     from '../pages/student/CourseCatalogPage.jsx'
import CourseDetailPage      from '../pages/student/CourseDetailPage.jsx'
import StudentDashboard      from '../pages/student/StudentDashboard.jsx'
import CoursePage            from '../pages/student/CoursePage.jsx'
import AssessmentPage        from '../pages/student/AssessmentPage.jsx'
import CertificatesPage      from '../pages/student/CertificatesPage.jsx'
import CourseCompletePage    from '../pages/student/CourseCompletePage.jsx'
import EnrollmentSuccessPage from '../pages/student/EnrollmentSuccessPage.jsx'

// Admin pages
import AdminDashboard        from '../pages/admin/AdminDashboard.jsx'
import AdminCourseBuilder    from '../pages/admin/AdminCourseBuilder.jsx'
import AdminQuizzesPage      from '../pages/admin/AdminQuizzesPage.jsx'
import AdminQuizEditor       from '../pages/admin/AdminQuizEditor.jsx'

export default function AppRoutes() {
  const { loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400 text-sm">Loading…</p>
      </div>
    )
  }

  // We wrap everything in our new master Layout once!
  return (
    <Layout>
      <Routes>
        {/* ── Public ─────────────────────────────────────────────────── */}
        {/* We keep the Footer ONLY on the home page so it doesn't clash with the app views */}
        <Route path="/" element={<><HomePage /><Footer /></>} />

        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/courses" element={<CourseCatalogPage />} />
        <Route path="/courses/:id" element={<CourseDetailPage />} />

        {/* ── Public certificate verification (no login required) ─────── */}
        <Route path="/verify/:code" element={<CertificateVerifyPage />} />

        {/* ── Student (login required) ────────────────────────────────── */}
        <Route path="/dashboard" element={
          <ProtectedRoute><StudentDashboard /></ProtectedRoute>
        } />
        <Route path="/learn/:id" element={
          <ProtectedRoute><CoursePage /></ProtectedRoute>
        } />
        <Route path="/learn/:id/assessment/:moduleId" element={
          <ProtectedRoute><AssessmentPage /></ProtectedRoute>
        } />
        <Route path="/certificates" element={
          <ProtectedRoute><CertificatesPage /></ProtectedRoute>
        } />
        <Route path="/course-complete/:id" element={
          <ProtectedRoute><CourseCompletePage /></ProtectedRoute>
        } />
        <Route path="/enrollment-success/:id" element={
          <ProtectedRoute><EnrollmentSuccessPage /></ProtectedRoute>
        } />

        {/* ── Admin (login + admin role required) ─────────────────────── */}
        <Route path="/admin" element={
          <ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>
        } />
        <Route path="/admin/courses" element={
          <ProtectedRoute adminOnly><AdminCourseBuilder /></ProtectedRoute>
        } />
        <Route path="/admin/quizzes" element={
          <ProtectedRoute adminOnly><AdminQuizzesPage /></ProtectedRoute>
        } />
        <Route path="/admin/quizzes/module/:moduleId" element={
          <ProtectedRoute adminOnly><AdminQuizEditor /></ProtectedRoute>
        } />

        {/* ── Fallback ────────────────────────────────────────────────── */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  )
}