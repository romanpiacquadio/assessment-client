'use client';

import * as React from 'react';
import { Room, RoomEvent } from 'livekit-client';
import { motion } from 'motion/react';
import { RoomAudioRenderer, RoomContext, StartAudio } from '@livekit/components-react';
import { toastAlert } from '@/components/alert-toast';
import { SessionView } from '@/components/session-view';
import { Toaster } from '@/components/ui/sonner';
import { Welcome } from '@/components/welcome';
import useConnectionDetails from '@/hooks/useConnectionDetails';
import { DimensionStateProvider } from '@/hooks/useDimensionStateContext';
import type { AppConfig } from '@/lib/types';

const MotionSessionView = motion.create(SessionView);
const MotionWelcome = motion.create(Welcome);

interface AppProps {
  appConfig: AppConfig;
}

export function App({ appConfig }: AppProps) {
  const [sessionStarted, setSessionStarted] = React.useState(false);
  const { supportsChatInput, supportsVideoInput, supportsScreenShare, startButtonText } = appConfig;

  const capabilities = {
    supportsChatInput,
    supportsVideoInput,
    supportsScreenShare,
  };

  const { connectionDetails, refreshConnectionDetails } = useConnectionDetails();

  const room = React.useMemo(() => new Room(), []);

  const handlerId = React.useRef(`audio-buffer-handler-${Date.now()}`);

  React.useEffect(() => {
    const cleanupTracks = async () => {
      await Promise.all([
        room.localParticipant.setMicrophoneEnabled(false),
        room.localParticipant.setCameraEnabled(false),
        room.localParticipant.setScreenShareEnabled(false),
      ]);
    };


    const registerAudioBufferHandler = () => {
      room.registerByteStreamHandler(`lk.agent.pre-connect-audio-buffer-${handlerId.current}`, 
        async (reader, participantId) => {
          try {
            // Procesar chunks incrementalmente
            for await (const chunk of reader) {
              // Aquí iría el procesamiento del buffer de audio
              console.log('Received audio buffer chunk');
            }
          } catch (error) {
            console.error('Error processing audio buffer:', error);
          }
        }
      );
    };

    const unregisterAudioBufferHandler = () => {
      try {
        room.unregisterByteStreamHandler(`lk.agent.pre-connect-audio-buffer-${handlerId.current}`);
      } catch (error) {
        console.error('Error unregistering audio buffer handler:', error);
      }
    };

    const onConnected = () => {
      registerAudioBufferHandler();
    };

    const onDisconnected = async () => {
      unregisterAudioBufferHandler();
      await cleanupTracks();
      setSessionStarted(false);
      refreshConnectionDetails();
    };

    const onMediaDevicesError = (error: Error) => {
      toastAlert({
        title: 'Encountered an error with your media devices',
        description: `${error.name}: ${error.message}`,
      });
    };

    const handleBeforeUnload = async () => {
      unregisterAudioBufferHandler();
      await cleanupTracks();
      room.disconnect();
    };

    room.on(RoomEvent.MediaDevicesError, onMediaDevicesError);
    room.on(RoomEvent.Connected, onConnected);
    room.on(RoomEvent.Disconnected, onDisconnected);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      room.off(RoomEvent.Connected, onConnected);
      room.off(RoomEvent.Disconnected, onDisconnected);
      room.off(RoomEvent.MediaDevicesError, onMediaDevicesError);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      unregisterAudioBufferHandler();
      cleanupTracks();
      room.disconnect();
    };
  }, [room, refreshConnectionDetails]);

  React.useEffect(() => {
    if (sessionStarted && room.state === 'disconnected' && connectionDetails) {
      const connectWithRetry = async (attempt = 1) => {
        try {
          await Promise.all([
            room.localParticipant.setMicrophoneEnabled(true, undefined, {
              preConnectBuffer: true,
            }),
            room.connect(connectionDetails.serverUrl, connectionDetails.participantToken),
          ]);
          // El handler se registrará automáticamente en el evento Connected
        } catch (error: unknown) {
          if (attempt <= 3) {
            const delay = Math.min(1000 * attempt, 5000);
            setTimeout(() => connectWithRetry(attempt + 1), delay);
          } else {
            const errorMessage = error instanceof Error 
              ? `${error.name}: ${error.message}`
              : 'Unknown connection error';
            toastAlert({
              title: 'There was an error connecting to the agent',
              description: errorMessage,
            });
          }
        }
      };

      connectWithRetry();
    }
    return () => {
      room.disconnect();
    };
  }, [room, sessionStarted, connectionDetails]);

  return (
    <>
      <MotionWelcome
        key="welcome"
        startButtonText={startButtonText}
        onStartCall={() => setSessionStarted(true)}
        disabled={sessionStarted}
        initial={{ opacity: 0 }}
        animate={{ opacity: sessionStarted ? 0 : 1 }}
        transition={{ duration: 0.5, ease: 'linear', delay: sessionStarted ? 0 : 0.5 }}
      />

      <RoomContext.Provider value={room}>
        <DimensionStateProvider>
          <RoomAudioRenderer />
          <StartAudio label="Start Audio" />
          {/* --- */}
          <MotionSessionView
            key={room.name || 'default'}
            capabilities={capabilities}
            sessionStarted={sessionStarted}
            disabled={!sessionStarted}
            initial={{ opacity: 0 }}
            animate={{ opacity: sessionStarted ? 1 : 0 }}
            transition={{
              duration: 0.5,
              ease: 'linear',
              delay: sessionStarted ? 0.5 : 0,
            }}
          />
        </DimensionStateProvider>
      </RoomContext.Provider>

      <Toaster />
    </>
  );
}
