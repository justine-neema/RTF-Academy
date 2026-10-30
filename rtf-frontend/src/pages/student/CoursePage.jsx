//
// import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
// import { Link, useNavigate, useParams } from 'react-router-dom'
// import { api } from '../../services/api.js'
// import { useAuth } from '../../context/AuthContext.jsx'
// import { useProgress } from '../../context/ProgressContext.jsx'
// import { useTabVisibility } from '../../hooks/useTabVisibility.js'
// import ProgressBar from '../../components/common/ProgressBar.jsx'
// import Button from '../../components/common/Button.jsx'
//
// // ── helpers ──────────────────────────────────────────────────────────────────
// function extractYouTubeId(url) {
//   if (!url) return null
//   const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|shorts\/))([-\w]+)/)
//   return m ? m[1] : null
// }
//
// function VideoPlayer({ url, videoRef }) {
//   if (!url) {
//     return (
//       <div className="w-full bg-gray-900 flex items-center justify-center rounded-lg" style={{ aspectRatio: '16/9' }}>
//         <div className="text-center text-gray-500">
//           <div className="w-14 h-14 rounded-full border-2 border-gray-600 flex items-center justify-center mx-auto mb-2">
//             <span className="text-2xl">▶</span>
//           </div>
//           <p className="text-sm">No video for this lesson</p>
//         </div>
//       </div>
//     )
//   }
//   const ytId = extractYouTubeId(url)
//   if (ytId) {
//     return (
//       <div className="w-full rounded-lg overflow-hidden bg-black" style={{ aspectRatio: '16/9' }}>
//         <iframe
//           className="w-full h-full"
//           src={`https://www.youtube.com/embed/${ytId}?rel=0`}
//           allowFullScreen
//           title="Lesson video"
//         />
//       </div>
//     )
//   }
//   return (
//     <video
//       ref={videoRef}
//       src={url}
//       controls
//       className="w-full rounded-lg bg-black"
//       style={{ aspectRatio: '16/9' }}
//     >
//       Your browser does not support video playback.
//     </video>
//   )
// }
//
// // ── sidebar icon components ───────────────────────────────────────────────────
// function IconCheck() {
//   return (
//     <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#D19A30] flex items-center justify-center text-white text-xs font-bold">✓</span>
//   )
// }
// function IconCurrent() {
//   return <span className="flex-shrink-0 w-5 h-5 rounded-full bg-navy border-2 border-navy" />
// }
// function IconTodo() {
//   return <span className="flex-shrink-0 w-5 h-5 rounded-full border-2 border-gray-300 bg-white" />
// }
// function IconLock() {
//   return <span className="flex-shrink-0 w-5 h-5 text-gray-400 flex items-center justify-center text-sm">🔒</span>
// }
// function IconQuiz() {
//   return <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#D19A30] flex items-center justify-center text-navy text-xs font-bold">Q</span>
// }
//
// // ── main component ────────────────────────────────────────────────────────────
// export default function CoursePage() {
//   const { id: courseId, moduleId } = useParams()
//   const { getToken } = useAuth()
//   const { isEnrolled, completeLesson } = useProgress()
//   const navigate = useNavigate()
//   const videoRef = useRef(null)
//
//   const [course, setCourse]             = useState(null)
//   const [progress, setProgress]         = useState(null)
//   const [currentLessonId, setLesson]    = useState(null)
//   const [expandedModules, setExpanded]  = useState({})   // { [moduleId]: bool }
//   const [sidebarOpen, setSidebar]       = useState(true) // desktop default open
//   const [completing, setCompleting]     = useState(false)
//   const [loading, setLoading]           = useState(true)
//   const [error, setError]               = useState('')
//
//   // Pause video when user switches tab
//   useTabVisibility(useCallback(() => {
//     if (videoRef.current) videoRef.current.pause()
//   }, []))
//
//   useEffect(() => {
//     async function load() {
//       try {
//         const token = await getToken()
//         const [courseData, progressData] = await Promise.all([
//           api.getCourse(courseId, token),
//           api.getCourseProgress(courseId, token).catch(() => null),
//         ])
//         setCourse(courseData)
//         setProgress(progressData)
//
//         // Default: expand all modules, auto-select first uncompleted lesson
//         const completedSet = new Set(progressData?.completed_lesson_ids || [])
//         const initExpanded = {}
//         let firstUncompleted = null
//
//         ;(courseData.modules || []).forEach((m) => {
//           initExpanded[m.id] = true
//           if (!m.is_locked && !firstUncompleted) {
//             const unc = (m.lessons || []).find((l) => !completedSet.has(l.id))
//             if (unc) firstUncompleted = unc.id
//           }
//         })
//         setExpanded(initExpanded)
//         // If all lessons done, select last lesson; otherwise first uncompleted
//         if (!firstUncompleted) {
//           const allLessons = (courseData.modules || []).flatMap((m) => m.lessons || [])
//           if (allLessons.length) firstUncompleted = allLessons[allLessons.length - 1].id
//         }
//         if (firstUncompleted) setLesson(firstUncompleted)
//       } catch (e) {
//         setError('Could not load course. ' + (e.message || ''))
//       }
//       setLoading(false)
//     }
//     load()
//   }, [courseId, getToken])
//
//   const completedIds = useMemo(
//     () => new Set(progress?.completed_lesson_ids || []),
//     [progress]
//   )
//
//   const flatLessons = useMemo(
//     () => (course?.modules || []).flatMap((m) =>
//       (m.lessons || []).map((l) => ({ ...l, moduleId: m.id, moduleLocked: !!m.is_locked }))
//     ),
//     [course]
//   )
//
//   const currentLesson = flatLessons.find((l) => l.id === currentLessonId) || flatLessons[0]
//   const currentIdx    = flatLessons.findIndex((l) => l.id === currentLesson?.id)
//   const prevLesson    = currentIdx > 0 ? flatLessons[currentIdx - 1] : null
//   const nextLesson    = currentIdx < flatLessons.length - 1 ? flatLessons[currentIdx + 1] : null
//   const progressPct   = progress?.progress_percentage ?? 0
//
//   function allLessonsDone(mod) {
//     return (mod.lessons || []).length > 0 && (mod.lessons || []).every((l) => completedIds.has(l.id))
//   }
//
//   function toggleModule(modId) {
//     setExpanded((prev) => ({ ...prev, [modId]: !prev[modId] }))
//   }
//
//   async function handleMarkComplete() {
//     if (!currentLesson || completing || currentLesson.moduleLocked) return
//     setCompleting(true)
//     try {
//       const result = await completeLesson(currentLesson.id)
//       if (result?.progress_percentage != null) {
//         setProgress((prev) => ({
//           ...(prev || {}),
//           progress_percentage: result.progress_percentage,
//           is_completed: !!result.course_completed,
//           completed_lesson_ids: [
//             ...(prev?.completed_lesson_ids || []),
//             currentLesson.id,
//           ],
//         }))
//       }
//       if (result?.course_completed) {
//         navigate(`/course-complete/${courseId}`)
//         return
//       }
//       // Auto-advance to next unlocked lesson
//       if (nextLesson && !nextLesson.moduleLocked) {
//         setLesson(nextLesson.id)
//       }
//     } catch (e) {
//       setError(e.message || 'Could not save progress.')
//     }
//     setCompleting(false)
//   }
//
//   // ── loading / error / not enrolled ─────────────────────────────────────────
//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <p className="text-gray-400 text-sm">Loading course…</p>
//       </div>
//     )
//   }
//   if (error) {
//     return <p className="text-center py-16 text-red-500 text-sm">{error}</p>
//   }
//   if (!course) return null
//   if (!isEnrolled(courseId)) {
//     return (
//       <div className="max-w-sm mx-auto px-4 py-16 text-center">
//         <p className="text-gray-500 mb-4">You are not enrolled in this course.</p>
//         <Link to={`/courses/${courseId}`}><Button>View Course Details</Button></Link>
//       </div>
//     )
//   }
//
//   // ── render ──────────────────────────────────────────────────────────────────
//   return (
//     // CHANGED: Fixed height wrapper forcing internal overflow rather than whole-page scrolling
//     <div className="flex flex-col h-[calc(100vh-180px)] md:h-[calc(100vh-144px)] min-h-[500px] bg-gray-50 rounded-xl overflow-hidden border border-gray-200 shadow-sm w-full">
//
//       {/* ── Top bar ──────────────────────────────────────────────────── */}
//       {/* CHANGED: Removed sticky top-0, added shrink-0 so it pins flawlessly */}
//       <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 shrink-0 z-20">
//         <button
//           onClick={() => setSidebar((o) => !o)}
//           className="p-1.5 rounded hover:bg-gray-100 text-gray-500 shrink-0"
//           title={sidebarOpen ? 'Hide course menu' : 'Show course menu'}
//         >
//           <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//             <path d="M3 6h18M3 12h18M3 18h18" />
//           </svg>
//         </button>
//
//         <Link to="/dashboard" className="text-xs text-gray-400 hover:text-navy shrink-0">← Dashboard</Link>
//
//         <div className="flex-1 min-w-0">
//           <p className="text-sm font-semibold text-navy truncate">{course.title}</p>
//         </div>
//
//         <div className="hidden sm:flex items-center gap-2 shrink-0 w-40">
//           <ProgressBar percent={progressPct} color="bg-[#D19A30]" height="h-1.5" />
//           <span className="text-xs text-gray-500 whitespace-nowrap">{progressPct}%</span>
//         </div>
//       </div>
//
//       {/* ── Body: sidebar + content ───────────────────────────────────── */}
//       <div className="flex flex-1 overflow-hidden">
//
//         {/* ── LEFT SIDEBAR ─────────────────────────── */}
//         <aside
//           className={`
//             bg-white border-r border-[#D19A30]/40 overflow-y-auto flex-shrink-0 transition-all duration-200
//             ${sidebarOpen ? 'w-72' : 'w-0 overflow-hidden'}
//             [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden
//           `}
//         >
//           <div className="px-4 py-3 border-b border-gray-100">
//             <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Course Content</p>
//             <p className="text-xs text-gray-400 mt-0.5">
//               {flatLessons.filter((l) => completedIds.has(l.id)).length}/{flatLessons.length} lessons completed
//             </p>
//           </div>
//
//           {(course.modules || []).map((mod, modIdx) => {
//             const isLocked  = !!mod.is_locked
//             const isDone    = allLessonsDone(mod)
//             const isOpen    = expandedModules[mod.id]
//             const hasQuiz   = !isLocked && isDone
//
//             return (
//               <div key={mod.id} className="border-b border-gray-100">
//                 <button
//                   onClick={() => !isLocked && toggleModule(mod.id)}
//                   disabled={isLocked}
//                   className={`w-full text-left px-4 py-3 flex items-start gap-2 hover:bg-gray-50 transition-colors ${isLocked ? 'cursor-not-allowed opacity-60' : ''}`}
//                 >
//                   <span className={`text-gray-400 mt-0.5 text-xs transition-transform duration-150 ${isOpen ? 'rotate-90' : ''}`}>▶</span>
//                   <div className="flex-1 min-w-0">
//                     <p className="text-sm font-semibold text-gray-800 leading-tight">
//                       {isLocked && '🔒 '}{mod.title}
//                     </p>
//                     <p className="text-xs text-gray-400 mt-0.5">
//                       {(mod.lessons || []).length} lessons
//                       {isDone && !isLocked && ' · All completed ✓'}
//                     </p>
//                   </div>
//                 </button>
//
//                 {isOpen && !isLocked && (
//                   <div className="pb-1">
//                     {(mod.lessons || []).map((lesson) => {
//                       const done    = completedIds.has(lesson.id)
//                       const active  = lesson.id === currentLesson?.id
//
//                       return (
//                         <button
//                           key={lesson.id}
//                           onClick={() => setLesson(lesson.id)}
//                           className={`
//                             w-full text-left px-4 py-2.5 flex items-center gap-3 transition-colors
//                             ${active
//                               ? 'bg-blue-50 border-l-4 border-navy'
//                               : 'hover:bg-gray-50 border-l-4 border-transparent'
//                             }
//                           `}
//                         >
//                           {done   ? <IconCheck />   : active ? <IconCurrent /> : <IconTodo />}
//                           <div className="flex-1 min-w-0">
//                             <p className={`text-xs leading-snug truncate ${active ? 'text-navy font-semibold' : done ? 'text-gray-500' : 'text-gray-700'}`}>
//                               {lesson.title}
//                             </p>
//                             {lesson.estimated_minutes ? (
//                               <p className="text-xs text-gray-400">{lesson.estimated_minutes} min</p>
//                             ) : null}
//                           </div>
//                         </button>
//                       )
//                     })}
//
//                     {hasQuiz && (
//                       <Link
//                         to={`/learn/${courseId}/assessment/${mod.id}`}
//                         className="w-full text-left px-4 py-2.5 flex items-center gap-3 hover:bg-yellow-50 border-l-4 border-transparent hover:border-[#D19A30] transition-colors"
//                       >
//                         <IconQuiz />
//                         <div className="flex-1 min-w-0">
//                           <p className="text-xs font-semibold text-navy">Module Quiz</p>
//                           <p className="text-xs text-gray-400">Test your knowledge</p>
//                         </div>
//                         <span className="text-xs text-[#D19A30] font-semibold">→</span>
//                       </Link>
//                     )}
//                   </div>
//                 )}
//               </div>
//             )
//           })}
//         </aside>
//
//         {/* ── MAIN CONTENT AREA ────────────────────────────────────── */}
//         <main className="flex-1 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
//           <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
//
//             <div className="mb-5 rounded-xl overflow-hidden shadow-sm">
//               <VideoPlayer url={currentLesson?.video_s3_url} videoRef={videoRef} />
//             </div>
//
//             <div className="mb-4">
//               <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">
//                 {(course.modules || []).find((m) => m.id === currentLesson?.moduleId)?.title || ''}
//               </p>
//               <h1 className="text-xl font-bold text-navy leading-tight">{currentLesson?.title}</h1>
//             </div>
//
//             {currentLesson?.moduleLocked && (
//               <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-5 text-sm text-amber-800">
//                 🔒 This module is locked. Complete all lessons and the quiz in the previous module first.
//               </div>
//             )}
//
//             {currentLesson?.text_content && (
//               <div className="bg-white rounded-xl border border-[#D19A30]/40 shadow-sm px-5 py-5 mb-5">
//                 <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
//                   {currentLesson.text_content}
//                 </p>
//               </div>
//             )}
//
//             <div className="flex items-center justify-between mb-6">
//               <button
//                 onClick={() => prevLesson && setLesson(prevLesson.id)}
//                 disabled={!prevLesson}
//                 className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-navy disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
//               >
//                 <span>←</span> Previous
//               </button>
//               <button
//                 onClick={() => nextLesson && !nextLesson.moduleLocked && setLesson(nextLesson.id)}
//                 disabled={!nextLesson || nextLesson?.moduleLocked}
//                 className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-navy disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
//               >
//                 Next <span>→</span>
//               </button>
//             </div>
//
//             {/* ── MARK AS COMPLETE ──────────────── */}
//             {!currentLesson?.moduleLocked && (
//               <div className="bg-white rounded-xl border border-[#D19A30]/40 shadow-sm px-5 py-5">
//                 {completedIds.has(currentLesson?.id) ? (
//                   <div className="flex items-center gap-3">
//                     <span className="w-8 h-8 rounded-full bg-[#D19A30]/10 text-[#D19A30] flex items-center justify-center text-sm font-bold flex-shrink-0">✓</span>
//                     <div>
//                       <p className="text-sm font-semibold text-[#D19A30]">Lesson completed</p>
//                       <p className="text-xs text-gray-400">Great job! Move to the next lesson or take the module quiz.</p>
//                     </div>
//                   </div>
//                 ) : (
//                   <div>
//                     <p className="text-sm font-medium text-gray-700 mb-3">
//                       Finished this lesson? Mark it as complete to track your progress.
//                     </p>
//                     <Button
//                       onClick={handleMarkComplete}
//                       disabled={completing}
//                       className="w-full sm:w-auto"
//                     >
//                       {completing ? 'Saving…' : '✓ Mark as Complete'}
//                     </Button>
//                   </div>
//                 )}
//
//                 {!completedIds.has(currentLesson?.id) ? null : (() => {
//                   const mod = (course.modules || []).find((m) => m.id === currentLesson?.moduleId)
//                   if (mod && allLessonsDone(mod)) {
//                     return (
//                       <div className="mt-4 pt-4 border-t border-gray-100">
//                         <Link
//                           to={`/learn/${courseId}/assessment/${mod.id}`}
//                           className="inline-flex items-center gap-2 bg-[#D19A30] text-navy-dark font-semibold text-sm px-5 py-2.5 rounded-md hover:opacity-90 transition-opacity"
//                         >
//                           Take Module Quiz →
//                         </Link>
//                         <p className="text-xs text-gray-400 mt-1">Pass the quiz to unlock the next module.</p>
//                       </div>
//                     )
//                   }
//                   return null
//                 })()}
//               </div>
//             )}
//
//             {progress?.is_completed && (
//               <div className="mt-4">
//                 <Link to={`/course-complete/${courseId}`}>
//                   <Button className="w-full bg-[#D19A30] hover:bg-opacity-90 text-white border-none">View My Certificate 🎓</Button>
//                 </Link>
//               </div>
//             )}
//
//           </div>
//         </main>
//       </div>
//     </div>
//   )
// }


import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api } from '../../services/api.js'
import { useAuth } from '../../context/AuthContext.jsx'
import { useProgress } from '../../context/ProgressContext.jsx'
import { useTabVisibility } from '../../hooks/useTabVisibility.js'
import ProgressBar from '../../components/common/ProgressBar.jsx'
import Button from '../../components/common/Button.jsx'

// ── helpers ──────────────────────────────────────────────────────────────────
function extractYouTubeId(url) {
  if (!url) return null
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|shorts\/))([-\w]+)/)
  return m ? m[1] : null
}

function VideoPlayer({ url, videoRef, iframeRef }) {
  if (!url) {
    return (
      <div className="w-full bg-gray-900 flex items-center justify-center rounded-lg" style={{ aspectRatio: '16/9' }}>
        <div className="text-center text-gray-500">
          <div className="w-14 h-14 rounded-full border-2 border-gray-600 flex items-center justify-center mx-auto mb-2">
            <span className="text-2xl">▶</span>
          </div>
          <p className="text-sm">No video for this lesson</p>
        </div>
      </div>
    )
  }

  const ytId = extractYouTubeId(url)

  if (ytId) {
    // Note: Passing our origin is critical for the YouTube JS API to accept commands
    const currentOrigin = typeof window !== 'undefined' ? window.location.origin : ''

    return (
      <div className="w-full rounded-lg overflow-hidden bg-black" style={{ aspectRatio: '16/9' }}>
        <iframe
          ref={iframeRef}
          className="w-full h-full"
          src={`https://www.youtube.com/embed/${ytId}?rel=0&enablejsapi=1&origin=${encodeURIComponent(currentOrigin)}`}
          allowFullScreen
          title="Lesson video"
        />
      </div>
    )
  }

  return (
    <video
      ref={videoRef}
      src={url}
      controls
      className="w-full rounded-lg bg-black"
      style={{ aspectRatio: '16/9' }}
    >
      Your browser does not support video playback.
    </video>
  )
}

// ── sidebar icon components ───────────────────────────────────────────────────
function IconCheck() {
  return (
    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#D19A30] flex items-center justify-center text-white text-xs font-bold">✓</span>
  )
}
function IconCurrent() {
  return <span className="flex-shrink-0 w-5 h-5 rounded-full bg-navy border-2 border-navy" />
}
function IconTodo() {
  return <span className="flex-shrink-0 w-5 h-5 rounded-full border-2 border-gray-300 bg-white" />
}
function IconLock() {
  return <span className="flex-shrink-0 w-5 h-5 text-gray-400 flex items-center justify-center text-sm">🔒</span>
}
function IconQuiz() {
  return <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#D19A30] flex items-center justify-center text-navy text-xs font-bold">Q</span>
}

// ── main component ────────────────────────────────────────────────────────────
export default function CoursePage() {
  const { id: courseId, moduleId } = useParams()
  const { getToken } = useAuth()
  const { isEnrolled, completeLesson } = useProgress()
  const navigate = useNavigate()

  const videoRef = useRef(null)
  const iframeRef = useRef(null)

  const [course, setCourse]             = useState(null)
  const [progress, setProgress]         = useState(null)
  const [currentLessonId, setLesson]    = useState(null)
  const [expandedModules, setExpanded]  = useState({})   // { [moduleId]: bool }
  const [sidebarOpen, setSidebar]       = useState(true) // desktop default open
  const [completing, setCompleting]     = useState(false)
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState('')

  // Pause video when user switches tab
  useTabVisibility(useCallback(() => {
    if (videoRef.current) {
      videoRef.current.pause()
    }
    if (iframeRef.current && iframeRef.current.contentWindow) {
      // Properly stringified command to force YouTube to pause
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func: 'pauseVideo', args: [] }),
        '*'
      )
    }
  }, []))

  useEffect(() => {
    async function load() {
      try {
        const token = await getToken()
        const [courseData, progressData] = await Promise.all([
          api.getCourse(courseId, token),
          api.getCourseProgress(courseId, token).catch(() => null),
        ])
        setCourse(courseData)
        setProgress(progressData)

        const completedSet = new Set(progressData?.completed_lesson_ids || [])
        const initExpanded = {}
        let firstUncompleted = null

        ;(courseData.modules || []).forEach((m) => {
          initExpanded[m.id] = true
          if (!m.is_locked && !firstUncompleted) {
            const unc = (m.lessons || []).find((l) => !completedSet.has(l.id))
            if (unc) firstUncompleted = unc.id
          }
        })
        setExpanded(initExpanded)

        if (!firstUncompleted) {
          const allLessons = (courseData.modules || []).flatMap((m) => m.lessons || [])
          if (allLessons.length) firstUncompleted = allLessons[allLessons.length - 1].id
        }
        if (firstUncompleted) setLesson(firstUncompleted)
      } catch (e) {
        setError('Could not load course. ' + (e.message || ''))
      }
      setLoading(false)
    }
    load()
  }, [courseId, getToken])

  const completedIds = useMemo(
    () => new Set(progress?.completed_lesson_ids || []),
    [progress]
  )

  const flatLessons = useMemo(
    () => (course?.modules || []).flatMap((m) =>
      (m.lessons || []).map((l) => ({ ...l, moduleId: m.id, moduleLocked: !!m.is_locked }))
    ),
    [course]
  )

  const currentLesson = flatLessons.find((l) => l.id === currentLessonId) || flatLessons[0]
  const currentIdx    = flatLessons.findIndex((l) => l.id === currentLesson?.id)
  const prevLesson    = currentIdx > 0 ? flatLessons[currentIdx - 1] : null
  const nextLesson    = currentIdx < flatLessons.length - 1 ? flatLessons[currentIdx + 1] : null
  const progressPct   = progress?.progress_percentage ?? 0

  function allLessonsDone(mod) {
    return (mod.lessons || []).length > 0 && (mod.lessons || []).every((l) => completedIds.has(l.id))
  }

  const totalModules = course?.modules?.length || 0
  const completedModules = (course?.modules || []).filter(m => allLessonsDone(m)).length

  function toggleModule(modId) {
    setExpanded((prev) => ({ ...prev, [modId]: !prev[modId] }))
  }

  async function handleMarkComplete() {
    if (!currentLesson || completing || currentLesson.moduleLocked) return
    setCompleting(true)
    try {
      const result = await completeLesson(currentLesson.id)
      if (result?.progress_percentage != null) {
        setProgress((prev) => ({
          ...(prev || {}),
          progress_percentage: result.progress_percentage,
          is_completed: !!result.course_completed,
          completed_lesson_ids: [
            ...(prev?.completed_lesson_ids || []),
            currentLesson.id,
          ],
        }))
      }
      if (result?.course_completed) {
        navigate(`/course-complete/${courseId}`)
        return
      }
      if (nextLesson && !nextLesson.moduleLocked) {
        setLesson(nextLesson.id)
      }
    } catch (e) {
      setError(e.message || 'Could not save progress.')
    }
    setCompleting(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-400 text-sm">Loading course…</p>
      </div>
    )
  }
  if (error) {
    return <p className="text-center py-16 text-red-500 text-sm">{error}</p>
  }
  if (!course) return null
  if (!isEnrolled(courseId)) {
    return (
      <div className="max-w-sm mx-auto px-4 py-16 text-center">
        <p className="text-gray-500 mb-4">You are not enrolled in this course.</p>
        <Link to={`/courses/${courseId}`}><Button>View Course Details</Button></Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[calc(100vh-180px)] md:h-[calc(100vh-144px)] min-h-[500px] bg-gray-50 rounded-xl overflow-hidden border border-gray-200 shadow-sm w-full">

      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 shrink-0 z-20">
        <button
          onClick={() => setSidebar((o) => !o)}
          className="p-1.5 rounded hover:bg-gray-100 text-gray-500 shrink-0"
          title={sidebarOpen ? 'Hide course menu' : 'Show course menu'}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 6h18M3 12h18M3 18h18" />
          </svg>
        </button>

        <Link to="/dashboard" className="text-xs text-gray-400 hover:text-navy shrink-0">← Dashboard</Link>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-navy truncate">{course.title}</p>
        </div>

        <div className="hidden sm:flex items-center gap-2 shrink-0 w-40">
          <ProgressBar percent={progressPct} color="bg-[#D19A30]" height="h-1.5" />
          <span className="text-xs text-gray-500 whitespace-nowrap">{progressPct}%</span>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">

        <aside
          className={`
            bg-white border-r border-[#D19A30]/40 overflow-y-auto flex-shrink-0 transition-all duration-200
            ${sidebarOpen ? 'w-72' : 'w-0 overflow-hidden'}
            [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden
          `}
        >
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Course Content</p>
            <p className="text-xs text-gray-400 mt-0.5">
              {completedModules}/{totalModules} modules completed
            </p>
          </div>

          {(course.modules || []).map((mod) => {
            const isLocked  = !!mod.is_locked
            const isDone    = allLessonsDone(mod)
            const isOpen    = expandedModules[mod.id]
            const hasQuiz   = !isLocked && isDone

            return (
              <div key={mod.id} className="border-b border-gray-100">
                <button
                  onClick={() => !isLocked && toggleModule(mod.id)}
                  disabled={isLocked}
                  className={`w-full text-left px-4 py-3 flex items-start gap-2 hover:bg-gray-50 transition-colors ${isLocked ? 'cursor-not-allowed opacity-60' : ''}`}
                >
                  <span className={`text-gray-400 mt-0.5 text-xs transition-transform duration-150 ${isOpen ? 'rotate-90' : ''}`}>▶</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 leading-tight">
                      {isLocked && '🔒 '}{mod.title}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {(mod.lessons || []).length} lessons
                      {isDone && !isLocked && ' · All completed ✓'}
                    </p>
                  </div>
                </button>

                {isOpen && !isLocked && (
                  <div className="pb-1">
                    {(mod.lessons || []).map((lesson) => {
                      const done    = completedIds.has(lesson.id)
                      const active  = lesson.id === currentLesson?.id

                      return (
                        <button
                          key={lesson.id}
                          onClick={() => setLesson(lesson.id)}
                          className={`
                            w-full text-left pr-4 pl-12 py-2.5 flex items-center gap-3 transition-colors
                            ${active
                              ? 'bg-blue-50 border-l-4 border-navy'
                              : 'hover:bg-gray-50 border-l-4 border-transparent'
                            }
                          `}
                        >
                          {done   ? <IconCheck />   : active ? <IconCurrent /> : <IconTodo />}
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs leading-snug truncate ${active ? 'text-navy font-semibold' : done ? 'text-gray-500' : 'text-gray-700'}`}>
                              {lesson.title}
                            </p>
                            {lesson.estimated_minutes ? (
                              <p className="text-xs text-gray-400">{lesson.estimated_minutes} min</p>
                            ) : null}
                          </div>
                        </button>
                      )
                    })}

                    {hasQuiz && (
                      <Link
                        to={`/learn/${courseId}/assessment/${mod.id}`}
                        className="w-full text-left pr-4 pl-12 py-2.5 flex items-center gap-3 hover:bg-yellow-50 border-l-4 border-transparent hover:border-[#D19A30] transition-colors"
                      >
                        <IconQuiz />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-navy">Module Quiz</p>
                          <p className="text-xs text-gray-400">Test your knowledge</p>
                        </div>
                        <span className="text-xs text-[#D19A30] font-semibold">→</span>
                      </Link>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </aside>

        <main className="flex-1 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">

            <div className="mb-5 rounded-xl overflow-hidden shadow-sm">
              <VideoPlayer url={currentLesson?.video_s3_url} videoRef={videoRef} iframeRef={iframeRef} />
            </div>

            <div className="mb-4">
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">
                {(course.modules || []).find((m) => m.id === currentLesson?.moduleId)?.title || ''}
              </p>
              <h1 className="text-xl font-bold text-navy leading-tight">{currentLesson?.title}</h1>
            </div>

            {currentLesson?.moduleLocked && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-5 text-sm text-amber-800">
                🔒 This module is locked. Complete all lessons and the quiz in the previous module first.
              </div>
            )}

            {currentLesson?.text_content && (
              <div className="bg-white rounded-xl border border-[#D19A30]/40 shadow-sm px-5 py-5 mb-5">
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                  {currentLesson.text_content}
                </p>
              </div>
            )}

            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => prevLesson && setLesson(prevLesson.id)}
                disabled={!prevLesson}
                className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-navy disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <span>←</span> Previous
              </button>
              <button
                onClick={() => nextLesson && !nextLesson.moduleLocked && setLesson(nextLesson.id)}
                disabled={!nextLesson || nextLesson?.moduleLocked}
                className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-navy disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                Next <span>→</span>
              </button>
            </div>

            {!currentLesson?.moduleLocked && (
              <div className="bg-white rounded-xl border border-[#D19A30]/40 shadow-sm px-5 py-5">
                {completedIds.has(currentLesson?.id) ? (
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-[#D19A30]/10 text-[#D19A30] flex items-center justify-center text-sm font-bold flex-shrink-0">✓</span>
                    <div>
                      <p className="text-sm font-semibold text-[#D19A30]">Lesson completed</p>
                      <p className="text-xs text-gray-400">Great job! Move to the next lesson or take the module quiz.</p>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-3">
                      Finished this lesson? Mark it as complete to track your progress.
                    </p>
                    <Button
                      onClick={handleMarkComplete}
                      disabled={completing}
                      className="w-full sm:w-auto"
                    >
                      {completing ? 'Saving…' : '✓ Mark as Complete'}
                    </Button>
                  </div>
                )}

                {!completedIds.has(currentLesson?.id) ? null : (() => {
                  const mod = (course.modules || []).find((m) => m.id === currentLesson?.moduleId)
                  if (mod && allLessonsDone(mod)) {
                    return (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <Link
                          to={`/learn/${courseId}/assessment/${mod.id}`}
                          className="inline-flex items-center gap-2 bg-[#D19A30] text-navy-dark font-semibold text-sm px-5 py-2.5 rounded-md hover:opacity-90 transition-opacity"
                        >
                          Take Module Quiz →
                        </Link>
                        <p className="text-xs text-gray-400 mt-1">Pass the quiz to unlock the next module.</p>
                      </div>
                    )
                  }
                  return null
                })()}
              </div>
            )}

            {progress?.is_completed && (
              <div className="mt-4">
                <Link to={`/course-complete/${courseId}`}>
                  <Button className="w-full bg-[#D19A30] hover:bg-opacity-90 text-white border-none">View My Certificate 🎓</Button>
                </Link>
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  )
}
