# Community Verification Fixes & Image Removal Bug

## Overview

Fix four interconnected issues in the issue-reporting flow that block community participation:

1. **Verify button silent failure** — Firestore rules reject non-owner issue writes
2. **Image removal bug** — Wrong photo removed, removed photos still uploaded
3. **Verification notification** — No toast or in-app notification when someone upvotes your issue
4. **Home page verification count** — Already implemented in IssueCard, broken by rule #1

## Architecture Context

```
User clicks ThumbsUp on IssueDetailsPage
  → handleVote('upvote')
    → VoteService.castVote(issueId, userId, 'upvote')
      → Firestore transaction:
        1. Read votes/{issueId}_{userId}  ✅ (passes rules)
        2. Read issues/{issueId}           ✅ (public read)
        3. Write votes/{issueId}_{userId}  ✅ (create: userId == auth.uid)
        4. UPDATE issues/{issueId}         ❌ (issue owner check fails)
```

The verification count in `IssueCard.tsx` reads `issue.verification?.upvotes` — this will show data once the transaction succeeds.

## Changes

### 1. Firestore Rules — Allow Verification Writes

**File:** `firestore.rules:45`

**Current:**
```
allow update: if isPrivileged() || (signedIn() && resource.data.reporterId == request.auth.uid);
```

**Target:**
```
allow update: if isPrivileged()
  || (signedIn() && resource.data.reporterId == request.auth.uid)
  || (signedIn() && request.resource.data.diff(resource.data).affectedKeys().hasOnly(['verification']));
```

Adds a third condition: any signed-in user may update the `verification` subfield of an issue. The `diff().affectedKeys().hasOnly()` guard ensures they cannot modify any other field (title, status, reporter, etc.). This is a Firestore security rules built-in — no custom functions needed.

**Why not route through submitVote callable exclusively?** The callable exists and can be used in parallel, but the client-side transaction should also work so voting works even when functions are undeployed (current state). Both paths will be viable.

### 2. Image Removal — Clean Up Blobs & Fix Keys

**File:** `apps/web/src/features/report/pages/ReportWizardPage.tsx`

**Current problems:**
- Remove handler in step 1 (`draft.photos.filter((_, j) => j !== i)`) updates `draft.photos` but leaves `photoBlobs.current` untouched → removed blobs still get uploaded at step 3 (`runAiAnalysis` consumes `photoBlobs.current`)
- `key={i}` on gallery grid items causes React reconciliation confusion when items shift indices
- `draft.localPhoto` is never cleared when the camera photo (index 0) is removed from gallery

**Changes:**
- Extract a `handleRemovePhoto(i: number)` function that:
  1. Removes from `draft.photos` (same filter as now)
  2. Removes from `photoBlobs.current` at the same index
  3. If the removed index is 0 (camera photo), also clears `draft.localPhoto`
  4. Revokes the removed blob URL (`URL.revokeObjectURL`)
- Change `key={i}` to `key={p}` (the blob URL string) in the gallery map

### 3. Verification Notification — Toast + In-App

**Files:**
- `apps/web/src/features/issues/pages/IssueDetailsPage.tsx`
- `firestore.rules:63`
- `apps/web/src/services/vote.service.ts`

**Current:**
- `handleVote` has no toast, no notification doc
- `notifications` rule: `allow create: if false` (server-only)
- `onVoteCreated` trigger exists (creates notification) but functions not deployed

**Changes:**
- **Firestore rules:** Change `allow create: if false` to `allow create: if signedIn() && request.resource.data.userId == request.auth.uid` — users can create notification docs for themselves
- **VoteService.castVote:** After successful transaction, if type is `'upvote'`, also write a notification doc to `notifications/{autoId}` for the issue reporter with type `'vote'`
- **IssueDetailsPage handleVote:** Add `toast.success('Vote recorded')` after successful cast
- **IssueDetailsPage handleVote:** Add try/catch with `toast.error` on failure (currently uncaught)

### 4. Home Page Verification Count

**No changes needed.** `IssueCard.tsx` already renders:
```tsx
{issue.verification?.upvotes > 0 && (
  <Badge>... {issue.verification.upvotes}</Badge>
)}
```
This will automatically appear once rules fix allows votes to increment.

### Future: submitVote callable fallback

**No immediate code changes.** The existing `submitVote` callable (`apps/functions/src/callables/submitVote.ts`) already exists as a Gen 2 Cloud Function. When Cloud Build deployment is resolved, the frontend can be updated to call it instead of/in addition to the client-side transaction. For now, the rules fix enables the client path.

## Implementation Order

1. **Firestore rules** — one-line change, enables everything downstream
2. **Image removal fix** — self-contained UI/bug fix
3. **Vote notification** — toast + notification doc
4. **Error handling** — try/catch in handleVote (belt-and-suspenders)

## Verification

1. Open an issue → click ThumbsUp → count increments in real-time, toast shown
2. Open IssueCard on home page → verification badge visible with count
3. Report wizard → add gallery photos → remove one → verify correct one removed → submit → verify removed photo NOT uploaded
4. Vote on someone else's issue → reporter receives notification in bell dropdown
