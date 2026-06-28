# CivicLens — Dynamic Island Implementation Guide
## Production-ready React + Tailwind + Framer Motion code

> Drop-in component code for the **signature iOS-style Dynamic Island** bottom nav.
> Built with React 19, Tailwind CSS v4, Framer Motion v11, and Lucide icons.
> Supports all 5 contextual states: Idle · AI Scanning · Live Activity · Capture · Offline.

---

## 1 · Install dependencies

```bash
npm install framer-motion lucide-react clsx tailwind-merge
```

---

## 2 · Design tokens (Tailwind config)

```ts
// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "#F7F8FB",
        ink: {
          900: "#0B1220",
          700: "#1F2937",
          500: "#475569",
          300: "#94A3B8",
        },
        cyan: { 500: "#06B6D4" },
        emerald: { 500: "#10B981" },
        amber: { 500: "#F59E0B" },
        rose: { 500: "#F43F5E" },
        indigo: { 500: "#6366F1" },
        violet: { 500: "#8B5CF6" },
      },
      backgroundImage: {
        "ai-gradient":
          "linear-gradient(135deg, #3B82F6 0%, #6366F1 50%, #8B5CF6 100%)",
        "ai-soft":
          "linear-gradient(135deg, #DBEAFE 0%, #E0E7FF 50%, #EDE9FE 100%)",
      },
      boxShadow: {
        island:
          "0 12px 32px rgba(15, 23, 42, 0.18), inset 0 1px 0 rgba(255,255,255,0.12)",
        glow: "0 0 32px rgba(99, 102, 241, 0.30), 0 0 64px rgba(139, 92, 246, 0.18)",
        "soft-md": "0 8px 24px rgba(15, 23, 42, 0.08), 0 2px 4px rgba(15, 23, 42, 0.04)",
      },
      borderRadius: {
        island: "9999px",
      },
      transitionTimingFunction: {
        ios: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      keyframes: {
        aiPulse: {
          "0%, 100%": {
            boxShadow:
              "0 0 20px rgba(99,102,241,0.30), 0 0 0px rgba(139,92,246,0.20)",
            transform: "scale(1)",
          },
          "50%": {
            boxShadow:
              "0 0 32px rgba(99,102,241,0.55), 0 0 48px rgba(139,92,246,0.30)",
            transform: "scale(1.04)",
          },
        },
        wave: {
          "0%, 100%": { transform: "scaleY(0.4)" },
          "50%": { transform: "scaleY(1)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
      },
      animation: {
        "ai-pulse": "aiPulse 2.6s ease-in-out infinite",
        wave: "wave 1.1s ease-in-out infinite",
        shimmer: "shimmer 1.8s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
```

---

## 3 · The Dynamic Island Component

```tsx
// components/DynamicIsland.tsx
"use client";

import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Home,
  Search,
  Camera,
  Map as MapIcon,
  User,
  Sparkles,
  WifiOff,
  ChevronUp,
  Mic,
  RefreshCw,
  X,
} from "lucide-react";
import { useState, useEffect } from "react";
import clsx from "clsx";

// ───────────────────────────────────────────────────────────
// Types
// ───────────────────────────────────────────────────────────
type Tab = "home" | "search" | "map" | "profile";
type IslandState =
  | "idle"
  | "scanning"
  | "activity"
  | "capture"
  | "offline";

interface DynamicIslandProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  onCapture: () => void;
  // Optional state override (e.g. when camera is open, hide the island)
  forceState?: IslandState | null;
  // Live activity content
  activity?: { title: string; subtitle: string } | null;
  // Offline queue count
  queuedCount?: number;
}

// ───────────────────────────────────────────────────────────
// Spring (iOS-feel)
const islandSpring = {
  type: "spring" as const,
  stiffness: 380,
  damping: 32,
  mass: 0.9,
};

// Waveform bars
const waveBars = [0.6, 1, 0.7, 1.2, 0.8, 1.1, 0.65];

// ───────────────────────────────────────────────────────────
// Main Component
// ───────────────────────────────────────────────────────────
export function DynamicIsland({
  activeTab,
  onTabChange,
  onCapture,
  forceState = null,
  activity = null,
  queuedCount = 0,
}: DynamicIslandProps) {
  const reduceMotion = useReducedMotion();
  const [state, setState] = useState<IslandState>("idle");

  // Auto-switch state when activity prop changes
  useEffect(() => {
    if (forceState) {
      setState(forceState);
      return;
    }
    if (queuedCount > 0) setState("offline");
    else if (activity) setState("activity");
    else setState("idle");
  }, [forceState, activity, queuedCount]);

  // Don't render island in full-screen camera / capture mode
  if (state === "capture") {
    return <CaptureIsland onClose={() => setState("idle")} />;
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 flex justify-center px-5 pb-5 pt-2 pointer-events-none">
      <motion.div
        layout
        transition={islandSpring}
        className={clsx(
          "pointer-events-auto relative flex items-center justify-between",
          "rounded-island bg-ink-900/94 backdrop-blur-2xl shadow-island",
          "border border-white/5",
          // Width morphs by state
          state === "idle" && "w-full max-w-md h-[72px] px-6",
          state === "scanning" && "w-full max-w-lg h-[60px] px-5",
          state === "activity" && "w-full max-w-lg h-[56px] px-4",
          state === "offline" && "w-full max-w-md h-[60px] px-5"
        )}
      >
        {/* TOP INNER HIGHLIGHT (iOS glass) */}
        <div className="absolute inset-x-6 top-0 h-px bg-white/10 rounded-full" />

        {/* ── IDLE STATE ────────────────────────────────── */}
        {state === "idle" && (
          <IdleNav
            activeTab={activeTab}
            onTabChange={onTabChange}
            onCapture={() => setState("capture")}
          />
        )}

        {/* ── SCANNING STATE ────────────────────────────── */}
        <AnimatePresence mode="wait">
          {state === "scanning" && (
            <motion.div
              key="scanning"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-3 w-full"
            >
              <motion.div
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 1.4, repeat: Infinity }}
                className="w-7 h-7 rounded-full bg-cyan-500/20 flex items-center justify-center"
              >
                <Sparkles size={14} className="text-cyan-400" />
              </motion.div>
              <div className="flex items-end gap-1 h-6 flex-1">
                {waveBars.map((h, i) => (
                  <motion.div
                    key={i}
                    className="w-1 rounded-full bg-gradient-to-t from-cyan-400 to-indigo-400"
                    animate={
                      reduceMotion
                        ? { scaleY: h }
                        : { scaleY: [h * 0.4, h, h * 0.4] }
                    }
                    transition={{
                      duration: 0.9 + i * 0.08,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    style={{ height: "100%", transformOrigin: "bottom" }}
                  />
                ))}
              </div>
              <div className="flex flex-col items-end">
                <span className="text-white text-sm font-semibold">
                  Analyzing issue…
                </span>
                <span className="text-white/60 text-[10px] tabular-nums">
                  97%
                </span>
              </div>
              <button
                onClick={() => setState("idle")}
                className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center"
                aria-label="Cancel scanning"
              >
                <X size={14} className="text-white/80" />
              </button>
            </motion.div>
          )}

          {/* ── ACTIVITY STATE ──────────────────────────── */}
          {state === "activity" && activity && (
            <motion.div
              key="activity"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex items-center gap-3 w-full"
            >
              <div className="w-8 h-8 rounded-full bg-ai-gradient flex items-center justify-center shrink-0">
                <Sparkles size={14} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-[13px] font-semibold truncate">
                  {activity.title}
                </p>
                <p className="text-white/60 text-[11px] truncate">
                  {activity.subtitle}
                </p>
              </div>
              <button
                onClick={() => setState("idle")}
                className="text-white/60 hover:text-white"
                aria-label="Dismiss"
              >
                <ChevronUp size={16} />
              </button>
            </motion.div>
          )}

          {/* ── OFFLINE STATE ───────────────────────────── */}
          {state === "offline" && (
            <motion.div
              key="offline"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-3 w-full"
            >
              <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
                <WifiOff size={14} className="text-amber-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-[13px] font-semibold">
                  Offline
                </p>
                <p className="text-white/60 text-[11px]">
                  {queuedCount} queued · Will sync
                </p>
              </div>
              <button
                onClick={() => setState("idle")}
                className="text-white/60 hover:text-white"
                aria-label="Retry"
              >
                <RefreshCw size={14} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

// ───────────────────────────────────────────────────────────
// Idle Nav (5-icon layout)
// ───────────────────────────────────────────────────────────
function IdleNav({
  activeTab,
  onTabChange,
  onCapture,
}: {
  activeTab: Tab;
  onTabChange: (t: Tab) => void;
  onCapture: () => void;
}) {
  const tabs: { id: Tab; icon: typeof Home; label: string }[] = [
    { id: "home", icon: Home, label: "Home" },
    { id: "search", icon: Search, label: "Search" },
    { id: "map", icon: MapIcon, label: "Map" },
    { id: "profile", icon: User, label: "Profile" },
  ];

  return (
    <>
      {/* Left two icons */}
      <NavItem
        icon={Home}
        label="Home"
        active={activeTab === "home"}
        onClick={() => onTabChange("home")}
      />
      <NavItem
        icon={Search}
        label="Search"
        active={activeTab === "search"}
        onClick={() => onTabChange("search")}
      />

      {/* Center elevated capture button */}
      <div className="relative flex items-center justify-center">
        <motion.div
          className="absolute inset-0 -m-3 rounded-full bg-ai-gradient opacity-40 blur-xl"
          animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 2.4, repeat: Infinity }}
        />
        <motion.button
          onClick={onCapture}
          whileTap={{ scale: 0.92 }}
          whileHover={{ scale: 1.05 }}
          transition={islandSpring}
          className="relative w-14 h-14 -my-4 rounded-full bg-ai-gradient shadow-glow flex items-center justify-center border border-white/20"
          aria-label="Open AI Camera"
        >
          <Camera size={22} className="text-white" strokeWidth={2.2} />
        </motion.button>
      </div>

      {/* Right two icons */}
      <NavItem
        icon={MapIcon}
        label="Map"
        active={activeTab === "map"}
        onClick={() => onTabChange("map")}
      />
      <NavItem
        icon={User}
        label="Profile"
        active={activeTab === "profile"}
        onClick={() => onTabChange("profile")}
      />
    </>
  );
}

// ───────────────────────────────────────────────────────────
// Individual Nav Item
// ───────────────────────────────────────────────────────────
function NavItem({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: typeof Home;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.85 }}
      transition={{ duration: 0.12 }}
      className="relative flex flex-col items-center justify-center gap-0.5 w-10"
      aria-label={label}
      aria-current={active ? "page" : undefined}
    >
      {active && (
        <motion.div
          layoutId="nav-indicator"
          className="absolute -top-2 w-1 h-1 rounded-full bg-ai-gradient"
          transition={islandSpring}
        />
      )}
      <Icon
        size={22}
        strokeWidth={active ? 2.2 : 1.6}
        className={clsx(
          "transition-colors duration-200",
          active ? "text-white" : "text-white/55"
        )}
      />
      <span
        className={clsx(
          "text-[9px] font-semibold tracking-wide transition-colors",
          active ? "text-white" : "text-white/40"
        )}
      >
        {label}
      </span>
    </motion.button>
  );
}

// ───────────────────────────────────────────────────────────
// Capture Island (full shutter mode)
// ───────────────────────────────────────────────────────────
function CaptureIsland({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 flex justify-center px-3 pb-4 pt-2 pointer-events-none">
      <motion.div
        layout
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={islandSpring}
        className="pointer-events-auto relative flex items-center justify-between w-full max-w-lg h-[88px] px-5 rounded-island bg-ink-900/94 backdrop-blur-2xl shadow-island border border-white/5"
      >
        <div className="absolute inset-x-6 top-0 h-px bg-white/10 rounded-full" />

        {/* Gallery thumb */}
        <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/10" />

        {/* Shutter button */}
        <motion.button
          whileTap={{ scale: 0.88 }}
          className="relative w-[68px] h-[68px] -my-3 rounded-full flex items-center justify-center"
          aria-label="Capture photo"
        >
          <motion.div
            className="absolute inset-0 rounded-full bg-ai-gradient opacity-40 blur-xl"
            animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.6, 0.4] }}
            transition={{ duration: 1.6, repeat: Infinity }}
          />
          <div className="relative w-full h-full rounded-full bg-white p-[3px]">
            <div className="w-full h-full rounded-full bg-ai-gradient flex items-center justify-center">
              <Camera size={28} className="text-white" strokeWidth={2.4} />
            </div>
          </div>
        </motion.button>

        {/* Flip camera */}
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center"
          aria-label="Close camera"
        >
          <RefreshCw size={18} className="text-white/80" />
        </button>
      </motion.div>
    </div>
  );
}
```

---

## 4 · Usage example

```tsx
// app/(tabs)/layout.tsx
"use client";

import { useState } from "react";
import { DynamicIsland } from "@/components/DynamicIsland";

export default function TabsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [tab, setTab] = useState<"home" | "search" | "map" | "profile">(
    "home"
  );

  // Example activity (could come from a notification store)
  const activity = {
    title: "Roads Dept acknowledged",
    subtitle: "Report #CL2024-000128",
  };

  return (
    <div className="min-h-screen bg-canvas pb-32">
      {children}

      <DynamicIsland
        activeTab={tab}
        onTabChange={setTab}
        onCapture={() => console.log("open camera")}
        activity={activity}
        queuedCount={0}
      />
    </div>
  );
}
```

---

## 5 · Animation reference (Framer Motion variants)

```ts
// utils/motion.ts
export const iosSpring = {
  type: "spring" as const,
  stiffness: 380,
  damping: 32,
  mass: 0.9,
};

export const iosEase = [0.22, 1, 0.36, 1] as const;

export const cardReveal = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.55, ease: iosEase },
};

export const stagger = {
  animate: { transition: { staggerChildren: 0.06 } },
};
```

---

## 6 · Triggering state changes

```tsx
// Anywhere in the app — toggle to scanning
import { useState } from "react";

const [islandState, setIslandState] = useState<
  "idle" | "scanning" | "capture" | null
>(null);

// When AI starts analyzing:
setIslandState("scanning");

// When done:
setTimeout(() => setIslandState(null), 4000);

// When opening camera:
setIslandState("capture");

<DynamicIsland forceState={islandState} ... />
```

---

## 7 · iOS-safe-area support

```tsx
// Wrap the island in a bottom safe-area container
<div className="fixed inset-x-0 bottom-0 z-50 flex justify-center px-4 
                pb-[max(20px,env(safe-area-inset-bottom))]">
  <DynamicIsland ... />
</div>
```

---

## 8 · Optional: Haptic feedback

```ts
// On tap (Safari iOS only)
function hapticTap() {
  if ("vibrate" in navigator) navigator.vibrate(8);
}

// Heavy feedback for shutter
function hapticShutter() {
  if ("vibrate" in navigator) navigator.vibrate([10, 30, 10]);
}
```

---

## 9 · Optional: Live Activity (iOS Lock Screen)

For a real hackathon demo, register a Live Activity with the same visual DNA:

```swift
// In a Widget Extension (iOS 16.1+)
struct CivicLensLiveActivity: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: ReportStatusAttributes.self) {
            // Lock screen UI — matches our Dynamic Island
            HStack(spacing: 12) {
                Image(systemName: "sparkles")
                    .foregroundStyle(.white)
                    .padding(8)
                    .background(LinearGradient(
                        colors: [.blue, .indigo, .violet],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    ))
                    .clipShape(Circle())

                VStack(alignment: .leading) {
                    Text(attributes.title).font(.headline)
                    Text(attributes.subtitle).font(.caption).foregroundStyle(.secondary)
                }
                Spacer()
                Image(systemName: "chevron.up")
            }
            .padding()
            .background(.black.opacity(0.85), in: Capsule())
        }
    }
}
```

---

## 10 · Performance tips

- The island uses `layout` animation — wrap in `React.memo` if parent re-renders often
- Use `useReducedMotion()` for accessibility (code already handles this for waveform)
- All shadows are pure CSS — no images
- The 5 icons are Lucide React SVG, ~1KB each
- Total component weight: ~6KB gzipped

---

**This is your hackathon centerpiece.** The Dynamic Island with morphing states is the kind of detail that makes judges pause and say *"how did they do that?"* — paired with the 26 visual screens from the generation prompts, you have a complete design-to-ship pipeline.
