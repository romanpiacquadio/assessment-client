import React from 'react';
import { useSearchParams } from 'next/navigation';
import { CodeBlockIcon } from '@phosphor-icons/react/dist/ssr';
import { Button } from '@/components/ui/button';
import { useClearSession } from '@/hooks/useClearSession';
import { useSessionCheck } from '@/hooks/useSessionCheck';
import type { DimensionState } from '@/lib/types';

interface WelcomeProps {
  disabled: boolean;
  startButtonText: string;
  onStartCall: () => void;
}

export const Welcome = ({
  disabled,
  startButtonText,
  onStartCall,
  ref,
}: React.ComponentProps<'div'> & WelcomeProps) => {
  const { hasSession, sessionData, isLoading, error, refetch } = useSessionCheck();
  const { clearSession, isClearing } = useClearSession();
  const searchParams = useSearchParams();
  const shouldResume = searchParams.get('resume') === 'true';

  // Check if assessment is completed
  const [isCompleted, setIsCompleted] = React.useState(false);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedState = localStorage.getItem('maturity-model-state');
        if (savedState) {
          const dimensionState: DimensionState = JSON.parse(savedState);
          setIsCompleted(dimensionState?.current === 'COMPLETED');
        } else if (sessionData?.custom_state) {
          const dimensionState = sessionData.custom_state as DimensionState;
          setIsCompleted(dimensionState?.current === 'COMPLETED');
        } else {
          setIsCompleted(false);
        }
      } catch {
        setIsCompleted(false);
      }
    }
  }, [sessionData]);

  const handleResumeAssessment = React.useCallback(() => {
    // If there's session data, load it into localStorage and start
    if (sessionData && typeof window !== 'undefined') {
      localStorage.setItem('maturity-model-state', JSON.stringify(sessionData.custom_state));
    }
    onStartCall();
  }, [sessionData, onStartCall]);

  // Refetch session data when component becomes visible (only when disabled changes from true to false)
  React.useEffect(() => {
    if (!disabled) {
      refetch();
    }
  }, [disabled]); // Remove refetch from dependencies to prevent infinite loop

  // Auto-resume when resume query parameter is present and we have session data or localStorage data
  React.useEffect(() => {
    if (shouldResume && !disabled && !isLoading) {
      // Check if we have session data from API or localStorage
      const hasLocalStorageData =
        typeof window !== 'undefined' && localStorage.getItem('maturity-model-state');

      if ((hasSession && sessionData) || hasLocalStorageData) {
        // If we have sessionData from API, use handleResumeAssessment to load it
        // Otherwise, if we only have localStorage data, just start the call directly
        if (sessionData) {
          handleResumeAssessment();
        } else if (hasLocalStorageData) {
          // Data is already in localStorage, just start the session
          onStartCall();
        }
      }
    }
  }, [
    shouldResume,
    disabled,
    isLoading,
    hasSession,
    sessionData,
    handleResumeAssessment,
    onStartCall,
  ]);

  const handleStartNewAssessment = async () => {
    try {
      await clearSession();
      // Clear local storage as well
      if (typeof window !== 'undefined') {
        localStorage.removeItem('maturity-model-state');
        localStorage.removeItem('maturity-model-chat-history');
      }
      // Start the assessment directly instead of reloading
      onStartCall();
    } catch (err) {
      console.error('Error starting new assessment:', err);
    }
  };

  if (isLoading) {
    return (
      <div
        ref={ref}
        inert={disabled}
        className="fixed inset-0 z-10 mx-auto flex h-svh flex-col items-center justify-center text-center"
      >
        <CodeBlockIcon size={64} className="mx-auto mb-4" />
        <h1 className="font-semibold">AI Maturity Assessment</h1>
        <p className="text-muted-foreground pt-1 font-medium">Checking for previous sessions...</p>
      </div>
    );
  }

  return (
    <div
      ref={ref}
      inert={disabled}
      className="fixed inset-0 z-10 mx-auto flex h-svh flex-col items-center justify-center text-center"
    >
      <CodeBlockIcon size={64} className="mx-auto mb-4" />
      <h1 className="font-semibold">AI Maturity Assessment</h1>
      <p className="text-muted-foreground max-w-prose pt-1 font-medium">
        {hasSession
          ? isCompleted
            ? 'We found a completed assessment. Would you like to view it or start a new one?'
            : 'We found a previous assessment session. Would you like to resume or start fresh?'
          : 'Start and our AI agent will guide you through.'}
        <br />
        Need to contact us? Visit our{' '}
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://cloudx.com/contact-us"
          className="underline underline-offset-4"
        >
          contact page
        </a>
        .
      </p>

      {hasSession ? (
        <div className="mt-12 flex flex-col gap-4 sm:flex-row sm:gap-6">
          <Button
            variant="primary"
            size="lg"
            onClick={handleResumeAssessment}
            className="w-64 font-mono"
            id={isCompleted ? 'view-completed-assessment-button' : 'resume-assessment-button'}
          >
            {isCompleted ? 'VIEW COMPLETED ASSESSMENT' : 'RESUME ASSESSMENT'}
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={handleStartNewAssessment}
            disabled={isClearing}
            className="w-64 font-mono"
            id="start-new-assessment-button"
          >
            {isClearing ? 'CLEARING...' : 'START NEW ASSESSMENT'}
          </Button>
        </div>
      ) : (
        <Button variant="primary" size="lg" onClick={onStartCall} className="mt-12 w-64 font-mono">
          {startButtonText}
        </Button>
      )}

      {error && <p className="mt-4 text-sm text-red-600">Error: {error}</p>}
    </div>
  );
};
