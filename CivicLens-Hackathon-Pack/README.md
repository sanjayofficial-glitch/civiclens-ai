# CivicLens — Hackathon Edition · Complete Design Package

> **Brand:** CivicLens — AI-Powered Civic Issue Reporting
> **Tagline:** *"See. Report. Improve."*
> **Mode:** Light Mode Primary
> **Signature Element:** iOS-style Dynamic Island bottom nav with 5 contextual states

---

## 📦 What's in this package

A complete design-to-ship pipeline for winning hackathons. 6 files, 5 deliverables, 29 generation-ready screen prompts, plus production-ready React code.

| # | File | Contents |
|---|------|----------|
| 00 | `00-CivicLens-Design-System-Light.md` | **Design system foundation** — colors, typography, spacing, glassmorphism, the Dynamic Island spec, animation language, accessibility |
| 01 | `01-Screens-01-07-Onboarding-to-Search.md` | **Screens 1–7 prompts** — Splash → Onboarding → Permissions → Login → Signup → Home → Search |
| 02 | `02-Screens-08-14-Camera-to-Timeline.md` | **Screens 8–14 prompts** — AI Camera → Live Detection → Analysis Loading → AI Result → Report Details → Success → Timeline |
| 03 | `03-Screens-15-21-Map-to-Support.md` | **Screens 15–21 prompts** — Map → Notifications → Profile → My Reports → Leaderboard → Settings → Help |
| 04 | `04-Screens-22-29-System-and-Dynamic-Island.md` | **Screens 22–29 prompts** — About → Offline → Error → Loading → Empty → Dynamic Island × 3 states |
| 05 | `05-Dynamic-Island-Implementation.md` | **Production code** — full React + Tailwind + Framer Motion Dynamic Island component, Tailwind config, animations, Live Activity Swift snippet |

---

## 🎯 Quick start

### For a hackathon pitch deck / Figma hero shots:
1. Open `04-Screens-22-29-System-and-Dynamic-Island.md` and generate Screens **27, 28, 29** first — the Dynamic Island variants. These are your wow-factor.
2. Then generate **Screen 6 (Home Dashboard)** — it shows the island in context.
3. Then generate the **AI Camera (8)**, **AI Detection (9)**, **Success (13)**, **Interactive Map (15)**, and **Profile (17)** — your visual punch lineup.
4. Drop the 8–10 best renders into your deck.

### For a working prototype (React Native / web):
1. Copy `05-Dynamic-Island-Implementation.md` — it's drop-in code.
2. Add the design tokens from `00` into your Tailwind config.
3. The Dynamic Island is the centerpiece — once that works, build out screens using the system tokens.

### For Figma hand-off:
1. Build the foundation in Figma using the tokens from `00`.
2. Use the screen prompts in `01–04` as visual references.
3. The Dynamic Island component should be an auto-layout with variants for each state.

---

## 🎨 Design language highlights

### The Signature Dynamic Island
- **Deep navy** (`#0B1220` at 94% opacity) with backdrop blur — feels premium like iOS
- **Centered elevated capture button** protrudes 8px above the pill with ambient gradient halo
- **5 contextual states**: Idle · AI Scanning · Live Activity · Capture · Offline
- Smooth morph via Framer Motion `layout` + spring physics (stiffness: 380, damping: 32)

### AI Glass aesthetic
- **Light mode pearl-white** (`#F7F8FB`) background — fresh, modern, daylight
- **Frosted glass cards** with 60-80px backdrop blur, 1px subtle borders
- **AI Gradient** (`#3B82F6 → #6366F1 → #8B5CF6`) is the only saturated color — used sparingly as action emphasis
- **Soft shadows** with top inner highlight — iOS-native optical glass feel

### Typography
- **SF Pro Display / Inter** for everything
- **Display 40px** for splash/empty, **H1 32px** for screen titles
- Tight letter-spacing (`-0.02em`) on large text
- **Monospace** for report IDs (`#CL2024-000128`)

### Motion
- iOS-easing curve `[0.22, 1, 0.36, 1]`
- Spring physics for the island (380/32/0.9)
- Stagger reveals: 0.06s between siblings
- All animations respect `prefers-reduced-motion`

---

## 🏆 Hackathon-winning playbook

| Asset | Why judges love it |
|-------|-------------------|
| **Dynamic Island nav** | The kind of detail 95% of civic-tech apps never attempt. Shows polish and iOS fluency. |
| **Light mode glass** | Most "AI" apps ship dark-only. Light mode shows range. |
| **AI confidence visualization** (Screen 9) | Bounding box + percentage + similar-issue count = trust + transparency. |
| **Civic impact stats** (Screen 17) | 1,280 Impact Score · 24 Reports · 18 Resolved → judges feel the social value. |
| **Offline-first** (Screen 23) | Shows engineering maturity — not just a UI mockup. |
| **Live Activity integration** | iOS Live Activity + Dynamic Island is the new gold standard. |
| **Accessibility** | Reduced motion, WCAG AA contrast, dynamic type — judges notice. |

---

## 🛠 Technical stack recommended

```
- React 19 + Next.js 15 (App Router)
- TypeScript
- Tailwind CSS v4
- Framer Motion v11
- Lucide React (icons)
- Mapbox GL JS (for the Interactive Map)
- React Native (if shipping mobile)
- Swift WidgetKit (for iOS Live Activity)
```

---

## 📋 Screen coverage map

```
Splash ──► Onboarding ──► Permissions ──► Login/Signup ──► Home Dashboard
                                                                     │
                                                                     ▼
                                              ┌── Search ◄── Dynamic Island ──► Map
                                              │            (signature)
                                              ▼
                                         AI Camera ──► Live Detection ──► AI Loading
                                                                     │
                                                                     ▼
                              AI Result ──► Report Details ──► Success ──► Timeline
                                             │
                                             ▼
                                        Notifications · Profile · My Reports
                                             │
                                             ▼
                              Leaderboard · Settings · Help · About
                                             │
                                             ▼
                              Offline · Error · Loading · Empty · About
```

---

## 🎁 Bonus content included

- 3 Dynamic Island morph states (Screens 27, 28, 29) — generated separately for hero shots
- iOS Live Activity Swift snippet — bridge to native lock-screen experience
- Tailwind config with full token system — drop-in styling
- Complete Framer Motion variants — consistent motion language
- Haptic feedback helper — iOS-native feel
- Safe-area handling — modern iPhone support

---

## 📞 About CivicLens (story)

**The problem:** Citizens see issues — potholes, broken streetlights, overflowing drains — but reporting them is friction-heavy. Calls, wrong departments, no follow-up.

**The solution:** CivicLens turns the phone into an intelligent reporting tool. Point the camera at any issue, AI detects and classifies it in <2 seconds, auto-routes to the right department, and gives the citizen a tracking timeline.

**Why this wins hackathons:**
1. **Real social impact** — clear civic value, not a toy demo
2. **AI that's tangible** — the user sees the AI work in real-time, not hidden in a backend
3. **Engineering polish** — Dynamic Island, glass UI, accessibility, offline mode
4. **Scalable story** — works in any city, integrates with any 311 system
5. **Demo-able** — judges can hold the phone, scan a pothole, see the magic

---

## 🚀 Next steps

1. **Generate hero screens** — pick your 6–8 best and render them at high resolution
2. **Build the prototype** — drop in the Dynamic Island code, iterate
3. **Record the demo video** — show: launch → scan → AI detect → submit → timeline
4. **Polish the deck** — 3 problems, 3 solutions, 3 wins, 1 ask
5. **Ship it** 🏆

---

*Built with the AI Glass OS design language. Designed to win.*

**— CivicLens Team**
