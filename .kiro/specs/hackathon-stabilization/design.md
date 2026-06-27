# Hackathon Stabilization Bugfix Design

## Overview

BlockSeBlock has five confirmed bugs that break the golden demo path — AI analysis
failing silently, uploads writing to wrong storage paths, GPS returning a stale
city, image URLs not persisting, and analytics/notifications queries firing before
data exists. In parallel, six stabilization phases are needed to prepare the app
for a live hackathon demo: core-feature verification, mock-data removal, production
code review, judge-experience polish, performance tuning, and security hardening.

This design formalizes the bug conditions, proposes targeted minimal fixes for each
confirmed bug, and describes the full six-phase plan with implementation details.

---

## Glossary

- **Bug_Condition (C)**: The exact runtime condition that triggers defective behavior.
- **Property (P)**: The observable correct outcome when C holds after the fix is applied.
- **Preservation (¬C)**: All inputs that do NOT hit the bug and whose behavior must be
  unchanged by the fix.
- **analyzeIssueMedia**: `apps/functions/src/services/geminiService.ts` — orchestrates
  image download + Gemini REST call + fallback.
- **fetchFileBuffer**: `apps/functions/src/services/storageService.ts` — unauthenticated
  HTTP GET; the root cause of Bug 1.
- **UploadService.uploadFile**: `apps/web/src/services/upload.service.ts` — takes a
  caller-supplied `path` string; Bug 2 arises because callers supply wrong paths.
- **analytics/global**: The single Firestore document id `global` in the `analytics`
  collection; Bug 5 arises because it is never initialised.
- **usedFallback**: A new field added to `aiAnalysis` in this fix to distinguish
  keyword-fallback results from real Gemini results.
- **Golden Demo Path**: sign-in → capture photo → AI analysis → submit report →
  verify issue appears in My Reports / Map / Dashboard with image + AI data.


---

## Bug Details

### Bug 1 — AI Image Analysis

The AI pipeline has two distinct failure modes that compound each other.

**Failure A — Missing API key guard**

`callGemini()` in `geminiService.ts` already reads `process.env.GEMINI_API_KEY` and
calls `fail('failed-precondition', ...)` when it is absent. However, `fail()` throws
an `HttpsError`, which is the correct mechanism for callable functions but propagates
as an uncaught exception inside `analyzeIssueMedia`, causing the entire callable to
return a 5xx error rather than a graceful fallback. The fix wraps the entire
`analyzeIssueMedia` call in a try/catch at the callable boundary.

**Failure B — Storage URL not accessible to Cloud Function**

`fetchFileBuffer` issues an unauthenticated `fetch()` against a Firebase Storage
download URL. The Storage rules do not allow public reads for the `issues/` path:

```
match /issues/{issueId}/{fileId=**} {
  allow read: if true;          // ← public read IS allowed here
  allow write: if signedIn() && ...
}
```

Actually the `/issues/` path has `allow read: if true`, so the URL _is_ publicly
readable — but only if the URL is a valid download URL with `alt=media&token=...`.
The callable receives the plain Storage URL string stored in `media.images`. If the
token is absent or the path was stored incorrectly (see Bug 2), `fetchFileBuffer`
returns a non-200 response and the image part is silently skipped, producing a
text-only Gemini analysis with low confidence.

The fix is to use Admin SDK bucket download inside the Cloud Function rather than a
plain HTTP fetch, so the call succeeds regardless of token state or Storage rule
changes.

**Formal Specification:**

```
FUNCTION isBugCondition_AI(X)
  INPUT: X = { apiKeyPresent: bool, imageUrl: string, storagePathValid: bool }
  OUTPUT: boolean
  RETURN (NOT X.apiKeyPresent)
      OR (X.imageUrl != '' AND NOT X.storagePathValid)
END FUNCTION
```

**Concrete Examples:**

- `GEMINI_API_KEY` env var missing → callable throws `HttpsError(failed-precondition)`,
  wizard shows generic error toast instead of fallback analysis.
- `imageUrl = 'https://firebasestorage.googleapis.com/v0/b/…/o/issues%2F…?alt=media&token=abc'`
  with expired token → `fetchFileBuffer` returns 403 → `imageParts` empty → Gemini
  returns text-only result with `confidence: 0.35`.
- `imageUrl = 'issues/1234_0_abc/photo_0.jpg'` (plain path, no domain, wrong from
  Bug 2 upload) → `fetch()` throws → image skipped entirely.


### Bug 2 — Reporting Pipeline (Upload Path Mismatch)

`runAiAnalysis()` in `ReportWizardPage.tsx` constructs the upload path as:

```ts
const uploadPath = `issues/${Date.now()}_${idx}_${Math.random().toString(36).slice(2)}`;
```

The Storage rules have TWO relevant matchers:

```
match /issues/{issueId}/{fileId=**} { allow write: if signedIn() && ... }  // ✅ this matches
match /users/{userId}/uploads/{fileId} { allow write: if isOwner(userId) && ... }
```

The `issues/` path actually allows authenticated writes — so the upload itself may
succeed. However, `storageService.ts` in the backend defines:

```ts
export function buildUploadPath(userId: string, kind: 'avatar' | 'issue', fileName: string) {
  return `users/${userId}/${kind}/${Date.now()}_${safeName}`;   // "users/{uid}/issue/…"
}
```

The frontend bypasses this helper entirely and uses a bare `issues/` path. This
means the Admin SDK inside Cloud Functions cannot resolve the original uploader's
UID from the path, and `geminiService` has no structured way to download the file
via Admin SDK (it needs the GCS path). Additionally, since `UploadService.uploadFile`
takes a caller-supplied `path`, fixing this is purely a caller-side change.

**Formal Specification:**

```
FUNCTION isBugCondition_Pipeline(X)
  INPUT: X = { uploadPath: string, userId: string }
  OUTPUT: boolean
  RETURN NOT X.uploadPath.startsWith('users/' + X.userId + '/')
END FUNCTION
```

**Concrete Examples:**

- `uploadPath = 'issues/1720000000000_0_xyz'` → path is writable but lacks user scope;
  Cloud Function cannot derive storage path from the Firestore URL for Admin SDK download.
- `uploadPath = 'users/uid123/issue/1720000000000_photo_0.jpg'` → correct; upload
  succeeds, Admin SDK can open `bucket.file('users/uid123/issue/…')`.


### Bug 3 — Location Accuracy (Stale Cached GPS)

`GeolocationService.getCurrentPosition()` calls the browser API with Stage 1 options:

```ts
{ enableHighAccuracy: false, timeout: 5000, maximumAge: 30000 }
```

`maximumAge: 30000` means the browser may return a cached position up to 30 seconds
old. If the last cached fix was an IP-geolocation result (e.g., Kolkata) from a
previous browser session, Stage 1 succeeds immediately with that wrong city.
Additionally, the `useEffect` in `ReportWizardPage.tsx` triggers when `draft.step`
changes and does not check `draft.hasCustomLocation`:

```ts
useEffect(() => {
  if (draft.step === 2 && !draft.hasCustomLocation) {
    // fires auto-detection
  }
}, [draft.step]);   // ← hasCustomLocation not in dependency array
```

Wait — the condition `!draft.hasCustomLocation` IS checked inside the effect, but
`hasCustomLocation` is NOT in the dep array so the effect may not re-run correctly
when the user navigates between steps. However, the primary GPS accuracy bug is the
`maximumAge: 30000` combined with `enableHighAccuracy: false`.

**Formal Specification:**

```
FUNCTION isBugCondition_Location(X)
  INPUT: X = { cachedPositionAgeMs: number, enableHighAccuracy: bool }
  OUTPUT: boolean
  RETURN X.cachedPositionAgeMs > 0 AND NOT X.enableHighAccuracy
END FUNCTION
```

**Concrete Examples:**

- Browser returns a 20-second-old IP-geolocation fix for Kolkata (within the 30s cache
  window) → `onSuccess` fires immediately → `draft.latitude/longitude` set to Kolkata →
  reverse geocode returns "Kolkata, West Bengal" → issue saved with wrong city.
- With fix applied (`maximumAge: 0, enableHighAccuracy: true`): browser ignores cache,
  starts fresh GPS acquisition, returns Rourkela coordinates.

### Bug 4 — Image Display (blob: / empty URLs in Firestore)

`ReportDraft.photos` starts as an array of `blob:` URLs set in `handleFileSelect`.
When `runAiAnalysis` runs, it replaces `draft.photos` with the Firebase download URLs.
But if the upload fails or if the user navigates away before `runAiAnalysis` resolves,
`draft.photos` still contains `blob:` URLs. `submit()` already has a guard:

```ts
const validImages = draft.photos.filter((url) => url.startsWith('https://'));
```

So `blob:` URLs are NOT persisted — `media.images` will be `[]` instead. This is
the real bug: upload failure → empty `media.images` → no image in Firestore → broken
image display. `loadDraft()` also already filters out `blob:` URLs on reload. The
issue is upstream: the upload path mismatch (Bug 2) causes the upload to fail, which
propagates here.

**Formal Specification:**

```
FUNCTION isBugCondition_Image(X)
  INPUT: X = { storedUrls: string[] }
  OUTPUT: boolean
  RETURN X.storedUrls.length == 0
      OR ANY url IN X.storedUrls: NOT url.startsWith('https://firebasestorage')
END FUNCTION
```

### Bug 5 — Mock Data / Missing Seed Data

Three sub-bugs:

**5a — `analytics/global` never written**: `onIssueCreated` calls
`recordAnalyticsEvent('weekly', ...)` not `recordAnalyticsEvent('global', ...)`.
`onIssueUpdated` writes to `'weekly'` doc on resolution. The `analytics/global` doc
that `AnalyticsService.listenToCommunityStats` reads is never created. Stats show
`-` / `0` permanently.

**5b — Leaderboard stale for new users**: `onAuthUserCreated` writes an initial
leaderboard entry. But `issuesReported` counter increments happen client-side in
`IssueService.create` (optimistic) and server-side in `onIssueCreated`. The
leaderboard score formula depends on `issuesReported × 10 + reputation`. New users
who submitted reports have reputation > 0 but the leaderboard doc still shows the
zero-initialized entry because `updateLeaderboard` has never been called.

**5c — `useNotifications` possible undefined UID**: Current implementation checks
`if (!user)` before starting the listener, which is correct. However, `user` is the
Firebase `User | null` from `useAuth`, and on cold start `user` is `null` for the
first render (before auth state resolves). The hook correctly guards this. The real
issue is if `user` is present but `user.uid` is undefined — which cannot happen with
Firebase Auth. The actual timing risk is that `loading` from `useAuth` is not
checked, so the hook subscribes on `user` becoming non-null but the Firestore listener
may be set up before the auth token is fully propagated.

**Formal Specification:**

```
FUNCTION isBugCondition_MockData(X)
  INPUT: X = { analyticsGlobalDocExists: bool, leaderboardHasCurrentScore: bool }
  OUTPUT: boolean
  RETURN NOT X.analyticsGlobalDocExists
      OR NOT X.leaderboardHasCurrentScore
END FUNCTION
```


---

## Expected Behavior

### Preservation Requirements

**Unchanged behaviors — these must work identically after every fix:**

- Manual map-click in Step 2 sets `draft.latitude/longitude` and `hasCustomLocation: true`
  and must NOT be overwritten by auto-detection.
- Address search via Nominatim geocodes correctly and updates the map marker.
- `VoteService.castVote()` transaction (unvote / switch / new vote) is fully intact.
- `IssueService.listenToIssues()` fallback to one-shot query on `failed-precondition`
  continues to work.
- The Gemini callable still returns `{ status: 'success', analysis: { ... } }` when
  the API key is present and the call succeeds.
- `IssueDetailsPage` with no images continues to skip the image gallery section.
- `onIssueCreated` trigger still awards reputation, runs duplicate detection, and sends
  notifications — AI enrichment is one step within it and its failure must not abort
  the others.
- `submitVote` callable and `addComment` callable response shapes are unchanged.
- ESLint 0 warnings / 0 errors; all 21 vitest tests continue to pass.

**Scope of changes per bug:**

| Bug | Files touched | Files untouched |
|-----|--------------|-----------------|
| 1 (AI) | `geminiService.ts`, `analyzeIssueImage.ts` | All client files, other callables |
| 2 (Upload) | `ReportWizardPage.tsx` (uploadPath line) | `upload.service.ts`, `storage.rules` |
| 3 (GPS) | `geolocation.service.ts` (Stage 1 options) | All other services |
| 4 (Image) | Fixed transitively by Bug 2 fix | — |
| 5 (Analytics) | `onIssueCreated.ts`, `analyticsService.ts` | All other triggers |


---

## Hypothesized Root Cause

### Bug 1 — AI Image Analysis

1. **Admin SDK not used for image fetch**: `storageService.ts` exposes `fetchFileBuffer`
   which is a plain unauthenticated `fetch()`. Cloud Functions run with full Admin
   privileges; instead of HTTP, they should use `bucket.file(path).download()`. The
   fix replaces `fetchFileBuffer` in the AI pipeline with an Admin SDK download that
   extracts the GCS path from the download URL or from the Firestore `media.images`
   array.

2. **No top-level error guard on callable**: `analyzeIssueImage` does not catch errors
   from `analyzeIssueMedia`, so any unhandled rejection propagates as a 5xx. A
   try/catch at the callable boundary returns a fallback gracefully instead.

3. **Field name mapping `title` → `suggestedTitle`**: Gemini is prompted to return
   `{ title, description, ... }` but `IssueAnalysisResult` and `CallableResponse`
   expose `suggestedTitle` / `suggestedDescription`. The mapping in `analyzeIssueMedia`
   currently returns fields named `title` and `description` from parsed JSON. The
   `analyzeIssueImage` callable returns `analysis` directly to the client, which reads
   `a.suggestedTitle`. Aligning field names in the Gemini prompt output with the
   interface eliminates ambiguity.

### Bug 2 — Reporting Pipeline

4. **Caller constructs path directly**: The `runAiAnalysis` closure in `ReportWizardPage`
   hard-codes `issues/${Date.now()}_${idx}_${random}` instead of calling the backend's
   `buildUploadPath` helper (which is server-side-only). The fix adds a thin client-side
   path builder: `users/${user.uid}/issue/${Date.now()}_${idx}_photo.jpg`.

### Bug 3 — Location Accuracy

5. **`maximumAge: 30000` accepts stale IP fix**: Setting `maximumAge: 0` forces the
   browser to acquire a fresh position. The Stage 2 fallback already uses
   `{ enableHighAccuracy: true, maximumAge: 0 }` — applying the same to Stage 1 and
   increasing Stage 1 accuracy fixes the problem while still using a shorter timeout.

### Bug 5 — Analytics / Seed Data

6. **`analytics/global` key hardcoded in client but never written by Cloud Functions**:
   `onIssueCreated` and `onIssueUpdated` write to `weekly` / `issue_resolution` doc IDs,
   not `global`. The fix adds a `recordAnalyticsEvent('global', 'totals', { totalReports: 1 })`
   call inside `onIssueCreated` so the document is created on the first ever issue.


---

## Correctness Properties

Property 1: Bug Condition — AI Pipeline Resilience

_For any_ request where `isBugCondition_AI(X)` is true (API key absent OR Storage
image not downloadable), the fixed `analyzeIssueImage` callable SHALL return
`{ status: 'fallback', analysis: { category, severity, confidence, ... } }` with no
unhandled exception, and `analysis.usedFallback` SHALL be `true`.

**Validates: Requirements 2.1, 2.2, 2.5**

Property 2: Preservation — AI Happy Path Unchanged

_For any_ request where `isBugCondition_AI(X)` is false (API key present AND image
downloadable), the fixed callable SHALL produce the same response shape and fields
(`status: 'success'`, `analysis.category`, `.severity`, `.confidence >= 0.6`,
`.suggestedTitle`, `.suggestedDescription`, `.suggestedTags`) as the original.

**Validates: Requirements 3.3, 3.8**

Property 3: Bug Condition — Upload Path Correctness

_For any_ upload initiated by an authenticated user, the fixed wizard SHALL use a
path of the form `users/${uid}/issue/${timestamp}_${idx}_photo.jpg`, and
`UploadService.uploadFile` SHALL return a `https://firebasestorage.googleapis.com`
download URL that is stored in `media.images`.

**Validates: Requirements 2.6, 2.7, 4.3**

Property 4: Preservation — Existing Upload Behavior Unchanged

_For any_ upload initiated with a valid path (not hitting the bug), `UploadService.uploadFile`
SHALL behave identically before and after the fix: same progress callbacks, same
error propagation, same download URL format.

**Validates: Requirements 3.4**

Property 5: Bug Condition — GPS Returns Fresh Position

_For any_ call to `GeolocationService.getCurrentPosition()`, the fixed implementation
SHALL request `{ maximumAge: 0 }` in Stage 1, ensuring the browser does not return
a stale cached position, and the returned coordinates SHALL have `accuracy < 500m`
when GPS is available.

**Validates: Requirements 3.1, 3.2**

Property 6: Preservation — Manual Location Not Overwritten

_For any_ state where `draft.hasCustomLocation === true` when entering Step 2, the
auto-detection `useEffect` SHALL NOT update `draft.latitude` or `draft.longitude`.

**Validates: Requirements 3.3, 3.4**

Property 7: Bug Condition — analytics/global Created on First Issue

_For any_ new issue created via `IssueService.create`, the `onIssueCreated` trigger
SHALL increment `analytics/global.metrics.totalReports` by 1 (creating the document
if absent), so `AnalyticsService.listenToCommunityStats` returns a non-null result
with `totalReports >= 1` after the first submission.

**Validates: Requirements 5.2**

Property 8: Preservation — Other Trigger Side-Effects Unchanged

_For any_ issue created, `onIssueCreated` SHALL still award reputation to the reporter,
run duplicate detection, and (if AI fails) fall back to keyword analysis — all
independently of the analytics write.

**Validates: Requirements 3.5**


---

## Fix Implementation

### Phase 1 — Core Bug Fixes

#### Fix 1A: Admin SDK image download in geminiService.ts

**File**: `apps/functions/src/services/geminiService.ts`

**Change**: Replace `fetchFileBuffer(url)` in the image-part loop with an Admin SDK
bucket download that converts a Firebase download URL to a GCS path:

```ts
import { bucket } from '../lib/firebase';

async function downloadImageAsBase64(url: string): Promise<string | null> {
  try {
    // Extract GCS path from download URL:
    // https://firebasestorage.googleapis.com/v0/b/{bucket}/o/{encoded-path}?alt=media&token=...
    const match = url.match(/\/o\/([^?]+)/);
    if (!match) return null;
    const gcsPath = decodeURIComponent(match[1]);
    const [buffer] = await bucket.file(gcsPath).download();
    return buffer.toString('base64');
  } catch {
    return null;
  }
}
```

Replace the loop body:
```ts
for (const url of input.imageUrls.slice(0, 3)) {
  const data = await downloadImageAsBase64(url);
  if (data) {
    imageParts.push({ inlineData: { mimeType: 'image/jpeg', data } });
  }
}
```

#### Fix 1B: Callable top-level error guard in analyzeIssueImage.ts

**File**: `apps/functions/src/callables/analyzeIssueImage.ts`

Wrap the `analyzeIssueMedia` calls in try/catch and return `{ status: 'fallback', analysis }`:

```ts
try {
  const analysis = await analyzeIssueMedia({ ... });
  return { status: 'success', analysis };
} catch (err) {
  const fallback = getFallbackAnalysis(title, description, imageUrls);
  return { status: 'fallback', analysis: fallback };
}
```

#### Fix 1C: Align field names in Gemini prompt and result

**File**: `apps/functions/src/services/geminiService.ts`

Update prompt to ask for `suggestedTitle` and `suggestedDescription` and map results:

```ts
'Return JSON: { category, severity, confidence, suggestedTitle, suggestedDescription, suggestedTags, duplicateScore, safetyConcern }'
```

Update `fallbackAnalysis` to use `suggestedTitle` / `suggestedDescription` keys.
Add `usedFallback: true` to fallback result.


#### Fix 2: Correct upload path in ReportWizardPage.tsx

**File**: `apps/web/src/features/report/pages/ReportWizardPage.tsx`

**Change**: Replace the path construction inside `runAiAnalysis`:

```ts
// Before:
const uploadPath = `issues/${Date.now()}_${idx}_${Math.random().toString(36).slice(2)}`;

// After:
const uploadPath = `users/${user.uid}/issue/${Date.now()}_${idx}_photo${idx}.jpg`;
```

This matches the `buildUploadPath` convention used by the server's `storageService.ts`
and makes the GCS path predictable for the Admin SDK download in Fix 1A.

#### Fix 3: Remove stale GPS cache in geolocation.service.ts

**File**: `apps/web/src/services/geolocation.service.ts`

**Change**: Stage 1 options — set `maximumAge: 0` and `enableHighAccuracy: true`:

```ts
// Before:
{ enableHighAccuracy: false, timeout: 5000, maximumAge: 30000 }

// After:
{ enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
```

The Stage 2 fallback (already using `enableHighAccuracy: true, maximumAge: 0`) can
be simplified since Stage 1 is now already high accuracy. Keep Stage 2 as a longer-
timeout retry for devices where the first attempt times out.

Also add `hasCustomLocation` to the `ReportWizardPage.tsx` `useEffect` dependency
array to prevent the effect from firing when returning to Step 2 with an existing
location:

```ts
// File: apps/web/src/features/report/pages/ReportWizardPage.tsx
useEffect(() => {
  if (draft.step === 2 && !draft.hasCustomLocation) {
    // ...detection logic unchanged...
  }
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [draft.step, draft.hasCustomLocation]);
```

#### Fix 4: Image display — fixed transitively by Fix 2

No separate code change needed. Once Fix 2 ensures uploads write to a valid path
and return a `https://` URL, the existing `validImages` filter in `submit()` will
have at least one URL to persist, and `IssueCard`/`IssueDetailsPage` will render it.

#### Fix 5: Seed analytics/global on issue creation

**File**: `apps/functions/src/triggers/onIssueCreated.ts`

After `enrichIssueOnCreate(issueId)` completes, call:

```ts
import { recordAnalyticsEvent } from '../services/analyticsService';
await recordAnalyticsEvent('global', 'totals', { totalReports: 1 });
```

`recordAnalyticsEvent` uses `FieldValue.increment` + `set(..., { merge: true })`, so
the document is created on first call and incremented atomically on subsequent calls.

Also update `onIssueUpdated.ts` to mirror resolved stats to `global`:

```ts
if (after.status === 'resolved') {
  await Promise.all([
    recordAnalyticsEvent('weekly', 'issue_resolution', { resolvedIssues: 1 }),
    recordAnalyticsEvent('global', 'totals', { resolvedThisWeek: 1 }),
  ]);
}
```


---

## Six-Phase Stabilization Plan

### Phase 1 — Core Features Verification

**Goal**: Confirm every feature in the golden demo path works end-to-end in the
deployed Firebase environment after applying the five bug fixes above.

**Checklist per feature:**

| Feature | Verify |
|---------|--------|
| Authentication | Google Sign-In popup, Email/Password, Anonymous; `onAuthUserCreated` fires, user doc created, leaderboard entry initialized |
| Report Submission | Upload → valid `https://` URL in Firestore; AI analysis returns category/severity; issue appears in My Reports within 2 s |
| AI Image Analysis | `analyzeIssueImage` callable returns `status: 'success'` with `confidence >= 0.6` for a real photo; fallback returns `status: 'fallback'` |
| Image Upload | File stored at `users/{uid}/issue/…`; download URL persisted in `media.images[0]` |
| GPS Location | `getCurrentPosition()` returns coordinates with `accuracy < 500 m`; Nominatim returns correct city |
| My Reports | `ProfilePage` lists the new issue; `reporterId` filter query works |
| Map | Issue marker appears at correct coordinates; clustering works; status filter tabs work |
| Dashboard (Home) | Community Impact shows `totalReports >= 1` after first submission |
| Government Dashboard | Issue appears in queue; status update works; analytics tab shows bar chart |
| Notifications | Status-change notification created by `onIssueUpdated`; bell shows unread count |
| Leaderboard | User appears with `score > 0` after submission; all three period tabs load |

**Acceptance**: All 11 feature areas pass manual smoke test in production Firebase
environment. No console errors on any page.


### Phase 2 — Mock Data Removal

**Goal**: Search the entire `apps/web/src` tree for any remaining hardcoded arrays,
`setTimeout`-based fake delays, dummy objects, and placeholder values that should be
sourced from Firebase.

**Search patterns to run:**

```bash
# Hardcoded arrays that look like fake issue/user data
grep -rn "const.*=\s*\[.*{" apps/web/src --include="*.ts" --include="*.tsx"

# setTimeout used as fake data delay (distinct from legitimate debounce)
grep -rn "setTimeout" apps/web/src --include="*.ts" --include="*.tsx"

# Common mock indicators
grep -rn "TODO\|FIXME\|mock\|dummy\|placeholder\|fake\|hardcoded" \
  apps/web/src apps/functions/src --include="*.ts" --include="*.tsx" -i

# Static numbers that look like analytics seeds
grep -rn "totalReports:\|resolvedThisWeek:\|activeIssues:" apps/web/src
```

**Known locations to audit:**

| Location | What to check |
|----------|--------------|
| `HomePage.tsx` | Community Impact fallback values — should show `-` not `0` when doc absent |
| `GovernmentDashboardPage.tsx` | Stat card fallback `0` values — confirm they pull from live `issues` array not constants |
| `LeaderboardPage.tsx` | Empty leaderboard state — confirm "No entries" message, not a static podium |
| `NotificationsPage.tsx` | Empty state — confirm "No notifications" not a dummy list |
| `ProfilePage.tsx` | Badges section — confirm `getBadges()` reads Firestore `badges` collection |
| `lib/constants.ts` | `BADGES` array — this is UI configuration, not mock data; leave as-is |

**Deliverable**: A mock-removal report listing every file changed, the mock that was
removed, and the live Firebase source that replaced it.

**Acceptance criteria**: Zero `setTimeout` calls used as fake data delays; zero
inline arrays containing fake issue/user documents; all stat figures sourced from
Firestore or computed from live query results.


### Phase 3 — Production Code Review

**Goal**: Full repository inspection for issues that would cause failures or errors
during a live demo. Auto-fix Critical and High severity issues.

**Severity tiers:**

| Tier | Auto-fix | Examples |
|------|----------|---------|
| Critical | Yes | Unhandled promise rejections, missing null checks that cause crashes |
| High | Yes | TypeScript errors, broken imports, security misconfigurations |
| Medium | Manual review | Memory leaks, duplicate logic, performance hotspots |
| Low | Document only | Code style, minor tech debt |

**Inspection areas:**

**Runtime errors**: Check every `useEffect` for missing cleanup (Firestore
`unsubscribe` calls). Confirm `listenToIssue`, `listenToIssues`, `listenToUserNotifications`,
`listenToCommunityStats` all return and call their unsub functions. Missing cleanups
cause memory leaks and duplicate listeners after route changes.

**TypeScript errors**: Run `tsc --noEmit` in both `apps/web` and `apps/functions`.
Known issue: TypeScript version mismatch (root uses ^6.0.3, functions uses ^5.0.0).
Target: zero type errors in strict mode.

**Console errors**: Run the app with DevTools open and walk every route. Common
sources: missing Leaflet CSS, unhandled Firestore permission errors, React key
warnings in lists.

**Memory leaks**: Every `onSnapshot` listener must be stored and returned from
`useEffect`. `MapContainer` in `ReportWizardPage` recreates Leaflet on every step
transition — consider lazy-mounting the map only on Step 2.

**Broken imports**: Check for any `import ... from '../../'` that resolves to a
deleted or renamed file. The `@/` alias is configured in `vite.config.ts`; verify
it is also in `tsconfig.json` `paths`.

**Duplicate code**: `reverseGeocode` is defined inline in `ReportWizardPage.tsx`
and also available via `GeolocationService.reverseGeocode`. Consolidate to the
service module.

**Security issues**: (See Phase 6 for full security audit.) At code level: confirm
no API keys in client-side source; confirm `VITE_UI_DEV_MODE` cannot be set in
production builds.

**Firebase issues**: Confirm all 9 composite indexes in `firestore.indexes.json` are
deployed. A missing index causes the `failed-precondition` fallback to activate,
which degrades to a slower one-shot query without real-time updates.

**AI issues**: Confirm `GEMINI_API_KEY` is set in Firebase Functions environment
(`firebase functions:config:set` or Secret Manager). The callable has a guard but
would silently fall back without it.

**Auto-fix targets (Critical/High):**

1. Add missing `unsubscribe` returns in any `useEffect` that starts a Firestore
   listener without returning the cleanup.
2. Fix the two `IssueAiAnalysis` field name inconsistencies (`title` vs `suggestedTitle`)
   so TypeScript compiles clean.
3. Remove `App.tsx` (unused Vite template artifact) to avoid import confusion.
4. Ensure `firestore.indexes.json` is deployed before demo by adding a pre-deploy
   check to the CI workflow.


### Phase 4 — Judge Experience Polish

**Goal**: No UI redesign. Polish only: improve first impressions, loading states,
success confirmations, error messages, empty states, spacing, and transitions.

**Specific improvements:**

**Loading screens**: The `Suspense` fallback in `routes.tsx` currently renders a
`<Spinner>`. Add a skeleton layout that matches each page's rough structure so the
transition from loading to content is smooth rather than a blank-then-pop.

**Success animations**: After `submit()` in `ReportWizardPage`, the wizard navigates
away immediately. Add a 1.5 s success state on Step 5 using Framer Motion before
`navigate('/issues/${docRef.id}')`. A checkmark animation with the issue ID shown
creates a memorable demo moment.

**Error messages**: Replace generic `toast.error('Something went wrong')` with
specific messages per failure mode:
- Upload failure: "Photo upload failed — check your connection and try again."
- AI failure: "AI analysis unavailable — your report was saved and will be analyzed shortly."
- Submission failure: differentiate permission / network / unknown.

**Empty states**: Every list view must show a meaningful empty state (not blank):
- Notifications: "You're all caught up! 🎉"
- Leaderboard: "Be the first to report an issue."
- My Reports: "No reports yet — report your first issue!"
- Government Dashboard issue queue: "No issues match your filters."

**Confirmation messages**: After marking a notification read or updating issue status
in the Government Dashboard, show a brief success toast.

**Consistent spacing**: Audit padding/margin on mobile (375px) viewport. Ensure no
content is hidden behind the fixed footer bar on any page. Safe area insets (`pb-safe`)
must be applied to all sticky/fixed footers.

**Smooth transitions**: The step progress bar in `ReportWizardPage` uses `Progress`
with immediate value changes. Add a CSS `transition: width 300ms ease` to `Progress`
so it animates step-to-step. Framer Motion `AnimatePresence` is already present for
step content — verify the exit animation does not leave a visible gap.

**Acceptance**: All polish items verified against the demo script. No jarring
loading flashes. Error and empty states are informative and branded.


### Phase 5 — Performance

**Goal**: Ensure the app loads fast and remains responsive on a demo device (mid-range
Android phone on Wi-Fi).

**Image loading**:
- Add `loading="lazy"` and explicit `width`/`height` attributes to all `<img>` tags
  in `IssueCard` and `IssueDetailsPage` to avoid layout shift.
- Add `decoding="async"` to non-critical images.
- Compress uploaded images client-side before upload: use `canvas.toBlob()` with
  quality 0.85 and max 1920px dimension. This reduces upload size ~60–80% for typical
  phone photos.

**Lazy loading**:
- All 19 page routes are already `React.lazy()` — no change needed.
- `MapContainer` (Leaflet + react-leaflet) adds ~200 KB to the chunk that imports it.
  Confirm it is only imported inside the lazy-loaded `ReportWizardPage` and `MapPage`,
  not in any eagerly-loaded component.

**Firestore queries**:
- Confirm all 9 indexes from `firestore.indexes.json` are deployed. Without the
  `status+createdAt` composite index, `listenToIssues` falls back to a one-shot query
  that does not update in real-time — critical for the demo.
- `useIssues` on HomePage fetches with no `limit` — add `limit: 20` default to avoid
  downloading the full issues collection.

**React re-renders**:
- `IssueCard` is rendered in lists; wrap it in `React.memo()` to prevent re-renders
  when parent state changes (e.g., filter tabs switching in MapPage).
- `ReportWizardPage` re-renders all 6 step panels on every `draft` state update.
  Split `draft` into per-step slices or use `useMemo` for the display-only computed
  values (`displayPhoto`, `progress`, `validImages`).

**Bundle size**:
- Run `npx vite-bundle-visualizer` (or `npx rollup-plugin-visualizer`) to identify
  large chunks. Likely candidates: Leaflet (~150 KB), Framer Motion (~80 KB),
  Radix UI (~60 KB combined). These are all lazy-loaded via page splits — confirm
  the main bundle does not import them at root level.
- `@google/genai` (2.10) is a client-side SDK imported in `ai.service.ts`. Confirm
  it is only used in the lazy-loaded `ReportWizardPage` path, not in the root bundle.

**Map performance**:
- `react-leaflet-cluster` is already used — verify `chunkedLoading: true` is set
  on `MarkerClusterGroup` so large datasets do not block the main thread.
- Add `maxZoom: 18` and `disableClusteringAtZoom: 16` so markers de-cluster at
  street level and clicking is precise.

**Acceptance**: Lighthouse mobile score >= 75 on a production build. Time-to-interactive
< 4 s on a simulated 4G connection.


### Phase 6 — Security

**Goal**: Verify that the Firebase security posture is production-safe before a
public demo. No changes that break existing functionality.

**Firestore rules audit:**

| Collection | Current state | Concern | Action |
|------------|--------------|---------|--------|
| `issues` | Public read | Intended — issues are public | ✅ OK |
| `analytics` | `isPrivileged()` read only, no client write | `analytics/global` is now written by Cloud Function (Admin SDK bypasses rules) | ✅ OK |
| `users` | `signedIn() \|\| isPrivileged()` read | Any signed-in user can read any user doc | Document — acceptable for civic platform |
| `notifications` | Owner/privileged only | `allow create: if false` means only Cloud Functions can create (Admin SDK bypasses) | ✅ Correct |
| `leaderboard` | Public read, privileged write | `updateLeaderboard` callable is privileged-only | ✅ OK |

**Storage rules audit:**

- `users/{userId}/issue/` is NOT in `storage.rules`. After Fix 2, uploads will
  target `users/{uid}/issue/{file}` but the only matching rule is
  `users/{userId}/uploads/{fileId}`. The fix requires adding:

```
match /users/{userId}/issue/{fileId=**} {
  allow read: if true;
  allow write: if isOwner(userId) && (validImage() || validVideo());
}
```

- Alternatively, update Fix 2 to use `users/${user.uid}/uploads/${...}` path which
  already has a rule. **Preferred**: add the `issue` matcher to `storage.rules` to
  match the server's `buildUploadPath` convention.

**Authentication:**

- Confirm `ProtectedRoute` with `allowedRoles={['official', 'moderator']}` is
  enforced server-side via Firestore rules (it is — via `role()` helper checking
  custom claims).
- Confirm `syncAuthProfile` callable validates the requested role is not being
  self-elevated beyond `citizen` without server authorization.
- Confirm `VITE_UI_DEV_MODE` flag is absent from production `.env` and the
  `deploy.yml` GitHub Actions workflow does not inject it.

**API key handling:**

- `GEMINI_API_KEY` must be stored in Firebase Secret Manager or `functions.config()`,
  never in source code or committed `.env` files. Confirm `.gitignore` blocks
  `apps/functions/.env`.
- `VITE_FIREBASE_*` keys are public by design (Firebase Web SDK is client-side) but
  the Firebase project should have App Check enabled to restrict API key abuse.
- Check `firebase.json` `hosting.headers` for `Content-Security-Policy`,
  `X-Frame-Options`, and `X-Content-Type-Options` headers.

**File upload validation:**

- `storage.rules` validates `contentType.matches('image/.*')` and size < 10 MB — ✅.
- Add client-side validation in `ReportWizardPage` before calling `UploadService`:
  check `file.type.startsWith('image/')` and `file.size < 10 * 1024 * 1024` to
  give immediate user feedback rather than a storage rejection error.

**Environment variables:**

- Confirm `apps/functions/.env.example` documents all required variables.
- Confirm `apps/web/.env.example` is up to date.
- Confirm neither file contains real values (only placeholders).

**Acceptance**: `storage.rules` deploy succeeds with the `issue` path added. No API
keys in git history (`git log -S "GEMINI_API_KEY"`). App Check enabled in Firebase
console. Security headers verified with `curl -I` against production hosting URL.


---

## Testing Strategy

### Validation Approach

Testing follows the bug-condition methodology: run exploratory tests against the
unfixed code to confirm (or refute) the root cause, then run fix-checking tests to
verify the corrected behavior, then run preservation tests to confirm no regressions.

The existing vitest suite in `apps/functions` must continue to pass (21 tests, 4 files)
after every fix. New tests are added for the new fix-checking and preservation properties.

### Exploratory Bug Condition Checking

**Goal**: Surface counterexamples on unfixed code to confirm root cause analysis.

**Test cases (run against unfixed code, expect failure):**

1. **AI key guard**: Call `analyzeIssueImage` with `GEMINI_API_KEY` unset in test env.
   Expected: returns `status: 'fallback'`. Unfixed: throws HttpsError.
2. **Image download**: Call `analyzeIssueMedia` with a real Storage URL and assert
   `imageParts.length > 0`. Unfixed: `imageParts` is empty (fetch fails in test env).
3. **Upload path shape**: Call `runAiAnalysis` and capture the path passed to
   `UploadService.uploadFile`. Unfixed: path starts with `issues/`.
4. **GPS stale**: Mock `navigator.geolocation.getCurrentPosition` to return a 25-second-old
   position. Call `getCurrentPosition()`. Unfixed: resolves immediately with the stale
   position. Fixed: ignores it (maximumAge: 0).
5. **analytics/global missing**: Submit an issue, then `getDoc('analytics/global')`.
   Unfixed: `snap.exists()` is `false`. Fixed: `snap.exists()` is `true`.

### Fix Checking

```
FOR ALL X WHERE isBugCondition_AI(X) DO
  result := analyzeIssueImage_fixed(X)
  ASSERT result.status IN ['success', 'fallback']
  ASSERT result.analysis.category IS NOT NULL
  ASSERT result.analysis.usedFallback == true  // if status == 'fallback'
END FOR

FOR ALL X WHERE isBugCondition_Pipeline(X) DO
  path := buildUploadPath_fixed(X.userId, idx)
  ASSERT path.startsWith('users/' + X.userId + '/issue/')
  result := submitReport_fixed(X)
  ASSERT result.mediaImages.every(url => url.startsWith('https://firebasestorage'))
END FOR

FOR ALL X WHERE isBugCondition_Location(X) DO
  result := getCurrentPosition_fixed()
  ASSERT result.coords.accuracy < 500
  ASSERT positionAgeMs_used == 0
END FOR
```

### Preservation Checking

```
FOR ALL X WHERE NOT isBugCondition_AI(X) DO
  ASSERT analyzeIssueMedia(X).status == analyzeIssueMedia_fixed(X).status
  ASSERT analyzeIssueMedia(X).analysis.category == analyzeIssueMedia_fixed(X).analysis.category
END FOR

FOR ALL X WHERE draft.hasCustomLocation == true ENTERING Step 2 DO
  ASSERT draft.latitude_after == draft.latitude_before
  ASSERT draft.longitude_after == draft.longitude_before
END FOR
```

### Unit Tests

Add to `apps/functions/src/__tests__/`:

- `geminiService.test.ts` (extend existing): Test `downloadImageAsBase64` with a
  mocked `bucket.file().download()`. Test that fallback result contains `usedFallback: true`.
- `analyzeIssueImage.test.ts` (new): Test callable top-level catch — mock
  `analyzeIssueMedia` to throw, assert return is `{ status: 'fallback', analysis: {...} }`.
- `analyticsService.test.ts` (extend existing): Test `recordAnalyticsEvent('global', ...)`
  creates the doc with `merge: true`. Test idempotent increment on second call.
- `onIssueCreated.test.ts` (new): Mock `enrichIssueOnCreate` and `recordAnalyticsEvent`,
  assert both are called when trigger fires.

### Property-Based Tests

- Generate random `imageUrls` arrays (empty, length 1–5, malformed URLs, valid GCS paths)
  and assert `analyzeIssueMedia` never throws — it always returns an `IssueAnalysisResult`.
- Generate random `userId` strings and assert `buildUploadPath(userId, 'issue', 'photo.jpg')`
  always starts with `users/${userId}/issue/`.
- Generate random `GeolocationPosition` mocks with varying `accuracy` values and assert
  that `getCurrentPosition` with `maximumAge: 0` never resolves with a position age > 0.

### Integration Tests

- **End-to-end golden path** (manual + emulator): Start Firebase emulators, sign in,
  submit a report, verify `analytics/global.metrics.totalReports` incremented, verify
  `media.images[0]` is a valid `https://` URL, verify `aiAnalysis.category` is populated.
- **Government Dashboard**: With emulators, update an issue to `resolved`, verify
  `analytics/global.metrics.resolvedThisWeek` incremented.
- **Notification timing**: With emulators, update issue status, verify notification
  doc appears in `notifications` collection for the reporter's UID within 3 s.

