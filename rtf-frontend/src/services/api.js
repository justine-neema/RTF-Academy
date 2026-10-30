// // RTF Academy API client
// // All URLs are relative to VITE_API_BASE_URL defined in .env
//
// const BASE_URL = import.meta.env.VITE_API_BASE_URL || ''
//
// export class ApiError extends Error {
//   constructor(message, status, body) {
//     super(message)
//     this.status = status
//     this.body = body
//   }
// }
//
// async function request(path, { method = 'GET', body, token } = {}) {
//   if (!BASE_URL) throw new ApiError('VITE_API_BASE_URL is not set — see .env.example', 0, null)
//
//   const url = `${BASE_URL.replace(/\/$/, '')}/${path.replace(/^\//, '')}`
//   const headers = { 'Content-Type': 'application/json' }
//   if (token) headers['Authorization'] = `Bearer ${token}`
//
//   const res = await fetch(url, {
//     method,
//     headers,
//     body: body ? JSON.stringify(body) : undefined,
//   })
//
//   if (res.status === 204) return null
//
//   let data = null
//   try { data = await res.json() } catch { /* empty body */ }
//
//   if (!res.ok) {
//     throw new ApiError(data?.detail || data?.error || `Request failed (${res.status})`, res.status, data)
//   }
//   return data
// }
//
// export const api = {
//   // ── Auth & profile ─────────────────────────────────────────────────────
//   me:            (token)          => request('/users/me/', { token }),
//   updateProfile: (payload, token) => request('/users/me/', { method: 'PUT', body: payload, token }),
//
//   // ── Courses ─────────────────────────────────────────────────────────────
//   listCourses:     (token)       => request('/courses/', { token }),
//   getCourse:       (id, token)   => request(`/courses/${id}/`, { token }),
//   getLessonDetail: (id, token)   => request(`/courses/lessons/${id}/`, { token }),
//
//   // ── Enrollments ─────────────────────────────────────────────────────────
//   enroll:          (courseId, token) => request('/progress/enrollments/', { method: 'POST', body: { course_id: courseId }, token }),
//   listEnrollments: (token)           => request('/progress/enrollments/', { token }),
//   getEnrollment:   (courseId, token) => request(`/progress/enrollments/${courseId}/`, { token }),
//
//   // ── Progress ─────────────────────────────────────────────────────────────
//   completeLesson:    (lessonId, token) => request('/progress/lesson/', { method: 'POST', body: { lesson_id: lessonId }, token }),
//   getCourseProgress: (courseId, token) => request(`/progress/course/${courseId}/`, { token }),
//
//   // ── Quizzes ──────────────────────────────────────────────────────────────
//   getModuleQuiz: (moduleId, token)              => request(`/assessments/module/${moduleId}/`, { token }),
//   submitQuiz:    (quizId, payload, token)        => request(`/assessments/${quizId}/submit/`, { method: 'POST', body: payload, token }),
//   getQuizResult: (quizId, token)                => request(`/assessments/${quizId}/result`, { token }),
//
//   // ── Certificates ─────────────────────────────────────────────────────────
//   myCertificates:      (token)          => request('/certificates/my/', { token }),
//   verifyCertificate:   (code)           => request(`/certificates/verify/${code}/`),
//   downloadCertificate: (certId, token)  => request(`/certificates/download/${certId}/`, { token }),
//
//   // ── Admin — stats & reports ───────────────────────────────────────────────
//   adminStats:            (token) => request('/courses/admin/stats/', { token }),
//   adminEnrollmentReport: (token) => request('/courses/admin/enrollments/report/', { token }),
//
//   // ── Admin — course builder ────────────────────────────────────────────────
//   createCourse: (payload, token)         => request('/courses/admin/', { method: 'POST', body: payload, token }),
//   updateCourse: (id, payload, token)     => request(`/courses/admin/${id}/`, { method: 'PATCH', body: payload, token }),
//   deleteCourse: (id, token)             => request(`/courses/admin/${id}/`, { method: 'DELETE', token }),
//   createModule: (courseId, p, token)    => request(`/courses/${courseId}/modules/`, { method: 'POST', body: p, token }),
//   updateModule: (moduleId, p, token)    => request(`/courses/modules/${moduleId}/`, { method: 'PUT', body: p, token }),
//   createLesson: (moduleId, p, token)    => request(`/courses/modules/${moduleId}/lessons/`, { method: 'POST', body: p, token }),
// }

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
  if (token) headers['Authorization'] = `Bearer ${token}`

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
  me:            (token)          => request('/users/me/', { token }),
  updateProfile: (payload, token) => request('/users/me/', { method: 'PUT', body: payload, token }),

  // ── Courses ─────────────────────────────────────────────────────────────
  listCourses:     (token)       => request('/courses/', { token }),
  getCourse:       (id, token)   => request(`/courses/${id}/`, { token }),
  getLessonDetail: (id, token)   => request(`/courses/lessons/${id}/`, { token }),

  // ── Enrollments ─────────────────────────────────────────────────────────
  enroll:          (courseId, token) => request('/progress/enrollments/', { method: 'POST', body: { course_id: courseId }, token }),
  listEnrollments: (token)           => request('/progress/enrollments/', { token }),
  getEnrollment:   (courseId, token) => request(`/progress/enrollments/${courseId}/`, { token }),

  // ── Progress ─────────────────────────────────────────────────────────────
  completeLesson:    (lessonId, token) => request('/progress/lesson/', { method: 'POST', body: { lesson_id: lessonId }, token }),
  getCourseProgress: (courseId, token) => request(`/progress/course/${courseId}/`, { token }),

  // ── Quizzes ──────────────────────────────────────────────────────────────
  getModuleQuiz: (moduleId, token)              => request(`/assessments/module/${moduleId}/`, { token }),
  submitQuiz:    (quizId, payload, token)        => request(`/assessments/${quizId}/submit/`, { method: 'POST', body: payload, token }),
  getQuizResult: (quizId, token)                => request(`/assessments/${quizId}/result`, { token }),

  // ── Certificates ─────────────────────────────────────────────────────────
  myCertificates:      (token)          => request('/certificates/my/', { token }),
  verifyCertificate:   (code)           => request(`/certificates/verify/${code}/`),
  downloadCertificate: (certId, token)  => request(`/certificates/download/${certId}/`, { token }),

  // ── Admin — stats & reports ───────────────────────────────────────────────
  adminStats:            (token) => request('/courses/admin/stats/', { token }),
  adminEnrollmentReport: (token) => request('/courses/admin/enrollments/report/', { token }),

  // ── Admin — course builder ────────────────────────────────────────────────
  createCourse: (payload, token)         => request('/courses/admin/', { method: 'POST', body: payload, token }),
  updateCourse: (id, payload, token)     => request(`/courses/admin/${id}/`, { method: 'PATCH', body: payload, token }),
  deleteCourse: (id, token)             => request(`/courses/admin/${id}/`, { method: 'DELETE', token }),
  createModule: (courseId, p, token)    => request(`/courses/${courseId}/modules/`, { method: 'POST', body: p, token }),
  updateModule: (moduleId, p, token)    => request(`/courses/modules/${moduleId}/`, { method: 'PUT', body: p, token }),
  createLesson: (moduleId, p, token)    => request(`/courses/modules/${moduleId}/lessons/`, { method: 'POST', body: p, token }),
}

// ── Admin — quiz management ─────────────────────────────────────────────
export const adminQuizApi = {
  createQuiz:     (moduleId, data, token)   => request(`/assessments/admin/modules/${moduleId}/quiz/`, { method: 'POST', body: data, token }),
  getQuizzes:     (token)                   => request('/assessments/admin/quizzes/', { token }),
  getQuiz:        (quizId, token)           => request(`/assessments/admin/quizzes/${quizId}/`, { token }),
  updateQuiz:     (quizId, data, token)     => request(`/assessments/admin/quizzes/${quizId}/`, { method: 'PUT', body: data, token }),
  deleteQuiz:     (quizId, token)           => request(`/assessments/admin/quizzes/${quizId}/`, { method: 'DELETE', token }),
  createQuestion: (quizId, data, token)     => request(`/assessments/admin/quizzes/${quizId}/questions/`, { method: 'POST', body: data, token }),
  updateQuestion: (questionId, data, token) => request(`/assessments/admin/questions/${questionId}/`, { method: 'PUT', body: data, token }),
  deleteQuestion: (questionId, token)       => request(`/assessments/admin/questions/${questionId}/`, { method: 'DELETE', token }),
}