// RTF Academy API client
// All URLs are relative to VITE_API_BASE_URL defined in .env

const BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

export class ApiError extends Error {
  constructor(message, status, body) {
    super(message)
    this.status = status
    this.body = body
  }
}

async function request(path, { method = 'GET', body, token } = {}) {
  if (!BASE_URL) throw new ApiError('VITE_API_BASE_URL is not set — see .env.example', 0, null)

  const url = `${BASE_URL.replace(/\/$/, '')}/${path.replace(/^\//, '')}`
  const headers = { 'Content-Type': 'application/json' }
  
  // If no token is passed explicitly, try to grab it from localStorage
  const authToken = token || localStorage.getItem('access_token')
  if (authToken) headers['Authorization'] = `Bearer ${authToken}`

  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  if (res.status === 204) return null

  let data = null
  try { data = await res.json() } catch { /* empty body */ }

  if (!res.ok) {
    throw new ApiError(data?.detail || data?.error || `Request failed (${res.status})`, res.status, data)
  }
  return data
}

export const api = {
  // ── Auth & profile ─────────────────────────────────────────────────────
  me:            ()          => request('/users/me/'),
  updateProfile: (payload)   => request('/users/me/', { method: 'PUT', body: payload }),
  login:         (email, password) => request('/users/login/', { method: 'POST', body: { email, password } }),
  register:      (payload)   => request('/users/register/', { method: 'POST', body: payload }),
  googleLogin:   (token)     => request('/users/auth/google/', { method: 'POST', body: { access_token: token } }),
  refreshToken:  (refresh)   => request('/users/token/refresh/', { method: 'POST', body: { refresh } }),

  // ── Courses ─────────────────────────────────────────────────────────────
  listCourses:     ()       => request('/courses/'),
  getCourse:       (id)     => request(`/courses/${id}/`),
  getLessonDetail: (id)     => request(`/courses/lessons/${id}/`),

  // ── Enrollments ─────────────────────────────────────────────────────────
  enroll:          (courseId) => request('/progress/enrollments/', { method: 'POST', body: { course_id: courseId } }),
  listEnrollments: ()         => request('/progress/enrollments/'),
  getEnrollment:   (courseId) => request(`/progress/enrollments/${courseId}/`),

  // ── Progress ─────────────────────────────────────────────────────────────
  completeLesson:    (lessonId) => request('/progress/lesson/', { method: 'POST', body: { lesson_id: lessonId } }),
  getCourseProgress: (courseId) => request(`/progress/course/${courseId}/`),

  // ── Quizzes ──────────────────────────────────────────────────────────────
  getModuleQuiz: (moduleId)        => request(`/assessments/module/${moduleId}/`),
  submitQuiz:    (quizId, payload) => request(`/assessments/${quizId}/submit/`, { method: 'POST', body: payload }),
  getQuizResult: (quizId)          => request(`/assessments/${quizId}/result`),

  // ── Certificates ─────────────────────────────────────────────────────────
  myCertificates:      ()      => request('/certificates/my/'),
  verifyCertificate:   (code)  => request(`/certificates/verify/${code}/`),
  downloadCertificate: (certId)=> request(`/certificates/download/${certId}/`),

  // ── Admin — stats & reports ───────────────────────────────────────────────
  adminStats:            () => request('/courses/admin/stats/'),
  adminEnrollmentReport: () => request('/courses/admin/enrollments/report/'),

  // ── Admin — course builder ────────────────────────────────────────────────
  createCourse: (payload)         => request('/courses/admin/', { method: 'POST', body: payload }),
  updateCourse: (id, payload)     => request(`/courses/admin/${id}/`, { method: 'PATCH', body: payload }),
  deleteCourse: (id)              => request(`/courses/admin/${id}/`, { method: 'DELETE' }),
  createModule: (courseId, p)     => request(`/courses/${courseId}/modules/`, { method: 'POST', body: p }),
  updateModule: (moduleId, p)     => request(`/courses/modules/${moduleId}/`, { method: 'PUT', body: p }),
  createLesson: (moduleId, p)     => request(`/courses/modules/${moduleId}/lessons/`, { method: 'POST', body: p }),
}

// ── Admin — quiz management ─────────────────────────────────────────────
export const adminQuizApi = {
  createQuiz:     (moduleId, data)   => request(`/assessments/admin/modules/${moduleId}/quiz/`, { method: 'POST', body: data }),
  getQuizzes:     ()                 => request('/assessments/admin/quizzes/'),
  getQuiz:        (quizId)           => request(`/assessments/admin/quizzes/${quizId}/`),
  updateQuiz:     (quizId, data)     => request(`/assessments/admin/quizzes/${quizId}/`, { method: 'PUT', body: data }),
  deleteQuiz:     (quizId)           => request(`/assessments/admin/quizzes/${quizId}/`, { method: 'DELETE' }),
  createQuestion: (quizId, data)     => request(`/assessments/admin/quizzes/${quizId}/questions/`, { method: 'POST', body: data }),
  updateQuestion: (questionId, data) => request(`/assessments/admin/questions/${questionId}/`, { method: 'PUT', body: data }),
  deleteQuestion: (questionId)       => request(`/assessments/admin/questions/${questionId}/`, { method: 'DELETE' }),
}