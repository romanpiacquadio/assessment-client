'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export function useAutoScroll() {
  const scrollToBottom = () => {
    const { scrollingElement } = document;
    if (scrollingElement) {
      scrollingElement.scrollTo({
        top: scrollingElement.scrollHeight,
        behavior: 'smooth',
      });
    }
  };

  return { scrollToBottom };
}
interface ChatProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  className?: string;
}

export const ChatMessageView = React.forwardRef<{ scrollToBottom: () => void }, ChatProps>(
  ({ className, children, ...props }, ref) => {
    const { scrollToBottom } = useAutoScroll();

    // Expose scrollToBottom function to parent component
    React.useImperativeHandle(
      ref,
      () => ({
        scrollToBottom,
      }),
      [scrollToBottom]
    );

    return (
      <div className={cn('flex flex-col justify-end', className)} {...props}>
        {children}
      </div>
    );
  }
);

ChatMessageView.displayName = 'ChatMessageView';
