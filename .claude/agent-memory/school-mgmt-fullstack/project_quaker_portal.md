---
name: Quaker Education Portal Architecture
description: Identity-based (no-account) quiz portal at /quaker — student verified against Students table, 30m JWT issued
type: project
---

Quiz portal entry point is /quaker (public Navbar button "A Quaker Education").

**Why:** User rejected email/password account model. Students just enter Branch + First/Last Name + Class/Section/Roll to verify against Students JOIN Classes table. A 30-min JWT with `{ studentId, branch_id, userType: "quiz" }` is issued on match.

**Architecture:**
- POST `/api/quiz/verify` (public) — verifies identity, returns JWT + student row
- POST/GET quiz routes use `quizStudentMiddleware` (checks `userType === "quiz"`)
- Frontend stores JWT in `sessionStorage` via `quizTokenHolder` in `quiz.service.js`
- Zustand `useQuizSessionStore` holds `{ quizToken, student }` — hydrates from sessionStorage on mount
- `/quaker/start` — identity form
- `/quaker/quiz` — quiz player (guards: redirect to /quaker/start if no token)
- `/quaker/progress` — either re-verifies identity OR loads from existing session token
- `/admin/quaker` — admin view (reuses features/admin/quicker/AdminPage.js)
- Old `/quicker/*` routes redirect to `/quaker/*`

**Key files:**
- `server/models/quizStudent.model.js` — verifyStudentIdentity() + generateQuizToken()
- `server/middlewares/quizStudent.middleware.js` — quiz JWT validator
- `frontend/src/services/quiz.service.js` — quizTokenHolder + quizClient (axios with token injection)
- `frontend/src/store/quizSessionStore.js` — Zustand session store

**How to apply:** Any quiz feature changes go through quizStudent.middleware not the old studentAuth. Quiz sessions are written to QuizSessions.StudentID (FK to Students table), not StudentUserID.
