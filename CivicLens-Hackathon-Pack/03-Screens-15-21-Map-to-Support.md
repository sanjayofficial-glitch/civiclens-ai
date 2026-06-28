# CivicLens — Screen Prompts Batch 3 (Screens 15–21)
## Interactive Map · Notifications · Profile · My Reports · Leaderboard · Settings · Help & Support

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

# SCREEN 15 · Interactive Map

**Purpose:** Spatial discovery of civic issues.

```
Mobile app interactive map screen, vertical 9:16. Full-screen stylized 
light-themed map background (very subtle warm-grey map with thin 
roads, parks in light-green, water in light-blue — Apple Maps light 
style, but abstracted/illustrated, not photorealistic). Floating UI 
overlays: top — a 48px tall fully-rounded pill search input (88% 
width, white 92% with backdrop blur, search icon + placeholder 
"Search area..."). Below search: a horizontal row of 5 filter pill 
chips — "All" (gradient-filled active with white text), "Road", 
"Light", "Water", "Trash" — each 32px tall rounded pill, glass with 
1px border, inactive ones grey text, active one white text on 
gradient. On the map: 4–5 floating glass map pins scattered — 
teardrop shape, white 85% glass with category icons inside (pothole, 
streetlight, water-droplet), with severity colored borders (one 
emerald for low, two amber for medium, two rose for high). A few pins 
are clustered together with a glass circle showing "12" in bold. 
Bottom: a peek bottom sheet 200px tall, rounded 32px top corners, 
white 92% with backdrop blur. Inside: pull handle 40×4px grey pill 
at top, then a row with thumbnail image (60px rounded), bold "Pothole 
· 0.2 mi away", amber pill "High severity", then two buttons "View 
Details" (gradient text) and "Directions" (glass button with 
navigation icon). Bottom-right of map: a floating 56px gradient 
circular FAB "+" Report Here with a soft glow. Status bar 9:41. 
Dynamic Island HIDDEN on map view. Style suffix.
```

---

# SCREEN 16 · Notifications

**Purpose:** Centralized activity feed.

```
Mobile app notifications screen, vertical 9:16. Soft pearl-white 
background. Floating glass header at top with "Notifications" 
headline in 22px bold left, "Mark all read" gradient text right. 
Below: section label "Today" in 12px uppercase grey. Then a stack 
of 2 glass notification cards (rounded 20px, white 88% opacity, 16px 
padding, 1px subtle border). Card 1 has a 3px gradient left border 
(unread), a 40px circular glass icon container left with an info 
icon in cyan, body text "Your report #CL2024-000128 was assigned to 
Roads Department" in 15px, "2h ago" caption in 12px grey. Card 2 is 
similar but with a sparkle icon in a small gradient circle (AI-
related) and 3px gradient border. Section label "Yesterday" in 12px 
uppercase grey. Then 2 more cards: one resolved with a check-circle 
icon in emerald, "Report #CL2024-000110 was marked Resolved" + 
"Yesterday"; another alert card with alert-triangle icon in amber. 
Cards have a subtle 3px gradient border on the left when unread. 
Bottom: same Dynamic Island nav, Home icon highlighted. Status bar 
9:41. Style suffix.
```

---

# SCREEN 17 · Profile

**Purpose:** User identity, civic impact dashboard.

```
Mobile app profile screen, vertical 9:16. Soft pearl-white background. 
Top: a 180px tall cover area with a soft gradient mesh (blue→violet, 
15% opacity, blurred abstract shapes — NOT a photo), full-width. 
Centered overlapping the cover bottom edge: a 96px circular avatar 
(image of a friendly young Indian man in soft 3D illustration style, 
smiling) with a 4px AI gradient border and a soft white halo. Below 
avatar: name "Sanjaya Sahu" in 24px bold (#0B1220), handle "@sanjaya" 
in 14px medium grey, then a small glass level pill "Level 3 Reporter" 
with a trophy icon in amber. Below (24px margin): a horizontal glass 
stats bar (rounded 24px, white 88%, padding 20px) split into two 
halves by a thin vertical divider. Left: huge "1,280" in gradient 
text (blue→violet) 28px bold + "Impact Score" caption 12px grey with 
a small "Top 8%" green badge. Right: "24" big bold + "Reports" caption, 
then "18" big bold + "Resolved" caption. Below: a vertical menu list 
of glass rows (52px tall, rounded 16px, white 85%, 12px gap between): 
"My Reports" with file-text icon, "Achievements" with award icon, 
"Leaderboard" with trophy icon, "Settings" with settings icon, "Help 
& Support" with help-circle icon. Each row has a left 36px glass 
circle with icon, label, and chevron-right. Bottom: Dynamic Island 
with Profile icon now active (gradient-filled). Status bar 9:41. 
Style suffix.
```

---

# SCREEN 18 · My Reports

**Purpose:** Personal report history.

```
Mobile app my reports screen, vertical 9:16. Soft pearl-white 
background. Floating glass header: "My Reports" headline 22px bold 
left, "Filter" glass icon-button right. Below: a 3-pill segmented 
control (rounded full, white 88%, 1px border) — "Active" (gradient-
filled active with white text and badge "3"), "Resolved" (grey text 
with badge "18"), "Drafts" (grey text with badge "2"). Below: vertical 
stack of report cards (rounded 20px, white 88%, 1px border, 110px 
tall). Card 1: 80px rounded thumbnail image left (pothole), middle 
column with bold "Pothole on MG Road" + "Bhubaneswar · 2 days ago" 
caption + amber status pill "In Progress". Right side: chevron-right. 
Bottom row inside card: eye icon + "12 views" + thumbs-up icon + "3 
upvotes" (12px grey). Card 2: similar but with streetlight thumbnail, 
"Broken Street Light", "Oak Avenue · 1 week ago", emerald pill 
"Resolved", "45 views", "12 upvotes". Card 3: similar with overflow-
drain thumbnail, "Garbage Overflow", "Patia · 3 days ago", amber 
pill "Under Review". Bottom: Dynamic Island with Home icon active. 
Status bar 9:41. Style suffix.
```

---

# SCREEN 19 · Leaderboard

**Purpose:** Gamification, community engagement.

```
Mobile app leaderboard screen, vertical 9:16. Soft pearl-white 
background. Floating glass header: "Leaderboard" headline 22px bold 
left, glass dropdown right "This Week" with chevron. Below: the 
podium visualization centered, 240px tall. Three glass columns on a 
baseline: Left column (#2, 100px tall): silver-tinted glass with 
gradient silver→white, topped with a 56px circular avatar of a young 
woman named "Sanjaya" caption, "1,450" score in gradient text. Center 
column (#1, 140px tall): gold-tinted glass with amber gradient, 
topped with a 56px circular avatar of a young man with crown icon 
above (gold), name "Alex" caption, "1,620" score in bold gradient 
text. Right column (#3, 100px tall): bronze-tinted glass, topped 
with a 56px circular avatar, name "Mike" caption, "1,380" score. 
Avatars sit on top of columns. Below podium: a sticky highlighted 
glass row showing "4 · You" with avatar + "1,280" score + a small 
"+12 this week" green tag — this row has a faint blue tint background 
to highlight user's position. Below that: a vertical list of ranked 
rows (48px tall, rounded 16px glass): row 5 "Rohit" 980, row 6 "Neha" 
870, row 7 "Vikash" 760, row 8 "Ananya" 650 — each with rank number, 
avatar, name, score, and small trending-up/down indicator arrows in 
emerald or rose. Bottom: Dynamic Island with Home icon. Status bar 
9:41. Style suffix.
```

---

# SCREEN 20 · Settings

**Purpose:** Premium preference management.

```
Mobile app settings screen, vertical 9:16. Soft pearl-white 
background. Top: large "Settings" headline 28px bold. Below: 
vertical grouped settings with section labels in 11px uppercase 
grey. Section "Account": two glass rows (56px tall, rounded 16px, 
white 88%, 12px gap) — "Edit Profile" with user icon, "Change 
Password" with lock icon, each with chevron-right. Section 
"Preferences": three rows — "Dark Mode" with moon icon + a glass 
toggle (right side, 48×28px pill, gradient-filled with white knob 
slid right indicating ON), "Notifications" with bell icon + similar 
toggle ON, "Language" with globe icon + "English" right-aligned + 
chevron. Section "AI Features": "Auto-Detect" with sparkle icon + 
toggle ON, "Offline Analysis" with wifi-off icon + toggle OFF (grey 
track, knob left). Bottom: a full-width glass button "Log Out" with 
rose-tinted text and a log-out icon, with a faint rose border. 
Dynamic Island at bottom with Profile icon highlighted. Status bar 
9:41. Style suffix.
```

---

# SCREEN 21 · Help & Support

**Purpose:** Accessible assistance with AI chat FAB.

```
Mobile app help & support screen, vertical 9:16. Soft pearl-white 
background. Top: "Help & Support" headline 28px bold. Below: a 56px 
tall fully-rounded glass search input (88% width) with magnifier 
icon + placeholder "Search help articles...". Below: "Quick Actions" 
section label, then a row of 3 glass action tiles (90px wide each, 
96px tall, rounded 20px, white 88%, evenly spaced) — each has a 
centered icon (help-circle, mail, message-square) + caption label 
("FAQ", "Contact", "Chat") below. Below: "Popular Articles" section 
label. Then a vertical list of glass article rows (60px tall, rounded 
16px, white 88%) — "How to report an issue?" with file-text icon, 
"AI detection tips" with sparkle icon, "Tracking your reports" with 
map-pin icon, "Privacy & data" with shield icon. Each row has 
category tag caption left and chevron-right. Floating bottom-right: 
a 64px glass-floating circular button with AI gradient border and a 
sparkle icon inside, with an ambient gradient halo glow around it. 
Caption below "Ask AI" in 12px gradient. Bottom: Dynamic Island with 
Profile icon. Status bar 9:41. Style suffix.
```
