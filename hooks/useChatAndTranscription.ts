import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  type ReceivedChatMessage,
  type TextStreamData,
  useChat,
  useRoomContext,
  useTranscriptions,
} from '@livekit/components-react';
import { useDimensionStateContext } from '@/hooks/useDimensionStateContext';
import {
  createChatMessageFromSerializable,
  historyToChatMessage,
  transcriptionToChatMessage,
} from '@/lib/utils';

interface TextStreamReader {
  readAll(): Promise<string>;
}

// Serializable format for localStorage
interface SerializableChatMessage {
  id: string;
  timestamp: number;
  message: string;
  role: 'user' | 'assistant';
}

const CHAT_HISTORY_STORAGE_KEY = 'maturity-model-chat-history';

export default function useChatAndTranscription() {
  const transcriptions: TextStreamData[] = useTranscriptions();
  const chat = useChat();
  const room = useRoomContext();
  const { dimensionState } = useDimensionStateContext();

  const [historicalMessages, setHistoricalMessages] = useState<ReceivedChatMessage[]>([]);
  const [localHistoricalMessages, setLocalHistoricalMessages] = useState<ReceivedChatMessage[]>([]);
  const [isHistoryLoaded, setIsHistoryLoaded] = useState(false);
  const [savedHistoryLoaded, setSavedHistoryLoaded] = useState(false);

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

  // Load chat history from localStorage or backend
  useEffect(() => {
    if (!room || isHistoryLoaded) return;

    const isCompleted = dimensionState?.current === 'COMPLETED';

    // Function to load from localStorage
    const loadFromLocalStorage = (): boolean => {
      if (!isCompleted || !room) return false;
      // For completed assessments, we don't need the room to be connected
      // We can load messages even if room is not connected

      try {
        const savedHistory = localStorage.getItem(CHAT_HISTORY_STORAGE_KEY);
        if (savedHistory) {
          const parsed: SerializableChatMessage[] = JSON.parse(savedHistory);

          // Convert serializable messages back to ReceivedChatMessage
          // Use createChatMessageFromSerializable which doesn't require room connection
          const restoredMessages: ReceivedChatMessage[] = parsed.map((msg) => {
            return createChatMessageFromSerializable(msg, room);
          });

          setHistoricalMessages(restoredMessages);
          setIsHistoryLoaded(true);
          return true; // Successfully loaded
        }
      } catch (error) {
        console.error('[ChatHistory] Error loading chat history from localStorage:', error);
      }
      return false;
    };

    // If assessment is completed, try to load from localStorage
    // For completed assessments, we don't need to wait for room connection
    if (isCompleted) {
      if (loadFromLocalStorage()) {
        return; // Successfully loaded, don't register backend handler
      }
    }

    // For non-completed assessments, use backend handler
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
        console.error('[HISTORIAL] Error parsing chat history:', error);
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
  }, [room, isHistoryLoaded, dimensionState]);

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
  }, [mergedMessages, localHistoricalMessages]);

  // Save chat history to localStorage when assessment is completed
  useEffect(() => {
    const isCompleted = dimensionState?.current === 'COMPLETED';
    if (isCompleted && mergedMessages.length > 0 && !savedHistoryLoaded) {
      try {
        const serializableMessages: SerializableChatMessage[] = mergedMessages.map((msg) => ({
          id: msg.id,
          timestamp: msg.timestamp,
          message: msg.message,
          role: msg.from?.isLocal ? 'user' : 'assistant',
        }));
        localStorage.setItem(CHAT_HISTORY_STORAGE_KEY, JSON.stringify(serializableMessages));
        setSavedHistoryLoaded(true);
      } catch (error) {
        console.error('[ChatHistory] Error saving chat history to localStorage:', error);
      }
    }
  }, [dimensionState, mergedMessages, savedHistoryLoaded]);

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

  // Send RPC to toggle input mode (audio on/off)
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
