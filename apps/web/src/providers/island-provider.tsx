import React, { createContext, useContext, useState } from 'react';
import type { IslandState } from '@/components/layout/DynamicIsland';

interface IslandContextType {
  islandState: IslandState | null;
  setIslandState: (state: IslandState | null) => void;
  activity: { title: string; subtitle: string } | null;
  setActivity: (activity: { title: string; subtitle: string } | null) => void;
  queuedCount: number;
  setQueuedCount: (count: number) => void;
}

const IslandContext = createContext<IslandContextType | undefined>(undefined);

export function IslandProvider({ children }: { children: React.ReactNode }) {
  const [islandState, setIslandState] = useState<IslandState | null>(null);
  const [activity, setActivity] = useState<{ title: string; subtitle: string } | null>(null);
  const [queuedCount, setQueuedCount] = useState<number>(0);

  return (
    <IslandContext.Provider
      value={{
        islandState,
        setIslandState,
        activity,
        setActivity,
        queuedCount,
        setQueuedCount,
      }}
    >
      {children}
    </IslandContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useIsland() {
  const context = useContext(IslandContext);
  if (context === undefined) {
    throw new Error('useIsland must be used within an IslandProvider');
  }
  return context;
}
