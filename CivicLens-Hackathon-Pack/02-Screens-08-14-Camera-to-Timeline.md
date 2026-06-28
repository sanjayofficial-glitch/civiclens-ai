# CivicLens — Screen Prompts Batch 2 (Screens 8–14)
## AI Camera · Live Detection · Analysis Loading · AI Result · Report Details · Report Submitted · Track Timeline

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

# SCREEN 8 · AI Camera

**Purpose:** Immersive AI-powered issue detection.

```
Mobile app AI camera screen, vertical 9:16. Full-screen camera preview 
background showing a stylized urban street scene (slightly dimmed with 
a 20% black overlay for contrast — NOT a real photo, an illustration 
in soft 3D-render style of an Indian road with potholes and streetlights). 
Overlaid UI: top-left a 40px frosted glass close × button (circular, 
white 30% opacity with backdrop blur). Top-right a 40px circular glass 
flash button with a lightning icon. Center of screen: an animated 
cyan bounding box drawn around a visible pothole (2px dashed cyan stroke 
#06B6D4 with corner brackets at all four corners, slightly pulsing), 
and a small floating glass pill above the box with text "Pothole — 98% 
confidence" in cyan with a sparkle icon. Bottom-center: a smaller 
floating glass pill with a spinning sparkle icon and text "AI 
scanning..." in 12px medium grey, with three animated dots after. 
Very bottom: a large 80px circular shutter button (outer ring 4px 
solid white, inner 64px filled with AI gradient blue→violet, slight 
glow halo). Left of shutter: a 48px rounded glass gallery thumbnail 
(most recent photo). Right of shutter: a 40px glass flip-camera 
button. Status bar at top shows 9:41 and small camera-recording red 
dot. Dynamic Island is HIDDEN in camera mode. Cinematic, premium, 
clean. Style suffix.
```

---

# SCREEN 9 · Live AI Detection

**Purpose:** Real-time detection lock-on with confidence visualization.

```
Mobile app live AI detection screen, vertical 9:16. Full-screen 
stylized camera preview (illustrated urban scene with a clearly visible 
pothole, dimmed slightly). Top-left: a floating glass info card 280px 
wide, rounded 20px, white 90% with backdrop blur, containing: a small 
cyan pill badge "Road Issue" with road icon, then bold text "Pothole" 
in 20px, then a confidence row: a small bar-chart icon + thin glass 
progress bar (track white at 10%, fill AI gradient) showing 97% 
filled, then a row with alert-triangle icon + "Severity: High" in 
amber text with amber-tinted pill background. Center of screen: a 
tight cyan bounding box around the pothole with corner brackets, small 
label pill "Pothole 97%" above it, and a faint crosshair at the 
center. Bottom of screen: a wider glass context card spanning most 
of the width, rounded 24px, white 88% opacity, containing a bar-chart 
icon + bold text "Similar issues nearby: 12", below in 14px grey 
"Average fix time: 3 days". Below that: two side-by-side buttons — 
left is "Retake" glass button with refresh icon, right is the full 
AI gradient pill button "Confirm" with a check icon. No Dynamic 
Island at bottom (camera session). Detection feels precise, locked, 
AI-confident. Style suffix.
```

---

# SCREEN 10 · AI Analysis Loading

**Purpose:** Build anticipation with multi-stage AI visualization.

```
Mobile app AI analysis loading screen, vertical 9:16. Background is 
a soft pearl-white with a subtle radial gradient halo behind the 
center orb (sky-blue to violet at 8% opacity). Dead center: a 140px 
glass sphere with a heavy inner gradient (blue→indigo→violet, blurred 
and swirling), with an outer thin ring rotating slowly (dashed cyan 
stroke). Tiny glass particles orbit the sphere. Below the orb: bold 
text "Analyzing image..." in 22px SF Pro (#0B1220), then a smaller 
grey subtitle "Identifying the issue..." in 14px that has just animated 
in. Below: a horizontal progress indicator — 4 small dots connected 
by thin glass lines, the first 2 dots are filled with the AI gradient 
and have small checkmark icons inside, the 3rd dot is currently 
active (gradient-filled, 12px, pulsing), the 4th is small grey 
outline. Below each dot a tiny label: "Scanning", "Classifying", 
"Verifying", "Generating". The line between dots 1–2 is filled with 
gradient, between 2–3 is partial, between 3–4 is empty grey. Bottom 
of screen: a single text button "Cancel" in medium grey. Status bar 
visible. No Dynamic Island. Calm, anticipatory, premium loading 
state. Style suffix.
```

---

# SCREEN 11 · AI Result

**Purpose:** Present AI findings with confidence.

```
Mobile app AI result screen, vertical 9:16. Top half (40% of screen): 
the captured pothole image with rounded 24px bottom corners, the 
cyan bounding box still visible on the pothole, and a small floating 
glass pill at top-left of image saying "AI Detected" with a tiny 
sparkle icon. Bottom half: a frosted glass result card that fills 
from below with rounded 32px top corners, white 92% opacity with 
backdrop blur and a soft top inner highlight. Pull handle: a small 
40×4px grey pill centered at the top of the card. Inside card: top — 
a 56px circular gradient icon background (blue→violet) with a road/
pothole icon in white. Next to it, large headline "Pothole" in 24px 
bold, below in 14px grey "Road Infrastructure". Then a thin hairline 
divider. Then 3 data rows, each 56px tall with left icon + label + 
value: row 1 "Confidence" + bar-chart icon + horizontal gradient 
progress bar filled to 97%; row 2 "Severity" + alert-triangle icon + 
an amber pill "High"; row 3 "Location" + map-pin icon + address text 
"MG Road, Bhubaneswar" + small gradient text "Auto-detected" with 
sparkle. Bottom of card: two side-by-side buttons — left glass "Edit 
Details" with edit icon, right gradient "Confirm & Continue" with 
check icon. No Dynamic Island. Style suffix.
```

---

# SCREEN 12 · Report Details

**Purpose:** Rich issue reporting form with AI pre-filled data.

```
Mobile app report details screen, vertical 9:16. Soft pearl-white 
background. Floating glass header at top (56px tall, 88% width, 
rounded 20px) with: chevron-left back icon, centered "Report Details" 
in 18px semibold, "Save" gradient text button right. Below: a 
captured image card (full-width minus 32px, 200px tall, rounded 24px, 
glass) with a small "+" button overlay bottom-right to add more. 
Below image: vertical form sections with labels above each glass 
input — "Issue Type" with a glass dropdown (rounded 12px, 52px tall) 
showing "Pothole" + chevron-down right; "Description" with a glass 
textarea (rounded 16px, 120px min height) containing italic grey AI-
generated prefill: "AI detected a large pothole approximately 60cm 
wide causing traffic disruption..."; "Location" with a glass input 
showing map-pin icon + "MG Road, Bhubaneswar" + small "Auto" badge. 
Below: section "Severity" with a 4-segment pill segmented control 
(Low / Medium / High / Critical) — the "High" pill is gradient-filled 
and slightly elevated. Below that: a collapsible "Additional options" 
with two glass toggle rows: "Anonymous Report" and "Notify me on 
updates" (both toggled ON, with the toggle knob shifted right and 
the track filled with gradient). Bottom-fixed: a full-width 56px 
gradient pill button "Submit Report" with white text and a soft 
glow. Status bar 9:41. No Dynamic Island (form filling mode). 
Style suffix.
```

---

# SCREEN 13 · Report Submitted Success ⭐

**Purpose:** Celebration moment — critical for retention.

```
Mobile app report submitted success screen, vertical 9:16. Background 
is soft pearl-white with a soft emerald-green ambient gradient halo 
behind the center (10% opacity). Centered top half: a 140px circular 
success orb with an emerald-tinted glass background (#10B981 at 15% 
opacity), 2px emerald border, and a large white check icon (48px) 
inside. Around the orb: 3 expanding concentric rings (emerald at 
decreasing opacity) like a ripple effect frozen mid-animation. Tiny 
glass confetti particles (scattered in cyan, violet, emerald, small 
dots and squares) fall around the top of the screen. Below the orb: 
huge headline "Report Submitted!" in 36px bold with a subtle gradient 
text treatment (blue→violet). Below in 16px medium grey: "Your issue 
has been sent to the Roads Department." Below that: a centered glass 
meta card 300px wide, rounded 20px, white 85% with backdrop blur, 
containing two rows separated by a thin divider: top row has a small 
hash icon + monospace text "Report ID: #CL2024-000128" in 14px; 
bottom row has a clock icon + "Est. Resolution: 3 days" in 14px grey. 
Below: a vertical stack of 3 buttons — primary 56px gradient pill 
"Track Report" with arrow-right icon, secondary glass "Share" with 
share icon, tertiary text-only "Back to Home" with home icon. Status 
bar 9:41. No Dynamic Island. Joyful, celebratory, premium. Style suffix.
```

---

# SCREEN 14 · Track Report Timeline

**Purpose:** Visual progress tracking with government transparency.

```
Mobile app report timeline screen, vertical 9:16. Soft pearl-white 
background. Floating glass header 56px tall: chevron-left back, 
centered monospace "#CL2024-000128" in 16px, share icon right. Below 
header: a content card section with the issue title "Pothole on MG 
Road" in 20px bold, below it an amber status pill "In Progress" with 
a small pulsing dot. Below: a vertical timeline. A thin 2px vertical 
line running down the left side (gradient-filled from top to about 
70%, then grey below). On the line, 5 timeline nodes evenly spaced: 
node 1 (filled gradient with small checkmark, "Submitted" + "You · 
2 days ago" caption), node 2 (filled gradient with check, "Under 
Review" + "AI verified · 1 day ago"), node 3 (larger, cyan-filled, 
gently pulsing, current step, "Assigned" + "Roads Dept · Today"), 
node 4 (small grey outline, "In Progress"), node 5 (small grey 
outline, "Resolved"). Each completed/current step has a glass card 
to the right of the node (rounded 16px, white 85% opacity, 1px subtle 
border) with step title (15px semibold), actor + timestamp caption 
(12px grey). The current step card is slightly highlighted with a 
faint cyan border. Bottom-fixed: two side-by-side glass buttons — 
"Message Department" with message-square icon, "Escalate" with 
arrow-up icon and amber-tinted border. Status bar 9:41. No Dynamic 
Island. Style suffix.
```
