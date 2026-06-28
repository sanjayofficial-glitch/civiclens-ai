import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  Home,
  Map as MapIcon,
  Camera,
  Trophy,
  User,
  Sparkles,
  WifiOff,
  ChevronUp,
  RefreshCw,
  X,
  BarChart3
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

// ───────────────────────────────────────────────────────────
// Types
// ───────────────────────────────────────────────────────────
export type IslandState = 'idle' | 'scanning' | 'activity' | 'capture' | 'offline';

export interface DynamicIslandProps {
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
  type: 'spring' as const,
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
  forceState = null,
  activity = null,
  queuedCount = 0,
}: DynamicIslandProps) {
  const reduceMotion = useReducedMotion();
  const [state, setState] = useState<IslandState>('idle');
  const navigate = useNavigate();

  // Auto-switch state when activity prop changes
  useEffect(() => {
    if (forceState) {
      setState(forceState);
      return;
    }
    if (queuedCount > 0) setState('offline');
    else if (activity) setState('activity');
    else setState('idle');
  }, [forceState, activity, queuedCount]);

  // Don't render island in full-screen camera / capture mode
  if (state === 'capture') {
    return <CaptureIsland onClose={() => setState('idle')} onCapture={() => navigate('/report')} />;
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 flex justify-center px-4 pb-safe pt-2 pointer-events-none lg:hidden">
      <motion.div
        layout
        transition={islandSpring}
        className={cn(
          'pointer-events-auto relative flex items-center justify-between',
          'rounded-island bg-ink-900/94 backdrop-blur-2xl shadow-island',
          'border border-white/5',
          // Width morphs by state
          state === 'idle' && 'w-full max-w-md h-[72px] px-6',
          state === 'scanning' && 'w-full max-w-lg h-[60px] px-5',
          state === 'activity' && 'w-full max-w-lg h-[56px] px-4',
          state === 'offline' && 'w-full max-w-md h-[60px] px-5'
        )}
      >
        {/* TOP INNER HIGHLIGHT (iOS glass) */}
        <div className="absolute inset-x-6 top-0 h-px bg-white/10 rounded-full" />

        {/* ── IDLE STATE ────────────────────────────────── */}
        {state === 'idle' && (
          <IdleNav onCapture={() => navigate('/report')} />
        )}

        {/* ── SCANNING STATE ────────────────────────────── */}
        <AnimatePresence mode="wait">
          {state === 'scanning' && (
            <motion.div
              key="scanning"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex w-full items-center gap-3"
            >
              <motion.div
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 1.4, repeat: Infinity }}
                className="flex size-7 items-center justify-center rounded-full bg-cyan-500/20"
              >
                <Sparkles size={14} className="text-cyan-400" />
              </motion.div>
              <div className="flex h-6 flex-1 items-end gap-1">
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
                      ease: 'easeInOut',
                    }}
                    style={{ height: '100%', transformOrigin: 'bottom' }}
                  />
                ))}
              </div>
              <div className="flex flex-col items-end">
                <span className="text-sm font-semibold text-white">
                  Analyzing issue…
                </span>
                <span className="text-[10px] tabular-nums text-white/60">
                  97%
                </span>
              </div>
              <button
                onClick={() => setState('idle')}
                className="flex size-7 items-center justify-center rounded-full bg-white/10"
                aria-label="Cancel scanning"
              >
                <X size={14} className="text-white/80" />
              </button>
            </motion.div>
          )}

          {/* ── ACTIVITY STATE ──────────────────────────── */}
          {state === 'activity' && activity && (
            <motion.div
              key="activity"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex w-full items-center gap-3"
            >
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[image:var(--image-ai-gradient)]">
                <Sparkles size={14} className="text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-semibold text-white">
                  {activity.title}
                </p>
                <p className="truncate text-[11px] text-white/60">
                  {activity.subtitle}
                </p>
              </div>
              <button
                onClick={() => setState('idle')}
                className="text-white/60 hover:text-white"
                aria-label="Dismiss"
              >
                <ChevronUp size={16} />
              </button>
            </motion.div>
          )}

          {/* ── OFFLINE STATE ───────────────────────────── */}
          {state === 'offline' && (
            <motion.div
              key="offline"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex w-full items-center gap-3"
            >
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-amber-500/20">
                <WifiOff size={14} className="text-amber-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-semibold text-white">
                  Offline
                </p>
                <p className="text-[11px] text-white/60">
                  {queuedCount} queued · Will sync
                </p>
              </div>
              <button
                onClick={() => setState('idle')}
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
function IdleNav({ onCapture }: { onCapture: () => void }) {
  const location = useLocation();
  const navigate = useNavigate();

  const getIsActive = (path: string) => {
    if (path === '/home') {
      return location.pathname === '/home' || location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Left two icons */}
      <NavItem
        icon={Home}
        label="Home"
        active={getIsActive('/home')}
        onClick={() => navigate('/home')}
      />
      <NavItem
        icon={MapIcon}
        label="Map"
        active={getIsActive('/map')}
        onClick={() => navigate('/map')}
      />

      {/* Center elevated capture button */}
      <div className="relative flex items-center justify-center">
        <motion.div
          className="absolute inset-0 -m-3 rounded-full bg-[image:var(--image-ai-gradient)] opacity-40 blur-xl"
          animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 2.4, repeat: Infinity }}
        />
        <motion.button
          onClick={onCapture}
          whileTap={{ scale: 0.92 }}
          whileHover={{ scale: 1.05 }}
          transition={islandSpring}
          className="relative -my-4 flex size-14 items-center justify-center rounded-full border border-white/20 bg-[image:var(--image-ai-gradient)] shadow-[var(--shadow-glow)]"
          aria-label="Open AI Camera"
        >
          <Camera size={22} className="text-white" strokeWidth={2.2} />
        </motion.button>
      </div>

      {/* Right two icons */}
      <NavItem
        icon={BarChart3}
        label="Impact"
        active={getIsActive('/impact') || getIsActive('/leaderboard')}
        onClick={() => navigate('/impact')}
      />
      <NavItem
        icon={User}
        label="Profile"
        active={getIsActive('/profile')}
        onClick={() => navigate('/profile')}
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
      className="relative flex w-10 flex-col items-center justify-center gap-0.5"
      aria-label={label}
      aria-current={active ? 'page' : undefined}
    >
      {active && (
        <motion.div
          layoutId="nav-indicator"
          className="absolute -top-2 h-1 w-1 rounded-full bg-[image:var(--image-ai-gradient)]"
          transition={islandSpring}
        />
      )}
      <Icon
        size={22}
        strokeWidth={active ? 2.2 : 1.6}
        className={cn(
          'transition-colors duration-200',
          active ? 'text-white' : 'text-white/55'
        )}
      />
      <span
        className={cn(
          'text-[9px] font-semibold tracking-wide transition-colors',
          active ? 'text-white' : 'text-white/40'
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
function CaptureIsland({ onClose, onCapture }: { onClose: () => void, onCapture: () => void }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 flex justify-center px-3 pb-4 pt-2 pointer-events-none lg:hidden">
      <motion.div
        layout
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={islandSpring}
        className="pointer-events-auto relative flex h-[88px] w-full max-w-lg items-center justify-between rounded-[9999px] border border-white/5 bg-ink-900/94 px-5 shadow-[var(--shadow-island)] backdrop-blur-2xl"
      >
        <div className="absolute inset-x-6 top-0 h-px rounded-full bg-white/10" />

        {/* Gallery thumb */}
        <div className="size-10 rounded-xl border border-white/10 bg-white/10" />

        {/* Shutter button */}
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={onCapture}
          className="relative -my-3 flex size-[68px] items-center justify-center rounded-full"
          aria-label="Capture photo"
        >
          <motion.div
            className="absolute inset-0 rounded-full bg-[image:var(--image-ai-gradient)] opacity-40 blur-xl"
            animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.6, 0.4] }}
            transition={{ duration: 1.6, repeat: Infinity }}
          />
          <div className="relative size-full rounded-full bg-white p-[3px]">
            <div className="flex size-full items-center justify-center rounded-full bg-[image:var(--image-ai-gradient)]">
              <Camera size={28} className="text-white" strokeWidth={2.4} />
            </div>
          </div>
        </motion.button>

        {/* Flip camera */}
        <button
          onClick={onClose}
          className="flex size-10 items-center justify-center rounded-full bg-white/10"
          aria-label="Close camera"
        >
          <RefreshCw size={18} className="text-white/80" />
        </button>
      </motion.div>
    </div>
  );
}
