'use client';

import { motion } from 'motion/react';
import { CheckCircle } from 'lucide-react';
import { useDimensionStateContext } from '@/hooks/useDimensionStateContext';
import { cn } from '@/lib/utils';

const DIMENSIONS = ['Evolution', 'Outcome', 'Leverage', 'Sponsorship', 'Coverage', 'Alignment'];

interface DimensionDisplayProps {
  isAudioMode?: boolean;
}

export function DimensionDisplay({ isAudioMode = false }: DimensionDisplayProps) {
  const { dimensionState } = useDimensionStateContext();

  if (!dimensionState) {
    return null;
  }

  // Calculate progress
  const currentIndex = DIMENSIONS.indexOf(dimensionState.current);
  const progress = currentIndex >= 0 ? ((currentIndex + 1) / DIMENSIONS.length) * 100 : 0;
  const remainingDimensions = DIMENSIONS.length - (currentIndex + 1);
  const isCompleted = dimensionState.current === 'COMPLETED';

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'fixed left-1/2 z-50 -translate-x-1/2 transform',
        isAudioMode ? 'top-16' : 'top-4'
      )}
    >
      <div
        className={cn(
          'bg-background/90 border-border rounded-lg border shadow-lg backdrop-blur-sm',
          isAudioMode ? 'min-w-[280px] px-3 py-2' : 'min-w-[320px] px-4 py-3'
        )}
      >
        {/* Current dimension info */}
        <div className="mb-2 flex items-center gap-2">
          {isCompleted ? (
            <CheckCircle className="h-4 w-4 text-green-500" />
          ) : (
            <div className="bg-primary h-2 w-2 animate-pulse rounded-full" />
          )}
          <span className="foreground text-sm font-medium">
            {isCompleted ? (
              <span className="font-semibold text-green-500">COMPLETED</span>
            ) : (
              <>
                Current dimension:{' '}
                <span className="text-primary font-semibold">{dimensionState.current}</span>
              </>
            )}
          </span>
        </div>

        {/* Progress bar - Text mode only */}
        {!isAudioMode && (
          <>
            <div className="mb-2">
              <div className="mb-1 flex items-center justify-between">
                <span className="muted-foreground text-xs">
                  {isCompleted ? 'Assessment Complete' : 'Progress'}
                </span>
              </div>
              <div className="bg-muted h-2 w-full rounded-full">
                <motion.div
                  className={cn(
                    'h-2 rounded-full',
                    isCompleted ? 'bg-green-500' : 'bg-primary'
                  )}
                  initial={{ width: 0 }}
                  animate={{
                    width: isCompleted ? '100%' : `${progress}%`,
                  }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
              </div>
            </div>

            {!isCompleted && (
              <div className="flex items-center justify-between">
                <span className="muted-foreground text-xs">
                  {remainingDimensions > 0
                    ? `${remainingDimensions} dimension${remainingDimensions > 1 ? 's' : ''} remaining`
                    : 'Last dimension!'}
                </span>
                <div className="flex gap-1">
                  {DIMENSIONS.map((dimension, index) => (
                    <div
                      key={dimension}
                      className={`h-2 w-2 rounded-full ${
                        index <= currentIndex ? 'bg-primary' : 'bg-muted'
                      }`}
                      title={dimension}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Audio mode - minimalist version */}
        {isAudioMode && (
          <div className="flex items-center justify-between">
            <span className="muted-foreground text-xs">
              {currentIndex + 1} of {DIMENSIONS.length}
            </span>
            <div className="flex gap-1">
              {DIMENSIONS.map((dimension, index) => (
                <div
                  key={dimension}
                  className={`h-1.5 w-1.5 rounded-full ${
                    index <= currentIndex ? 'bg-primary' : 'bg-muted'
                  }`}
                  title={dimension}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
