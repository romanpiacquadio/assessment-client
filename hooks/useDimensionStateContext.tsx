'use client';

import React, { ReactNode, createContext, useContext } from 'react';
import { useDimensionState } from './useDimensionState';

interface DimensionStateContextType {
  dimensionState: any;
  isCompleted: boolean;
  reset: () => void;
}

const DimensionStateContext = createContext<DimensionStateContextType | null>(null);

interface DimensionStateProviderProps {
  children: ReactNode;
}

export function DimensionStateProvider({ children }: DimensionStateProviderProps) {
  const dimensionStateData = useDimensionState();

  return (
    <DimensionStateContext.Provider value={dimensionStateData}>
      {children}
    </DimensionStateContext.Provider>
  );
}

export function useDimensionStateContext() {
  const context = useContext(DimensionStateContext);
  if (!context) {
    throw new Error('useDimensionStateContext must be used within a DimensionStateProvider');
  }
  return context;
}
