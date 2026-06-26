# Structure

## Root Layout

```
blockseblock/
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
├── App.tsx               # Default Vite template (not used)
├── routes.tsx            # React Router configuration
├── index.css             # Global styles
├── App.css               # App styles
├── assets/               # Static assets
├── components/           # Reusable components
│   ├── layout/           # Layout components (ProtectedRoute, PageLoader)
│   ├── shared/           # Shared components
│   └── ui/               # UI primitives (shadcn-style)
├── features/             # Feature modules
│   ├── auth/             # Authentication (Splash, Login, Signup, Onboarding)
│   ├── home/             # Home page
│   ├── map/              # Map view
│   ├── report/           # Issue reporting wizard
│   ├── issues/           # Issue details
│   ├── leaderboard/      # Leaderboard
│   ├── notifications/    # Notifications
│   ├── profile/          # User profile & settings
│   └── gov/              # Government dashboard
├── hooks/                # Custom hooks (useAuth)
├── lib/                  # Utilities & Firebase config
│   ├── firebase/         # Firebase initialization
│   ├── utils.ts          # General utilities
│   └── issue-meta.ts     # Issue metadata helpers
├── providers/            # React context providers
│   ├── app-providers.tsx # Root provider composition
│   ├── query-provider.tsx # React Query provider
│   └── theme-provider.tsx # Theme provider
├── services/             # Firebase service layer
│   ├── auth.service.ts   # Authentication
│   ├── issue.service.ts  # Issue CRUD
│   ├── user.service.ts   # User operations
│   ├── upload.service.ts # File uploads
│   ├── geolocation.service.ts # Location services
│   ├── permissions.service.ts # Permission checks
│   └── logger.service.ts # Logging
└── data/                 # Static data
```

## apps/functions/src/

```
src/
├── index.ts              # Functions entry (exports triggers & callables)
├── callables/            # HTTPS callable functions
│   └── updateLeaderboard.ts
├── triggers/             # Firestore triggers
│   └── onIssueCreated.ts
├── services/             # Backend services
└── webhooks/             # Webhook handlers
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
