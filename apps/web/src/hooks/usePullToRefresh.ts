import { useState, useRef, useCallback } from 'react';

const PULL_THRESHOLD = 60;
const MAX_PULL = 120;

interface UsePullToRefreshOptions {
  onRefresh: () => Promise<void> | void;
  disabled?: boolean;
}

interface UsePullToRefreshReturn {
  pullDistance: number;
  isRefreshing: boolean;
  touchHandlers: {
    onTouchStart: (e: React.TouchEvent) => void;
    onTouchMove: (e: React.TouchEvent) => void;
    onTouchEnd: (e: React.TouchEvent) => void;
  };
}

export function usePullToRefresh({
  onRefresh,
  disabled = false,
}: UsePullToRefreshOptions): UsePullToRefreshReturn {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startY = useRef(0);
  const isPulling = useRef(false);
  const scrollTop = useRef(0);

  const onTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (disabled) return;
      // Only activate pull-to-refresh when scrolled to the top
      const scrollEl = e.currentTarget as HTMLElement;
      scrollTop.current = scrollEl.scrollTop;
      if (scrollEl.scrollTop > 0) return;

      startY.current = e.touches[0].clientY;
      isPulling.current = true;
    },
    [disabled],
  );

  const onTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (disabled || !isPulling.current || isRefreshing) return;
      // If the user scrolled down, ignore the pull
      if (scrollTop.current > 0) return;

      const currentY = e.touches[0].clientY;
      const diff = currentY - startY.current;

      // Only pull down, not up
      if (diff <= 0) {
        setPullDistance(0);
        return;
      }

      // Apply some resistance for a natural feel
      const eased = Math.min(diff * 0.4, MAX_PULL);
      setPullDistance(eased);
    },
    [disabled, isRefreshing],
  );

  const onTouchEnd = useCallback(
    async () => {
      if (disabled || !isPulling.current) return;

      isPulling.current = false;

      if (pullDistance >= PULL_THRESHOLD && !isRefreshing) {
        setIsRefreshing(true);
        setPullDistance(PULL_THRESHOLD); // Hold at threshold during refresh
        await onRefresh();
        setIsRefreshing(false);
        setPullDistance(0);
      } else {
        setPullDistance(0);
      }
    },
    [disabled, pullDistance, isRefreshing, onRefresh],
  );

  return {
    pullDistance,
    isRefreshing,
    touchHandlers: {
      onTouchStart,
      onTouchMove,
      onTouchEnd,
    },
  };
}
