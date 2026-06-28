# BlockSeBlock — Hackathon Presentation Polish Plan

> **Goal:** Make this app demo-ready — polished, impressive, and narratively compelling for a live/recorded hackathon presentation.

## The Hero Demo Loop

The core narrative: **Citizen sees problem → Reports with photo + AI analysis → Issue appears on map → Community verifies → Government resolves → Everyone sees the impact.**

**Seeded demo data needed** (Firestore seed script or manual): ~8-12 issues across categories/statuses, 1 user with badges/reputation, a few comments and votes, leaderboard entries.

---

## Phase 1 — Demo Blockers (DO FIRST)

### 1.1 Add ErrorBoundary to lazy routes
**File:** `apps/web/src/routes.tsx`
**Problem:** If any lazy-loaded page fails (network blip, Firebase timeout), user sees nothing — app crashes silently.
**Fix:** Wrap `React.lazy()` imports or the `<Suspense>` boundary with a top-level `<ErrorBoundary>` that shows a recoverable error screen with a "Try Again" button.
**Pattern:**
```tsx
class ErrorBoundary extends React.Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) {
      return <ErrorState title="Something went wrong" action="Try Again" onAction={() => this.setState({ hasError: false })} />;
    }
    return this.props.children;
  }
}
```
Wrap each `<Suspense>` call or create a wrapper `<SuspenseWithErrorBoundary>` component.

### 1.2 Add EmptyState to every data-driven page
**Files to check/modify:**
- `HomePage.tsx` — if no issues fetched, show "No issues yet—be the first to report!"
- `MapPage.tsx` — if no markers, show a centered empty state "No issues in this area"
- `IssueDetailsPage.tsx` — if issue not found (deleted), redirect or show "Issue not found"
- `NotificationsPage.tsx` — "No notifications yet"
- `LeaderboardPage.tsx` — "No rankings yet" (period-specific)
- `ImpactPage.tsx` — "Not enough data yet"
- `ProfilePage.tsx` — "No reports yet" under My Reports
- `GovernmentDashboardPage.tsx` — "No issues match this filter"

**Pattern:** Use the existing `<EmptyState>` component from `components/ui/empty-state.tsx` (verify it exists — if not, create one with icon, message, optional action button).

### 1.3 Add ErrorState to data hooks
**Problem:** React Query hooks (`useIssue`, `useIssues`, etc.) may have `isError` state but not all pages render it.
**Fix:** Audit each page that uses data hooks and render `<ErrorState>` when `isError` is true, with a retry action calling `refetch()`.
**Priority pages:** HomePage (first thing user sees after login), IssueDetailsPage (deep link), GovernmentDashboardPage (official demo path).

### 1.4 Handle map loading failures
**File:** `MapPage.tsx`
**Problem:** Leaflet tiles fail to load in poor connectivity — shows grey tiles with no feedback.
**Fix:** Add `<ErrorState>` or toast when tile loading fails. Show a "Map unavailable" fallback with a list view. Listen for Leaflet `tileerror` events.

### 1.5 Camera/gallery permissions fallback
**File:** `ReportWizardPage.tsx` (step 1)
**Problem:** If user denies camera/gallery permissions on web, the wizard gets stuck.
**Fix:** Detect `PermissionDenied` / `NotAllowedError` and show a friendly message with a file-picker fallback ("Camera unavailable. You can upload a photo instead.").

---

## Phase 2 — Demo Flow Polish (The Hero Loop)

### 2.1 Report flow: tightening
**File:** `apps/web/src/features/report/pages/ReportWizardPage.tsx`
**Goals:**
- Add a progress bar showing step 1-6 position (already may exist — verify)
- Add step transition animations (slide left on next, slide right on back) using Framer Motion `AnimatePresence`
- Add keyboard shortcut: Enter to advance to next step
- Pre-fill location from browser geolocation on step 2 with a "Using your location" toast
- AI Analysis step (step 3): show a live "scanning" animation in the Dynamic Island + a typewriter effect on results appearing
- Add an "I'll describe it myself" skip button on AI analysis (user may not want AI)
- Step 6 success: add confetti (canvas-confetti light) + "Share this issue" button
- Add `useRef<ReturnType<typeof setTimeout>>(undefined)` fix for React 19 build (already done per AGENTS.md)

### 2.2 Map interaction: demo-ready
**File:** `apps/web/src/features/map/pages/MapPage.tsx`
**Goals:**
- On marker click: bottom sheet slides up with IssueCard preview (verify existing)
- Bottom sheet: smooth spring animation, shows title + category + severity + thumbnail + "View Details" button
- Add a "My Location" button (centers map on user's geolocation)
- Add a brief marker pop animation on initial load (staggered appearance of cluster markers)
- Status filter pills at top should persist selection

### 2.3 Issue Details: the "aha" moment
**File:** `apps/web/src/features/issues/pages/IssueDetailsPage.tsx`
**Goals:**
- **Voting animation:** when user taps upvote/downvote, the count animates up/down with a spring + the button scales briefly
- **Status timeline:** if issue has been updated (status changes), show a vertical timeline with date stamps and status badges
- **Image carousel:** swipe or arrow navigation for multiple images; pinch-to-zoom if possible
- **AI insights card:** collapsed by default, expandable section showing "AI Analysis" with category, severity, confidence score, suggested tags
- **Comments section:** scroll-to-bottom on new comment, auto-focus input when tapping "Add Comment"

### 2.4 HomePage: first impression
**File:** `apps/web/src/features/home/pages/HomePage.tsx`
**Goals:**
- Personalized greeting: "Good morning, Alex!" based on time of day
- Quick stats cards with animated counters (count up from 0 when they appear)
- Staggered card entry animation (cards fade in one by one)
- Search bar: add voice search button (Web Speech API) for demo wow-factor
- Trending issues section: auto-scrolling horizontal carousel
- Pull-to-refresh visual feedback

### 2.5 Profile & Impact: demo payoff
**Goals:**
- ProfilePage: add animated stat counters, badge showcase with unlock animation
- ImpactPage: add a "Your Impact" section vs "Community Impact" — personal contribution highlighted
- Show streak flame icon next to streak count

---

## Phase 3 — Visual & UX Enhancement

### 3.1 Page transitions
**File:** `apps/web/src/routes.tsx` (or AppLayout)
**Problem:** Route changes are instant with no transition — feels like a web app.
**Fix:** Use Framer Motion `<AnimatePresence>` with `<motion.div>` on each page wrapper. Simple opacity + slide up (0.2s). Define variants:
```tsx
const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.2 } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.15 } },
};
```

### 3.2 Dynamic Island polish
**File:** `apps/web/src/components/layout/DynamicIsland.tsx`
**Check:**
- Does it show a scanning animation during AI analysis?
- Does it indicate offline mode with an appropriate icon and color?
- Does it show activity feedback "Issue submitted!", "Vote counted!"?
- Add haptic-style spring animations for state transitions
- Add auto-dismiss after showing a brief message

### 3.3 Bottom Nav polish
**File:** `apps/web/src/components/layout/BottomNav.tsx`
**Check:**
- Active tab indicator animation (underline slide or icon scale)
- FAB (if exists) — add a pulse animation on page load to draw attention
- Micro-interactions: icon bounce on tap

### 3.4 Dark mode audit
**Quick check every page in both themes. Common issues:**
- Text contrast in cards (text-muted-foreground on muted backgrounds)
- Map tiles (Leaflet dark tile layer for dark mode)
- Bottom sheet backgrounds
- Input field borders in dark mode
- Sonner toast colors in dark mode

### 3.5 Skeleton loading states
**Audit every page for missing skeleton loaders:**
- Use `<Skeleton>` components that match the page layout shape
- Avoid layout shift when data loads (wrap in fixed-height containers)
- **Priority pages:** HomePage, MapPage, IssueDetailsPage, ProfilePage

### 3.6 Micro-interactions checklist
- Buttons: subtle scale on press (active:scale-95)
- Cards: hover lift effect (desktop) with shadow increase
- Toggle switches: smooth color transition
- Pull-to-refresh: animated spinner at top
- Tab switches: content crossfade
- Toast notifications: slide-in from top-right (Sonner default), check dark mode
- Vote buttons: color fill animation on toggle

### 3.7 Accessibility quick wins
- All icon buttons need aria-label (verify existing)
- Form inputs need associated labels (they have them)
- Color-blind friendly severity indicators (don't rely solely on red/green — add text labels)
- Focus outlines visible on keyboard navigation
- Reduced-motion support: wrap animations in `prefers-reduced-motion` media query or Framer Motion's `useReducedMotion`

---

## Phase 4 — Demo Script & Showmanship

### 4.1 Demo Script (the hero walkthrough)

**Setup:** Pre-seeded data loaded, logged in as "Alex Rivera — concerned citizen"

**Act 1 — The Problem (30s)**
1. App opens to HomePage → personalized greeting + stats
2. "Look at these issues in my neighborhood" — tap into MapPage
3. See clustered markers, tap one → bottom sheet shows pothole
4. "This has been reported, but let me show you how easy it is to add one"

**Act 2 — The Report (60s) — THE MOMENT**
5. Tap "+" FAB → ReportWizard opens
6. **Step 1:** Select photo from gallery (pre-seeded dramatic pothole/streetlight photo)
7. **Step 2:** Map auto-detects location — "Using my location" toast appears
8. **Step 3:** AI Analysis — **this is the demo highlight**
   - Dynamic Island shows scanning animation
   - Results appear with typewriter effect: "Category: Pothole (95% confidence)"
   - "Severity: High" — "Suggested description: Deep pothole near crosswalk"
   - "This is what makes BlockSeBlock different — AI understands the problem"
9. **Step 4:** Quick review, tap "Submit"
10. **Step 5:** Success screen with confetti + "Report shared with your city!"

**Act 3 — Community in Action (45s)**
11. Switch to HomePage → new issue appears in "Recent" section
12. Go to ImpactPage → "See how the community is making a difference"
13. Show weekly chart, category breakdown
14. "Every report, every vote — it adds up"

**Act 4 — The Payoff (30s)**
15. Show NotificationsPage → "You'll even get notified when the city takes action"
16. Show ProfilePage → badges earned, streak maintained
17. "BlockSeBlock turns frustration into action — AI-powered civic engagement"

### 4.2 Seeded Data Requirements
Run a seed script before the demo to create:
- **User:** "Alex Rivera" — reputation 842, 12 issues reported, 8 verified, streak 23 days
- **Issues (8-12):**
  - "Deep pothole on Main Street" (pothole, high, reported) — photo of pothole
  - "Streetlight out at Oak Park" (streetlight, medium, in_progress) — night photo
  - "Water leak near library" (water_leak, critical, verified) — leaking pipe
  - "Graffiti on Elm Street wall" (graffiti, low, resolved) — before/after
  - "Broken sidewalk on 5th Ave" (sidewalk, medium, reported)
  - "Trash pile behind超市" (garbage, medium, reported)
  - "Damaged guardrail on Highway 9" (other, critical, in_progress)
- **Votes:** several upvotes on the demo user's issues
- **Comments:** 2-3 comments on various issues
- **Leaderboard:** Alex ranked #2 weekly, #5 all-time
- **Notifications:** 3 unread (vote received, status update, badge earned)

### 4.3 Recording Tips
- Record at 1080p 60fps
- Use Chrome DevTools mobile emulation (iPhone 14 Pro Max / Pixel 7)
- Set `prefers-reduced-motion` query to ensure animations work for recordings
- Pre-load all pages once before recording to warm Firebase cache and tile cache
- Record audio narration separately for best quality
- If live demo: have a hotspot backup, local Firebase emulator fallback

### 4.4 Judging Criteria Mapping

| Criteria | How BlockSeBlock delivers | Key moment in demo |
|----------|--------------------------|--------------------|
| **Innovation** | AI-powered issue classification + severity analysis | AI Analysis step in wizard |
| **Technical complexity** | Real-time Firestore, Gemini AI, Leaflet maps, offline queue, Dynamic Island | Multi-step wizard + real-time map updates |
| **Impact** | Bridges citizens and government, quantifies community action | ImpactPage + notification of resolution |
| **Polish** | Dark mode, animations, Dynamic Island, glass-morphism UI | Page transitions + micro-interactions |
| **Completeness** | Full auth, reporting, map, voting, comments, leaderboard, notifications, gov dashboard | Entire end-to-end flow works |

---

## Phase 5 — Prep Checklist (Day Before)

- [ ] Run seed script → verify all seeded data renders
- [ ] Test full hero loop on Chrome mobile emulation
- [ ] Test full hero loop on physical phone (if available)
- [ ] Test offline mode: report an issue while airplane mode → queue → comes through on reconnect
- [ ] Verify dark mode toggle on every page of the demo flow
- [ ] Turn off all notifications, close all other tabs
- [ ] Record a dry run — watch for timing, narration gaps, loading spinners
- [ ] Have a backup: screen recording of the full flow in case of network failure
- [ ] Pre-warm Firebase, Gemini API, and Leaflet tile cache (visit pages once)
- [ ] Test on projector/external display resolution
- [ ] Check font sizes are readable on big screen
- [ ] Disable browser extensions that may interfere
- [ ] Verify `npm run build` passes cleanly
