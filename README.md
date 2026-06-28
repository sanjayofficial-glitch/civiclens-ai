# BlockSeBlock

**AI-powered civic issue reporting platform.**

Citizens report urban problems (potholes, streetlights, water leaks, garbage, graffiti, etc.) by taking a photo. Google Gemini AI analyzes the image to auto-classify category, severity, and suggest a description. Government officials get a dashboard to track resolution.

Built for **Civic Tech Hackathon**.

---

## Tech Stack

| Layer | Stack |
|-------|-------|
| Frontend | React 19, Vite 8, Tailwind CSS 4, TanStack Query 5 |
| Backend | Firebase Cloud Functions v2 (Node.js) |
| AI | Google Gemini 1.5 Flash |
| Database | Firestore (NoSQL) |
| Auth | Firebase Auth (Google, Email, Anonymous) |
| Storage | Firebase Cloud Storage |
| Map | Leaflet + React Leaflet |
| Infra | Turborepo, Firebase Hosting |

---

## Prerequisites

- Node.js >= 20
- npm 10+
- Firebase CLI: `npm install -g firebase-tools`

## Setup

```bash
git clone <repo-url>
cd blockseblock
npm install
```

### Environment Variables

Copy `.env.local.example` (if present) to `.env.local` and fill in the 6 required `VITE_FIREBASE_*` keys. The app validates these at startup.

For Cloud Functions, set the remaining vars in Firebase:

```bash
firebase functions:config:set gemini.api_key="..."
```

## Development

```bash
npm run dev
```

Starts all packages in parallel (web + functions + shared).

## Build

```bash
npm run build
```

## Run Tests

```bash
npm run test --workspace=@blockseblock/functions
```

21 tests across 4 test files (vitest).

## Lint

```bash
npm run lint
```

---

## Architecture

```
Firebase (Firestore + Auth + Storage + Cloud Functions + Hosting)
     │
     └── Web App (React SPA)
              │
              └── Shared (@blockseblock/shared — Zod schemas + Types)
```

### Key Features

- **Report Issue** — 6-step wizard: Capture → Location → AI Analysis → Edit → Preview → Success
- **AI Analysis** — Gemini classifies category/severity with fallback keyword matching
- **Interactive Map** — Leaflet with marker clustering, status filters, heatmap toggle
- **Community Voting** — Transactional upvote/downvote with toggle/switch/unvote
- **Leaderboard** — Weekly/Monthly/All-time with gamification badges
- **Government Dashboard** — Issue queue, assign officials, analytics, export
- **Duplicate Detection** — Token similarity + geohash proximity scoring
- **Notifications** — Real-time feed with type-based icons

---

## Project Structure

```
blockseblock/
├── apps/
│   ├── web/             # React SPA (19 routes)
│   └── functions/       # Cloud Functions (5 triggers + 5 callables)
├── packages/
│   └── shared/          # Zod schemas, types, constants
├── docs/codebase/       # Architecture docs
├── firebase.json
├── firestore.rules
├── storage.rules
└── turbo.json
```
