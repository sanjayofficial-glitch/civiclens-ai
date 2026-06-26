# Concerns

## Tech Debt

### 1. Missing Test Infrastructure
- **Severity**: High
- **Impact**: No automated quality verification
- **Location**: All packages
- **Recommendation**: Add Vitest + testing-library for web, firebase-functions-test for backend

### 2. Incomplete Cloud Functions
- **Severity**: Medium
- **Impact**: Backend features marked "Codex will implement"
- **Location**: `apps/functions/src/callables/updateLeaderboard.ts`, `apps/functions/src/triggers/onIssueCreated.ts`
- **Details**: 
  - `updateLeaderboard` — placeholder, no actual leaderboard logic
  - `onIssueCreated` — placeholder, no AI analysis or duplicate detection

### 3. Default App.tsx Not Replaced
- **Severity**: Low
- **Impact**: Confusing entry point
- **Location**: `apps/web/src/App.tsx`
- **Details**: Contains Vite template code, not used (main.tsx uses routes.tsx directly)

### 4. Type Version Mismatch
- **Severity**: Low
- **Impact**: Potential compatibility issues
- **Location**: Root vs package TypeScript versions
- **Details**: Root uses TS ^6.0.3, web uses ~6.0.2, functions uses ^5.0.0, shared uses ^5.7.2

## Security Considerations

### 1. UI Dev Mode
- **Severity**: Medium
- **Impact**: Auth bypass in development
- **Location**: `apps/web/.env.development`
- **Details**: `VITE_UI_DEV_MODE=true` bypasses Firebase auth guards
- **Mitigation**: Ensure this is `false` in production

### 2. Firestore Rules Coverage
- **Severity**: Medium
- **Impact**: Incomplete security rules
- **Location**: `firestore.rules`
- **Details**: 
  - `issues` collection not explicitly secured (uses `entities` placeholder)
  - `votes`, `notifications`, `leaderboard` collections not covered
  - `comments` collection not covered

## Performance Considerations

### 1. Large Bundle Potential
- **Severity**: Low
- **Impact**: Initial load time
- **Location**: `apps/web/`
- **Details**: Multiple Radix UI components, Leaflet maps, Framer Motion
- **Mitigation**: Lazy loading already implemented for routes

### 2. Real-time Listener Management
- **Severity**: Low
- **Impact**: Memory leaks if not cleaned up
- **Location**: `apps/web/src/services/issue.service.ts`
- **Details**: `listenToIssue` returns unsubscribe function, must be called on unmount

## Missing Features (from schemas)

### 1. Comment System
- **Severity**: Medium
- **Impact**: No way to discuss issues
- **Location**: `packages/shared/src/schemas/comment.ts` exists, no UI implementation

### 2. Vote System
- **Severity**: Medium
- **Impact**: No community verification
- **Location**: `packages/shared/src/schemas/vote.ts` exists, no UI implementation

### 3. Notification System
- **Severity**: Medium
- **Impact**: No user alerts
- **Location**: `packages/shared/src/schemas/notification.ts` exists, `NotificationsPage` exists but implementation unknown

## Code Quality

### 1. No Linting for Functions
- **Severity**: Low
- **Impact**: Inconsistent code style
- **Location**: `apps/functions/`
- **Details**: Uses ESLint while web uses Oxlint

### 2. No Path Aliases in Functions
- **Severity**: Low
- **Impact**: Relative import paths
- **Location**: `apps/functions/src/`
- **Details**: Uses `../index` style imports instead of aliases

## Evidence

- `apps/functions/src/callables/updateLeaderboard.ts` — placeholder implementation
- `apps/functions/src/triggers/onIssueCreated.ts` — placeholder implementation
- `apps/web/src/App.tsx` — unused Vite template
- `apps/web/.env.development` — UI dev mode flag
- `firestore.rules` — incomplete rules
- `packages/shared/src/schemas/*.ts` — unused schema definitions
