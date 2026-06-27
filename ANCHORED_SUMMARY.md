## Goal
- Implement a 6-phase analytics system (backend triggers, client hooks, Impact page, profile chart, Gov dashboard recharts upgrade, and predictive insights) across functions and web apps.

## Constraints & Preferences
- Phases must be executed in order (1→6)
- All analytics docs live in the `analytics` Firestore collection
- Use Firestore `FieldValue.increment` for counter updates
- No new dependencies except recharts (Phase 5) — CSS-only charts elsewhere
- Callable functions must use Zod for input validation and include auth checks
- Follow existing code patterns: trigger structure, service patterns, callable layout
- Prefer `admin.firestore.FieldValue` in functions, `firebase/firestore` equivalents in web

## Progress
### Done
- Phase 1.1: Added `recordDailyMetrics`, `recordCategoryMetrics`, `recordStatusMetrics` + `dailyDocId` helper to `apps/functions/src/services/analyticsService.ts`
- Phase 1.2: Wired analytics calls into all 4 triggers:
  - `onIssueCreated` — calls `recordDailyMetrics({ newIssues: 1 })`, `recordCategoryMetrics(category)`, `recordStatusMetrics('reported')`
  - `onVoteCreated` — calls `recordDailyMetrics({ verifications: 1 })` only on `upvote`
  - `onCommentCreated` — calls `recordDailyMetrics({ comments: 1 })`
  - `onIssueUpdated` — calls `recordStatusMetrics(after.status)` on status change (augments existing weekly resolution record)
- Phase 2: Added client methods (`getDailyMetrics`, `listenToDailyMetrics`, `getCategoryBreakdown`, `getStatusDistribution`, `getImpactMetrics`) to `apps/web/src/services/analytics.service.ts` and 4 hooks (`useDailyMetrics`, `useCategoryBreakdown`, `useStatusDistribution`, `useImpactMetrics`) to `apps/web/src/hooks/data/useAnalytics.ts`
- Phase 3: Created `ImpactPage.tsx` with 7-day CSS bar chart, category breakdown, status distribution, and summary stats; added `/impact` route; replaced Alerts → Impact in `BottomNav.tsx` with `BarChart3` icon

### Blocked
- (none)

## Key Decisions
- New analytics docs use `daily_YYYY-MM-DD`, `category_{category}`, `status_{status}` as doc IDs with `scope` field — consistent with existing `recordAnalyticsEvent` signature
- The `recordDailyMetrics` wrapper maps date → `daily_{date}` docId, scope `"daily"`
- `recordCategoryMetrics`/`recordStatusMetrics` use `FieldValue.increment(1)` for count fields
- `getImpactMetrics` on client fetches last N daily docs in parallel via `Promise.all`, aggregates totals
- Category/status breakdown queries use `where('scope', '==', '...')` — Firestore index `scope+updatedAt↓` already exists
- Impact page uses CSS-only charts (no recharts) to keep bundle light for mobile users
- Phase 5 Gov dashboard gets recharts for richer filtering
- Phase 6 Gemini call uses text-only prompt (no media) — Gemini API key handling already exists in codebase

## Next Steps
1. **Phase 4**: Add mini activity chart to `ProfilePage.tsx`
2. **Phase 5**: Install recharts, upgrade `GovernmentDashboardPage.tsx` with recharts + time-range filter
3. **Phase 6**: Add `getIssueTrends()` to `issueService.ts`, create `predictInsights` callable, wire into ImpactPage

## Critical Context
- `analyticsService.ts` in functions: single `recordAnalyticsEvent(docId, scope, metrics)` that merges `metrics.*` fields using `FieldValue.increment`
- Client `firestore.service.ts` re-exports `collection`, `doc`, `getDoc`, `onSnapshot`, `query`, `where`, `setDoc`, `updateDoc`
- `useIssues` hook supports filters including `reporterId`, `status`, `category`, `severity`
- `getStatusMeta` from `@/lib/issue-meta` provides color/label per status
- `onVoteCreated` has `vote.type` — only call analytics on `'upvote'`
- `onIssueUpdated` already calls `recordAnalyticsEvent('weekly', 'issue_resolution', { resolvedIssues: 1 })` when status → `'resolved'` — kept as-is, augmented with `recordStatusMetrics`

## Relevant Files
- `apps/functions/src/services/analyticsService.ts`: updated with 3 wrappers + `dailyDocId` helper
- `apps/functions/src/triggers/onIssueCreated.ts`: wired daily + category + status analytics
- `apps/functions/src/triggers/onVoteCreated.ts`: wired daily verifications on upvote
- `apps/functions/src/triggers/onCommentCreated.ts`: wired daily comments
- `apps/functions/src/triggers/onIssueUpdated.ts`: wired status metrics on status change
- `apps/functions/src/services/issueService.ts`: add `getIssueTrends()` utility (Phase 6)
- `apps/functions/src/callables/index.ts`: export new `predictInsights` (Phase 6)
- `apps/functions/src/index.ts`: exports triggers + callables
- `apps/functions/src/services/geminiService.ts`: has `analyzeIssueMedia` with text fallback — model for Phase 6 callable
- `apps/functions/src/config.ts`: `GEMINI_MODEL`, `GEMINI_TIMEOUT_MS`, `GEMINI_MAX_RETRIES`
- `apps/web/src/services/analytics.service.ts`: updated with 5 new methods + 4 interfaces
- `apps/web/src/hooks/data/useAnalytics.ts`: updated with 4 new hooks
- `apps/web/src/features/impact/pages/ImpactPage.tsx`: created (Phase 3)
- `apps/web/src/routes.tsx`: added `/impact` route (Phase 3)
- `apps/web/src/components/layout/BottomNav.tsx`: replaced Alerts → Impact (Phase 3)
- `apps/web/src/features/profile/pages/ProfilePage.tsx`: add mini bar chart (Phase 4)
- `apps/web/src/features/gov/pages/GovernmentDashboardPage.tsx`: recharts upgrade (Phase 5)
- `apps/web/package.json`: add `recharts` dep (Phase 5)
