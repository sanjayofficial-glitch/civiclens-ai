# CivicLens AI

<div align="center">
  <img src="docs/placeholder-logo.png" alt="CivicLens Logo" width="200" height="200" />
  <h3>AI-Powered Civic Issue Reporting & Management Platform</h3>
  <p>Empowering citizens and local governments to collaborate on urban improvements through artificial intelligence and real-time data.</p>
</div>

---

## 📖 Project Overview

**CivicLens AI** is a fully-implemented civic tech platform designed to bridge the gap between community members and local government officials. It streamlines the reporting, verification, and resolution of urban issues like potholes, broken streetlights, and graffiti, fostering transparency and active citizen engagement.

## ⚠️ Problem Statement

Urban infrastructure problems often go unreported due to complex bureaucratic processes, lack of transparency, and poor feedback loops for citizens. Even when reported, governments struggle to triage, categorize, and prioritize issues effectively without significant manual overhead.

## 💡 Solution

CivicLens AI solves this by introducing a seamless, AI-assisted reporting flow. Citizens can report an issue simply by taking a photo. Our integrated AI automatically analyzes the image, identifies the problem, estimates the severity, and suggests actionable descriptions. 

For government officials, CivicLens provides a comprehensive dashboard to track, assign, and resolve issues efficiently, complete with analytics and mapping tools.

## ✨ Features

- **Intuitive Issue Reporting:** A 6-step reporting wizard with geolocation and image upload.
- **Community Voting & Verification:** Democratic upvote/downvote system with reputation adjustments.
- **Interactive Map:** Real-time leaflet map with marker clustering and status filtering.
- **Leaderboard & Gamification:** Weekly, monthly, and all-time leaderboards rewarding active citizens with badges.
- **Government Dashboard:** Advanced triage queue, analytical charts, and status management for officials.
- **Real-Time Notifications:** Live updates on issue statuses, new comments, and earned badges.

## 🤖 AI Capabilities

CivicLens leverages **Google Gemini 1.5 Flash** for high-speed, accurate image and text analysis:
- **Auto-Categorization:** Determines if an issue is a pothole, electrical hazard, vandalism, etc.
- **Severity Assessment:** Evaluates the danger level (Low, Medium, High, Critical).
- **Smart Suggestions:** Auto-generates concise titles, descriptions, and searchable tags based on visual evidence.
- **Duplicate Detection:** Intelligent fallback to prevent multiple reports of the same incident in close proximity.

## 🛠 Technology Stack

**Frontend:**
- React 19 (Vite 8)
- Tailwind CSS 4 + Radix UI
- TanStack Query (React Query)
- Framer Motion
- Leaflet Maps

**Backend & Infrastructure:**
- Firebase Cloud Functions v2 (Node.js)
- Firebase Firestore (NoSQL Database)
- Firebase Authentication & Storage
- Google Gemini API
- Turborepo (Monorepo Architecture)

## 🏗 Architecture Overview

The project is structured as a feature-based monorepo managed by Turborepo:
```
Firebase (Firestore + Auth + Storage + Cloud Functions + Hosting)
     │
     └── Web App (React 19 SPA)
              │
              └── Shared Layer (@CivicLens/shared — Zod Schemas + Types)
```
- **Schema-First Design:** Zod schemas in the shared package act as the single source of truth.
- **Robust Security:** Granular Firestore and Storage security rules based on role-based access control (RBAC).

## 📸 Screenshots

| Home Dashboard | Issue Map | Government Dashboard |
|:---:|:---:|:---:|
| <img src="docs/placeholder-home.png" width="250" /> | <img src="docs/placeholder-map.png" width="250" /> | <img src="docs/placeholder-gov.png" width="250" /> |

*(Note: Replace placeholders with actual application screenshots before submission).*

## 🚀 Installation & Setup

### Prerequisites
- [Node.js](https://nodejs.org/) >= 20
- npm >= 10
- [Firebase CLI](https://firebase.google.com/docs/cli): `npm install -g firebase-tools`

### 1. Clone the Repository
```bash
git clone https://github.com/sanjayasahu/civiclens-ai.git
cd civiclens-ai
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Variables

Copy `.env.example` to `.env.local` in the root:
```bash
cp .env.example .env.local
```
Fill in your Firebase project configuration and Gemini API Key:
```env
VITE_FIREBASE_API_KEY="your_api_key"
VITE_FIREBASE_AUTH_DOMAIN="your_project_id.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="your_project_id"
VITE_FIREBASE_STORAGE_BUCKET="your_project_id.firebasestorage.app"
VITE_FIREBASE_MESSAGING_SENDER_ID="your_sender_id"
VITE_FIREBASE_APP_ID="your_app_id"
VITE_GEMINI_API_KEY="your_gemini_api_key"
```

For the Cloud Functions environment, set the secrets using the Firebase CLI:
```bash
firebase functions:config:set gemini.api_key="your_gemini_api_key"
```

## 💻 Running Locally

To start the development server across all packages:
```bash
npm run dev
```
The web application will be available at `http://localhost:5173`.

## ☁️ Deployment

Build the project for production:
```bash
npm run build
```

Deploy to Firebase (Hosting, Functions, Firestore Rules, and Storage Rules):
```bash
firebase deploy
```

## 🗺 Future Roadmap

- **Offline Mode:** Implement full offline reporting capabilities using service workers.
- **Predictive Analytics:** Use historical data to predict infrastructure failures before they happen.
- **Multi-Language Support:** Expand accessibility for diverse urban populations.

## 👥 Team Information

- **[Your Name]** - Principal DevOps Engineer & Senior Software Engineer

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
