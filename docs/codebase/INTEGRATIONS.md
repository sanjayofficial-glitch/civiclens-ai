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

Environment variables (from `apps/web/.env.development`):
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

### Authentication Methods

From `apps/web/src/services/auth.service.ts`:
- Google Sign-In (popup)
- Email/Password Sign-In
- Email/Password Sign-Up
- Anonymous Sign-In (guest)
- Sign Out

### Maps Integration

| Library | Purpose |
|---------|---------|
| Leaflet | Map rendering |
| React Leaflet | React bindings |
| React Leaflet Cluster | Marker clustering |

## Internal Integrations

### Shared Package (`@blockseblock/shared`)

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
- `issue.service.ts` — Issue CRUD + real-time listeners
- `user.service.ts` — User profile operations
- `upload.service.ts` — File upload to Storage
- `geolocation.service.ts` — Browser geolocation
- `permissions.service.ts` — Permission checks

### Cloud Functions (Backend)

From `apps/functions/src/`:
- `onIssueCreated` — Firestore trigger on new issues
- `updateLeaderboard` — Callable function for leaderboard updates

## Security Rules

### Firestore Rules (`firestore.rules`)
- Users can only edit their own profile
- Anyone authenticated can read user profiles
- Issue authors can edit their own issues
- Published entities are publicly readable

### Storage Rules (`storage.rules`)
- [TODO] — Rules file exists but not inspected

## Evidence

- `firebase.json` — Firebase services configuration
- `firestore.rules` — Database security rules
- `firestore.indexes.json` — Database indexes
- `storage.rules` — Storage security rules
- `apps/web/.env.development` — Environment variables
- `apps/web/src/services/*.service.ts` — Service implementations
- `apps/functions/src/**/*.ts` — Cloud Functions
- `apps/web/src/lib/firebase/*.ts` — Firebase initialization
