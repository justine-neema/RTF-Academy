# RTF Academy — Frontend (Phase 3)

React + Vite + Tailwind frontend for the Raise Them Foundation e-learning platform,
built to match the Figma mobile mockups and the Phase 2 API Endpoint Specification.

## Project tree

```
rtf-academy/
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── index.html
└── src/
    ├── main.jsx                 # React root, providers, router
    ├── App.jsx
    ├── index.css                # Tailwind + integrity-lock helper class
    │
    ├── assets/
    │   └── logo.png             # Real RTF logo (header + certificate)
    │
    ├── data/
    │   └── mockData.js          # Shaped exactly like the API spec responses
    │
    ├── services/
    │   ├── firebase.js          # Firebase init — no-ops until .env keys are set
    │   └── api.js               # fetch wrapper, one function per backend endpoint
    │
    ├── context/
    │   ├── AuthContext.jsx      # Firebase email/password + Google, demo-mode fallback
    │   └── ProgressContext.jsx  # enroll/completeLesson/certificates — mirrors /enrollments, /progress, /certificates
    │
    ├── hooks/
    │   └── useTabVisibility.js  # tab-switch / blur detection for quiz integrity
    │
    ├── components/
    │   ├── layout/
    │   │   ├── Header.jsx
    │   │   ├── Footer.jsx
    │   │   └── ProtectedRoute.jsx
    │   ├── common/
    │   │   ├── Button.jsx
    │   │   ├── ProgressBar.jsx
    │   │   ├── StatCard.jsx
    │   │   └── GoogleButton.jsx
    │   └── assessment/
    │       ├── QuizIntegrityWrapper.jsx   # copy/paste block + tab-switch flagging
    │       └── QuizTimer.jsx
    │
    ├── pages/
    │   ├── HomePage.jsx
    │   ├── auth/
    │   │   ├── RegisterPage.jsx
    │   │   ├── LoginPage.jsx
    │   │   └── ForgotPasswordPage.jsx
    │   ├── student/
    │   │   ├── StudentDashboard.jsx
    │   │   ├── CourseCatalogPage.jsx
    │   │   ├── CourseDetailPage.jsx        # "Enrollment detail" screen
    │   │   ├── EnrollmentSuccessPage.jsx
    │   │   ├── CoursePage.jsx              # lesson viewer + module accordion
    │   │   ├── AssessmentPage.jsx          # quiz + integrity wrapper
    │   │   ├── CourseCompletePage.jsx       # certificate-earned screen
    │   │   └── CertificatesPage.jsx        # "My Certificates" screen
    │   └── admin/
    │       └── AdminDashboard.jsx
    │
    └── routes/
        └── AppRoutes.jsx         # all route definitions
```

## Run it

```bash
npm install
npm run dev       # http://localhost:5173 (or next free port)
npm run build      # production build → dist/
```

Copy `.env.example` to `.env` and fill it in when you're ready to connect
real services (see below). Until then, the app auto-detects missing config
and runs in **local demo mode**: auth and progress are stubbed with
`localStorage` so you can demo the full flow today. Log in with any
email/password; an email containing "admin" (e.g. `admin@rtf.org`) drops you
into the admin dashboard.

## Connecting the real backend

Your backend is live at `https://rtf-academy-backend.onrender.com`, but a
bare Render URL returning 404 at `/` is normal for a Django app — nothing is
routed at the root. You need the actual API prefix, which lives in your
Django `urls.py` (commonly `/api/` or `/api/v1/`). Once you know it, set:

```
VITE_API_BASE_URL=https://rtf-academy-backend.onrender.com/api/v1
```

in `.env`. `src/services/api.js` is a thin fetch wrapper with one function
per endpoint in the Phase 2 spec (`api.listCourses()`, `api.enroll()`,
`api.submitAssessment()`, etc.) — call these instead of reading
`mockData.js` as you wire each page up for real.

Two things worth knowing:
- **Render free tier spins down when idle.** The first request after a
  while can take 30-60 seconds to wake the service — that's not a bug.
- **CORS**: make sure the Django backend's `CORS_ALLOWED_ORIGINS` includes
  wherever this frontend is served from (`http://localhost:5173` for dev,
  plus your real deployed domain later), or every request will fail silently
  in the browser console with a CORS error, not a helpful one.

## Firebase Auth + Google sign-in

The API spec says tokens come from Firebase Authentication and get
validated by the Django backend — so real login (and the Google button)
need a Firebase project. In Firebase Console → Project Settings → General →
"Your apps" → SDK setup, copy the six config values into `.env`:

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

Also enable **Google** as a sign-in provider under Firebase Console →
Authentication → Sign-in method (it's off by default).

Once those are set, `AuthContext` automatically switches from demo mode to
real Firebase: `register`/`login` use Firebase email/password, and
`loginWithGoogle` opens the Google popup — no code changes needed, it's all
driven by whether `VITE_FIREBASE_API_KEY` is present. After Firebase
authenticates, the frontend calls `GET /users/me` with the Firebase ID
token to fetch/create the matching backend profile (role, full name, etc.).
If the backend isn't reachable yet, login still succeeds using the Firebase
identity alone, so you're never blocked by backend downtime while testing.

## Screens covered (matches the Figma set)

Homepage · Registration · Login · Forgot Password · Student Dashboard ·
Course Catalog · Course Detail / Enrollment · Enrollment Success · Course
(lesson) Page · Assessment/Quiz · Certificate Earned · My Certificates ·
Admin Dashboard.

## Progress tracking

`ProgressContext` tracks, per course, per learner: `enrolled_at`,
`progress_percent`, `completed_lessons`, `status`, and `certificate`. It
recomputes `progress_percent` every time a lesson is marked complete, drives
every progress bar in the app (dashboard cards, course sidebar, certificates
page, admin course-performance chart), and is the single source of truth for
unlocking the certificate once a course hits 100%.

Swap `ProgressContext`'s functions for real `fetch()` calls to
`/enrollments`, `/progress/lesson`, `/progress/course/{id}`, and
`/certificates/generate/{id}` when the Django backend is live — the object
shapes already match the documented responses, so components don't need to
change.

## Academic-integrity feature (assessments)

`QuizIntegrityWrapper` + `useTabVisibility` add lightweight, transparent
deterrents to the quiz screen, aimed at casual copy-pasting into an AI tool
or looking up answers mid-quiz — not a lockdown browser:

- Blocks copy / paste / cut / right-click inside the quiz
- Detects tab switches and window-blur events
- Shows the learner an upfront notice explaining what's tracked (no hidden
  monitoring, no camera/mic access, no screen recording)
- After `maxWarnings` (default 3) violations, the submission is flagged for
  facilitator review — it still submits, it's just marked for a human to
  look at, alongside a timestamped `integrity_log` per enrollment
- A countdown timer (`QuizTimer`) auto-submits when time runs out

This is a deterrent layer, not a guarantee — pair it with facilitator spot
checks and varied/randomized question banks for anything higher-stakes.

## Next steps for later phases

- Wire `AuthContext` to Firebase Authentication + the Django `/auth/*`
  endpoints
- Replace `mockData.js` reads with real `fetch()` calls to `/courses`,
  `/enrollments`, `/assessments`, `/certificates`, `/admin/stats`
- Add real video hosting for lesson content (`video_url` field is already
  in the lesson shape)
- Consider server-side randomized question banks per assessment attempt to
  complement the integrity wrapper
