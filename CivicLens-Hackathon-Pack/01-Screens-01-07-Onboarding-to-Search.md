# CivicLens — Screen Prompts Batch 1 (Screens 1–7)
## Splash · Onboarding · Permissions · Login · Signup · Home Dashboard · Search

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

# SCREEN 1 · Splash Screen

**Purpose:** Brand imprint, premium first impression, set the AI Glass OS tone.

**Midjourney Prompt:**

```
Mobile app splash screen, vertical 9:16, ultra-clean Apple-style startup 
screen. Background is a soft pearl-white (#F7F8FB) with a giant floating 
soft-focus gradient orb in the center — a mix of indigo, sky-blue and 
violet (10% opacity) that fades out like a halo. Centered logo: a 
minimalist geometric "C" mark made of two intersecting glass shards 
with a faint gradient stroke (blue to violet), 96×96px. Below the logo, 
the wordmark "CivicLens" in bold SF Pro Display, deep navy (#0B1220), 
44px, slightly tight letter spacing. Tagline below in 14px medium grey 
(#475569): "See. Report. Improve." Tiny at the very bottom, a 2px thin 
progress bar in the AI gradient (blue → indigo → violet) animating 30% 
filled, glassy track behind it. Status bar at top with 9:41 time and 
battery. No buttons, no clutter, pure brand moment. Style suffix.
```

**DALL-E 3 variant:** Add *"minimalist mobile app startup screen, civic tech brand intro, premium aesthetic"* and aspect ratio 9:16.

---

# SCREEN 2 · Onboarding (3-Scene Carousel)

**Purpose:** Educate users about AI capabilities in three fluid scenes.

## Scene 1 · "Point. Detect. Report."

```
Mobile app onboarding carousel screen, vertical 9:16. Soft pearl-white 
background (#F7F8FB). Top half shows a large hero illustration area 
with rounded glass card behind it: a stylized illustration of a 
smartphone camera scanning a pothole on a road, with cyan bounding 
boxes drawn around the issue and small floating AI labels ("Pothole 
98%"). The illustration uses soft 3D-feel gradients (sky-blue, violet) 
with light and shadow, not a real photo. Headline below illustration 
in bold 28px SF Pro: "Point. Detect. Report." Body text in 16px medium 
grey: "Our AI recognizes 200+ civic issues instantly — from potholes 
to broken streetlights." Bottom of screen: three glass pagination 
dots (the middle dot is expanded to 24px and filled with the AI 
gradient blue→violet, the other two are small white dots with subtle 
shadow). Below the dots, a full-width gradient pill button (blue→
indigo→violet, 56px tall, full pill radius) labeled "Get Started" in 
white 16px semibold. Underneath, faint text link "Already have an 
account? Log in". Modern, premium, Apple-like. Style suffix.
```

## Scene 2 · "AI-Powered Routing"

```
Mobile app onboarding scene 2, vertical 9:16. Pearl-white background. 
Top hero illustration: an abstract network graph visualization — 6 
floating glass nodes (circles with subtle gradient fills blue, violet, 
cyan) connected by thin glowing gradient lines, with small stylized 
government-building icons (column architecture) at 3 of the nodes. 
Soft ambient halos behind each node. Headline below in bold 28px: 
"AI-Powered Routing". Body in 16px medium grey: "Issues reach the 
right department automatically. No phone calls. No confusion." Bottom: 
pagination dots (middle dot active gradient), full-width gradient 
pill button "Next" in white, faint "Skip" text top-right. Style suffix.
```

## Scene 3 · "Watch Change Happen"

```
Mobile app onboarding scene 3, vertical 9:16. Pearl-white background. 
Top hero illustration: a vertical timeline visualization with 5 glass 
checkpoint circles — the top 3 are filled with gradient (emerald, 
amber, cyan), the bottom 2 are outlined glass. A glowing emerald map 
pin at the very end, with soft rays emanating from it. Subtle 
background grid suggesting progress. Headline in bold 28px: "Watch 
Change Happen". Body in 16px grey: "Follow your report from submission 
to resolution in real-time." Bottom: pagination dots (last dot active 
gradient), full-width gradient pill button "Get Started" white. Style suffix.
```

---

# SCREEN 3 · Permissions

**Purpose:** Request camera, location, and notifications with trust-building UI.

## 3A · Camera Permission

```
Mobile app permission request screen, vertical 9:16. Soft pearl-white 
background (#F7F8FB). Centered top: a 96px frosted glass circle with 
a thin AI gradient border, containing a soft sky-blue (#06B6D4) camera 
icon with a subtle gradient fill, gentle glow halo behind it. Below 
the icon, large headline "Enable AI Camera" in 28px bold SF Pro 
(#0B1220). Body text below in 16px medium grey: "CivicLens uses your 
camera to identify issues automatically. Photos are analyzed on-device 
for your privacy." Below body, a frosted glass info card with rounded 
24px corners, subtle border, containing a small shield icon in indigo 
plus the text "Your privacy is protected. Images are processed locally 
by AI." in 14px. At the bottom, two stacked buttons: primary is a 
full-width 56px gradient pill button "Allow Camera Access" with white 
text and a soft AI glow, secondary below is a transparent text-only 
button "Maybe Later" in medium grey. No status bar clutter. Premium 
Apple-style permission UX. Style suffix.
```

## 3B · Location Permission

```
Mobile app location permission screen, vertical 9:16. Pearl-white 
background. Centered top: a 96px frosted glass circle with thin AI 
gradient border, containing a gradient map-pin icon (blue→violet) 
with subtle glow halo. Headline "Location Services" in 28px bold. Body: 
"We auto-tag reports with precise location so departments know exactly 
where to fix issues." Glass info card below with shield icon + "GPS 
data is only used for reporting. You can manually enter addresses 
anytime." Bottom: gradient pill button "Allow Location" with white 
text, secondary text button "Enter Manually". Style suffix.
```

## 3C · Notifications Permission

```
Mobile app notification permission screen, vertical 9:16. Pearl-white 
background. Centered top: a 96px frosted glass circle with thin AI 
gradient border, containing an amber-tinted bell icon (#F59E0B) with 
soft amber glow halo. Headline "Stay Updated" in 28px bold. Body: "Get 
notified when your reports are acknowledged, updated, or resolved." 
Glass info card below with shield icon + "You can customize notification 
frequency in Settings." Bottom: gradient pill button "Allow 
Notifications" white, secondary text button "Not Now". Style suffix.
```

---

# SCREEN 4 · Login

**Purpose:** Authentication — premium, minimal friction, glassy card.

```
Mobile app login screen, vertical 9:16. Background is a soft pearl-white 
gradient with two large blurry floating gradient orbs in the top-left 
(sky-blue) and bottom-right (violet), each at 12% opacity, blurred like 
auras. Centered on screen: a floating frosted glass login card, 360px 
wide, rounded 32px corners, white at 85% opacity with 60px backdrop 
blur, soft top inner highlight and subtle 16px drop shadow. Inside the 
card top: small 48px CivicLens logo. Below: headline "Welcome back" in 
24px bold. Two stacked glass inputs (52px tall, 12px radius, white at 
80% opacity, 1px subtle border): first labeled "Email" with a tiny 
mail icon on the left, second "Password" with a lock icon left and an 
eye icon right. Below inputs: "Forgot password?" right-aligned in 14px 
medium grey, the word "password?" with a subtle gradient underline. 
Then a full-width 56px AI gradient pill button "Log In" in white. 
Below: a thin "or" divider with horizontal hairlines. Then two 
side-by-side glass buttons (each 48px tall, 12px radius) — "Google" 
with multicolor G icon and "Apple" with monochrome Apple icon. Bottom 
outside card: "New here? Sign up" with "Sign up" in gradient text 
(blue→violet). iPhone status bar with 9:41. Style suffix.
```

---

# SCREEN 5 · Signup (Multi-step)

**Purpose:** Frictionless account creation with progressive disclosure.

## 5A · Step 1 — Identity

```
Mobile app signup screen step 1 of 3, vertical 9:16. Pearl-white 
background with two floating gradient orbs (12% opacity). Centered 
glass card 360px wide, rounded 32px, white 85% backdrop blur. Top of 
card: 3-pill progress indicator — pill 1 wide gradient-filled active 
(with soft glow), pills 2 and 3 small grey outline. Headline "Create 
account" in 24px bold. Three stacked glass inputs with icons: "Full 
Name" with user icon, "Email" with mail icon, "Phone" with phone icon. 
Full-width 56px gradient pill button "Continue" in white at bottom of 
card. Outside card: faint text "Already have an account? Login" with 
"Login" gradient. Style suffix.
```

## 5B · Step 2 — Security

```
Mobile app signup screen step 2 of 3, vertical 9:16. Pearl-white 
background with floating gradient orbs. Centered glass card. Top: 
3-pill progress — pill 1 small grey (filled, completed with checkmark), 
pill 2 wide gradient active, pill 3 small grey outline. Headline "Secure 
your account" 24px bold. Two glass inputs: "Password" with lock icon, 
"Confirm password" with shield-check icon. Below: glass password-
strength bar — 4 small segments; first 3 filled (red→amber→emerald 
gradient) showing "strong" status. Tiny text "Strong password" emerald 
below. Full-width 56px gradient pill button "Create Account" white. 
Outside card: "By signing up, you agree to our Terms" with "Terms" 
gradient. Style suffix.
```

## 5C · Step 3 — Profile

```
Mobile app signup screen step 3 of 3, vertical 9:16. Pearl-white 
background. Centered glass card. Top: progress — pills 1-2 small 
filled with checkmarks, pill 3 wide gradient active. Headline "Almost 
done" 24px bold. Centered 96px avatar upload circle (glass with 
gradient border, default placeholder grey), with a small 32px gradient 
circular camera-plus icon overlay at bottom-right corner. Below: glass 
input "Username" with user icon. Below: glass input "Referral code 
(optional)" with gift icon. Full-width 56px gradient pill button 
"Get Started" white with sparkle icon. Style suffix.
```

---

# SCREEN 6 · Home Dashboard ⭐ (Dynamic Island Debut)

**Purpose:** Command center. The iOS Dynamic Island bottom nav appears here for the first time.

```
Mobile app home dashboard screen, vertical 9:16. Soft pearl-white 
background (#F7F8FB). Top status bar: 9:41, signal, battery. Below: 
floating glass header 56px tall, 88% screen width, rounded 20px, white 
85% with backdrop blur, containing: hamburger menu icon left, centered 
"CivicLens" wordmark in 18px bold, notification bell icon right with 
a small rose-red dot. Below header: a large hero card full-width minus 
32px margins, 200px tall, rounded 32px, frosted glass with a 1.5px 
gradient border (blue→indigo→violet), inside glow. Top-left of card: 
small AI badge "AI Powered" with a tiny sparkle icon. Big white text 
"Report an Issue" 24px bold. Subtitle "Tap to scan with AI" in 14px 
white at 80% opacity. Bottom-right of card: a 48px circular AI 
gradient button with a camera/scan icon, gentle pulse halo around it. 
Below hero card: section header "Recent Activity" with "View all" 
gradient text right-aligned. Then two stacked horizontal scroll cards 
(280px wide each, 96px tall, rounded 20px, glass): one with pothole 
icon left + "Pothole · 2h ago · In Progress" + amber pill badge; 
another with streetlight icon + similar layout. Below: "Nearby Issues" 
section header, then a 200px tall mini-map preview card with rounded 
24px, showing a stylized dark map with glass pin clusters, and a 
small floating badge "12 issues nearby". Below map: section "Quick 
Categories" with 3-column grid of 6 small glass squares (80px tall, 
12px radius), each with a centered thin-stroke icon (Road, Lightbulb, 
Trash2, Droplets, Trees, Volume2) and a small caption below. At the 
very bottom: the SIGNATURE DYNAMIC ISLAND floating pill — 88% screen 
width, 80px tall, deep navy (#0B1220) at 94% opacity with backdrop 
blur, fully rounded pill shape, containing 5 icons evenly spaced: 
Home (filled gradient, active with tiny 4px gradient dot above), 
Search, a CENTERED ELEVATED 56px gradient circle with white 
camera/scan icon (protruding 8px above the pill, with ambient gradient 
halo glow), Map, Profile. Subtle drop shadow under entire island. 
iOS-like, premium, Apple Dynamic Island inspired. Style suffix.
```

---

# SCREEN 7 · Search

**Purpose:** Discover issues and reports with AI-assisted search.

```
Mobile app search screen, vertical 9:16. Soft pearl-white background. 
Top: a 56px tall floating glass search input, 88% width, fully rounded 
pill, white at 88% opacity with backdrop blur, containing a left-
aligned search/magnifier icon in light grey and placeholder text 
"Search issues, locations..." in 14px medium grey. Right side of 
input: a small mic icon (voice AI) and a sliders icon (filters). Below 
the search bar: section label "Recent Searches" in 13px uppercase 
medium grey. Then a vertical stack of 3 glass list rows (52px tall, 
rounded 16px, white 80% with subtle borders): each row has a small 
clock icon left in grey, text in 15px medium grey (e.g. "Pothole near 
MG Road", "Broken streetlight", "Garbage on Main Street"), and a 
small × close icon right. Below: section label "Trending in Your 
Area". A horizontal-scroll row of pill chips (32px tall, rounded pill, 
glass with 1px border): each chip has a tiny flame or trending icon + 
label like "Potholes", "Streetlights", "Water", "Garbage". One chip 
is highlighted with full gradient fill (blue→violet) and white text. 
Below that: a special AI suggestion card, full-width minus 32px 
margins, rounded 24px, glass-floating with a 4px wide gradient left 
border, containing a small sparkle icon, bold text "Based on your 
area", and 3 suggested issue rows with right-chevrons. Bottom: same 
Dynamic Island nav, with the Search icon now active (gradient). 
Premium, minimal. Style suffix.
```
