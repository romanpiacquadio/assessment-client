'use client';

import { motion } from 'motion/react';
import { useDimensionState } from '@/hooks/useDimensionState';

export function DimensionDisplay() {
  const { dimensionState } = useDimensionState();
  console.log('dimensionState', dimensionState);

  if (!dimensionState) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50"
    >
      <div className="bg-background/90 backdrop-blur-sm border border-border rounded-lg px-4 py-2 shadow-lg">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
          <span className="text-sm font-medium text-foreground">
            Current dimension: <span className="text-primary font-semibold">{dimensionState.current}</span>
          </span>
        </div>
      </div>
    </motion.div>
  );
} 