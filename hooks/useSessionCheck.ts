import { useCallback, useEffect, useState } from 'react';

interface SessionCheckResult {
  hasSession: boolean;
  sessionData: any;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useSessionCheck(): SessionCheckResult {
  const [hasSession, setHasSession] = useState(false);
  const [sessionData, setSessionData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkSession = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/check-session', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || 'Failed to check session');
      }

      const result = await response.json();
      setHasSession(result.hasSession);
      setSessionData(result.sessionData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error checking session:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, []);

  // Expose the checkSession function so it can be called manually
  return {
    hasSession,
    sessionData,
    isLoading,
    error,
    refetch: checkSession,
  };
}
