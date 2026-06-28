# CivicLens — AI Glass OS Design System (Light Mode)

> **Brand:** CivicLens — AI-Powered Civic Issue Reporting
> **Tagline:** *"See. Report. Improve."*
> **Sub-tagline:** *"Together, we build better cities."*
> **Edition:** Hackathon Edition · v2.1.0
> **Mode:** Light (Primary) · Dark (Optional)

---

## 1. Core Philosophy

**"Intelligence through Clarity."**
A premium, daylight-first aesthetic where the AI presence is felt through ambient gradients, soft glass, and considered motion. The interface feels like polished optical glass — clean, confident, and engineered. Government-grade utility, startup-grade polish, and an iOS-native rhythm that feels at home on a modern iPhone.

The signature move: an **iOS-style Dynamic Island** floating bottom nav that adapts contextually — animating between Home, Camera (Capture), Search, Activity, and Profile while showing live AI states, scroll progress, and micro-interactions.

---

## 2. Color Architecture

### Light Mode Base (Primary)

| Token | Hex | Usage |
|-------|-----|-------|
| `--bg-canvas` | `#F7F8FB` | App background (soft pearl) |
| `--bg-surface` | `#FFFFFF` | Cards, sheets |
| `--bg-elevated` | `#FFFFFF` | Floating panels, nav island |
| `--glass-light` | `rgba(255, 255, 255, 0.72)` | Frosted panels |
| `--glass-medium` | `rgba(255, 255, 255, 0.85)` | Primary floating elements |
| `--glass-border` | `rgba(15, 23, 42, 0.06)` | Subtle glass edges |
| `--glass-inner` | `inset 0 1px 0 rgba(255,255,255,0.9)` | Top inner highlight |
| `--text-primary` | `#0B1220` | Headlines (near-black) |
| `--text-secondary` | `#475569` | Body, labels |
| `--text-tertiary` | `#94A3B8` | Captions, placeholders |
| `--divider` | `rgba(15, 23, 42, 0.06)` | Hairlines |

### AI Gradient Spectrum (Signature)

| Token | Value | Usage |
|-------|-------|-------|
| `--gradient-ai` | `linear-gradient(135deg, #3B82F6 0%, #6366F1 50%, #8B5CF6 100%)` | Primary AI actions |
| `--gradient-ai-soft` | `linear-gradient(135deg, #DBEAFE 0%, #E0E7FF 50%, #EDE9FE 100%)` | Soft tints |
| `--gradient-glow` | `radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)` | Ambient AI halos |
| `--accent-cyan` | `#06B6D4` | Live detection, scanning |
| `--accent-emerald` | `#10B981` | Success, resolved |
| `--accent-amber` | `#F59E0B` | Warnings, in-progress |
| `--accent-rose` | `#F43F5E` | Errors, urgent issues |

### Glassmorphism Presets (Light)

```css
.glass-light {
  background: rgba(255, 255, 255, 0.72);
  backdrop-filter: blur(40px) saturate(180%);
  -webkit-backdrop-filter: blur(40px) saturate(180%);
  border: 1px solid rgba(15, 23, 42, 0.06);
  border-radius: 24px;
  box-shadow:
    0 1px 0 rgba(255,255,255,0.9) inset,
    0 8px 24px rgba(15, 23, 42, 0.06);
}

.glass-medium {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(60px) saturate(160%);
  -webkit-backdrop-filter: blur(60px) saturate(160%);
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 24px;
  box-shadow:
    0 1px 0 rgba(255,255,255,0.95) inset,
    0 16px 32px rgba(15, 23, 42, 0.08);
}

.glass-floating {
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(80px) saturate(180%);
  -webkit-backdrop-filter: blur(80px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-radius: 32px;
  box-shadow:
    0 1px 0 rgba(255,255,255,0.95) inset,
    0 24px 48px rgba(15, 23, 42, 0.10),
    0 0 0 1px rgba(99, 102, 241, 0.06);
}

.dynamic-island {
  background: rgba(11, 18, 32, 0.94);
  backdrop-filter: blur(40px) saturate(180%);
  border-radius: 9999px;
  box-shadow:
    0 1px 0 rgba(255,255,255,0.12) inset,
    0 8px 24px rgba(15, 23, 42, 0.18);
}
```

---

## 3. Typography Scale

**Primary:** SF Pro Display / Inter / Geist
**Secondary (mono):** SF Mono / JetBrains Mono

| Level | Size | Weight | Line Height | Letter Spacing | Usage |
|-------|------|--------|-------------|----------------|-------|
| Display | 40px | 700 | 1.1 | -0.02em | Splash, empty states |
| H1 | 32px | 700 | 1.2 | -0.01em | Screen titles |
| H2 | 24px | 600 | 1.3 | -0.01em | Card headers |
| H3 | 20px | 600 | 1.4 | 0 | Section titles |
| Body | 16px | 400 | 1.5 | 0 | Primary content |
| Body Small | 14px | 400 | 1.5 | 0 | Descriptions |
| Caption | 12px | 500 | 1.4 | 0.01em | Labels, badges |
| Micro | 10px | 600 | 1.3 | 0.05em | Overlines, tags |
| Mono | 13px | 500 | 1.4 | 0 | Report IDs |

---

## 4. Spacing System (4px Base)

| Token | Value | Usage |
|-------|-------|-------|
| `space-1` | 4px | Icon padding, tight gaps |
| `space-2` | 8px | Inline elements, badge padding |
| `space-3` | 12px | Small card padding |
| `space-4` | 16px | Standard padding, button base |
| `space-5` | 24px | Card padding, section gaps |
| `space-6` | 32px | Large card padding |
| `space-7` | 48px | Section breaks |
| `space-8` | 64px | Major section spacing |

---

## 5. Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `radius-sm` | 12px | Buttons, inputs, small chips |
| `radius-md` | 16px | Medium cards |
| `radius-lg` | 24px | Primary cards, modals |
| `radius-xl` | 32px | Bottom sheets, hero cards |
| `radius-2xl` | 40px | Floating panels |
| `radius-full` | 9999px | Pills, avatars, dynamic island |

---

## 6. Shadow Elevation (Light)

| Level | Value |
|-------|-------|
| `shadow-xs` | `0 1px 2px rgba(15, 23, 42, 0.04)` |
| `shadow-sm` | `0 2px 8px rgba(15, 23, 42, 0.06)` |
| `shadow-md` | `0 8px 24px rgba(15, 23, 42, 0.08), 0 2px 4px rgba(15, 23, 42, 0.04)` |
| `shadow-lg` | `0 16px 48px rgba(15, 23, 42, 0.10), 0 4px 8px rgba(15, 23, 42, 0.05)` |
| `shadow-xl` | `0 24px 64px rgba(15, 23, 42, 0.12)` |
| `shadow-glow` | `0 0 32px rgba(99, 102, 241, 0.20), 0 0 64px rgba(139, 92, 246, 0.10)` |
| `shadow-island` | `0 12px 32px rgba(15, 23, 42, 0.18), 0 0 0 1px rgba(255,255,255,0.04) inset` |

---

## 7. The Dynamic Island — Signature Bottom Nav

This is the hero element. A floating, iOS-style pill that morphs contextually.

### Anatomy

```
┌────────────────────────────────────────────┐
│         Status bar (above island)          │
│                                            │
│  ┌──────────────────────────────────────┐  │
│  │  🏠   🔍        [AI Orb]        🗺️  👤│  │  ← Idle pill nav
│  └──────────────────────────────────────┘  │
│                                            │
│              [Screen content]              │
│                                            │
└────────────────────────────────────────────┘
```

### States

| State | Morph | Content |
|-------|-------|---------|
| **Idle** | Full pill, 5 icons | Home, Search, AI Camera (centered, elevated), Map, Profile |
| **AI Scanning** | Expands wider, pulsing | "Analyzing issue..." with live waveform |
| **Recording** | Red pulse | Audio waveform with timer |
| **Capture** | Becomes shutter | Large shutter button morphs in center |
| **Compressing** | Progress bar fills | "Optimizing image 73%" |
| **Live Activity** | Notification style | "Roads Dept acknowledged your report" |
| **Mini Player** | Media player chip | When tracking a report's progress |

### Specs

- **Width (idle):** 88% of screen, 80px height
- **Width (expanded):** 92% of screen, dynamic height
- **Bottom margin:** 24px above safe area
- **Border-radius:** 9999px (full pill)
- **Background:** `#0B1220` at 94% opacity with `backdrop-filter: blur(40px)`
- **Center button:** 56px circular, gradient AI, elevated 8px above the pill, with ambient halo
- **Icons:** 22px, `rgba(255,255,255,0.7)` inactive, gradient-fill when active
- **Active indicator:** Top dot (4px) above icon, gradient

---

## 8. Animation Language (Framer Motion)

```typescript
// Page transitions — soft iOS feel
const pageTransition = {
  initial: { opacity: 0, y: 16, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -8, scale: 0.99 },
  transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] }
};

// Dynamic island morph
const islandMorph = {
  type: "spring",
  stiffness: 380,
  damping: 32,
  mass: 0.9
};

// Card stagger
const containerStagger = {
  animate: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } }
};

const cardReveal = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] }
};

// Glass shimmer (loading)
const shimmer = {
  animate: { backgroundPosition: ["200% 0", "-200% 0"] },
  transition: { repeat: Infinity, duration: 1.8, ease: "linear" }
};

// AI pulse
const aiPulse = {
  animate: {
    scale: [1, 1.06, 1],
    opacity: [0.85, 1, 0.85],
    boxShadow: [
      "0 0 20px rgba(99,102,241,0.20)",
      "0 0 40px rgba(99,102,241,0.40)",
      "0 0 20px rgba(99,102,241,0.20)"
    ]
  },
  transition: { repeat: Infinity, duration: 2.6, ease: "easeInOut" }
};

// Button press
const buttonTap = { scale: 0.96, transition: { duration: 0.12 } };

// Card hover
const cardHover = { y: -3, transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] } };

// Bottom sheet entrance (iOS-style spring)
const sheetEntrance = {
  initial: { y: "100%" },
  animate: { y: 0 },
  exit: { y: "100%" },
  transition: { type: "spring", stiffness: 300, damping: 32 }
};
```

---

## 9. Iconography

**Library:** Lucide React / Phosphor / SF Symbols
- **Size:** 20px standard, 24px nav, 16px inline, 14px micro
- **Stroke:** 1.6px (premium thin weight)
- **Color:** `text-secondary` default, `text-primary` active, gradient for AI features
- **Active treatment:** Gradient fill or 1.5px gradient stroke

---

## 10. Component Primitives

### AI Button (Primary)

- Background: `var(--gradient-ai)`
- Color: `#FFFFFF`
- Height: 56px
- Border-radius: `radius-full`
- Font: Body, Weight 600
- Shadow: `shadow-glow`
- Icon: Right-aligned arrow (16px)
- Tap: `scale: 0.96`
- Loading: Shimmer overlay + spinner

### Glass Input

- Background: `glass-light`
- Border: 1px solid `var(--glass-border)`
- Border-radius: `radius-sm`
- Height: 52px
- Padding: 0 16px
- Focus: Border → `rgba(59,130,246,0.4)`, inner glow `rgba(99,102,241,0.08)`
- Placeholder: `text-tertiary`

### Floating Card

- Background: `glass-medium`
- Border-radius: `radius-lg`
- Padding: `space-5`
- Shadow: `shadow-md`
- Hover: `y: -3`, shadow increases

### AI Badge

- Background: `rgba(99, 102, 241, 0.08)`
- Border: 1px solid `rgba(99, 102, 241, 0.18)`
- Border-radius: `radius-full`
- Padding: 6px 12px
- Font: Caption, Weight 600
- Color: `#6366F1`
- Icon: `Sparkles` 12px

### Status Pill (Severity)

| Severity | Background | Text | Border |
|----------|-----------|------|--------|
| Low | `rgba(16,185,129,0.10)` | `#059669` | `rgba(16,185,129,0.25)` |
| Medium | `rgba(245,158,11,0.10)` | `#B45309` | `rgba(245,158,11,0.25)` |
| High | `rgba(244,63,94,0.10)` | `#BE123C` | `rgba(244,63,94,0.25)` |
| Critical | `rgba(190,18,60,0.12)` | `#9F1239` | `rgba(244,63,94,0.35)` |

---

## 11. Accessibility

- **Touch target:** 48×48px minimum
- **Contrast:** WCAG AA (4.5:1) — all text passes
- **Focus ring:** 2px solid `#6366F1` with 4px offset, 60% opacity
- **Reduce motion:** All animations become instant
- **Dynamic Type:** Supports up to 200% scaling
- **Voice labels:** AI states announced via `aria-live="polite"`

---

## 12. Responsive

| Breakpoint | Adaptation |
|------------|-----------|
| Mobile (<376px) | Reduce spacing by 4px, hero card shrinks to 160px |
| Tablet (768px+) | Two-column lists, side-rail nav, max-width 480px phone-frame simulation |
| Desktop (1024px+) | Adaptive grid OR centered phone-frame at 420px max-width |

---

*Next: 26 screen-by-screen generation prompts optimized for image-gen tools (Midjourney v6, DALL-E 3, Ideogram, Flux Pro).*
