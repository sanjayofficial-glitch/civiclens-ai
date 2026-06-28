# Integrations

## External Services

### Firebase Platform

| Service | Purpose | Configuration |
|---------|---------|---------------|
| **Firestore** | Primary database | `firebase.json`, `firestore.rules` |
| **Authentication** | User management | Firebase Auth SDK |
| **Storage** | File uploads (images/videos) | `storage.rules` |
| **Hosting** | SPA deployment | `firebase.json` hosting config |
| **Cloud Functions** | Serverless backend | `apps/functions/` |

### Firebase Configuration

Environment variables (from `apps/web/.env.local`):
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

All validated at module load in `apps/web/src/lib/firebase/config.ts` — throws descriptive error if any are missing.

Firebase Admin env vars (for functions):
- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`

Gemini:
- `GEMINI_API_KEY`
- `GEMINI_MODEL` (default: `gemini-1.5-flash`)

### Authentication Methods

From `apps/web/src/services/auth.service.ts`:
- Google Sign-In (popup)
- Email/Password Sign-In
- Email/Password Sign-Up
- Password Reset
- Email Verification
- Anonymous Sign-In (guest)
- Sign Out

### Maps Integration

| Library | Purpose |
|---------|---------|
| Leaflet | Map rendering |
| React Leaflet | React bindings |
| React Leaflet Cluster | Marker clustering |

## Internal Integrations

### Shared Package (`@CivicLens/shared`)

Used by both `apps/web` and `apps/functions`:
- Zod schemas for validation
- TypeScript types
- Constants

### Firebase SDKs

| App | SDK | Version |
|-----|-----|---------|
| web | firebase | ^12.15.0 |
| functions | firebase-admin | ^12.0.0 |
| functions | firebase-functions | ^4.6.0 |

## API Layer

### Firestore Operations (Web)

From `apps/web/src/services/`:
- `auth.service.ts` — Authentication operations
- `issue.service.ts` — Issue CRUD + real-time listeners (with smart fallback on missing composite indexes)
- `user.service.ts` — User profile operations
- `vote.service.ts` — Transactional vote casting with toggle/switch/unvote
- `comment.service.ts` — Comment CRUD + real-time listener
- `notification.service.ts` — Notification fetch + real-time listener
- `leaderboard.service.ts` — Leaderboard queries by period
- `badge.service.ts` — Badge fetching
- `upload.service.ts` — File upload to Storage
- `geolocation.service.ts` — Browser geolocation + geocoding
- `permissions.service.ts` — Permission checks
- `ai.service.ts` — Wrapper for `analyzeIssueImage` callable
- `analytics.service.ts` — Event tracking
- `logger.service.ts` — Console wrapper with env-aware filtering
- `converters.ts` — Firestore DocumentSnapshot converters (Timestamp → ISO string)

### Cloud Functions (Backend)

#### Triggers (Firestore + Auth)

| Trigger | Event | Action |
|---------|-------|--------|
| `onAuthUserCreated` | Auth user created | Creates Firestore user doc, sets custom claims, initializes leaderboard entry |
| `onIssueCreated` | `issues/{id}` created | AI enrichment (Gemini), duplicate detection, reputation award, duplicate notification |
| `onIssueUpdated` | `issues/{id}` updated | Status-change notification to reporter, analytics recording |
| `onVoteCreated` | `votes/{id}` created | Updates issue verification counts, adjusts reputation |
| `onCommentCreated` | `comments/{id}` created | Reputation award, notification to issue reporter |

#### Callables (HTTPS)

| Function | Auth | Purpose |
|----------|------|---------|
| `analyzeIssueImage` | Required | On-demand AI analysis during report wizard |
| `submitVote` | Required | Transactional vote write (upvote/downvote) |
| `addComment` | Required | Add comment to issue |
| `syncAuthProfile` | Required | Sync auth UID to Firestore profile |
| `updateLeaderboard` | Admin/moderator only | Rebuild leaderboard scores by period |

### Backend Services (functions/src/services/)

| Service | Responsibilities |
|---------|-----------------|
| **issueService** | Orchestrates AI enrichment + duplicate detection + reputation + notification on new issue |
| **geminiService** | Gemini API calls with retry loop (3 attempts, exponential backoff), keyword fallback |
| **duplicateDetectionService** | Token-Jaccard similarity + geohash proximity scoring |
| **verificationService** | Firestore transaction for vote registration |
| **notificationService** | Create/mark-read notification CRUD |
| **reputationService** | Adjust reputation and issue counters on user profile |
| **leaderboardService** | Rebuild leaderboard by period, init on user creation |
| **analyticsService** | Upsert analytics events |
| **storageService** | File validation (MIME + size), signed URLs |
| **authService** | Role-checking utilities |

## Security Rules

### Firestore Rules (`firestore.rules`)

- Helper functions: `signedIn()`, `role()`, `isOwner(uid)`, `isModerator()`, `isAdmin()`, `isPrivileged()`
- Users: signed-in read; owner/privileged create/update; admin delete
- Issues: public read; signed-in create; owner/privileged update/delete
- Votes: signed-in read; user creates own; owner/privileged update/delete
- Comments: public read; signed-in create; owner/privileged update/delete
- Notifications: owner/privileged read/update/delete
- Leaderboard: public read; privileged write
- Analytics: privileged read only
- Badges: public read; admin write

### Storage Rules (`storage.rules`)

- MIME type validation (images: JPEG/PNG/WebP/GIF, videos: MP4/WebM)
- File size limits (images: 10MB, videos: 50MB)
- Authenticated users can upload to own paths
- Public read access for issue media

## Evidence

- `firebase.json` — Firebase services configuration
- `firestore.rules` — Database security rules
- `firestore.indexes.json` — 9 composite indexes
- `storage.rules` — Storage security rules
- `apps/web/src/services/*.service.ts` — 15 service implementations
- `apps/functions/src/**/*.ts` — Cloud Functions (triggers + callables + services + repositories)
- `apps/web/src/lib/firebase/*.ts` — Firebase initialization
- `apps/web/.env.local` — Environment variables
