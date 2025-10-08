'use client';

import React, { type RefObject, useRef } from 'react';
import { cn } from '@/lib/utils';

export function useAutoScroll(scrollContentContainerRef: RefObject<Element | null>) {
  const scrollToBottom = () => {
    const { scrollingElement } = document;
    if (scrollingElement) {
      scrollingElement.scrollTo({
        top: scrollingElement.scrollHeight,
        behavior: 'smooth'
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
    const scrollContentRef = useRef<HTMLDivElement>(null);
    const { scrollToBottom } = useAutoScroll(scrollContentRef);

    // Expose scrollToBottom function to parent component
    React.useImperativeHandle(ref, () => ({
      scrollToBottom
    }), [scrollToBottom]);

    return (
      <div ref={scrollContentRef} className={cn('flex flex-col justify-end', className)} {...props}>
        {children}
      </div>
    );
  }
);
