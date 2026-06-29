# Google AI Studio & Antigravity: Design & Reference Guide

This document identifies and details how **Google AI Studio** and **Google Antigravity (Agentic AI)** were used as core references and development drivers to build the CivicLens platform.

---

## 1. How Google AI Studio Was Used for Referencing

Before writing any backend code, **Google AI Studio** was utilized as our primary environment to prototype, test, and refine the AI-powered features. 

### A. Prompt Prototyping & System Instructions
*   **The Goal:** We needed a way to extract structured data (category, severity, title, description, tags) from a single user-uploaded image.
*   **AI Studio Usage:** We uploaded various civic issue images (potholes, graffiti, broken streetlights) to AI Studio and experimented with **System Instructions** using **Gemini 1.5 Flash**.
*   **Output:** We tuned the prompt until the model consistently understood the difference between a "Low" severity issue (e.g., minor graffiti) and a "Critical" severity issue (e.g., a blocked road or active water leak).

### B. Structured JSON Schema Validation
*   **The Goal:** The React frontend and Firestore database require a strict, predictable data structure.
*   **AI Studio Usage:** We used the **Structured Output** feature in AI Studio, setting the response type to `application/json` and defining the JSON schema.
*   **Output:** This ensured that the Gemini API would always return keys like `category`, `severity`, `suggestedTitle`, and `suggestedDescription` in the exact format our Zod schemas (`packages/shared/src/schemas`) expected.

### C. Graceful Fallback Prototyping
*   **The Goal:** Design a system that remains 100% functional even if the user has no network connection or an invalid API key.
*   **AI Studio Usage:** We analyzed the typical response patterns of the model to build a local **Heuristic Backup Engine** (using text-pattern matching and keyword weighting) that mimics the AI's classification logic when offline.

---

## 2. How Google Antigravity Helped Build the Design

**Google Antigravity** acted as our autonomous pair-programmer, accelerating frontend design, implementing animations, and ensuring architectural alignment:

### A. Contextual UI/UX Design (Framer Motion)
Antigravity designed and implemented the visual Polish that makes the app feel premium:
*   **Interactive AI Scanner:** Designed a custom CSS keyframe animation (`@keyframes scan`) that places a glowing primary-colored laser line and green gradient sweep over the photo during the 2-5 second Gemini analysis.
*   **Tactile Micro-interactions:** Added spring-loaded hover animations to the feed cards (vertical cards lift up, horizontal cards slide right) and button-press scaling (`scale: 0.95`) to the upvote/downvote buttons.
*   **Progressive Form Validation:** Added validation steps to the 6-step reporting wizard to prevent users from skipping required steps (like photo capture and map location).

### B. Monorepo & Type Safety Management
*   **Turborepo Scaffolding:** Antigravity managed the orchestration between the React 19 Vite client, the Firebase Cloud Functions v2 backend, and the shared Zod package.
*   **Strict Type-Checking:** Resolved complex React 19 `useRef` and hook compilation warnings on Windows, achieving a **100% clean build** (`npm run build`) and **100% passing test suite** (45/45 tests).
*   **Database Rule Integration:** Verified that the frontend status updates matched the security permissions defined in `firestore.rules`.
