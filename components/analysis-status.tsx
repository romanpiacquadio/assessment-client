'use client';

import { useEffect, useState } from 'react';
import { PopupButton } from 'react-calendly';
import { FileChartColumnIncreasing, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { useDimensionStateContext } from '@/hooks/useDimensionStateContext';
import { cn } from '@/lib/utils';
import { RadarChart } from './radar-chart';
import { Button } from './ui/button';

const DIMENSIONS = [
  'Evolution',
  'Outcome',
  'Leverage',
  'Sponsorship',
  'Coverage',
  'Alignment',
] as const;

interface AnalysisStatusProps {
  className?: string;
  isViewingPartialFeedback: boolean;
  partialFeedbackDimension: string | null;
  setPartialFeedbackDimension: (dimension: string | null) => void;
  onUserClosePartialFeedback: (isViewingPartialFeedback: boolean) => void;
}

export function AnalysisStatus({
  className,
  isViewingPartialFeedback,
  partialFeedbackDimension,
  setPartialFeedbackDimension,
  onUserClosePartialFeedback,
}: AnalysisStatusProps) {
  const { dimensionState } = useDimensionStateContext();
  const [rootElement, setRootElement] = useState<HTMLElement | null>(null);

  useEffect(() => {
    // In Next.js, there's no #root element. Use document.body as the root element for portals
    // This ensures the Calendly popup modal is rendered correctly in the DOM
    setRootElement(document.body);
  }, []);

  if (!isViewingPartialFeedback) {
    return null;
  }

  const chartData = {
    labels: [...DIMENSIONS],
    datasets: [
      {
        label: `${partialFeedbackDimension} Score`,
        data: DIMENSIONS.map((dimension) => dimensionState?.[dimension]?.scoring || 0),
        backgroundColor: 'rgba(99, 102, 241, 0.2)',
        borderColor: 'rgba(99, 102, 241, 1)',
        borderWidth: 2,
      },
    ],
  };

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
      <div className="relative z-10 flex items-start gap-4">
        {/* Icon with animation */}
        <div className="relative">
          <motion.div
            className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg"
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'linear',
            }}
          >
            <FileChartColumnIncreasing className="h-6 w-6" />
          </motion.div>
        </div>

        {/* Text content */}
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
              Analyzed Dimension: {partialFeedbackDimension}
            </motion.h3>
            <Sparkles className="h-4 w-4 text-yellow-500" />
          </div>

          <p className="mb-2 text-sm text-blue-700 dark:text-blue-300">
            Process completed and partial feedback generated for:{' '}
            <span className="font-medium text-blue-900 dark:text-blue-100">
              {partialFeedbackDimension}
            </span>
          </p>
        </div>
      </div>

      {/* Partial feedback overview */}
      <div>
        <div className="mb-8 rounded-lg border p-6">
          <h2 className="mb-4 text-xl font-semibold">{partialFeedbackDimension} Overview</h2>
          <div className="flex flex-col items-center justify-center gap-8">
            {/* Centered RadarChart */}
            <div className="flex w-2/5 items-center justify-center">
              <RadarChart data={chartData} />
            </div>
            {/* Recommendations */}
            <h2 className="text-l mb-4 font-semibold text-blue-900 dark:text-blue-100">
              Action Points for: {partialFeedbackDimension}
            </h2>
            <div className="flex w-full flex-1 flex-col justify-center">
              {dimensionState?.[partialFeedbackDimension ?? 'Evolution'].partial_feedback.map(
                (recommendation: string, index: number) => (
                  <div
                    key={index}
                    className="my-2 flex items-center justify-center rounded-lg bg-sky-200 px-4 py-2 text-center text-xs font-medium shadow-sm transition-all duration-200 hover:bg-sky-200 dark:bg-sky-900 dark:hover:bg-sky-800"
                    style={{
                      maxWidth: 700,
                      minWidth: 350,
                      marginTop: '0.2rem',
                      marginBottom: '0.2rem',
                      marginLeft: 'auto',
                      marginRight: 'auto',
                    }}
                  >
                    {recommendation}
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-20 mt-4 flex justify-end gap-2">
        {/* Button to continue the analysis with the next dimension */}
        <Button
          className="font:bg-green-500 rounded-md bg-green-500 px-4 py-2 text-xs font-bold text-white uppercase transition-colors hover:bg-green-600 active:bg-green-500"
          onClick={() => {
            onUserClosePartialFeedback(false);
            setPartialFeedbackDimension(null);
          }}
        >
          CONTINUE WITH NEXT DIMENSION
        </Button>

        {/* Button to contact CloudX team for support */}
        <Button
          asChild
          className="rounded-md bg-orange-500 px-4 py-2 text-xs font-bold text-white uppercase transition-colors hover:bg-orange-600 focus:bg-orange-500 active:bg-orange-500"
        >
          <a
            href="https://cloudx.com/contact-us"
            target="_blank"
            rel="noopener noreferrer"
          >
            CONTACT CLOUDX TEAM
          </a>
        </Button>
      </div>
    </motion.div>
  );
}
