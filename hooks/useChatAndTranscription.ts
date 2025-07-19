import { useEffect, useMemo } from 'react';
import {
  type ReceivedChatMessage,
  type TextStreamData,
  useChat,
  useRoomContext,
  useTranscriptions,
} from '@livekit/components-react';
import { transcriptionToChatMessage } from '@/lib/utils';

export default function useChatAndTranscription() {
  const transcriptions: TextStreamData[] = useTranscriptions();
  const chat = useChat();
  const room = useRoomContext();

  useEffect(() => {
    console.log('[DEBUG] Transcriptions from useTranscriptions:', transcriptions);
    console.log('[DEBUG] Room state:', room?.state);
  }, [transcriptions, room]);

  // Log room context para ver identidades
  useEffect(() => {
    if (room) {
      console.log('[DEBUG] Room localParticipant:', room.localParticipant?.identity);
      console.log('[DEBUG] Room remoteParticipants:',
        Array.from(room.remoteParticipants.values()).map((p) => p.identity)
      );
    }
  }, [room]);

  const mergedTranscriptions = useMemo(() => {
    const merged: Array<ReceivedChatMessage> = [
      ...transcriptions.map((transcription) => transcriptionToChatMessage(transcription, room)),
      ...chat.chatMessages,
    ];
    return merged.sort((a, b) => a.timestamp - b.timestamp);
  }, [transcriptions, chat.chatMessages, room]);

  // Log mensajes combinados que se renderizan
  //useEffect(() => {
  //  console.log('[DEBUG] Merged messages (transcriptions + chat):', mergedTranscriptions);
  //}, [mergedTranscriptions]);

  // Enviar un RPC para cambiar el modo de output (voz/texto)
  const sendToggleOutput = async (payload: string) => {
    if (!room) {
      console.warn('[LiveKit] No room context available for sendToggleOutput');
      return;
    }
    const agent = Array.from(room.remoteParticipants.values())[0];
    const agentIdentity = agent?.identity;
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
      console.log(`[LiveKit] Sent toggle_output RPC with payload: ${payload}`);
    } catch (err) {
      console.error('[LiveKit] Error sending toggle_output RPC:', err);
    }
  };

  // Enviar un RPC para cambiar el modo de input (audio on/off)
  const sendToggleInput = async (payload: string) => {
    if (!room) {
      console.warn('[LiveKit] No room context available for sendToggleInput');
      return;
    }
    const agent = Array.from(room.remoteParticipants.values())[0];
    const agentIdentity = agent?.identity;
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
      console.log(`[LiveKit] Sent toggle_input RPC with payload: ${payload}`);
    } catch (err) {
      console.error('[LiveKit] Error sending toggle_input RPC:', err);
    }
  };

  return { messages: mergedTranscriptions, send: chat.send, sendToggleOutput, sendToggleInput };
}
