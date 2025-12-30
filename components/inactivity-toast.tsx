'use client';

import { toast as sonnerToast } from 'sonner';
import { Clock, X } from '@phosphor-icons/react/dist/ssr';
import { motion } from 'motion/react';
import { Button } from './ui/button';

interface InactivityToastProps {
  id: string | number;
  title: string;
  description: string;
}

export function showInactivityToast(toast: Omit<InactivityToastProps, 'id'>) {
  return sonnerToast.custom(
    (id) => (
      <InactivityToast id={id} title={toast.title} description={toast.description} />
    ),
    {
      duration: Infinity,
      position: 'top-center',
      className: 'w-full max-w-md',
    }
  );
}

function InactivityToast({ id, title, description }: InactivityToastProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="w-full"
    >
      <div className="relative w-full rounded-lg border-2 border-destructive bg-destructive text-destructive-foreground px-4 py-3 shadow-lg">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            <Clock weight="bold" className="size-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-base font-semibold mb-1.5">
              {title}
            </div>
            <div className="text-sm leading-relaxed whitespace-normal break-words">
              {description}
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="flex-shrink-0 h-6 w-6 rounded-full hover:bg-destructive-foreground/10 text-destructive-foreground"
            onClick={() => sonnerToast.dismiss(id)}
            aria-label="Close notification"
          >
            <X weight="bold" className="size-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}