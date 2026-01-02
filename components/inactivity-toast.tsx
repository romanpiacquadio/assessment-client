'use client';

import { motion } from 'motion/react';
import { toast as sonnerToast } from 'sonner';
import { Clock, X } from '@phosphor-icons/react/dist/ssr';
import { Button } from './ui/button';

interface InactivityToastProps {
  id: string | number;
  title: string;
  description: string;
}

let inactivityToastId: string | number | null = null;

export function showInactivityToast(toast: Omit<InactivityToastProps, 'id'>) {
  inactivityToastId = sonnerToast.custom(
    (id) => <InactivityToast id={id} title={toast.title} description={toast.description} />,
    {
      duration: Infinity,
      position: 'top-center',
      className: 'w-full max-w-md',
    }
  );
  return inactivityToastId;
}

export function dismissInactivityToast() {
  if (inactivityToastId !== null) {
    sonnerToast.dismiss(inactivityToastId);
    inactivityToastId = null;
  }
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
      <div className="border-destructive bg-destructive text-destructive-foreground relative w-full rounded-lg border-2 px-4 py-3 shadow-lg">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex-shrink-0">
            <Clock weight="bold" className="size-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="mb-1.5 text-base font-semibold">{title}</div>
            <div className="text-sm leading-relaxed break-words whitespace-normal">
              {description}
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="hover:bg-destructive-foreground/10 text-destructive-foreground h-6 w-6 flex-shrink-0 rounded-full"
            onClick={() => {
              sonnerToast.dismiss(id);
              inactivityToastId = null;
            }}
            aria-label="Close notification"
          >
            <X weight="bold" className="size-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
