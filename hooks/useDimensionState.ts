import { useCallback, useEffect, useState } from 'react';
import { useRoomContext } from '@livekit/components-react';

const STORAGE_KEY = 'maturity-model-state';

interface DimensionState {
  Evolution: { scoring: number | null; justification: string };
  Outcome: { scoring: number | null; justification: string };
  current: string;
  final_report?: {
    executive_summary: string;
    recommendations: Array<{
      text: string;
      priority: 'High' | 'Medium' | 'Low';
    }>;
  };
}

export function useDimensionState() {
  const [dimensionState, setDimensionState] = useState<DimensionState | null>(() => {
    const savedState = localStorage.getItem(STORAGE_KEY);
    return savedState ? JSON.parse(savedState) : null;
  });
  const [isCompleted, setIsCompleted] = useState(false);
  const room = useRoomContext();

  const reset = useCallback(() => {
    setDimensionState(null);
    setIsCompleted(false);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  useEffect(() => {
    if (dimensionState) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dimensionState));
    }
  }, [dimensionState]);

  useEffect(() => {
    console.log('[DimensionState] useEffect', room);
    if (!room) return;

    const processData = (data: any) => {
      try {
        console.log('[DimensionState] Processing data:', data);
        
        if (data && typeof data === 'object') {
          console.log('[DimensionState] data.current:', data.current);
          if (data.current === 'COMPLETED') {
            console.log('[DimensionState] Setting isCompleted to true');
            setIsCompleted(true);
          }
          const newState = data as DimensionState;
          console.log('[DimensionState] Setting new dimension state:', newState);
          setDimensionState(newState);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
          console.log('[DimensionState] Updated dimension state:', data);
        }
      } catch (error) {
        console.error('[DimensionState] Error processing data:', error);
      }
    };

    const registerDimensionHandler = () => {
      try {
        room.registerTextStreamHandler('agent-state-update', async (reader, participantInfo) => {
          try {
            const text = await reader.readAll();
            console.log(`[DimensionState] Received text from ${participantInfo.identity}: ${text}`);
            
            const data = JSON.parse(text);
            processData(data);
          } catch (error) {
            console.error('[DimensionState] Error reading text stream:', error);
          }
        });

        console.log('[DimensionState] Registered text stream handler for agent-state-update');
      } catch (error) {
        console.error('[DimensionState] Error registering text stream handler:', error);
      }
    };

    if (room.state === 'connected') {
      registerDimensionHandler();
    } else {
      const handleConnected = () => {
        registerDimensionHandler();
      };
      
      room.on('connected', handleConnected);
      
      return () => {
        room.off('connected', handleConnected);
      };
    }

    return () => {
      try {
        console.log('[DimensionState] Cleanup: handler will be removed on room disconnect');
      } catch (error) {
        console.error('[DimensionState] Error during cleanup:', error);
      }
    };
  }, [room]);

  console.log('[useDimensionState] Returning:', { dimensionState, isCompleted });

  return { dimensionState, isCompleted, reset };
}
