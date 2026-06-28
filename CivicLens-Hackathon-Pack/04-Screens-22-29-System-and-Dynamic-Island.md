# CivicLens — Screen Prompts Batch 4 (Screens 22–29)
## About · Offline Mode · Error · Loading · Empty State · Dynamic Island States (3 variants)

> **Tool targets:** Midjourney v6 / DALL-E 3 / Ideogram 2.0 / Flux Pro 1.1
> **Aspect Ratio:** 9:16 (mobile portrait)
> **Style Anchor:** Apple HIG × Stripe × Linear × Arc Browser × iOS 17

---

## Global Style Suffix (append to every prompt)

```
Style suffix: "ultra-clean UI design, soft pearl-white background (#F7F8FB), 
frosted glass cards, subtle blue-to-violet AI gradient (#3B82F6 → #6366F1 → #8B5CF6), 
thin 1px borders, soft drop shadows, SF Pro typography, no realistic photos, 
no skeuomorphism, premium app store screenshot quality, 4K, sharp, 
--ar 9:16 --s 750 --v 6.1"
```

For Ideogram / DALL-E, drop the `--` flags and append: *"aspect ratio 9:16, photorealistic UI mockup, 4K."*

---

# SCREEN 22 · About

**Purpose:** Brand storytelling, version info, links.

```
Mobile app about screen, vertical 9:16. Soft pearl-white background 
with a subtle gradient halo at top-center (blue→violet, 8% opacity). 
Centered top half: 80px CivicLens logo (the geometric "C" mark) with 
a faint gradient stroke and gentle pulse halo. Below logo: "CivicLens" 
wordmark in 28px bold with subtle gradient text. Below: "Version 2.1.0" 
in 12px medium grey. Below: a frosted glass mission card (300px wide, 
rounded 24px, white 88%, padding 24px) containing centered italic 
Body Small text: "Built with AI for smarter cities. Our mission is 
to empower citizens with intelligent tools to make their neighborhoods 
better." Below: a vertical list of 3 glass link rows (52px tall, 
rounded 16px) — "Privacy Policy" with shield icon, "Terms of Service" 
with file-text icon, "Open Source Licenses" with code icon, each with 
chevron-right. At the very bottom: tiny centered caption "Made with 
[heart icon] for better cities" in 12px grey. Bottom: Dynamic Island 
with Profile icon. Status bar 9:41. Style suffix.
```

---

# SCREEN 23 · Offline Mode

**Purpose:** Graceful degradation, clear status.

```
Mobile app offline mode screen, vertical 9:16. Soft pearl-white 
background. At the very top (below status bar): a sticky amber-tinted 
glass banner (full-width, rounded 16px, amber at 10% background with 
amber left border 4px, padding 16px) containing a wifi-off icon in 
amber + bold "Offline Mode" in 16px + caption "Changes will sync when 
you're back online" in 13px grey. Below: "Queued for Sync" section 
label. Then a vertical list of 3 glass cards (rounded 20px, white 
88%, 1px border) showing pending items: card 1 has a small pending-
dot in amber + "Pothole on MG Road" + a thin amber progress bar (40% 
filled, "Queued" caption), card 2 similar with "Broken Streetlight" 
+ cyan progress bar 100% "Saved locally", card 3 with "Garbage 
Overflow" + amber progress 0% "Draft". Below: a full-width glass 
button (56px tall, rounded full, white with amber-tinted border 1px, 
amber text) "+ Create Offline Report" with plus icon, indicating 
limited-functionality mode. Bottom: Dynamic Island with a special 
"offline" state — the pill is slightly wider and shows a tiny wifi-
off icon + "Offline · 2 queued" instead of the regular nav icons, 
indicating limited functionality. Status bar 9:41 with wifi-off icon. 
Style suffix.
```

---

# SCREEN 24 · Error State

**Purpose:** Recoverable failure with premium polish.

```
Mobile app error state screen, vertical 9:16. Soft pearl-white 
background with a very subtle rose-tinted ambient glow behind the 
center orb (rose #F43F5E at 6% opacity). Centered top: a 120px glass 
circle with rose-tinted background (rose at 12% opacity), 2px rose 
border at 30% opacity, containing a large alert-triangle icon in 
rose (#F43F5E) at 48px. The orb has a very subtle shake animation 
frozen (slightly tilted). Below: large headline "Something went 
wrong" in 26px bold (#0B1220). Below: body text in 16px medium grey 
"We couldn't load your reports. Please try again." Below: a small 
monospace error code "ERR_503" in 12px tertiary grey. Below: a 
vertical stack of 2 buttons — primary is a full-width 56px rose-
gradient pill button "Try Again" with refresh icon in white, secondary 
is a glass button "Go Back" with chevron-left icon. Tertiary tiny 
text link "Contact Support" in gradient text centered below. Bottom: 
Dynamic Island visible (regular state). Status bar 9:41. Style suffix.
```

---

# SCREEN 25 · Loading State (Skeleton)

**Purpose:** Premium perceived performance.

```
Mobile app loading skeleton screen, vertical 9:16. Soft pearl-white 
background. Floating glass header at top (placeholder grey rounded 
rectangles instead of text — 60% width for title, 32px for right 
icon, both with subtle shimmer animation — a faint white highlight 
sliding left-to-right across them continuously). Below: a hero card 
placeholder (full-width minus 32px, 180px tall, rounded 32px, white 
88% with shimmer overlay — empty inside, just glass with shimmer). 
Below: section header placeholder rectangles. Then 3 stacked skeleton 
cards (110px tall, rounded 20px, white 88% with shimmer) — each 
containing 2 grey rounded rectangles inside (one wider for title, 
one narrower for caption) and a smaller circle on the right (avatar 
placeholder). All skeleton blocks have a subtle shimmer — a soft 
white-to-transparent gradient sweeping left-to-right across them, 
indicating loading. Bottom: Dynamic Island still visible but the 
center button has a small spinner inside instead of camera icon. 
Status bar 9:41. Style suffix.
```

---

# SCREEN 26 · Empty State

**Purpose:** Encourage action with delightful on-brand illustration.

```
Mobile app empty state screen, vertical 9:16. Soft pearl-white 
background. Centered top: a 140px glass orb (white at 12% opacity, 
subtle 1px border, no pulse — calm/static) containing a 56px outlined 
file-text icon in medium grey (#94A3B8). Around the orb: 3 subtle 
floating geometric shapes (small dots and squares, in light blue and 
violet at 15% opacity) — soft, decorative, no clutter. Below orb: 
headline "No reports yet" in 28px bold (#0B1220). Below: body text 
in 16px medium grey "Start reporting issues in your neighborhood to 
see them here. Together we make cities better." Below: a full-width 
56px gradient pill button "Report your first issue" in white with a 
sparkle icon left. Below that: secondary text-only button "Browse 
nearby issues" in gradient text with a chevron-right. Bottom: Dynamic 
Island visible. Status bar 9:41. Calm, encouraging, beautifully 
minimal. Style suffix.
```

---

# SCREEN 27 · Dynamic Island — AI Scanning State ⭐

**Purpose:** Show the island morphing into an AI-scanning pill. **The signature element.**

```
Extreme close-up of a single iOS-style Dynamic Island floating at the 
bottom of a soft pearl-white mobile screen, 9:16. The island has 
expanded into a wider, slightly taller pill (approx 60% screen width, 
52px tall), deep navy #0B1220 at 94% opacity with 40px backdrop blur 
and rounded full pill (9999px). Inside, from left to right: a small 
pulsing cyan sparkle icon (16px) + animated cyan waveform (4–5 vertical 
bars of varying heights between 12-24px, rounded tops) + bold white 
text "Analyzing issue..." (14px SF Pro) + small white caption "97%" 
on the right (12px). The island has a soft cyan glow halo underneath 
(8px blur). Above the island, the rest of the screen is softly blurred 
showing a faint pothole image. Status bar at top showing 9:41. The 
pill has a subtle drop shadow beneath it (shadow-island). Premium, 
distinctly iOS Dynamic Island inspired, glowing, alive. Style suffix.
```

---

# SCREEN 28 · Dynamic Island — Live Activity (Report Update) ⭐

**Purpose:** Show the island morphing into a notification.

```
Close-up of iOS-style Dynamic Island floating at the bottom of a soft 
pearl-white mobile screen, 9:16. The island has morphed into a 
notification-style wider pill (approx 70% screen width, 48px tall). 
Left side: a small 28px circular CivicLens logo (gradient blue→violet). 
Middle: bold white text "Roads Dept acknowledged" (14px SF Pro) + 
smaller white-70% caption "Report #CL2024-000128" below (11px). 
Right side: tiny chevron-up icon in white-60% (12px). Deep navy 
#0B1220 at 94% opacity, backdrop blur 40px, rounded pill (9999px), 
soft shadow-island below. Above the island, the background is softly 
blurred showing the Timeline screen content. The pill has a thin 
white-8% inner highlight on top edge for the iOS-glass feel. Status 
bar 9:41. Style suffix.
```

---

# SCREEN 29 · Dynamic Island — Capture State ⭐

**Purpose:** Show the island morphing into a shutter button.

```
Close-up of iOS-style Dynamic Island floating at the bottom of a soft 
pearl-white mobile screen during camera capture, 9:16. The island 
has morphed dramatically: the center has expanded into a large 72px 
circular shutter button with a 3px solid white outer ring and a 64px 
inner circle filled with the AI gradient blue→indigo→violet. Around 
the shutter: a soft AI glow halo (cyan to violet, 16px blur). Left 
and right of the shutter: small 32px icons (gallery thumbnail left, 
flip-camera right) in white-70%. The pill is wider than normal (95% 
screen width, 88px tall to accommodate the larger shutter), deep navy 
94% opacity, backdrop blur 40px, rounded pill, soft shadow. Above: 
camera preview softly blurred (showing a street scene). Status bar 
9:41 with small red camera-recording dot. Premium, cinematic, iOS-
inspired. Style suffix.
```

---

# Summary: Complete Screen Library

| # | Screen | Key Element | Dynamic Island State |
|---|--------|-------------|----------------------|
| 1 | Splash | Logo + progress bar | Hidden |
| 2 | Onboarding | 3 carousel scenes | Hidden |
| 3 | Permissions | Trust cards | Hidden |
| 4 | Login | Glass auth card | Hidden |
| 5 | Signup | 3-step progress | Hidden |
| 6 | **Home Dashboard** | Hero + categories | **Idle (debut)** |
| 7 | Search | Search + chips | Idle (Search active) |
| 8 | AI Camera | Bounding box + shutter | Hidden |
| 9 | Live Detection | Lock-on + confidence | Hidden |
| 10 | AI Loading | Orb + progress dots | Hidden |
| 11 | AI Result | Bottom sheet details | Hidden |
| 12 | Report Details | Form + AI prefill | Hidden |
| 13 | **Success** | Confetti + check orb | Hidden |
| 14 | Timeline | Vertical nodes | Hidden |
| 15 | Map | Pins + bottom sheet | Hidden |
| 16 | Notifications | Activity feed | Idle (Home active) |
| 17 | Profile | Stats + menu | Idle (Profile active) |
| 18 | My Reports | Report cards | Idle (Home active) |
| 19 | Leaderboard | Podium + ranks | Idle (Home active) |
| 20 | Settings | Toggles + rows | Idle (Profile active) |
| 21 | Help | AI chat FAB | Idle (Profile active) |
| 22 | About | Brand mission card | Idle (Profile active) |
| 23 | **Offline** | Amber banner | **Offline state** |
| 24 | Error | Rose-tinted orb | Idle |
| 25 | Loading | Skeleton shimmer | Idle (with spinner) |
| 26 | Empty | Calm glass orb | Idle |
| **27** | **DI: AI Scanning** | Waveform + glow | **Expanded AI state** |
| **28** | **DI: Live Activity** | Logo + message | **Notification state** |
| **29** | **DI: Capture** | Shutter button | **Camera state** |

**Total:** 29 generation-ready prompts covering 26 screens + 3 Dynamic Island variants.
