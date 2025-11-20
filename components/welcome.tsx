import React from 'react';
import { CodeBlockIcon } from '@phosphor-icons/react/dist/ssr';
import { Button } from '@/components/ui/button';
import { useClearSession } from '@/hooks/useClearSession';
import { useSessionCheck } from '@/hooks/useSessionCheck';

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

  // Refetch session data when component becomes visible (only when disabled changes from true to false)
  React.useEffect(() => {
    if (!disabled) {
      refetch();
    }
  }, [disabled]); // Remove refetch from dependencies to prevent infinite loop

  const handleStartNewAssessment = async () => {
    try {
      await clearSession();
      // Clear local storage as well
      if (typeof window !== 'undefined') {
        localStorage.removeItem('maturity-model-state');
      }
      // Start the assessment directly instead of reloading
      onStartCall();
    } catch (err) {
      console.error('Error starting new assessment:', err);
    }
  };

  const handleResumeAssessment = () => {
    // If there's session data, load it into localStorage and start
    if (sessionData && typeof window !== 'undefined') {
      localStorage.setItem('maturity-model-state', JSON.stringify(sessionData.custom_state));
    }
    onStartCall();
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
          ? 'We found a previous assessment session. Would you like to resume or start fresh?'
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
            id="resume-assessment-button"
          >
            RESUME ASSESSMENT
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
