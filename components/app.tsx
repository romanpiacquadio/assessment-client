'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import { Room, RoomEvent } from 'livekit-client';
import { motion } from 'motion/react';
import { RoomAudioRenderer, RoomContext, StartAudio } from '@livekit/components-react';
import { toastAlert } from '@/components/alert-toast';
import { dismissInactivityToast } from '@/components/inactivity-toast';
import { SessionView } from '@/components/session-view';
import { Toaster } from '@/components/ui/sonner';
import { Welcome } from '@/components/welcome';
import useConnectionDetails from '@/hooks/useConnectionDetails';
import { DimensionStateProvider } from '@/hooks/useDimensionStateContext';
import { useInactivityTimeout } from '@/hooks/useInactivityTimeout';
import type { AppConfig, DimensionState } from '@/lib/types';

const MotionSessionView = motion.create(SessionView);
const MotionWelcome = motion.create(Welcome);

interface AppProps {
  appConfig: AppConfig;
}

export function App({ appConfig }: AppProps) {
  const [sessionStarted, setSessionStarted] = React.useState(false);
  const [sessionViewVisible, setSessionViewVisible] = React.useState(false);
  const [shouldMountRoomComponent, setShouldMountRoomComponent] = React.useState(false);
  const { supportsChatInput, supportsVideoInput, supportsScreenShare, startButtonText } = appConfig;
  const searchParams = useSearchParams();
  const shouldResume = searchParams.get('resume') === 'true';

  // Check if there's a completed assessment in localStorage to auto-resume
  React.useEffect(() => {
    if (shouldResume && typeof window !== 'undefined' && !sessionStarted) {
      try {
        const savedState = localStorage.getItem('maturity-model-state');
        if (savedState) {
          const dimensionState: DimensionState = JSON.parse(savedState);
          // If assessment is completed, start session immediately without showing Welcome
          if (dimensionState?.current === 'COMPLETED') {
            dismissInactivityToast();
            setSessionStarted(true);
            setSessionViewVisible(true);
            setShouldMountRoomComponent(true);
          }
        }
      } catch (error) {
        console.error('[App] Error checking localStorage for completed assessment:', error);
      }
    }
  }, [shouldResume, sessionStarted]);

  const capabilities = {
    supportsChatInput,
    supportsVideoInput,
    supportsScreenShare,
  };

  const { connectionDetails, refreshConnectionDetails } = useConnectionDetails();

  const room = React.useMemo(() => new Room(), []);

  React.useEffect(() => {
    const onDisconnected = () => {};
    const onMediaDevicesError = (error: Error) => {
      toastAlert({
        title: 'Encountered an error with your media devices',
        description: `${error.name}: ${error.message}`,
      });
    };
    room.on(RoomEvent.MediaDevicesError, onMediaDevicesError);
    room.on(RoomEvent.Disconnected, onDisconnected);
    return () => {
      room.off(RoomEvent.Disconnected, onDisconnected);
      room.off(RoomEvent.MediaDevicesError, onMediaDevicesError);
    };
  }, [room, refreshConnectionDetails]);

  React.useEffect(() => {
    // Check if assessment is completed - if so, don't connect to backend
    const isCompleted =
      typeof window !== 'undefined' &&
      (() => {
        try {
          const savedState = localStorage.getItem('maturity-model-state');
          if (savedState) {
            const dimensionState: DimensionState = JSON.parse(savedState);
            return dimensionState?.current === 'COMPLETED';
          }
        } catch {
          return false;
        }
        return false;
      })();

    // Only connect if session started, room is disconnected, we have connection details, and assessment is not completed
    if (sessionStarted && room.state === 'disconnected' && connectionDetails && !isCompleted) {
      Promise.all([
        room.connect(connectionDetails.serverUrl, connectionDetails.participantToken),
      ]).catch((error) => {
        toastAlert({
          title: 'There was an error connecting to the agent',
          description: `${error.name}: ${error.message}`,
        });
      });
    }
    return () => {
      // Only disconnect if room is actually connected
      if (room.state === 'connected' || room.state === 'connecting') {
        room.disconnect();
      }
    };
  }, [room, sessionStarted, connectionDetails]);

  const onStartCall = () => {
    dismissInactivityToast();
    setSessionStarted(true);
    setSessionViewVisible(true);
    setShouldMountRoomComponent(true);
  };

  const onSessionFinished = () => {
    setSessionViewVisible(false);
    setSessionStarted(false);
    setShouldMountRoomComponent(false);
    refreshConnectionDetails();
  };

  const isWelcomeDisabled = sessionViewVisible || sessionStarted;

  return (
    <>
      <div id="non-printable-app-container">
        {!isWelcomeDisabled && (
          <MotionWelcome
            key="welcome"
            startButtonText={startButtonText}
            onStartCall={onStartCall}
            disabled={isWelcomeDisabled}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, ease: 'linear', delay: 0.5 }}
          />
        )}

        {shouldMountRoomComponent && (
          <RoomContext.Provider value={room}>
            <DimensionStateProvider>
              <InactivityTimeoutHandler onSessionEnded={onSessionFinished} />
              <RoomAudioRenderer />
              <StartAudio label="Start Audio" />
              {/* --- */}
              <MotionSessionView
                key={room.name || 'default'}
                capabilities={capabilities}
                sessionStarted={sessionStarted}
                onSessionFinished={onSessionFinished}
                disabled={!sessionViewVisible}
                initial={{ opacity: 0 }}
                animate={{ opacity: sessionViewVisible ? 1 : 0 }}
                transition={{
                  duration: 0.5,
                  ease: 'linear',
                  delay: sessionViewVisible ? 0.5 : 0,
                }}
              />
            </DimensionStateProvider>
          </RoomContext.Provider>
        )}

        <Toaster />
      </div>
    </>
  );
}

function InactivityTimeoutHandler({ onSessionEnded }: { onSessionEnded: () => void }) {
  useInactivityTimeout(onSessionEnded);
  return null;
}
