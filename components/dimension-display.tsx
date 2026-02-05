'use client';

import { CheckCircle, XCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { useDimensionStateContext } from '@/hooks/useDimensionStateContext';
import { cn } from '@/lib/utils';

const DIMENSIONS = ['Evolution', 'Outcome', 'Leverage', 'Sponsorship', 'Coverage', 'Alignment'];

interface DimensionDisplayProps {
  isAudioMode?: boolean;
}

export function DimensionDisplay({ isAudioMode = false }: DimensionDisplayProps) {
  const { dimensionState, isHydrated } = useDimensionStateContext();

  if (!isHydrated || !dimensionState) {
    return null;
  }

  const isCompleted = dimensionState.current === 'COMPLETED';
  const isEndingByAgent = dimensionState.current === 'ENDING_BY_AGENT';

  const currentIndex = isEndingByAgent ? -1 : DIMENSIONS.indexOf(dimensionState.current);
  const remainingDimensions = isEndingByAgent ? 0 : DIMENSIONS.length - currentIndex;

  let lastCompletedIndex = -1;
  if (isEndingByAgent) {
    for (let i = DIMENSIONS.length - 1; i >= 0; i--) {
      if (
        dimensionState[DIMENSIONS[i]]?.scoring !== null &&
        dimensionState[DIMENSIONS[i]]?.scoring !== undefined
      ) {
        lastCompletedIndex = i;
        break;
      }
    }
  } else {
    lastCompletedIndex = currentIndex;
  }

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
        <div className="mb-2 flex items-center gap-2">
          {isCompleted ? (
            <CheckCircle className="h-4 w-4 text-green-500" />
          ) : isEndingByAgent ? (
            <XCircle className="h-4 w-4 text-gray-500" />
          ) : (
            <div className="bg-primary h-2 w-2 animate-pulse rounded-full" />
          )}
          <span className="foreground text-xs font-medium">
            {isCompleted ? (
              <span className="font-semibold text-green-500">COMPLETED</span>
            ) : isEndingByAgent ? (
              <span className="font-semibold text-gray-500">Assessment ended</span>
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
                  {isCompleted ? 'Assessment Complete' : isEndingByAgent ? '' : 'Progress'}
                </span>
              </div>
              <div className="bg-muted relative h-2 w-full overflow-hidden rounded-full">
                {isCompleted ? (
                  <motion.div
                    className="h-2 rounded-full bg-green-500"
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                  />
                ) : isEndingByAgent ? (
                  <>
                    {lastCompletedIndex >= 0 && (
                      <div
                        className="absolute left-0 h-2 rounded-full bg-gray-400"
                        style={{
                          width: `${((lastCompletedIndex + 1) / DIMENSIONS.length) * 100}%`,
                        }}
                      />
                    )}
                  </>
                ) : (
                  <>
                    {currentIndex > 0 && (
                      <motion.div
                        className="bg-primary absolute left-0 h-2"
                        style={{
                          borderRadius: '9999px 0 0 9999px',
                        }}
                        initial={{ width: 0 }}
                        animate={{
                          width: `${(currentIndex / DIMENSIONS.length) * 100}%`,
                        }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                      />
                    )}
                    {currentIndex >= 0 && (
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
                  </>
                )}
              </div>
            </div>

            {!isCompleted && (
              <div className="flex items-center justify-between">
                <span className="muted-foreground text-xs">
                  {isEndingByAgent
                    ? 'Assessment ended by agent'
                    : remainingDimensions > 1
                      ? `${remainingDimensions} dimensions remaining`
                      : 'Last dimension!'}
                </span>
                <div className="flex gap-1">
                  {DIMENSIONS.map((dimension, index) => {
                    const hasScoring =
                      dimensionState[dimension]?.scoring !== null &&
                      dimensionState[dimension]?.scoring !== undefined;
                    return (
                      <div
                        key={dimension}
                        className={`h-2 w-2 rounded-full ${
                          isEndingByAgent
                            ? hasScoring
                              ? 'bg-gray-400'
                              : 'bg-muted'
                            : index < currentIndex
                              ? 'bg-primary'
                              : index === currentIndex
                                ? 'animate-pulse bg-orange-500'
                                : 'bg-muted'
                        }`}
                        title={dimension}
                      />
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}

        {isAudioMode && (
          <div className="flex items-center justify-between">
            <span className="muted-foreground text-xs">
              {isEndingByAgent ? 'Assessment ended' : `${currentIndex + 1} of ${DIMENSIONS.length}`}
            </span>
            <div className="flex gap-1">
              {DIMENSIONS.map((dimension, index) => {
                const hasScoring =
                  dimensionState[dimension]?.scoring !== null &&
                  dimensionState[dimension]?.scoring !== undefined;
                return (
                  <div
                    key={dimension}
                    className={`h-1.5 w-1.5 rounded-full ${
                      isEndingByAgent
                        ? hasScoring
                          ? 'bg-gray-400'
                          : 'bg-muted'
                        : index < currentIndex
                          ? 'bg-primary'
                          : index === currentIndex
                            ? 'animate-pulse bg-orange-500'
                            : 'bg-muted'
                    }`}
                    title={dimension}
                  />
                );
              })}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
