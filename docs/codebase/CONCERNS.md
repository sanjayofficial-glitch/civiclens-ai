# Concerns

> **NOTE**: This doc was originally written during initial scaffolding. Many listed concerns are now resolved.
> See `AGENTS.md` at the project root for the single source of truth on current state.

## Tech Debt

### 1. Missing Test Infrastructure
- **Severity**: High
- **Impact**: No automated quality verification
- **Location**: All packages
- **Recommendation**: Add Vitest + testing-library for web, firebase-functions-test for backend

### 2. Default App.tsx Not Replaced
- **Severity**: Low
- **Impact**: Confusing entry point
- **Location**: `apps/web/src/App.tsx`
- **Details**: Contains Vite template code, not used (main.tsx uses routes.tsx directly)

### 3. Type Version Mismatch
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

## Previously Resolved Items

The following were listed as concerns in earlier versions but are now **fully implemented**:

| Item | Resolution |
|------|-----------|
| `onIssueCreated` trigger | Fully implemented with AI enrichment (Gemini), duplicate detection, reputation +10, and duplicate notifications |
| `updateLeaderboard` callable | Fully implemented with Zod validation, auth checks, and actual `rebuildLeaderboard()` logic |
| Comment system | UI, service, hook, Cloud Function (`addComment`), and trigger (`onCommentCreated`) all implemented |
| Vote system | UI, service, hook, Cloud Function (`submitVote`), and trigger (`onVoteCreated`) all implemented with Firestore transactions |
| Notification system | UI (grouped by date, mark read, filter), service with real-time listener, Cloud Function trigger all implemented |
| Firestore rules | All collections (users, issues, votes, comments, notifications, leaderboard, analytics, badges) are secured with role-based rules |

## Evidence

- `apps/web/src/App.tsx` — unused Vite template
- `apps/web/.env.development` — UI dev mode flag
