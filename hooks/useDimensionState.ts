import { useCallback, useEffect, useRef, useState } from 'react';
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

type AgentStateData = Partial<DimensionState> & {
  current?: string;
};

const loadStateFromStorage = (): DimensionState | null => {
  try {
    const savedState = localStorage.getItem(STORAGE_KEY);
    return savedState ? JSON.parse(savedState) : null;
  } catch (error) {
    console.error('[DimensionState] Error loading from localStorage:', error);
    return null;
  }
};

const saveStateToStorage = (state: DimensionState): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('[DimensionState] Error saving to localStorage:', error);
  }
};

export function useDimensionState() {
  const [dimensionState, setDimensionState] = useState<DimensionState | null>(loadStateFromStorage);
  const [isCompleted, setIsCompleted] = useState(false);
  const room = useRoomContext();
  const handlerRegistered = useRef(false);

  const reset = useCallback(() => {
    setDimensionState(null);
    setIsCompleted(false);
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

  useEffect(() => {
    if (dimensionState) {
      saveStateToStorage(dimensionState);
    }
  }, [dimensionState]);

  useEffect(() => {
    if (!room || handlerRegistered.current) return;

    const registerHandler = () => {
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
        handlerRegistered.current = true;
      } catch (error) {
        console.error('[DimensionState] Error registering handler:', error);
      }
    };

    if (room.state === 'connected') {
      registerHandler();
    } else {
      const handleConnected = () => registerHandler();
      room.on('connected', handleConnected);

      return () => {
        room.off('connected', handleConnected);
      };
    }

    return () => {
      handlerRegistered.current = false;
    };
  }, [room, processAgentData]);

  return { dimensionState, isCompleted, reset };
}
