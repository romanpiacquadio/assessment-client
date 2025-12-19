import { useCallback, useEffect, useRef, useState } from 'react';
import { useRoomContext } from '@livekit/components-react';
import { AgentStateData, AnalysisNotification, DimensionState } from '@/lib/types';

const STORAGE_KEY = 'maturity-model-state';

const isBrowser = typeof window !== 'undefined';

const loadStateFromStorage = (): DimensionState | null => {
  if (!isBrowser) return null;

  try {
    const savedState = localStorage.getItem(STORAGE_KEY);
    return savedState ? JSON.parse(savedState) : null;
  } catch (error) {
    console.error('[DimensionState] Error loading from localStorage:', error);
    return null;
  }
};

const saveStateToStorage = (state: DimensionState): void => {
  if (!isBrowser) return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('[DimensionState] Error saving to localStorage:', error);
  }
};

export function useDimensionState() {
  const [dimensionState, setDimensionState] = useState<DimensionState | null>(loadStateFromStorage);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [analyzingDimension, setAnalyzingDimension] = useState<string | null>(null);
  const room = useRoomContext();
  const handlerRegistered = useRef(false);
  const analysisTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const reset = useCallback(() => {
    setDimensionState(null);
    setIsCompleted(false);
    setAnalyzingDimension(null);
    if (analysisTimeoutRef.current) {
      clearTimeout(analysisTimeoutRef.current);
      analysisTimeoutRef.current = null;
    }
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const processAgentData = useCallback((data: AgentStateData) => {
    if (!data || typeof data !== 'object') return;

    if (data.current === 'COMPLETED') {
      setIsCompleted(true);
    }

    const newState = data as DimensionState;
    setDimensionState(newState);
  }, []);

  const processAnalysisNotification = useCallback((notification: AnalysisNotification) => {
    if (notification.status === 'started') {
      // Clear any existing timeout
      if (analysisTimeoutRef.current) {
        clearTimeout(analysisTimeoutRef.current);
      }

      setAnalyzingDimension(notification.dimension);

      // Set 15-second timeout
      analysisTimeoutRef.current = setTimeout(() => {
        console.warn('[DimensionState] Analysis timeout after 15 seconds');
        setAnalyzingDimension(null);
        analysisTimeoutRef.current = null;
      }, 15000);
    } else if (notification.status === 'completed') {
      // Clear timeout and stop analyzing
      if (analysisTimeoutRef.current) {
        clearTimeout(analysisTimeoutRef.current);
        analysisTimeoutRef.current = null;
      }
      setAnalyzingDimension(null);
    }
  }, []);

  useEffect(() => {
    if (isBrowser) {
      const savedState = loadStateFromStorage();
      if (savedState) {
        setDimensionState(savedState);
      }
      setIsHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (dimensionState) {
      saveStateToStorage(dimensionState);
    }
  }, [dimensionState]);

  useEffect(() => {
    if (!room) return;

    const registerHandlers = () => {
      if (handlerRegistered.current) return;

      try {
        room.registerTextStreamHandler('agent-state-update', async (reader, participantInfo) => {
          try {
            const text = await reader.readAll();
            const data = JSON.parse(text) as AgentStateData;
            processAgentData(data);
          } catch (error) {
            console.error('[DimensionState] Error processing stream data:', error);
          }
        });

        room.registerTextStreamHandler('agent-analysis-notification', async (reader) => {
          try {
            const text = await reader.readAll();
            const notification = JSON.parse(text) as AnalysisNotification;
            if (notification.type === 'dimension_analysis') {
              processAnalysisNotification(notification);
            }
          } catch (error) {
            console.error('[DimensionState] Error processing analysis notification:', error);
          }
        });

        handlerRegistered.current = true;
      } catch (error) {
        console.error('[DimensionState] Error registering handler:', error);
      }
    };

    const unregisterHandlers = () => {
      try {
        room.unregisterTextStreamHandler('agent-state-update');
        room.unregisterTextStreamHandler('agent-analysis-notification');
      } catch (error) {
        console.error(error);
      }
      handlerRegistered.current = false;
    };

    // Register when connected
    if (room.state === 'connected') {
      registerHandlers();
    }

    const handleConnected = () => registerHandlers();
    const handleDisconnected = () => unregisterHandlers();

    room.on('connected', handleConnected);
    room.on('disconnected', handleDisconnected);

    return () => {
      room.off('connected', handleConnected);
      room.off('disconnected', handleDisconnected);
      unregisterHandlers();
    };
  }, [room, processAgentData, processAnalysisNotification]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (analysisTimeoutRef.current) {
        clearTimeout(analysisTimeoutRef.current);
      }
    };
  }, []);

  return { dimensionState, isCompleted, analyzingDimension, reset, isHydrated };
}
