import { useState } from 'react';

interface ClearSessionResult {
  clearSession: () => Promise<void>;
  isClearing: boolean;
  error: string | null;
}

export function useClearSession(): ClearSessionResult {
  const [isClearing, setIsClearing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearSession = async () => {
    setIsClearing(true);
    setError(null);

    try {
      const response = await fetch('/api/clear-session', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || 'Failed to clear session');
      }

      const result = await response.json();
      console.log('Session cleared successfully:', result.message);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error clearing session:', err);
    } finally {
      setIsClearing(false);
    }
  };

  return {
    clearSession,
    isClearing,
    error,
  };
}
