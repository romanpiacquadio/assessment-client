import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  type ReceivedChatMessage,
  type TextStreamData,
  useChat,
  useRoomContext,
  useTranscriptions,
} from '@livekit/components-react';
import { historyToChatMessage, transcriptionToChatMessage } from '@/lib/utils';

interface TextStreamReader {
  readAll(): Promise<string>;
}

export default function useChatAndTranscription() {
  const transcriptions: TextStreamData[] = useTranscriptions();
  const chat = useChat();
  const room = useRoomContext();

  const [historicalMessages, setHistoricalMessages] = useState<ReceivedChatMessage[]>([]);
  const [localHistoricalMessages, setLocalHistoricalMessages] = useState<ReceivedChatMessage[]>([]);
  const [isHistoryLoaded, setIsHistoryLoaded] = useState(false);

  // Reset state when room disconnects
  useEffect(() => {
    if (!room) return;

    const handleDisconnected = () => {
      setIsHistoryLoaded(false);
      setHistoricalMessages([]);
    };

    room.on('disconnected', handleDisconnected);

    return () => {
      room.off('disconnected', handleDisconnected);
    };
  }, [room]);

  useEffect(() => {
    if (!room || isHistoryLoaded) return;

    const handleHistoryBackfill = async (reader: TextStreamReader) => {
      try {
        const text = await reader.readAll();
        const history = JSON.parse(text);

        if (Array.isArray(history)) {
          const parsed: ReceivedChatMessage[] = history.reduce((acc, item) => {
            if (item.role === 'system') return acc;
            acc.push(historyToChatMessage(item, room));
            return acc;
          }, [] as ReceivedChatMessage[]);

          setHistoricalMessages(parsed);
        }
      } catch (error) {
        console.error('[HISTORIAL] Error al parsear el historial de chat:', error);
      }
      setIsHistoryLoaded(true);
    };

    room.registerTextStreamHandler('chat-history-backfill', handleHistoryBackfill);

    return () => {
      try {
        room.unregisterTextStreamHandler('chat-history-backfill');
      } catch (error) {
        console.log(error);
      }
    };
  }, [room, isHistoryLoaded]);

  const mergedMessages = useMemo(() => {
    const merged: Array<ReceivedChatMessage> = [
      ...historicalMessages,
      ...transcriptions.map((transcription) => transcriptionToChatMessage(transcription, room)),
      ...chat.chatMessages,
    ];
    return merged.sort((a, b) => {
      const timeDiff = a.timestamp - b.timestamp;
      const timeThreshold = 1000;

      // If timestamps are < 1 second, use secondary sorting by message origin
      if (Math.abs(timeDiff) < timeThreshold) {
        const aIsUser = a.from?.isLocal ?? false;
        const bIsUser = b.from?.isLocal ?? false;

        // User messages should come before agent messages when timestamps are close
        if (aIsUser && !bIsUser) return -1;
        if (!aIsUser && bIsUser) return 1;
      }

      // Otherwise, sort by timestamp
      return timeDiff;
    });
  }, [historicalMessages, transcriptions, chat.chatMessages, room]);

  // Keep messages in local even when the room is disconnected
  const localMergedMessages = useMemo(() => {
    if (mergedMessages.length >= localHistoricalMessages.length) {
      setLocalHistoricalMessages(mergedMessages);
      return mergedMessages;
    }
    return localHistoricalMessages;
  }, [mergedMessages]);

  const getAgentIdentity = useCallback(() => {
    if (!room) return null;
    const agent = Array.from(room.remoteParticipants.values())[0];
    return agent?.identity || null;
  }, [room]);

  // Send RPC to toggle output mode (voice/text)
  const sendToggleOutput = useCallback(
    async (payload: string) => {
      if (!room) {
        console.warn('[LiveKit] No room context available for sendToggleOutput');
        return;
      }

      const agentIdentity = getAgentIdentity();
      if (!agentIdentity) {
        console.warn('[LiveKit] No agent identity found for performRpc');
        return;
      }

      try {
        await room.localParticipant.performRpc({
          destinationIdentity: agentIdentity,
          method: 'toggle_output',
          payload,
        });
      } catch (error) {
        console.error('[LiveKit] Error sending toggle_output RPC:', error);
      }
    },
    [room, getAgentIdentity]
  );

  // Enviar un RPC para cambiar el modo de input (audio on/off)
  const sendToggleInput = useCallback(
    async (payload: string) => {
      if (!room) {
        console.warn('[LiveKit] No room context available for sendToggleInput');
        return;
      }

      const agentIdentity = getAgentIdentity();
      if (!agentIdentity) {
        console.warn('[LiveKit] No agent identity found for performRpc');
        return;
      }

      try {
        await room.localParticipant.performRpc({
          destinationIdentity: agentIdentity,
          method: 'toggle_input',
          payload,
        });
      } catch (error) {
        console.error('[LiveKit] Error sending toggle_input RPC:', error);
      }
    },
    [room, getAgentIdentity]
  );

  return {
    messages: mergedMessages,
    send: chat.send,
    sendToggleOutput,
    sendToggleInput,
    isHistoryLoaded,
    localMessages: localMergedMessages,
  };
}
