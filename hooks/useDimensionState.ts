import { useEffect, useState } from 'react';
import { useRoomContext } from '@livekit/components-react';

interface DimensionState {
  Evolution: { scoring: number | null; justification: string };
  Outcome: { scoring: number | null; justification: string };
  Leverage: { scoring: number | null; justification: string };
  Sponsorship: { scoring: number | null; justification: string };
  Coverage: { scoring: number | null; justification: string };
  Alignment: { scoring: number | null; justification: string };
  current: string;
}

export function useDimensionState() {
  const [dimensionState, setDimensionState] = useState<DimensionState | null>(null);
  const room = useRoomContext();

  useEffect(() => {
    console.log('[DimensionState] useEffect', room);
    if (!room) return;

    // Función para procesar datos recibidos
    const processData = (data: any) => {
      try {
        console.log('[DimensionState] Processing data:', data);
        
        // Verificar si el dato contiene información de dimensiones
        if (data && typeof data === 'object' && data.current) {
          setDimensionState(data as DimensionState);
          console.log('[DimensionState] Updated dimension state:', data);
        }
      } catch (error) {
        console.error('[DimensionState] Error processing data:', error);
      }
    };

    // Registrar handler para recibir datos de dimensiones
    const registerDimensionHandler = () => {
      try {
        // Registrar handler para el topic 'agent-state-update'
        room.registerTextStreamHandler('agent-state-update', async (reader, participantInfo) => {
          try {
            const text = await reader.readAll();
            console.log(`[DimensionState] Received text from ${participantInfo.identity}: ${text}`);
            
            // Parsear el JSON recibido
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

    // Registrar el handler cuando el room esté disponible
    if (room.state === 'connected') {
      registerDimensionHandler();
    } else {
      // Esperar a que el room se conecte
      const handleConnected = () => {
        registerDimensionHandler();
      };
      
      room.on('connected', handleConnected);
      
      return () => {
        room.off('connected', handleConnected);
      };
    }

    return () => {
      // Cleanup: remover el handler si es necesario
      try {
        // Nota: LiveKit no tiene un método directo para remover handlers
        // pero se limpiarán automáticamente cuando el room se desconecte
        console.log('[DimensionState] Cleanup: handler will be removed on room disconnect');
      } catch (error) {
        console.error('[DimensionState] Error during cleanup:', error);
      }
    };
  }, [room]);

  return { dimensionState };
} 