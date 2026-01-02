'use client';

import { useEffect, useRef } from 'react';
import { useRoomContext } from '@livekit/components-react';
import { showInactivityToast } from '@/components/inactivity-toast';
import { InactivityTimeoutNotification } from '@/lib/types';

/**
 * Hook listens to inactivity timeout notifications
 * and shows an alert to the user when the session is automatically closed.
 */
export function useInactivityTimeout(onSessionEnded?: () => void) {
  const room = useRoomContext();
  const handlerRegistered = useRef(false);

  useEffect(() => {
    if (!room) return;

    const registerHandler = () => {
      if (handlerRegistered.current) return;

      try {
        room.registerTextStreamHandler('inactivity-timeout-notification', async (reader) => {
          try {
            const text = await reader.readAll();
            const notification = JSON.parse(text) as InactivityTimeoutNotification;

            if (
              notification.type === 'inactivity_timeout' &&
              notification.status === 'session_ended'
            ) {
              // Show notification to the user
              showInactivityToast({
                title: 'Session Ended',
                description:
                  notification.message ||
                  'Your session has been automatically closed due to inactivity',
              });

              // Execute callback to clear the session state
              if (onSessionEnded) {
                onSessionEnded();
              }

              // Disconnect the session if still connected
              if (room.state === 'connected') {
                room.disconnect();
              }
            }
          } catch (error) {
            console.error('[InactivityTimeout] Error processing notification:', error);
          }
        });

        handlerRegistered.current = true;
      } catch (error) {
        console.error('[InactivityTimeout] Error registering handler:', error);
      }
    };

    const unregisterHandler = () => {
      try {
        room.unregisterTextStreamHandler('inactivity-timeout-notification');
      } catch (error) {
        console.error('[InactivityTimeout] Error unregistering handler:', error);
      }
      handlerRegistered.current = false;
    };

    if (room.state === 'connected') {
      registerHandler();
    }

    const handleConnected = () => registerHandler();
    const handleDisconnected = () => unregisterHandler();

    room.on('connected', handleConnected);
    room.on('disconnected', handleDisconnected);

    return () => {
      room.off('connected', handleConnected);
      room.off('disconnected', handleDisconnected);
      unregisterHandler();
    };
  }, [room, onSessionEnded]);
}
