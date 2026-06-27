# Implementation Plan

## Overview

Six-phase stabilization plan for the hackathon demo. Phase 1 (core bug fixes) is blocking and must be completed first. Phases 2-6 can be worked in parallel once Phase 1 is done.

## Task Dependency Graph

```json
{
  "waves": [
    {
      "wave": 1,
      "tasks": ["1", "2"],
      "description": "Exploration and preservation tests — must run on unfixed code before any implementation"
    },
    {
      "wave": 2,
      "tasks": ["3", "6", "7", "8"],
      "description": "Fix 1A (Admin SDK), Fix 2 (upload path), Fix 3 (GPS), Fix 5 (analytics) — parallel fixes"
    },
    {
      "wave": 3,
      "tasks": ["4", "5", "9", "10"],
      "description": "Fix 1B (callable guard), Fix 1C (field names), storage rule, image display verification — depend on wave 2"
    },
    {
      "wave": 4,
      "tasks": ["11"],
      "description": "Phase 1 checkpoint — gates all remaining phases"
    },
    {
      "wave": 5,
      "tasks": ["12", "13", "14", "15", "16", "17", "18", "19", "21", "22", "23", "24", "25", "26", "28", "29", "30", "31", "32", "33", "35", "36", "37", "38", "39"],
      "description": "Phases 2-6 in parallel — all depend on Phase 1 checkpoint"
    },
    {
      "wave": 6,
      "tasks": ["20", "27", "34", "40"],
      "description": "Phase checkpoints for phases 3, 4, 5, 6"
    },
    {
      "wave": 7,
      "tasks": ["41"],
      "description": "Final regression checkpoint — all phases complete"
    }
  ]
}
```

## Notes

- The exploration test (task 1) and preservation tests (task 2) must be written and run on unfixed code BEFORE any implementation starts.
- Property 1 (Bug Condition) exploration tests are expected to FAIL on unfixed code — this is correct behavior that proves bugs exist.
- Property 2 (Preservation) tests must PASS on unfixed code before implementation begins.
- Each fix task includes sub-tasks to re-run the same tests after the fix is applied.
- Phase 1 bugs are interdependent: Fix 1A (Admin SDK) enables Fix 1B (callable guard) to return meaningful fallback; Fix 2 (upload path) is required for Fix 1A (Admin SDK needs the correct GCS path); Bug 4 (image display) resolves transitively once Fix 2 is applied.
- Run `npm run build` and `npm run test` after each phase checkpoint before proceeding.

## Tasks

<!-- ===================================================================
     PHASE 1 — CORE BUG FIXES  (blocking all other phases)
     =================================================================== -->

## Phase 1 — Core Bug Fixes

- [x] 1. Write bug condition exploration test
  - **Property 1: Bug Condition** - AI Pipeline + Upload Path + GPS Stale Cache
  - **CRITICAL**: This test MUST FAIL on unfixed code — failure confirms the bugs exist
  - **DO NOT attempt to fix the test or the code when it fails**
  - **GOAL**: Surface counterexamples that demonstrate each bug
  - **Scoped PBT Approach**: Scope to the concrete failing cases from isBugCondition pseudocode in design
  - Test 1A — AI key guard: call `analyzeIssueImage` with `GEMINI_API_KEY` unset; assert result.status IN ['success','fallback'] — unfixed code throws HttpsError instead
  - Test 1B — Image download: call `analyzeIssueMedia` with a Storage URL, assert `imageParts.length > 0`; unfixed: empty due to failed unauthenticated fetch
  - Test 1C — Field names: call analyzeIssueMedia and assert result has `suggestedTitle`/`suggestedDescription` keys; unfixed: may have `title`/`description`
  - Test 2 — Upload path: capture path passed to `UploadService.uploadFile`, assert starts with `users/${userId}/issue/`; unfixed: starts with `issues/`
  - Test 3 — GPS stale: mock `navigator.geolocation.getCurrentPosition` to return 25-second-old position, call `getCurrentPosition()`; unfixed: resolves immediately with stale pos
  - Test 5 — analytics/global: submit issue then `getDoc('analytics/global')`, assert `snap.exists()` is true; unfixed: false
  - Run tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests FAIL (this is correct — proves bugs exist)
  - Document counterexamples found (e.g., "analyzeIssueImage throws HttpsError instead of returning fallback", "path = 'issues/1720…' not 'users/uid/issue/…'")
  - Mark task complete when tests are written, run, and failures are documented
  - _Requirements: 1.1, 1.2, 1.3, 2.1, 3.1, 5.2_


- [ ] 2. Write preservation property tests (BEFORE implementing fix)
  - **Property 2: Preservation** - Happy-path AI, existing upload behavior, manual location, passing triggers
  - **IMPORTANT**: Follow observation-first methodology — run unfixed code with non-buggy inputs first
  - Observe: `analyzeIssueImage` with valid key + accessible URL → returns `{ status:'success', analysis:{ category, severity, confidence>=0.6, suggestedTitle, suggestedDescription, suggestedTags } }`
  - Observe: `UploadService.uploadFile` with any path → returns `https://firebasestorage.googleapis.com` URL unchanged
  - Observe: entering Step 2 with `draft.hasCustomLocation === true` → `draft.latitude`/`draft.longitude` remain unchanged
  - Observe: `onIssueCreated` trigger → awards reputation, runs duplicate detection, sends notifications independently of AI step
  - Write property-based tests capturing these observed behaviors (from Preservation Requirements in design)
  - For AI: for all X where NOT isBugCondition_AI(X), assert fixed callable produces same response shape
  - For upload: for all valid paths, assert uploadFile behavior is identical before/after fix
  - For location: for all states where hasCustomLocation=true, assert coordinates are not overwritten
  - Verify tests PASS on UNFIXED code (confirms baseline)
  - _Requirements: 3.3, 3.4, 3.5, 3.6, 3.8_


- [ ] 3. Fix 1A — Replace fetchFileBuffer with Admin SDK download in geminiService.ts

  - [~] 3.1 Implement Admin SDK image download helper
    - File: `apps/functions/src/services/geminiService.ts`
    - Add `import { bucket } from '../lib/firebase'`
    - Add `async function downloadImageAsBase64(url: string): Promise<string | null>` that extracts GCS path via `/o\/([^?]+)/` regex, calls `bucket.file(gcsPath).download()`, returns base64 string or null on error
    - Replace the `fetchFileBuffer(url)` loop body with `downloadImageAsBase64(url)` — iterate `input.imageUrls.slice(0, 3)`, push to `imageParts` when non-null
    - Ensure the existing retry logic and fallback are untouched
    - _Bug_Condition: isBugCondition_AI(X) where storageAccessible=false (unauthenticated fetch fails)_
    - _Expected_Behavior: imageParts.length > 0 for valid GCS paths; Gemini receives image inlineData_
    - _Preservation: analyzeIssueMedia happy path (valid key + accessible URL) returns same shape_
    - _Requirements: 2.2, 2.4_

  - [~] 3.2 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - Image download counterexample resolved
    - **IMPORTANT**: Re-run the SAME test from task 1 (Test 1B) — do NOT write a new test
    - Run `analyzeIssueMedia` with Storage URL and assert `imageParts.length > 0`
    - **EXPECTED OUTCOME**: Test PASSES (confirms Admin SDK download works)
    - _Requirements: 2.2, 2.4_

  - [~] 3.3 Verify preservation tests still pass
    - **Property 2: Preservation** - Happy-path AI unchanged
    - Re-run the SAME preservation tests from task 2
    - Confirm `analyzeIssueMedia` with valid key + accessible URL still returns `status:'success'`
    - **EXPECTED OUTCOME**: All preservation tests PASS


- [ ] 4. Fix 1B — Add top-level try/catch in analyzeIssueImage.ts callable

  - [~] 4.1 Wrap analyzeIssueMedia call in try/catch at callable boundary
    - File: `apps/functions/src/callables/analyzeIssueImage.ts`
    - Wrap the `analyzeIssueMedia({ imageUrls, title, description })` call in a try/catch block
    - On success: return `{ status: 'success', analysis }`
    - On catch: call `getFallbackAnalysis(title, description, imageUrls)` (or inline keyword fallback), return `{ status: 'fallback', analysis: fallback }`
    - Ensure the callable never throws — always returns a structured response
    - Keep input validation (Zod) and auth checks outside the try/catch so auth errors still propagate correctly
    - _Bug_Condition: isBugCondition_AI(X) where apiKeyPresent=false → HttpsError thrown, callable returns 5xx_
    - _Expected_Behavior: result.status IN ['success','fallback']; no unhandled exception_
    - _Preservation: callable with valid key + image continues to return status:'success' with same shape_
    - _Requirements: 2.1, 2.5, 3.8_

  - [~] 4.2 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - API key guard counterexample resolved
    - Re-run Test 1A from task 1: call callable with GEMINI_API_KEY unset
    - **EXPECTED OUTCOME**: Test PASSES — returns `{ status: 'fallback', analysis: {...} }` instead of throwing

  - [~] 4.3 Verify preservation tests still pass
    - **Property 2: Preservation** - Callable response shape unchanged for happy path
    - Re-run preservation test: callable with valid key returns `status:'success'`, same field set
    - **EXPECTED OUTCOME**: All preservation tests PASS


- [ ] 5. Fix 1C — Align Gemini prompt field names and add usedFallback flag

  - [~] 5.1 Update Gemini prompt to request suggestedTitle/suggestedDescription
    - File: `apps/functions/src/services/geminiService.ts`
    - Change the JSON schema in the Gemini prompt string to use `suggestedTitle` and `suggestedDescription` instead of `title` and `description`
    - Updated prompt fragment: `'Return JSON: { category, severity, confidence, suggestedTitle, suggestedDescription, suggestedTags, duplicateScore, safetyConcern }'`
    - Update the result mapping to read `parsed.suggestedTitle` / `parsed.suggestedDescription`
    - Update `fallbackAnalysis()` to return keys named `suggestedTitle` / `suggestedDescription`
    - Add `usedFallback: true` to the fallback result object
    - Add `usedFallback: false` (or omit) on real Gemini results so clients can distinguish them
    - Run `tsc --noEmit` in `apps/functions` — confirm zero type errors
    - _Bug_Condition: Gemini returns title/description keys; IssueAnalysisResult expects suggestedTitle/suggestedDescription → fields undefined on client_
    - _Expected_Behavior: result always has suggestedTitle, suggestedDescription; fallback has usedFallback:true_
    - _Requirements: 2.3, 2.5_

  - [~] 5.2 Verify Test 1C from exploration suite now passes
    - Re-run Test 1C: assert result has `suggestedTitle` / `suggestedDescription` keys
    - **EXPECTED OUTCOME**: Test PASSES

  - [~] 5.3 Verify preservation tests still pass
    - Run existing 21 vitest tests: `npm run test` in `apps/functions`
    - **EXPECTED OUTCOME**: All 21 tests PASS (geminiService tests updated if needed)


- [ ] 6. Fix 2 — Correct upload path in ReportWizardPage.tsx

  - [~] 6.1 Replace hard-coded issues/ path with users/{uid}/issue/ path
    - File: `apps/web/src/features/report/pages/ReportWizardPage.tsx`
    - Locate the `runAiAnalysis` closure and find: `const uploadPath = \`issues/${Date.now()}_${idx}_${Math.random().toString(36).slice(2)}\``
    - Replace with: `const uploadPath = \`users/${user.uid}/issue/${Date.now()}_${idx}_photo${idx}.jpg\``
    - Ensure `user` is in scope (it is — from `useAuth()`)
    - Verify the `submit()` function's `validImages` filter (`url.startsWith('https://')`) is present and unchanged
    - Run `npm run build` in `apps/web` to confirm no TypeScript errors
    - _Bug_Condition: isBugCondition_Pipeline(X) where uploadPath starts with 'issues/' not 'users/{uid}/'_
    - _Expected_Behavior: path = 'users/${uid}/issue/${timestamp}_${idx}_photo${idx}.jpg'; upload returns https:// URL stored in media.images_
    - _Preservation: UploadService.uploadFile behavior (progress callbacks, error propagation, URL format) unchanged_
    - _Requirements: 2.6, 2.7_

  - [~] 6.2 Verify upload path exploration test now passes
    - Re-run Test 2 from task 1: capture path passed to uploadFile, assert starts with `users/${userId}/issue/`
    - **EXPECTED OUTCOME**: Test PASSES

  - [~] 6.3 Verify preservation tests still pass
    - Re-run preservation test for upload behavior
    - **EXPECTED OUTCOME**: All preservation tests PASS


- [ ] 7. Fix 3 — Geolocation Stage 1 options and useEffect dependency

  - [~] 7.1 Update Stage 1 geolocation options to force fresh GPS
    - File: `apps/web/src/services/geolocation.service.ts`
    - Change Stage 1 options from `{ enableHighAccuracy: false, timeout: 5000, maximumAge: 30000 }` to `{ enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }`
    - `maximumAge: 0` forces the browser to acquire a fresh position, ignoring any cached IP-geolocation result
    - `enableHighAccuracy: true` matches Stage 2 and ensures GPS is used when available
    - Keep Stage 2 as a longer-timeout retry for devices where the first attempt times out
    - _Bug_Condition: isBugCondition_Location(X) where cachedPositionAge_ms > 0 AND enableHighAccuracy=false_
    - _Expected_Behavior: Stage 1 never resolves with a stale cached position; accuracy < 500m when GPS available_
    - _Preservation: Manual map-click and address search paths in Step 2 are untouched_
    - _Requirements: 3.1, 3.2_

  - [~] 7.2 Add draft.hasCustomLocation to useEffect dependency array (Fix 3b)
    - File: `apps/web/src/features/report/pages/ReportWizardPage.tsx`
    - Find the `useEffect` that fires auto-detection on Step 2
    - Change dependency array from `[draft.step]` to `[draft.step, draft.hasCustomLocation]`
    - Add eslint-disable comment if needed: `// eslint-disable-next-line react-hooks/exhaustive-deps`
    - This prevents auto-detection from re-firing when navigating back to Step 2 after user set custom location
    - _Preservation: hasCustomLocation=true on entering Step 2 → coordinates NOT overwritten_
    - _Requirements: 3.3, 3.4_

  - [~] 7.3 Verify GPS exploration test now passes
    - Re-run Test 3 from task 1: mock getCurrentPosition with 25s-old position, assert it is not used
    - **EXPECTED OUTCOME**: Test PASSES (maximumAge:0 means browser ignores stale cache)

  - [~] 7.4 Verify preservation tests still pass
    - Re-run preservation test: manual location not overwritten when hasCustomLocation=true
    - **EXPECTED OUTCOME**: All preservation tests PASS


- [ ] 8. Fix 5 — Seed analytics/global on issue creation

  - [~] 8.1 Add recordAnalyticsEvent('global') call in onIssueCreated.ts
    - File: `apps/functions/src/triggers/onIssueCreated.ts`
    - After `enrichIssueOnCreate(issueId)` completes, add: `await recordAnalyticsEvent('global', 'totals', { totalReports: 1 })`
    - Import `recordAnalyticsEvent` from `../services/analyticsService`
    - `recordAnalyticsEvent` uses `FieldValue.increment` + `set(..., { merge: true })` — idempotent and creates doc on first call
    - Wrap in try/catch so analytics failure does not abort the trigger (non-fatal)
    - _Bug_Condition: isBugCondition_MockData(X) where analyticsDocExists=false → analytics/global never created_
    - _Expected_Behavior: After first issue created, analytics/global.metrics.totalReports >= 1_
    - _Preservation: onIssueCreated still awards reputation, runs duplicate detection, sends notifications independently_
    - _Requirements: 5.2_

  - [~] 8.2 Mirror resolved count to analytics/global in onIssueUpdated.ts
    - File: `apps/functions/src/triggers/onIssueUpdated.ts`
    - When `after.status === 'resolved'`, call both:
      - `recordAnalyticsEvent('weekly', 'issue_resolution', { resolvedIssues: 1 })` (existing)
      - `recordAnalyticsEvent('global', 'totals', { resolvedThisWeek: 1 })` (new)
    - Use `Promise.all([...])` to run both writes concurrently
    - _Requirements: 5.2, 5.3_

  - [~] 8.3 Verify analytics/global exploration test now passes
    - Re-run Test 5 from task 1: submit issue, assert `getDoc('analytics/global').exists()` is true
    - **EXPECTED OUTCOME**: Test PASSES

  - [~] 8.4 Verify preservation tests still pass
    - Run full vitest suite: `npm run test` in `apps/functions`
    - Confirm all 21 tests still pass plus any new tests added
    - **EXPECTED OUTCOME**: All tests PASS


- [ ] 9. Fix 5b — Add Storage rule for users/{userId}/issue/{fileId=**}

  - [~] 9.1 Add issue path matcher to storage.rules
    - File: `storage.rules`
    - After Fix 2, uploads target `users/${uid}/issue/{file}` but current rules only match `users/{userId}/uploads/{fileId}`
    - Add the following matcher inside the `match /users/{userId}/` block:
      ```
      match /issue/{fileId=**} {
        allow read: if true;
        allow write: if isOwner(userId) && (validImage() || validVideo());
      }
      ```
    - Verify `isOwner()`, `validImage()`, `validVideo()` helpers are already defined in the file — reuse them unchanged
    - Deploy updated rules: `firebase deploy --only storage`
    - _Requirements: 2.6, 2.7_

- [ ] 10. Fix 4 — Verify image display is fixed transitively (no separate code change)

  - [~] 10.1 Verify validImages filter is present in submit()
    - File: `apps/web/src/features/report/pages/ReportWizardPage.tsx`
    - Confirm `const validImages = draft.photos.filter((url) => url.startsWith('https://'))` is present in `submit()`
    - Confirm `media: { images: validImages, ... }` is passed to `IssueService.create()`
    - No code change needed — this filter already blocks blob: URLs
    - Document verification result (pass/fail)
    - _Requirements: 4.3_

  - [~] 10.2 Verify issueConverter correctly maps media fields in converters.ts
    - File: `apps/web/src/services/converters.ts`
    - Confirm the Firestore converter maps `data.media.images`, `data.media.videos`, `data.media.thumbnail` to the typed `Issue.media` object
    - Confirm `media` is never returned as `undefined` — provide a default `{ images: [], videos: [] }` fallback if the field is absent
    - Fix only if incorrect; otherwise document as verified
    - _Requirements: 4.4_

- [~] 11. Phase 1 Checkpoint — All core bug fixes complete
  - Run `npm run build` from workspace root — confirm 0 TypeScript errors, 0 lint errors
  - Run `npm run test` in `apps/functions` — confirm all tests pass (21 baseline + any new tests)
  - Manually smoke-test the golden demo path against production Firebase environment:
    - Sign in → capture photo → AI analysis returns category/severity → submit report
    - Verify issue appears in My Reports, Map, and Dashboard within 2 s
    - Verify `media.images[0]` is a valid `https://` URL and image renders on IssueDetailsPage
    - Verify `aiAnalysis.suggestedTitle` and `.suggestedDescription` are populated
    - Verify GPS returns correct city (not a stale IP-geolocation result)
    - Verify `analytics/global.metrics.totalReports >= 1` after first submission
  - Ensure all tests pass; ask the user if any questions arise


<!-- ===================================================================
     PHASE 2 — MOCK DATA REMOVAL
     =================================================================== -->

## Phase 2 — Mock Data Removal

- [ ] 12. Search codebase for mock/dummy/placeholder/hardcoded data

  - [~] 12.1 Run grep scans for common mock indicators
    - Search for `setTimeout` used as fake data delay (distinct from legitimate debounce/animation)
    - Search for `TODO`, `FIXME`, `mock`, `dummy`, `placeholder`, `fake`, `hardcoded` (case-insensitive) in `apps/web/src` and `apps/functions/src`
    - Search for inline arrays containing fake issue/user objects (pattern: `const.*=\s*\[.*{`)
    - Search for static numbers used as analytics seeds (`totalReports:`, `resolvedThisWeek:`, `activeIssues:`)
    - Document every finding with file path, line number, and description
    - _Requirements: 5.1, 5.2, 5.3_

  - [~] 12.2 Audit known locations for mock data
    - `HomePage.tsx`: Confirm Community Impact fallback values show `-` not `0` when `analytics/global` doc is absent; confirm "Nearby Issues" and trending sections read from live `useIssues` query
    - `GovernmentDashboardPage.tsx`: Confirm stat cards (`activeIssues`, `totalReports`, `resolvedThisWeek`, `totalVerifications`) compute from live `issues` array or `analytics/global`; no hardcoded constants
    - `LeaderboardPage.tsx`: Confirm empty state shows "Be the first to report an issue." not a static podium with dummy names
    - `NotificationsPage.tsx`: Confirm empty state shows "You're all caught up! 🎉" not a dummy notification list
    - `ProfilePage.tsx` badges section: Confirm `getBadges()` reads the Firestore `badges` collection; `lib/constants.ts` BADGES array is UI config — leave as-is
    - _Requirements: 5.1, 5.3, 5.4, 5.5_

- [ ] 13. Replace every production-facing mock with live Firebase data

  - [~] 13.1 Remove or replace any setTimeout fake-data delays found in task 12
    - For each hit: determine if it is a mock (replace with real query) or a legitimate delay (leave with comment explaining purpose)
    - Ensure no loading state is faked — use React Query's `isLoading` from the actual data hooks
    - _Requirements: 5.1_

  - [~] 13.2 Replace hardcoded inline arrays with Firestore reads
    - For each hardcoded array of fake issue/user data found: replace with the appropriate `useIssues` / `useUser` / `useLeaderboard` hook call
    - Ensure the component handles the `isLoading` and `error` states properly
    - _Requirements: 5.1, 5.4_

  - [~] 13.3 Fix Community Impact fallback display
    - `HomePage.tsx`: when `stats` is null (analytics/global absent), show `-` for all metrics instead of `0` to make it clear data is loading, not zero
    - After Fix 5 (task 8), the doc will be created on first issue; this fallback is only for cold-start before any issues exist
    - _Requirements: 5.2_

- [~] 14. Generate mock-removal report
  - Create a summary listing every file changed, the mock that was removed, and the live Firebase source that replaced it
  - Confirm zero `setTimeout` calls remain that are used purely as fake data delays
  - Confirm zero inline arrays containing fake issue/user documents remain
  - Confirm all stat figures are sourced from Firestore or computed from live query results
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_


<!-- ===================================================================
     PHASE 3 — PRODUCTION CODE REVIEW
     =================================================================== -->

## Phase 3 — Production Code Review

- [ ] 15. Audit all useEffect Firestore listeners for unsubscribe cleanup

  - [~] 15.1 Verify every onSnapshot listener returns its unsubscribe function
    - Check `hooks/data/useIssue.ts`: `listenToIssue` — confirm `return unsubscribe` inside `useEffect`
    - Check `hooks/data/useIssues.ts`: `listenToIssues` — confirm `return unsubscribe`
    - Check `hooks/data/useComments.ts`: `listenToIssueComments` — confirm `return unsubscribe`
    - Check `hooks/data/useNotifications.ts`: `listenToNotifications` — confirm `return unsubscribe`
    - Check `hooks/data/useAnalytics.ts` (if real-time): confirm `return unsubscribe`
    - Check any inline `onSnapshot` calls in page components (`HomePage`, `GovernmentDashboardPage`)
    - Add missing `return unsubscribe` wherever absent to prevent memory leaks and duplicate listeners after route changes
    - _Requirements: (production quality — no explicit bugfix requirement number)_

  - [~] 15.2 Check useNotifications uid timing (Bug 5c)
    - File: `apps/web/src/hooks/data/useNotifications.ts`
    - Confirm the hook checks `user?.uid` (not just `user`) before subscribing
    - Confirm the `enabled` condition or `if (!user?.uid) return` guard is in place
    - If missing: add `enabled: !!userId` to the React Query options so the query does not fire until uid is defined
    - _Requirements: 5.5_

- [ ] 16. Run TypeScript strict checks and fix type errors

  - [~] 16.1 Run tsc --noEmit in apps/web
    - Command: `npx tsc --noEmit` from `apps/web/`
    - Fix all reported errors (target: zero errors)
    - Known pre-existing issue: `useRef<ReturnType<typeof setTimeout>>(undefined)` in ReportWizardPage — confirm already fixed
    - _Requirements: (TypeScript correctness)_

  - [~] 16.2 Run tsc --noEmit in apps/functions
    - Command: `npx tsc --noEmit` from `apps/functions/`
    - Fix all reported errors (target: zero errors)
    - Focus on `IssueAiAnalysis` field name inconsistencies (`title` vs `suggestedTitle`) — Fix 1C (task 5) should resolve these
    - Note: ESLint OOM on Windows is a pre-existing env issue; use `NODE_OPTIONS="--max-old-space-size=4096"` if needed
    - _Requirements: (TypeScript correctness)_

  - [~] 16.3 Fix IssueAiAnalysis field name inconsistencies across codebase
    - Search for any remaining references to `aiAnalysis.title` or `aiAnalysis.description` in client code
    - Update to use `aiAnalysis.suggestedTitle` / `aiAnalysis.suggestedDescription` consistently
    - Update `packages/shared/src/schemas/issue.ts` `issueAiAnalysisSchema` if needed to include `usedFallback` field
    - Run `tsc --noEmit` again to confirm zero errors
    - _Requirements: 2.3_

- [ ] 17. Remove App.tsx (unused Vite template artifact)

  - [~] 17.1 Delete apps/web/src/App.tsx
    - Confirm `App.tsx` is not imported anywhere: `main.tsx` uses `routes.tsx` → `AppRoutes` directly
    - Delete the file
    - Run `npm run build` to confirm the build still passes
    - _Requirements: (code hygiene — noted in AGENTS.md tech debt)_

- [ ] 18. Check for missing null guards and crash-prone patterns

  - [~] 18.1 Audit IssueCard for safe media access
    - File: `apps/web/src/components/shared/IssueCard.tsx`
    - Confirm `issue.media?.thumbnail ?? issue.media?.images?.[0]` uses optional chaining throughout
    - Confirm rendering `<img src={...}>` only when src is a valid `https://` URL
    - _Requirements: 4.2_

  - [~] 18.2 Audit IssueDetailsPage for safe image gallery rendering
    - File: `apps/web/src/features/issues/pages/IssueDetailsPage.tsx`
    - Confirm image gallery section is skipped (`images.length === 0`) with no broken img tags
    - Confirm `images[imageIndex]` access is bounds-checked
    - _Requirements: 4.1_

  - [~] 18.3 Confirm reverseGeocode consolidation
    - Check if `reverseGeocode` is defined inline in `ReportWizardPage.tsx` AND in `geolocation.service.ts`
    - If duplicated: remove the inline definition and use the service module version
    - _Requirements: (code quality)_

- [ ] 19. Verify Firestore indexes are deployed

  - [~] 19.1 Check firestore.indexes.json has all 9 composite indexes
    - File: `firestore.indexes.json`
    - Verify presence of: `issues` (status+createdAt↓, category+createdAt↓, reporterId+createdAt↓, severity+createdAt↓, geohash+status), `votes` (issueId+userId), `comments` (issueId+createdAt↓), `notifications` (userId+read+createdAt↓), `leaderboard` (period+score↓)
    - If any are missing: add them to `firestore.indexes.json`
    - Deploy: `firebase deploy --only firestore:indexes`
    - _Requirements: 5.1, 2.3_

- [~] 20. Phase 3 Checkpoint
  - Run `npm run build` — 0 errors
  - Run `npm run test` in `apps/functions` — all tests pass
  - Walk every route in the app with DevTools open — 0 console errors
  - Confirm no React key warnings in lists (IssueCard, CommentList, LeaderboardPage)
  - Ensure all tests pass; ask the user if questions arise


<!-- ===================================================================
     PHASE 4 — JUDGE EXPERIENCE POLISH
     =================================================================== -->

## Phase 4 — Judge Experience Polish

- [ ] 21. Add skeleton loading states matching page structure

  - [~] 21.1 Add skeleton to HomePage issue lists
    - File: `apps/web/src/features/home/pages/HomePage.tsx`
    - Replace the generic `<Spinner>` Suspense fallback inside the Nearby Issues and Trending sections with `<Skeleton>` elements that match the height/width of `IssueCard` components
    - Use the existing `Skeleton` primitive from `components/ui/`
    - Show 3 skeleton cards while `isLoading` is true for `useIssues`
    - _Requirements: (judge experience — Phase 4)_

  - [~] 21.2 Add skeleton to IssueDetailsPage
    - File: `apps/web/src/features/issues/pages/IssueDetailsPage.tsx`
    - While `isLoading`, render skeleton rows for title, image gallery placeholder, description, and badges
    - _Requirements: (Phase 4)_

  - [~] 21.3 Add skeleton to GovernmentDashboardPage stat cards
    - File: `apps/web/src/features/gov/pages/GovernmentDashboardPage.tsx`
    - While `isLoading`, render 4 skeleton `StatCard` shapes matching the real cards' dimensions
    - _Requirements: (Phase 4)_

  - [~] 21.4 Add skeleton to LeaderboardPage
    - File: `apps/web/src/features/leaderboard/pages/LeaderboardPage.tsx`
    - While `isLoading`, render skeleton rows for podium and ranked list
    - _Requirements: (Phase 4)_

- [ ] 22. Add 1.5s success animation on report submission before navigation

  - [~] 22.1 Implement Framer Motion success state on Step 5 of ReportWizardPage
    - File: `apps/web/src/features/report/pages/ReportWizardPage.tsx`
    - After `submit()` resolves with `docRef`, set a `showSuccess` state to `true` before calling `navigate()`
    - Render a Framer Motion animated checkmark overlay (AnimatePresence + motion.div) when `showSuccess` is true
    - Display the new issue ID during the animation so it feels informative
    - After 1500ms, call `navigate(\`/issues/${docRef.id}\`)`
    - Use Framer Motion's `animate` and `exit` props — library is already installed (framer-motion 11.18)
    - _Requirements: (Phase 4)_

- [ ] 23. Replace generic error toasts with specific per-failure-mode messages

  - [~] 23.1 Differentiate error messages in ReportWizardPage
    - File: `apps/web/src/features/report/pages/ReportWizardPage.tsx`
    - Upload failure: `toast.error("Photo upload failed — check your connection and try again.")`
    - AI analysis failure (fallback returned): `toast.info("AI analysis unavailable — your report was saved and will be analyzed shortly.")`
    - Submission permission error: `toast.error("Permission denied — please sign in again.")`
    - Submission network error: `toast.error("Network error — check your connection and retry.")`
    - Submission unknown error: `toast.error("Submission failed — please try again.")`
    - _Requirements: (Phase 4)_

  - [~] 23.2 Add success toasts for Government Dashboard status updates
    - File: `apps/web/src/features/gov/pages/GovernmentDashboardPage.tsx`
    - After successfully updating issue status: `toast.success("Issue status updated.")`
    - _Requirements: (Phase 4)_

- [ ] 24. Add meaningful empty states to all list views

  - [~] 24.1 NotificationsPage empty state
    - File: `apps/web/src/features/notifications/pages/NotificationsPage.tsx`
    - When notification list is empty and `isLoading` is false: render "You're all caught up! 🎉" using the `EmptyState` component from `components/ui/`
    - _Requirements: (Phase 4)_

  - [~] 24.2 LeaderboardPage empty state
    - File: `apps/web/src/features/leaderboard/pages/LeaderboardPage.tsx`
    - When leaderboard entries is empty and `isLoading` is false: render "Be the first to report an issue." with a link to `/report`
    - _Requirements: (Phase 4)_

  - [~] 24.3 ProfilePage My Reports empty state
    - File: `apps/web/src/features/profile/pages/ProfilePage.tsx`
    - When user's reports list is empty and `isLoading` is false: render "No reports yet — report your first issue!" with a link to `/report`
    - _Requirements: (Phase 4)_

  - [~] 24.4 GovernmentDashboard issue queue empty state
    - File: `apps/web/src/features/gov/pages/GovernmentDashboardPage.tsx`
    - When filtered issue queue is empty: render "No issues match your filters." with a "Clear filters" action
    - _Requirements: (Phase 4)_

- [ ] 25. Add safe-area insets to all fixed footers

  - [~] 25.1 Apply pb-safe (safe-area padding) to all sticky/fixed footer bars
    - Search for all fixed/sticky footer elements across page components and layout components
    - Add `pb-[env(safe-area-inset-bottom)]` or `pb-safe` Tailwind class to each
    - Verify on a 375px viewport that no content is hidden behind the footer bar
    - Confirm `index.css` has the `pb-safe` utility defined (or use the `env()` directly inline)
    - _Requirements: (Phase 4 mobile polish)_

- [ ] 26. Add CSS transition to Progress component step bar

  - [~] 26.1 Animate progress bar width on step changes
    - File: `apps/web/src/components/ui/progress.tsx` (or wherever Progress is defined)
    - Add `transition: width 300ms ease` (or Tailwind `transition-[width] duration-300 ease-in-out`) to the inner progress bar element
    - Verify the `AnimatePresence` exit animation in ReportWizardPage step transitions does not leave a visible gap between steps
    - _Requirements: (Phase 4)_

- [~] 27. Phase 4 Checkpoint
  - Walk the full 6-step report wizard — success animation fires, progress bar animates smoothly
  - Verify all 4 empty states render correctly with empty collections in browser
  - Verify error toasts show specific messages by temporarily triggering each failure mode
  - Check 375px mobile viewport — no content hidden behind fixed footer on any page
  - Ensure all tests pass; ask the user if questions arise


<!-- ===================================================================
     PHASE 5 — PERFORMANCE
     =================================================================== -->

## Phase 5 — Performance

- [ ] 28. Add lazy loading and decoding attributes to images

  - [~] 28.1 Add loading="lazy" and decoding="async" to IssueCard
    - File: `apps/web/src/components/shared/IssueCard.tsx`
    - Add `loading="lazy"` and `decoding="async"` to the thumbnail `<img>` tag
    - Add explicit `width` and `height` attributes to avoid Cumulative Layout Shift
    - _Requirements: (Phase 5 performance)_

  - [~] 28.2 Add loading="lazy" and decoding="async" to IssueDetailsPage gallery
    - File: `apps/web/src/features/issues/pages/IssueDetailsPage.tsx`
    - Add `loading="lazy"` and `decoding="async"` to all `<img>` tags in the image gallery
    - Keep `loading="eager"` on the first/active image so it loads immediately
    - _Requirements: (Phase 5)_

- [ ] 29. Add client-side image compression before upload

  - [~] 29.1 Implement canvas.toBlob compression helper in ReportWizardPage
    - File: `apps/web/src/features/report/pages/ReportWizardPage.tsx`
    - Add a `compressImage(file: File): Promise<Blob>` helper using `canvas.toBlob()`
    - Max dimension: 1920px (scale down proportionally if larger)
    - Quality: 0.85 for JPEG output
    - Use `createImageBitmap` for efficient decoding
    - Call `compressImage(photo)` before `UploadService.uploadFile` in `runAiAnalysis`
    - Pass the compressed Blob (as a File with same name) to uploadFile
    - _Requirements: (Phase 5 — reduces upload size 60-80% for typical phone photos)_

- [ ] 30. Add limit: 20 default to useIssues on HomePage

  - [~] 30.1 Pass limit constraint to useIssues in HomePage
    - File: `apps/web/src/features/home/pages/HomePage.tsx`
    - Change `useIssues({})` to `useIssues({}, 20)` (or `useIssues({ limit: 20 })` depending on hook signature) for the Nearby Issues and feed queries
    - Verify the `useIssues` hook and `IssueService.getIssues` support a `limit` parameter
    - If the hook does not currently accept `limit`: add it — pass through to Firestore `query(..., limit(n))`
    - _Requirements: (Phase 5 — prevents downloading full issues collection)_

- [ ] 31. Wrap IssueCard in React.memo()

  - [~] 31.1 Memoize IssueCard component
    - File: `apps/web/src/components/shared/IssueCard.tsx`
    - Wrap the export with `React.memo()`: `export default React.memo(IssueCard)`
    - This prevents re-renders when parent state changes (e.g., filter tab switching in MapPage)
    - Verify the eslint-disable comment for `react/only-export-components` is added if the barrel export pattern requires it
    - Run `npm run build` to confirm 0 errors
    - _Requirements: (Phase 5)_

- [ ] 32. Verify Leaflet and @google/genai are only in lazy-loaded chunks

  - [~] 32.1 Confirm Leaflet is not in the root bundle
    - Run `npx vite-bundle-visualizer` (or equivalent) from `apps/web/` on a production build
    - Confirm `leaflet` and `react-leaflet` appear only in the lazy-loaded `MapPage` and `ReportWizardPage` chunks, not in the root `index` chunk
    - If found in root bundle: check for any eagerly-imported component that transitively imports Leaflet and fix with dynamic import
    - _Requirements: (Phase 5 bundle size)_

  - [~] 32.2 Confirm @google/genai is not in the root bundle
    - In the bundle visualization: confirm `@google/genai` appears only in the `ReportWizardPage` lazy chunk
    - `ai.service.ts` imports `@google/genai` — ensure `ai.service.ts` is not imported by any eagerly-loaded module
    - _Requirements: (Phase 5)_

- [ ] 33. Add chunkedLoading: true to MarkerClusterGroup

  - [~] 33.1 Enable chunked loading on the map cluster component
    - File: `apps/web/src/features/map/pages/MapPage.tsx` (and ReportWizardPage map if applicable)
    - Add `chunkedLoading={true}` prop to `<MarkerClusterGroup>`
    - Optionally add `maxZoom={18}` and `disableClusteringAtZoom={16}` for precise street-level clicking
    - _Requirements: (Phase 5 map performance)_

- [~] 34. Phase 5 Checkpoint
  - Run Lighthouse mobile audit on production build — target score >= 75
  - Verify time-to-interactive < 4s on simulated 4G
  - Confirm image compression works: upload a large photo, check network tab shows reduced payload
  - Confirm IssueCard does not re-render when filter tabs change (use React DevTools Profiler)
  - Ensure all tests pass; ask the user if questions arise


<!-- ===================================================================
     PHASE 6 — SECURITY
     =================================================================== -->

## Phase 6 — Security

- [ ] 35. Verify GEMINI_API_KEY is in Firebase Secret Manager, not in source

  - [~] 35.1 Confirm GEMINI_API_KEY is not committed to source
    - Run `git log -S "GEMINI_API_KEY"` and check that no commit contains a real key value (only the variable name in config/example files is acceptable)
    - Check `apps/functions/.env` — confirm it is absent from the repo (git-ignored) or contains only a placeholder
    - Check `apps/functions/.env.example` — confirm it has `GEMINI_API_KEY=` with no real value
    - If a real key is found in git history: rotate the key in Google Cloud Console immediately, then remove from history
    - _Requirements: (Phase 6 security)_

  - [~] 35.2 Confirm GEMINI_API_KEY is configured in Firebase Functions runtime
    - Verify the key is set via Firebase Secret Manager or `firebase functions:secrets:set GEMINI_API_KEY`
    - Check `apps/functions/src/config.ts` reads from `process.env.GEMINI_API_KEY` (not a hardcoded fallback)
    - _Requirements: (Phase 6)_

- [ ] 36. Verify VITE_UI_DEV_MODE is absent from production config

  - [~] 36.1 Check .env files and deploy.yml for VITE_UI_DEV_MODE
    - Confirm `VITE_UI_DEV_MODE` is absent from `apps/web/.env.production` (or any non-.local env file)
    - Confirm `VITE_UI_DEV_MODE` is not injected by `.github/workflows/deploy.yml`
    - If present: remove it from all production-facing files; keep it only in `.env.local` (git-ignored)
    - _Requirements: (Phase 6)_

- [ ] 37. Add Content-Security-Policy and security headers to firebase.json

  - [~] 37.1 Add security headers to firebase.json hosting config
    - File: `firebase.json`
    - Add a `headers` block under the `hosting` key for the `**` glob:
      ```json
      {
        "source": "**",
        "headers": [
          { "key": "X-Frame-Options", "value": "DENY" },
          { "key": "X-Content-Type-Options", "value": "nosniff" },
          { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
          { "key": "Content-Security-Policy", "value": "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://firebasestorage.googleapis.com https://*.tile.openstreetmap.org; connect-src 'self' https://*.googleapis.com https://*.firebaseio.com wss://*.firebaseio.com https://nominatim.openstreetmap.org;" }
        ]
      }
      ```
    - Adjust `img-src` and `connect-src` based on actual external resources used (Leaflet tiles, Nominatim, Firebase)
    - Verify the app still functions after deploying headers: `firebase deploy --only hosting`
    - _Requirements: (Phase 6)_

- [ ] 38. Add client-side file type and size validation in ReportWizardPage

  - [~] 38.1 Validate file type and size before upload
    - File: `apps/web/src/features/report/pages/ReportWizardPage.tsx`
    - In `handleFileSelect` (Step 1), before adding to `draft.photos`, validate:
      - `file.type.startsWith('image/')` — if false: `toast.error("Only image files are supported.")`
      - `file.size < 10 * 1024 * 1024` (10 MB) — if false: `toast.error("Image must be smaller than 10 MB.")`
    - Reject invalid files early so the user gets immediate feedback instead of a Firebase Storage rejection error
    - This mirrors the server-side validation in `storage.rules` (`validImage()` + size check)
    - _Requirements: (Phase 6 — defense in depth)_

- [ ] 39. Verify .gitignore blocks apps/functions/.env

  - [~] 39.1 Confirm apps/functions/.env is git-ignored
    - File: `.gitignore` (root)
    - Confirm it contains `apps/functions/.env` or `**/.env` pattern (but NOT `**/.env.example`)
    - If absent: add `apps/functions/.env` to `.gitignore`
    - Run `git status` — confirm `apps/functions/.env` is listed as ignored (not tracked)
    - _Requirements: (Phase 6)_

- [~] 40. Phase 6 Checkpoint — Full security verification
  - Verify `storage.rules` deploy succeeded with the `users/{userId}/issue/` matcher added (task 9.1)
  - Confirm no API keys in git history: `git log --all -S "AIzaSy"` returns no hits
  - Verify security headers with: `curl -I https://<your-project>.web.app` — confirm `X-Frame-Options` and `X-Content-Type-Options` are present
  - Run `npm run build` — 0 errors, 0 lint warnings
  - Run `npm run test` in `apps/functions` — all tests pass
  - Ensure all tests pass; ask the user if questions arise

<!-- ===================================================================
     FINAL CHECKPOINT
     =================================================================== -->

## Final Checkpoint

- [~] 41. Full regression run — all six phases complete
  - Run `npm run build` from workspace root — 0 TypeScript errors, 0 lint warnings
  - Run `npm run test` in `apps/functions` — all tests pass (21 baseline + new tests)
  - Execute the complete golden demo path manually against production Firebase:
    1. Sign in with Google
    2. Capture a real photo
    3. Step 3 AI analysis returns `status:'success'` with `confidence >= 0.6`
    4. Submit report — success animation plays for 1.5 s
    5. Navigate to IssueDetailsPage — image renders, `aiAnalysis.suggestedTitle` shown
    6. Check My Reports — new issue appears within 2 s
    7. Check Map — marker at correct coordinates
    8. Check Home Community Impact — `totalReports >= 1`
    9. Government Dashboard — issue in queue with correct data
    10. Update issue to `resolved` — notification appears in Notifications page
  - Confirm Lighthouse mobile score >= 75 on production build
  - Confirm all 11 Phase 1 feature areas pass manual smoke test
  - Confirm no console errors on any of the 19 routes
  - Document any remaining known issues for post-hackathon follow-up
  - Ensure all tests pass; ask the user if questions arise
