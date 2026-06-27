# BlockSeBlock — Complete Codebase Memory

## Project Overview

BlockSeBlock is a fully-implemented **AI-powered civic issue reporting platform**. Citizens report urban problems (potholes, streetlights, water leaks, garbage, graffiti, etc.), Google Gemini AI analyzes the reports, and government officials track resolution via a dashboard.

**Monorepo** managed with Turborepo + npm workspaces. Node >=20, npm 10.9.0.

---

## Architecture

```
Firebase (Firestore + Auth + Storage + Cloud Functions + Hosting)
     │
     └── Web App (React 19 + Vite 8 SPA)
              │
              └── Shared Package (@blockseblock/shared — Zod schemas + Types)
```

**Pattern:** Feature-based modular architecture with a shared domain layer. Schema-first — Zod schemas in `packages/shared` are the single source of truth for all types.

**Provider stack (outer→inner):** ThemeProvider (next-themes) → QueryProvider (TanStack) → AuthProvider → AppRoutes → Toaster

---

## Directory Structure

```
blockseblock/
├── AGENTS.md                          ← THIS FILE
├── apps/
│   ├── web/                           # React 19 SPA (Vite 8)
│   │   └── src/
│   │       ├── main.tsx               # Entry point
│   │       ├── routes.tsx             # 19 routes, lazy-loaded
│   │       ├── index.css              # Tailwind v4 global styles + design tokens
│   │       ├── hooks/                 # 11 hooks (useAuth, useIssue, useIssues, useComments, useUserVote, useNotifications, useLeaderboard, useAnalytics, usePullToRefresh)
│   │       ├── services/              # 15 services (auth, issue, user, comment, vote, notification, leaderboard, badge, upload, geolocation, permissions, ai, analytics, logger, converters)
│   │       ├── providers/             # app-providers, query-provider, theme-provider
│   │       ├── lib/                   # constants, issue-meta, utils, firebase/ (config, auth, firestore, storage)
│   │       ├── components/
│   │       │   ├── layout/            # AppLayout, PageHeader, AuthLayout, GovLayout, BottomNav, top-bar, section-header, ProtectedRoute, ProtectedRouteAuth, PageLoader, page-container, FAB
│   │       │   ├── ui/                # 32 shadcn-style primitives (button, card, dialog, sheet, tabs, avatar, badge, tooltip, spinner, skeleton, empty-state, error-state, search-input, bottom-sheet, etc.)
│   │       │   └── shared/            # IssueCard, StatCard
│   │       └── features/
│   │           ├── auth/pages/        # Splash, Onboarding (3 slides), Welcome, Login, Signup, ForgotPassword, ProfileCompletion, Unauthorized
│   │           ├── home/pages/        # HomePage (dashboard with stats, nearby issues, trending, activity feed)
│   │           ├── map/pages/         # MapPage (Leaflet + marker clustering + status filter + heatmap)
│   │           ├── report/pages/      # ReportWizardPage (6-step: camera/gallery → map picker → AI analysis → edit → confirm)
│   │           ├── issues/pages/      # IssueDetailsPage (gallery, badges, voting, timeline, map, comments)
│   │           ├── leaderboard/pages/ # LeaderboardPage (weekly/monthly/all-time, podium, badges)
│   │           ├── notifications/pages/ # NotificationsPage (grouped, mark read, filter)
│   │           ├── profile/pages/     # ProfilePage, SettingsPage (theme, notifications, privacy)
│   │           └── gov/pages/         # GovernmentDashboardPage (stats, queue, analytics chart, map, actions)
│   └── functions/                     # Firebase Cloud Functions v2
│       └── src/
│           ├── index.ts               # Exports all triggers + callables
│           ├── config.ts              # Environment config
│           ├── types.ts               # Internal types
│           ├── lib/                   # firebase admin init, errors (HttpsError helpers), validation (Zod), logger
│           ├── triggers/              # onAuthUserCreated, onIssueCreated, onIssueUpdated, onVoteCreated, onCommentCreated
│           ├── callables/             # analyzeIssueImage, submitVote, addComment, syncAuthProfile, updateLeaderboard
│           ├── services/              # authService, issueService, geminiService, duplicateDetectionService, verificationService, notificationService, reputationService, leaderboardService, analyticsService, storageService
│           └── repositories/          # baseRepository, issueRepository, userRepository, voteRepository, commentRepository, notificationRepository, leaderboardRepository, analyticsRepository
├── packages/
│   └── shared/src/
│       ├── constants/                 # APP_NAME, COLLECTIONS, HTTP_STATUS, enum arrays
│       ├── schemas/                   # Zod schemas: common (timestamp, geopoint), enums (UserRole, IssueStatus, IssueCategory, IssueSeverity, VoteType, NotificationType, LeaderboardPeriod), user, issue, vote, comment, notification, leaderboard
│       └── types/                     # api.ts (ApiResponse, ApiError, PaginatedResult), domain.ts, models.ts
├── docs/codebase/                     # ARCHITECTURE.md, CONCERNS.md, CONVENTIONS.md, INTEGRATIONS.md, STACK.md, STRUCTURE.md, TESTING.md — NOTE: many are outdated, AGENTS.md is the single source of truth
├── firebase.json                      # Firestore + Functions + Hosting + Storage config
├── firestore.rules                    # Security rules
├── firestore.indexes.json             # 9 composite indexes
├── storage.rules                      # MIME + size validation
├── turbo.json                         # Turborepo pipeline
├── Dockerfile                         # Nginx deployment alternative
└── .github/workflows/deploy.yml       # CI/CD: push to main → build → deploy to Firebase Hosting
```

---

## Routes (19 total)

| Path | Component | Auth Required | Roles |
|------|-----------|--------------|-------|
| `/` | SplashPage | No | — |
| `/onboarding` | OnboardingPage | No | — |
| `/welcome` | WelcomePage | No | — |
| `/login` | LoginPage | No | — |
| `/signup` | SignupPage | No | — |
| `/forgot-password` | ForgotPasswordPage | No | — |
| `/profile-completion` | ProfileCompletionPage | No | — |
| `/unauthorized` | UnauthorizedPage | No | — |
| `/home` | HomePage | Yes (guest allowed) | any |
| `/map` | MapPage | Yes | any |
| `/report` | ReportWizardPage | Yes | any |
| `/issues/:id` | IssueDetailsPage | Yes | any |
| `/leaderboard` | LeaderboardPage | Yes | any |
| `/notifications` | NotificationsPage | Yes | any |
| `/profile` | ProfilePage | Yes | any |
| `/settings` | SettingsPage | Yes | any |
| `/gov` | GovernmentDashboardPage | Yes | official, moderator |

All page components are lazy-loaded with `React.lazy()` + `Suspense`.

---

## Tech Stack

**Frontend:** React 19.2, Vite 8.1, React Router DOM 7.18, TanStack React Query 5.101, Tailwind CSS 4.3, Radix UI (12 primitives), Framer Motion 11.18, Leaflet + React Leaflet 5.0, react-leaflet-cluster, Sonner toast, Lucide React 0.460, next-themes, clsx + tailwind-merge, `@google/genai` 2.10, Firebase JS SDK 12.15

**Backend:** Firebase Cloud Functions v2 (firebase-functions 4.6 + firebase-admin 12), Gemini 1.5 Flash, Zod 3.24

**Infrastructure:** Firebase (Firestore + Auth + Storage + Hosting), Turborepo, GitHub Actions CI/CD, Docker (Nginx)

---

## Features — All Completed

### Auth & Onboarding
- Google Sign-In (popup), Email/Password login & signup, Anonymous (guest) login, Password reset, Email verification
- Splash → 3-slide Onboarding → Welcome → Login/Signup/Anonymous
- Profile completion after first auth
- Role-based access: `citizen`, `moderator`, `official` — `ProtectedRoute` component with `allowedRoles` prop

### Home Dashboard
- Personalized greeting, search bar, quick-action cards (Report/Map/Leaderboard/My Reports)
- Stats cards (total reports, verified, your reports, streak)
- Nearby issues list + trending issues + community impact stats
- Recent activity feed + user rank card + pull-to-refresh

### Interactive Map (Leaflet)
- Full-screen map with marker clustering (react-leaflet-cluster)
- Status filter tabs (All/Reported/Verified/In Progress/Resolved)
- Bottom sheet on marker click with issue preview
- Heatmap toggle button

### Issue Reporting Wizard (6-step)
1. **Capture:** Camera or gallery selection
2. **Location:** Map click / address search / browser geolocation
3. **AI Analysis:** Sends image to Gemini 1.5 Flash via callable `analyzeIssueImage` — returns category, severity, confidence, suggested title/description/tags
4. **Edit:** User reviews and edits AI suggestions (description, category, severity)
5. **Preview & Confirm:** Final review before submission
6. **Success:** Confirmation with option to view the issue

### Issue Details
- Image gallery with carousel navigation
- Status badge (color-coded), severity badge, category badge
- Voting buttons (upvote/downvote) with count — toggle, switch, unvote support
- Full description, location map, status timeline
- Comments section with add-comment form, sorted oldest-first

### Community Voting
- Upvote/downvote with Firestore transactions (vote doc + issue verification update atomically)
- `submitVote` callable Cloud Function as alternative path
- `onVoteCreated` trigger updates verification counts + reputation

### Comments
- Per-issue comments, real-time via Firestore
- `addComment` callable Cloud Function
- `onCommentCreated` trigger awards reputation + sends notification

### Leaderboard
- Weekly / Monthly / All-time tabs
- Podium display for top 3 users
- Ranked list with avatar, name, score, issues count
- Current user highlighted
- Badges & achievements section
- `updateLeaderboard` callable (admin/moderator only) recalculates scores
- `onAuthUserCreated` initializes leaderboard entry

### Notifications
- Real-time notification feed via Firestore listener
- Grouped by Today / Yesterday / Earlier
- Mark single read, mark all read
- Filter: All / Unread
- Type-based icons (vote, comment, issue_update, verification, assignment, resolution, leaderboard, general)
- `onIssueUpdated` trigger sends status-change notifications
- Notification preferences in Settings

### User Profile
- Avatar, display name, reputation points, streak count, join date
- Stats: Reports submitted, verified count, badges earned
- Earned achievements display
- My Reports list with status badges
- Pull-to-refresh
- Links to Settings and Logout

### Settings
- Theme toggle: Light / Dark / System (next-themes)
- Notification preferences: Push, Email, Leaderboard updates toggles
- Privacy: Public profile toggle, Share location on reports toggle
- App version display

### Government Dashboard
- Stats cards: Active issues, Resolved this month, Total reports, Total verifications
- Issue queue with search/filter (status, category, severity), assign to official, update status
- Analytics tab with bar chart (reports over time by category)
- Issues map view
- Quick actions: Export reports, Manage officials, System settings

### AI Analysis (Gemini)
- **`enrichIssueOnCreate`** (called by `onIssueCreated` trigger): Analyzes issue image via Gemini API, classifies category/severity, generates title/description/tags; has retry logic (3 attempts), keyword-based fallback if AI fails
- **`analyzeIssueImage`** callable: On-demand AI analysis during wizard; returns structured JSON: `{ category, severity, confidence, suggestedTitle, suggestedDescription, suggestedTags }`
- Fallback analysis using keyword matching on description when image analysis fails

### Duplicate Detection
- Token-based text similarity (Jaccard coefficient on token sets)
- Geohash proximity scoring (same prefix = higher duplicate probability)
- Combined score: `0.7 × textSimilarity + 0.3 × proximityScore`
- If score > 0.7, issue is marked as duplicate
- Sends notification to reporter about potential duplicate
- `duplicateOf`, `duplicateScore` fields on issue document

### Reputation System
- Events and their point values:
  - Report issue: +10
  - Issue verified (upvotes reach threshold): +5
  - Add comment: +2
  - Receive upvote: +1
  - Receive downvote: -1
- Reputation score stored on user profile
- Adjusted via Cloud Functions triggers

### Leaderboard
- Scores calculated per period (weekly/monthly/all_time) based on:
  - issuesReported × 10
  - issuesVerified × 20
  - reputation score
- Docs stored in `leaderboard` collection with composite index `period+score`
- Rebuilt via `updateLeaderboard` callable (admin/moderator only)
- Initialized on user creation via `onAuthUserCreated`

---

## Cloud Functions — Complete

### Triggers (Firestore + Auth)
| Trigger | Event | Action |
|---------|-------|--------|
| `onAuthUserCreated` | Auth user created | Creates Firestore user doc with default citizen role, sets custom claims, initializes leaderboard entry |
| `onIssueCreated` | `issues/{id}` created | Runs AI enrichment (Gemini), duplicate detection, reputation award (+10), duplicate notification |
| `onIssueUpdated` | `issues/{id}` updated | Sends status-change notification to reporter, records analytics on resolution |
| `onVoteCreated` | `votes/{id}` created | Updates issue.verification.upvotes/downvotes count, adjusts reputation |
| `onCommentCreated` | `comments/{id}` created | Awards reputation (+2), sends notification to issue reporter |

### Callables (HTTPS)
| Function | Auth | Input | Output |
|----------|------|-------|--------|
| `analyzeIssueImage` | Required | `{ issueId }` | `{ category, severity, confidence, suggestedTitle, suggestedDescription, suggestedTags }` |
| `submitVote` | Required | `{ issueId, type: 'upvote'|'downvote' }` | `{ status, voteId }` — transactional write |
| `addComment` | Required | `{ issueId, text }` | `{ status, commentId }` |
| `syncAuthProfile` | Required | `{ role? }` | `{ status }` — syncs auth UID to Firestore profile |
| `updateLeaderboard` | Required (admin/moderator only) | `{ period }` | `{ status, period }` — rebuilds leaderboard rankings |

---

## Backend Services (functions/src/services/)

| Service | Key Responsibilities |
|---------|---------------------|
| **issueService** | `enrichIssueOnCreate` — orchestrates AI analysis + duplicate detection + reputation + notification on new issue |
| **geminiService** | `analyzeImage(mediaUrl)` — calls Gemini 1.5 Flash, retry loop (3 attempts, exponential backoff), fallback keyword analysis; returns structured `{ category, severity, confidence, suggestedTitle, suggestedDescription, suggestedTags }` |
| **duplicateDetectionService** | `findDuplicates(description, geohash)` — token-Jaccard similarity + geohash proximity scoring; threshold 0.7 |
| **verificationService** | `registerVote(issueId, userId, type)` — Firestore transaction (write vote doc + atomically increment issue verification count); handles toggle/switching/unvote |
| **notificationService** | `createNotification(userId, type, title, body, data)` — creates notification doc; `markAsRead`, `markAllAsRead` |
| **reputationService** | `adjustReputation(userId, points)` — increments user.reputation; also adjusts issuesReported/issuesVerified counters |
| **leaderboardService** | `rebuildLeaderboard(period)` — aggregates user scores, writes leaderboard docs; `initLeaderboardEntry(userId)` |
| **analyticsService** | `recordEvent(key, scope, metrics)` — upserts analytics docs |
| **storageService** | `validateFile(mimeType, size)` — MIME + size checks; `getSignedUrl(path)` — generates signed URLs |
| **authService** | `isPrivilegedRole(role)`, `normalizeRole(role)` — role-checking utilities |

## Backend Repositories (data access layer, BaseRepository pattern)

| Repository | Collection | Key Methods |
|------------|-----------|-------------|
| **baseRepository** | Generic | `get(id)`, `set(id, data)`, `update(id, data)`, `delete(id)`, `query(constraints)`, `runTransaction(updateFn)` |
| **issueRepository** | `issues` | `get(id)`, `update(id, data)`, `addVerification(id, delta)`, `queryByStatus(status, limit)` |
| **userRepository** | `users` | `get(id)`, `set(id, data)`, `update(id, data)`, `incrementReputation(id, points)`, `incrementField(id, field)` |
| **voteRepository** | `votes` | `get(issueId, userId)`, `set(id, data)`, `delete(id)`, `exists(issueId, userId)` |
| **commentRepository** | `comments` | `create(commentData)`, `getByIssue(issueId)` |
| **notificationRepository** | `notifications` | `create(data)`, `getByUser(userId)`, `markAsRead(id)`, `markAllAsRead(userId)` |
| **leaderboardRepository** | `leaderboard` | `getByPeriod(period, limit)`, `set(id, data)`, `deleteByPeriod(period)` |
| **analyticsRepository** | `analytics` | `recordEvent(key, scope, metrics)` |

---

## Firebase Firestore Schema

### `users/{uid}`
```ts
{ uid, displayName, email, photoURL?, phoneNumber?, role: 'citizen'|'moderator'|'official',
  reputation: number, issuesReported: number, issuesVerified: number, badges: string[],
  streakDays: number, lastActive: Timestamp, location?: GeoPoint, locationLabel?: string,
  fcmTokens: string[], createdAt: Timestamp, updatedAt: Timestamp }
```

### `issues/{issueId}`
```ts
{ id, reporterId, status: 'reported'|'verified'|'in_progress'|'resolved'|'rejected',
  category: 'pothole'|'streetlight'|'water_leak'|'garbage'|'graffiti'|'sidewalk'|'other',
  severity: 'low'|'medium'|'high'|'critical', title, description,
  location: { geohash, geopoint: GeoPoint, address },
  media: { images: string[], videos: string[], thumbnail? },
  aiAnalysis?: { category, severity, confidence (0-1), suggestedTitle, suggestedDescription, suggestedTags, duplicateProbability (0-1) },
  duplicateOf?, duplicateScore?,
  verification: { upvotes, downvotes, verifiedBy: string[], verifiedAt? },
  assignedTo?, resolution?: { resolvedAt, resolvedBy, resolutionNotes, beforeAfterPhotos },
  tags: string[], createdAt: Timestamp, updatedAt: Timestamp }
```

### `votes/{issueId}_{userId}`
```ts
{ issueId, userId, type: 'upvote'|'downvote', createdAt: Timestamp }
```

### `comments/{commentId}`
```ts
{ issueId, userId, text, createdAt: Timestamp }
```

### `notifications/{notificationId}`
```ts
{ userId, type, title, body, data: Record<string,unknown>, read: boolean, createdAt: Timestamp }
```

### `leaderboard/{period}_{userId}`
```ts
{ userId, displayName, photoURL?, score, issuesReported, issuesVerified, period, weekStart?, monthStart?, updatedAt }
```

### `analytics/{docId}`
```ts
{ key, scope, metrics: Record<string,number>, updatedAt: Timestamp }
```

### Firestore Indexes
- `issues`: status+createdAt↓, category+createdAt↓, reporterId+createdAt↓, severity+createdAt↓, geohash+status
- `votes`: issueId+userId (unique)
- `comments`: issueId+createdAt↓
- `notifications`: userId+read+createdAt↓
- `leaderboard`: period+score↓
- `analytics`: scope+updatedAt↓

---

## Firefox Security Rules

- Helper functions: `signedIn()`, `role()`, `isOwner(uid)`, `isModerator()`, `isAdmin()`, `isPrivileged()`
- `users`: signed-in read; owner/privileged create/update; admin delete
- `issues`: public read; signed-in create (must match reporterId); owner/privileged update & delete
- `votes`: signed-in read; user creates own; owner/privileged update/delete
- `comments`: public read; signed-in create (must match userId); owner/privileged update/delete
- `notifications`: owner/privileged read/update/delete; no public create
- `leaderboard`: public read; privileged write
- `analytics`: privileged read only
- `badges`: public read; admin write

---

## Frontend Service Layer (apps/web/src/services/)

All services return typed promises. Key patterns:
- **issue.service.ts**: `create`, `getById`, `update`, `delete`, `listenToIssue(id, callback)` (returns unsubscribe fn), `queryByStatus`
- **auth.service.ts**: `signInWithGoogle`, `signInWithEmail`, `signUp`, `signInAnonymously`, `signOut`, `sendPasswordReset`, `sendEmailVerification`, `getCurrentUser`
- **user.service.ts**: `getUser`, `updateUser`, `listenToUser`
- **comment.service.ts**: `getComments(issueId)`, `addComment(issueId, text)` (calls callable)
- **vote.service.ts**: `getUserVote(issueId, userId)`, `castVote(issueId, type)` (transactional)
- **notification.service.ts**: `getNotifications(userId)`, `listenToNotifications`, `markAsRead`, `markAllAsRead`
- **leaderboard.service.ts**: `getLeaderboard(period)`
- **badge.service.ts**: `getBadges`, `getUserBadges`
- **upload.service.ts**: `uploadFile(path, file)`, `deleteFile(path)`
- **geolocation.service.ts**: `getCurrentPosition()`, `geocode(address)`, `reverseGeocode(lat, lng)`
- **permissions.service.ts**: `hasPermission(requiredRole)`, `isPrivileged(role)`
- **ai.service.ts**: `analyzeIssueImage(issueId)` (calls callable)
- **analytics.service.ts**: `trackEvent(name, properties)`
- **logger.service.ts**: `info`, `warn`, `error` — console wrapper with env-aware filtering
- **converters.ts**: Firestore Timestamp ↔ Date, GeoPoint conversion utilities

## Frontend Custom Hooks

- **useAuth**: Full auth context provider — `user`, `userProfile`, `loading`, `signIn`, `signUp`, `signOut`, `signInWithGoogle`, `signInAnonymously`, `isAuthenticated`, `isPrivileged`
- **useIssue(id)**: Single issue with real-time updates
- **useIssues(filters?)**: Paginated issue list with filters
- **useComments(issueId)**: Comments with real-time listener
- **useUserVote(issueId)**: Current user's vote state (upvote/downvote/none)
- **useNotifications**: Real-time notification feed with unread count
- **useLeaderboard(period)**: Leaderboard data with period switching
- **useAnalytics(scope)**: Analytics data
- **usePullToRefresh**: Mobile pull-to-refresh gesture handler

---

## UI Components (32 primitives in components/ui/)

button, card, dialog, sheet, tabs, input, textarea, label, avatar, badge, switch, checkbox, radio-group, slider, progress, separator, tooltip, dropdown-menu, alert-dialog, scroll-area, skeleton, spinner, empty-state, error-state, search-input, bottom-sheet, icon-button, sonner (toast), theme-toggle, typography, file all barrel-exported from `index.ts`

---

## Known Tech Debt (Minor)

1. **No tests** — no test framework, no test files, no test scripts anywhere
2. **`App.tsx`** contains unused Vite template code (not imported; `main.tsx` uses `routes.tsx` directly)
3. **TypeScript version mismatch**: root ^6.0.3, web ~6.0.2, functions ^5.0.0, shared ^5.7.2
4. **`VITE_UI_DEV_MODE`** flag can bypass Firebase auth in dev
5. **No linting for functions** (ESLint instead of Oxlint)
6. **No path aliases in functions** (uses `../` relative imports)

---

## Environment Variables Required

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
GEMINI_API_KEY=
GEMINI_MODEL=gemini-1.5-flash
FIREBASE_FUNCTIONS_REGION=us-central1
```

---

## Key Conventions

- **Files**: features lowercase/kebab, components PascalCase, services camelCase.service.ts
- **Imports**: external → `@blockseblock/shared` → `@/` alias → relative
- **Components**: functional only, lazy-loaded pages, hooks for logic
- **Error handling**: services return null for not-found, Firebase errors propagate, UI handles via React Query loading/error states
- **Services**: plain objects with async methods (not classes)
- **Functions backend**: Repository pattern (baseRepository → per-collection repos), service layer for business logic, triggers for side effects
