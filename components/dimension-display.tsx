'use client';

import { CheckCircle } from 'lucide-react';
import { motion } from 'motion/react';
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
  const remainingDimensions = DIMENSIONS.length - currentIndex;
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
      <div className="bg-background/30 border-border min-w-[240px] rounded-lg border px-3 py-2 shadow-lg backdrop-blur-sm">
        {/* Current dimension info */}
        <div className="mb-2 flex items-center gap-2">
          {isCompleted ? (
            <CheckCircle className="h-4 w-4 text-green-500" />
          ) : (
            <div className="bg-primary h-2 w-2 animate-pulse rounded-full" />
          )}
          <span className="foreground text-xs font-medium">
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
              <div className="bg-muted relative h-2 w-full overflow-hidden rounded-full">
                {/* Completed sections in blue */}
                {currentIndex > 0 && (
                  <motion.div
                    className="bg-primary absolute left-0 h-2"
                    style={{
                      borderRadius: '9999px 0 0 9999px', // rounded left side
                    }}
                    initial={{ width: 0 }}
                    animate={{
                      width: `${(currentIndex / DIMENSIONS.length) * 100}%`,
                    }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                  />
                )}
                {/* Current section in orange (pulsing) */}
                {!isCompleted && (
                  <motion.div
                    className="absolute h-2 animate-pulse bg-orange-500"
                    style={{
                      left: `${(currentIndex / DIMENSIONS.length) * 100}%`,
                      width: `${(1 / DIMENSIONS.length) * 100}%`,
                      borderRadius:
                        currentIndex === 0
                          ? '9999px'
                          : currentIndex === DIMENSIONS.length - 1
                            ? '0 9999px 9999px 0'
                            : '0',
                    }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                )}
                {/* When completed, show full green bar */}
                {isCompleted && (
                  <motion.div
                    className="h-2 rounded-full bg-green-500"
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                  />
                )}
              </div>
            </div>

            {!isCompleted && (
              <div className="flex items-center justify-between">
                <span className="muted-foreground text-xs">
                  {remainingDimensions > 1
                    ? `${remainingDimensions} dimensions remaining`
                    : 'Last dimension!'}
                </span>
                <div className="flex gap-1">
                  {DIMENSIONS.map((dimension, index) => (
                    <div
                      key={dimension}
                      className={`h-2 w-2 rounded-full ${
                        index < currentIndex
                          ? 'bg-primary'
                          : index === currentIndex
                            ? 'animate-pulse bg-orange-500'
                            : 'bg-muted'
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
                    index < currentIndex
                      ? 'bg-primary'
                      : index === currentIndex
                        ? 'animate-pulse bg-orange-500'
                        : 'bg-muted'
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
