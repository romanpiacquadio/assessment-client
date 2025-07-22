'use client';

import { motion } from 'motion/react';
import { useDimensionState } from '@/hooks/useDimensionState';
import { cn } from '@/lib/utils';

const DIMENSIONS = ['Evolution', 'Outcome', 'Leverage', 'Sponsorship', 'Coverage', 'Alignment'];

interface DimensionDisplayProps {
  isAudioMode?: boolean;
}

export function DimensionDisplay({ isAudioMode = false }: DimensionDisplayProps) {
  const { dimensionState } = useDimensionState();
  console.log('dimensionState', dimensionState);

  if (!dimensionState) {
    return null;
  }

  // Mostrar siempre, pero con diferentes estilos según el modo

  // Calcular progreso
  const currentIndex = DIMENSIONS.indexOf(dimensionState.current);
  const progress = currentIndex >= 0 ? ((currentIndex + 1) / DIMENSIONS.length) * 100 : 0;
  const remainingDimensions = DIMENSIONS.length - (currentIndex + 1);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'fixed left-1/2 z-50 -translate-x-1/2 transform',
        isAudioMode
          ? 'top-16' // Posición más alta para modo voz (arriba del waveform)
          : 'top-4' // Posición normal para modo texto
      )}
    >
      <div
        className={cn(
          'bg-background/90 border-border rounded-lg border shadow-lg backdrop-blur-sm',
          isAudioMode
            ? 'min-w-[280px] px-3 py-2' // Versión más pequeña para modo voz
            : 'min-w-[320px] px-4 py-3' // Versión completa para modo texto
        )}
      >
        {/* Información de la dimensión actual */}
        <div className="mb-2 flex items-center gap-2">
          <div className="bg-primary h-2 w-2 animate-pulse rounded-full" />
          <span className="foreground text-sm font-medium">
            Current dimension:{' '}
            <span className="text-primary font-semibold">{dimensionState.current}</span>
          </span>
        </div>

        {/* Barra de progreso - Solo en modo texto */}
        {!isAudioMode && (
          <>
            <div className="mb-2">
              <div className="mb-1 flex items-center justify-between">
                <span className="muted-foreground text-xs">Progress</span>
                <span className="muted-foreground text-xs">
                  {currentIndex + 1} of {DIMENSIONS.length}
                </span>
              </div>
              <div className="bg-muted h-2 w-full rounded-full">
                <motion.div
                  className="bg-primary h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
              </div>
            </div>

            {/* Message of remaining dimensions */}
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
          </>
        )}

        {/* Versión minimalista para modo voz */}
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