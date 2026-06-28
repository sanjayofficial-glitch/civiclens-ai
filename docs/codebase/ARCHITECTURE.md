# Architecture

## High-Level Overview

CivicLens is a civic issue reporting platform where citizens report urban problems (potholes, streetlights, water leaks, etc.), AI analyzes reports, and government officials track resolution.

```
┌─────────────────────────────────────────────────────────────┐
│                        Firebase                              │
├─────────────┬─────────────┬─────────────┬──────────────────┤
│  Firestore  │    Auth     │   Storage   │  Cloud Functions │
│  (Database) │ (Users)     │  (Media)    │  (Backend)       │
└──────┬──────┴──────┬──────┴──────┬──────┴────────┬─────────┘
       │             │             │               │
       └─────────────┴─────────────┴───────────────┘
                             │
                    ┌────────┴────────┐
                    │   Web App (SPA) │
                    │  React + Vite   │
                    └─────────────────┘
```

## Architectural Pattern

**Feature-Based Module Architecture** with a shared domain layer:

- **Presentation Layer**: React components organized by feature (auth, home, map, report, issues, leaderboard, notifications, profile, gov)
- **Service Layer**: Firebase service classes (`services/*.service.ts`) wrapping Firestore operations
- **Domain Layer**: Shared Zod schemas and TypeScript types in `packages/shared`
- **Backend Layer**: Firebase Cloud Functions for server-side logic (triggers, callables)

## Data Flow

### Issue Reporting Flow
```
User → ReportWizardPage → IssueService.create() → Firestore
                                                    ↓
                                           onIssueCreated trigger
                                                     ↓
                                           AI Analysis (Gemini 1.5 Flash)
                                                     ↓
                                           Duplicate detection + reputation + notification
                                                     ↓
                                           Issue enriched with analysis
```

### Authentication Flow
```
User → LoginPage → AuthService → Firebase Auth → useAuth hook → ProtectedRoute
```

### Real-time Updates
```
Firestore → onSnapshot() → Service callback → React state → UI
```

## Key Patterns

### 1. Lazy Loading
All page components use `React.lazy()` with `Suspense` for code splitting:
```tsx
const HomePage = lazy(() => import('@/features/home/pages/HomePage'));
```

### 2. Provider Composition
Global providers are composed in order: Theme → Query → Toaster → App

### 3. Service Pattern
Services are plain objects with async methods:
```typescript
export const IssueService = {
  create: async (data) => { ... },
  getById: async (id) => { ... },
  update: async (id, data) => { ... },
};
```

### 4. Schema-First Types
Zod schemas in `packages/shared` are the source of truth. TypeScript types are derived:
```typescript
export const issueSchema = z.object({ ... });
export type Issue = z.infer<typeof issueSchema>;
```

### 5. Protected Routes
Route protection uses a `ProtectedRoute` component with role-based access:
```tsx
<ProtectedRoute allowedRoles={['official', 'moderator']} />
```

## Firestore Collections

| Collection | Purpose | Key Indexes |
|------------|---------|-------------|
| `issues` | Reported civic issues | status+createdAt, category+createdAt, geohash+status |
| `users` | User profiles | - |
| `votes` | Issue verification votes | issueId+userId |
| `leaderboard` | User scores | period+score |
| `notifications` | User notifications | - |

> **NOTE**: This doc covers the high-level architecture. For comprehensive details including all implemented features, Cloud Functions, schemas, and conventions, see `AGENTS.md` at the project root — the single source of truth.

## Evidence

- `apps/web/src/routes.tsx` — routing architecture
- `apps/web/src/providers/app-providers.tsx` — provider composition
- `apps/web/src/services/*.service.ts` — service layer pattern
- `packages/shared/src/schemas/*.ts` — schema-first approach
- `firestore.indexes.json` — database indexes
- `firestore.rules` — security rules
