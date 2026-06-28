# Stack

## Runtime & Language

| Layer | Technology | Version |
|-------|-----------|---------|
| Language | TypeScript | ^6.0.3 (root), ~6.0.2 (web), ^5.0.0 (functions) |
| Runtime | Node.js | >=20 (root), 20 (functions) |
| Package Manager | npm | 10.9.0 |

## Frontend (apps/web)

| Category | Technology | Version |
|----------|-----------|---------|
| Framework | React | ^19.2.7 |
| Bundler | Vite | ^8.1.0 |
| Routing | React Router DOM | ^7.18.0 |
| State/Data | TanStack React Query | ^5.101.1 |
| Styling | Tailwind CSS | ^4.3.1 |
| UI Components | Radix UI (multiple) | ^1.x - ^2.x |
| Animation | Framer Motion | ^11.18.2 |
| Maps | Leaflet + React Leaflet | ^1.9.4 / ^5.0.0 |
| Toast | Sonner | ^1.7.4 |
| Icons | Lucide React | ^0.460.0 |
| Theme | next-themes | ^0.4.6 |
| Linting | Oxlint | ^1.69.0 |

## Backend (apps/functions)

| Category | Technology | Version |
|----------|-----------|---------|
| Platform | Firebase Cloud Functions | ^4.6.0 |
| Admin SDK | firebase-admin | ^12.0.0 |
| Runtime | Node.js 20 | - |

## Shared (packages/shared)

| Category | Technology | Version |
|----------|-----------|---------|
| Validation | Zod | ^3.24.1 |
| AI SDK | @google/genai | ^2.10.0 |
| Build | TypeScript | ^5.7.2 |
| Testing | Vitest | ^4.1.9 |

## Infrastructure

| Category | Technology |
|----------|-----------|
| Database | Cloud Firestore |
| Auth | Firebase Authentication |
| Storage | Firebase Storage |
| Hosting | Firebase Hosting |
| Monorepo | Turborepo ^2.3.3 |
| CI/CD | GitHub Actions (detected in .github/) |

> **NOTE**: This doc covers the technology stack. For complete project context including all implemented features and architecture, see `AGENTS.md` at the project root — the single source of truth.

## Evidence

- `package.json` (root) — workspaces, devDependencies, engines
- `apps/web/package.json` — frontend dependencies
- `apps/functions/package.json` — backend dependencies
- `packages/shared/package.json` — shared package dependencies
- `vite.config.ts` — Vite configuration
- `turbo.json` — Turborepo task config
- `firebase.json` — Firebase services config
