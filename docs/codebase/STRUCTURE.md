# Structure

## Root Layout

```
CivicLens/
├── apps/
│   ├── web/              # React SPA (Vite)
│   └── functions/        # Firebase Cloud Functions
├── packages/
│   └── shared/           # Shared types, schemas, constants
├── docs/                 # Documentation
├── .github/              # CI/CD workflows
├── firebase.json         # Firebase config
├── firestore.rules       # Firestore security rules
├── firestore.indexes.json # Firestore indexes
├── storage.rules         # Firebase Storage rules
├── turbo.json            # Turborepo config
├── tsconfig.base.json    # Base TypeScript config
└── package.json          # Root workspace config
```

## apps/web/src/

```
src/
├── main.tsx              # Entry point
├── routes.tsx            # React Router configuration (19 routes)
├── index.css             # Global styles (Tailwind v4)
├── components/           # Reusable components
│   ├── layout/           # Layout components (ProtectedRoute, PageLoader)
│   ├── shared/           # Shared components (IssueCard, StatCard)
│   └── ui/               # 32 UI primitives (shadcn-style, Radix-based)
├── features/             # Feature modules
│   ├── auth/             # Authentication (Splash, Login, Signup, Onboarding)
│   ├── home/             # Home page
│   ├── map/              # Map view (Leaflet + clustering)
│   ├── report/           # Issue reporting wizard (6-step)
│   ├── issues/           # Issue details + voting + comments
│   ├── leaderboard/      # Leaderboard
│   ├── notifications/    # Notifications
│   ├── profile/          # User profile & settings
│   └── gov/              # Government dashboard
├── hooks/                # Custom hooks
│   ├── useAuth.tsx       # Auth context provider
│   ├── usePullToRefresh.ts # Mobile gesture handler
│   └── data/             # React Query hooks (useIssue, useIssues, useComments, etc.)
├── lib/                  # Utilities & Firebase config
│   ├── firebase/         # Firebase init (config, auth, firestore, storage)
│   ├── constants.ts      # Filter options, badges, formatRelativeTime
│   ├── utils.ts          # cn() — Tailwind class merge
│   └── issue-meta.ts     # Issue metadata helpers
├── providers/            # React context providers
│   ├── app-providers.tsx # Theme → Query → Auth → Routes → Toaster
│   ├── query-provider.tsx # TanStack QueryClientProvider
│   └── theme-provider.tsx # next-themes (light/dark/system)
├── services/             # Firebase service layer (15 modules)
│   ├── auth.service.ts   # Authentication
│   ├── issue.service.ts  # Issue CRUD + listeners + smart fallback
│   ├── vote.service.ts   # Transactional voting (toggle/switch/unvote)
│   ├── comment.service.ts # Comment CRUD + listeners
│   ├── user.service.ts   # User operations
│   ├── notification.service.ts # Notification listeners
│   ├── leaderboard.service.ts  # Leaderboard queries
│   ├── badge.service.ts  # Badge fetching
│   ├── upload.service.ts # File uploads
│   ├── geolocation.service.ts  # Location services
│   ├── permissions.service.ts  # Permission checks
│   ├── ai.service.ts     # Gemini analysis callable wrapper
│   ├── analytics.service.ts    # Event tracking
│   ├── logger.service.ts # Console wrapper
│   └── converters.ts     # Firestore converters
```

## apps/functions/src/

```
src/
├── index.ts              # Functions entry (exports triggers & callables)
├── config.ts             # Environment: region, Gemini config, reputation defaults
├── types.ts              # Backend-specific types
├── callables/            # 5 HTTPS callable functions
│   ├── index.ts          # Barrel re-export
│   ├── analyzeIssueImage.ts
│   ├── submitVote.ts
│   ├── addComment.ts
│   ├── syncAuthProfile.ts
│   └── updateLeaderboard.ts
├── triggers/             # 5 Firestore/Auth trigger functions
│   ├── index.ts          # Barrel re-export
│   ├── onAuthUserCreated.ts
│   ├── onIssueCreated.ts
│   ├── onIssueUpdated.ts
│   ├── onVoteCreated.ts
│   └── onCommentCreated.ts
├── services/             # 10 backend service classes
│   ├── issueService.ts
│   ├── geminiService.ts
│   ├── duplicateDetectionService.ts
│   ├── verificationService.ts
│   ├── notificationService.ts
│   ├── reputationService.ts
│   ├── leaderboardService.ts
│   ├── analyticsService.ts
│   ├── storageService.ts
│   └── authService.ts
├── repositories/         # 8 data access classes (BaseRepository pattern)
│   ├── baseRepository.ts
│   ├── issueRepository.ts
│   ├── userRepository.ts
│   ├── voteRepository.ts
│   ├── commentRepository.ts
│   ├── notificationRepository.ts
│   ├── leaderboardRepository.ts
│   └── analyticsRepository.ts
├── lib/                  # Firebase admin init, error helpers, validation, logger
└── __tests__/            # 45 vitest tests across 8 files
```

## packages/shared/src/

```
src/
├── index.ts              # Package exports
├── constants/            # App constants
│   └── index.ts
├── schemas/              # Zod schemas (source of truth)
│   ├── index.ts
│   ├── common.ts         # Shared schemas (timestamps, geopoints)
│   ├── enums.ts          # All enums (UserRole, IssueStatus, etc.)
│   ├── user.ts           # User schema
│   ├── issue.ts          # Issue schema
│   ├── vote.ts           # Vote schema
│   ├── comment.ts        # Comment schema
│   ├── notification.ts   # Notification schema
│   └── leaderboard.ts    # Leaderboard schema
└── types/                # TypeScript types
    ├── index.ts
    ├── api.ts            # API response types
    ├── domain.ts         # Domain interfaces
    └── models.ts         # Model types
```

## Entry Points

| App | Entry | Purpose |
|-----|-------|---------|
| web | `apps/web/src/main.tsx` | React app bootstrap |
| functions | `apps/functions/src/index.ts` | Cloud Functions exports |
| shared | `packages/shared/src/index.ts` | Package barrel export |

## Evidence

- Directory listings of `apps/`, `packages/`, `apps/web/src/`, `apps/functions/src/`, `packages/shared/src/`
- `apps/web/src/routes.tsx` — all feature page imports
- `apps/web/src/main.tsx` — app bootstrap
- `apps/functions/src/index.ts` — functions exports
