# Community Verification Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the verify/vote button, image removal bug, verification notifications, and home page verification count display.

**Architecture:** Four independent but sequential changes: (1) Firestore rules change to allow verification writes, (2) UI fix for image removal in report wizard, (3) error handling + toast in vote handler, (4) notification doc creation on vote.

**Tech Stack:** React 19, Firebase Firestore (security rules + client SDK), Sonner toast, TanStack Router

## Global Constraints

- No new dependencies
- Follow existing code patterns (service objects, `const` + arrow functions, no classes)
- Firestore rules use `rules_version = '2'`

---

### Task 1: Fix Firestore Rules — Allow Verification Writes

**Files:**
- Modify: `firestore.rules:45`

**Interfaces:**
- Consumes: Existing `isPrivileged()`, `signedIn()` helper functions in rules
- Produces: Non-owner signed-in users can update `verification.*` fields on issues

- [ ] **Step 1: Change the `issues` update rule**

Change line 45 from:
```
      allow update: if isPrivileged() || (signedIn() && resource.data.reporterId == request.auth.uid);
```
to:
```
      allow update: if isPrivileged()
        || (signedIn() && resource.data.reporterId == request.auth.uid)
        || (signedIn() && request.resource.data.diff(resource.data).affectedKeys().hasOnly(['verification']));
```

- [ ] **Step 2: Commit**

```
git add firestore.rules
git commit -m "fix: allow non-owner signed-in users to update issue verification fields"
```

---

### Task 2: Fix Image Removal in Report Wizard

**Files:**
- Modify: `apps/web/src/features/report/pages/ReportWizardPage.tsx:314-322` (handleGallerySelect)
- Modify: `apps/web/src/features/report/pages/ReportWizardPage.tsx:467-476` (gallery grid)

**Interfaces:**
- Consumes: `draft.photos`, `photoBlobs.current`, `draft.localPhoto` — existing state
- Produces: Clean removal that syncs `draft.photos` with `photoBlobs.current`

- [ ] **Step 1: Extract `handleRemovePhoto` function and fix gallery grid keys**

In the gallery step (around line 467), replace the inline remove handler with a named function. Also change `key={i}` to `key={p}`.

Add this function in the component body (after `handleGallerySelect`, before the return):
```tsx
const handleRemovePhoto = (i: number) => {
  // Revoke the blob URL to free memory
  const removedUrl = draft.photos[i];
  if (removedUrl?.startsWith('blob:')) {
    URL.revokeObjectURL(removedUrl);
  }
  // Remove from display list
  const updatedPhotos = draft.photos.filter((_, j) => j !== i);
  // Sync photoBlobs — if removing the camera photo (index 0) and there are gallery photos,
  // the camera blob (photoBlobs[0]) should be removed
  photoBlobs.current = photoBlobs.current.filter((_, j) => j !== i);
  update({ photos: updatedPhotos });
  // If the camera photo was removed, clear localPhoto too
  if (i === 0) {
    update({ localPhoto: null });
  }
};
```

Change the gallery grid remove button's onClick:
```tsx
// Before:
onClick={() => update({ photos: draft.photos.filter((_, j) => j !== i) })}
// After:
onClick={() => handleRemovePhoto(i)}
```

Change the grid item key from `key={i}` to `key={p}`:
```tsx
// Before:
{draft.photos.map((p, i) => (
  <div key={i} className="relative aspect-square">
// After:
{draft.photos.map((p, i) => (
  <div key={p} className="relative aspect-square">
```

- [ ] **Step 2: Commit**

```
git add apps/web/src/features/report/pages/ReportWizardPage.tsx
git commit -m "fix: sync photoBlobs.current on image removal and use URL keys in gallery grid"
```

---

### Task 3: Add Error Handling + Success Toast in Vote Button

**Files:**
- Modify: `apps/web/src/features/issues/pages/IssueDetailsPage.tsx:140-147`

**Interfaces:**
- Consumes: `VoteService.castVote(issueId, userId, type)`, `setUserVote(state)`, `userVote` current state
- Produces: Toast feedback on vote success/failure

- [ ] **Step 1: Replace the bare `handleVote` with try/catch + toast**

Change the `handleVote` function (lines 140-147) from:
```tsx
const handleVote = async (type: 'upvote' | 'downvote') => {
    if (!user || !id) {
      toast.error('Sign in to vote on issues.');
      return;
    }
    await VoteService.castVote(id, user.uid, type);
    setUserVote(userVote === type ? null : type);
};
```
to:
```tsx
const handleVote = async (type: 'upvote' | 'downvote') => {
    if (!user || !id) {
      toast.error('Sign in to vote on issues.');
      return;
    }
    try {
      await VoteService.castVote(id, user.uid, type);
      setUserVote(userVote === type ? null : type);
      toast.success(type === 'upvote' ? 'Issue verified!' : 'Vote recorded.');
    } catch {
      toast.error('Failed to record vote. Please try again.');
    }
};
```

- [ ] **Step 2: Commit**

```
git add apps/web/src/features/issues/pages/IssueDetailsPage.tsx
git commit -m "feat: add try/catch and toast feedback to vote handler"
```

---

### Task 4: Add Notification on Vote

**Files:**
- Modify: `firestore.rules:63`
- Modify: `apps/web/src/services/vote.service.ts:73-77`

**Interfaces:**
- Consumes: `db` (firestore instance), `issueRef` (already in transaction scope)
- Produces: Notification doc written for issue reporter when someone upvotes

- [ ] **Step 1: Relax notification creation rule**

Change `firestore.rules:63` from:
```
      allow create: if false;
```
to:
```
      allow create: if signedIn() && request.resource.data.type == 'vote';
```

Only `vote`-type notifications can be created client-side. This lets the voter (auth.uid = voterId) create a notification for the reporter (userId = reporterId) since the voter doesn't own the reporter's notification doc but is creating a `vote`-type notification. Other notification types (`comment`, `issue_update`, etc.) remain server-only. The `onVoteCreated` trigger (when deployed) will handle reputation/badge awards server-side.

- [ ] **Step 2: Write notification doc in VoteService.castVote**

After the `runTransaction` call in `vote.service.ts` (line 78), add code to create a notification when the vote type is `'upvote'`. The issue data (`issueData`) was read inside the transaction, but we need the reporterId and issue title for the notification. We need to read the issue snapshot data before the transaction or capture it during.

Modify `castVote` to capture the issue's reporter info before/after the transaction:

```tsx
import { addDoc, collection, doc, getDoc } from 'firebase/firestore';

// In castVote, after the transaction (line 78+):
  // After successful transaction, create notification for reporter on upvote
  if (type === 'upvote') {
    // Read issue data to get reporter info (fresh after transaction)
    const freshIssue = await getDoc(issueRef);
    if (freshIssue.exists()) {
      const issueData = freshIssue.data();
      const reporterId = issueData.reporterId;
      if (reporterId && reporterId !== userId) {
        const notificationsRef = collection(db, 'notifications');
        await addDoc(notificationsRef, {
          userId: reporterId,
          type: 'vote',
          title: 'Your issue was verified',
          body: `Someone verified your issue: ${issueData.title || 'Untitled'}`,
          data: {
            issueId,
            voterId: userId,
          },
          read: false,
          createdAt: new Date().toISOString(),
        });
      }
    }
  }
```

- [ ] **Step 3: Commit**

```
git add firestore.rules apps/web/src/services/vote.service.ts
git commit -m "feat: add notification on upvote — relax rules and write notification doc in VoteService"
```

---

### Verification

After all tasks are deployed/active, verify end-to-end:

1. Open any issue → click ThumbsUp → count increments in real-time → toast says "Issue verified!" → refresh → count persists
2. Home page issue cards (IssueCard) show verification badge with count
3. Report wizard → step 1 → add 3 gallery photos → remove second one → correct one removed → remaining ones stay → submit → only non-removed photos appear in issue detail
4. Vote on someone else's issue → reporter logs in → bell dropdown shows notification "Your issue was verified"
