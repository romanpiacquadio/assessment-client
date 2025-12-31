'use client';

import { Brain, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

interface AnalysisStatusEvaluationProps {
  className?: string;
  partialFeedbackDimension: string | null;
}

export function AnalysisStatusEvaluation({
  className,
  partialFeedbackDimension,
}: AnalysisStatusEvaluationProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -20 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={cn(
        'relative overflow-hidden rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 shadow-lg dark:border-blue-800 dark:from-blue-950/50 dark:to-indigo-950/50',
        className
      )}
    >
      {/* Background animated elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-4 -right-4 h-32 w-32 rounded-full bg-blue-200/30 dark:bg-blue-800/20"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-indigo-200/30 dark:bg-indigo-800/20"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.4, 0.7, 0.4],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 0.5,
          }}
        />
      </div>

      {/* Main content */}
      <div className="relative z-10 flex items-start gap-4" id="analysis-status-evaluation">
        {/* Icon with animation */}
        <div className="relative">
          <motion.div
            className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg"
            animate={{
              rotate: [0, 360],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'linear',
            }}
          >
            <Brain className="h-6 w-6" />
          </motion.div>

          {/* Orbiting sparkles */}
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="absolute inset-0 flex items-center justify-center"
              animate={{
                rotate: [0, 360],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'linear',
                delay: i * 0.5,
              }}
            >
              <motion.div
                className="absolute h-2 w-2 rounded-full bg-yellow-400"
                style={{
                  top: '-8px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                }}
                animate={{
                  scale: [0.5, 1, 0.5],
                  opacity: [0.3, 1, 0.3],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: i * 0.3,
                }}
              />
            </motion.div>
          ))}
        </div>

        {/* Title and description indicators */}
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <motion.h3
              className="text-lg font-semibold text-blue-900 dark:text-blue-100"
              animate={{
                opacity: [0.8, 1, 0.8],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              Analyzing Dimension: {partialFeedbackDimension}
            </motion.h3>
            <Sparkles className="h-4 w-4 text-yellow-500" />
          </div>

          <p className="mb-2 text-sm text-blue-700 dark:text-blue-300">
            Processing your responses for the dimension:{' '}
            <span className="font-medium text-blue-900 dark:text-blue-100">
              {partialFeedbackDimension}
            </span>
          </p>

          {/* Progress point indicator */}
          <div className="mb-2 flex items-center gap-2">
            <div className="flex gap-1">
              {[0, 1, 2, 3, 4].map((i) => (
                <motion.div
                  key={i}
                  className="h-1.5 w-1.5 rounded-full bg-blue-400"
                  animate={{
                    scale: [0.8, 1.2, 0.8],
                    opacity: [0.4, 1, 0.4],
                  }}
                  transition={{
                    duration: 1.2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: i * 0.15,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
