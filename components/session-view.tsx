'use client';

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'motion/react';
import remarkGfm from 'remark-gfm';
import { type ReceivedChatMessage } from '@livekit/components-react';
import { AnalysisStatus } from '@/components/analysis-status';
import { DimensionDisplay } from '@/components/dimension-display';
import { AgentControlBar } from '@/components/livekit/agent-control-bar/agent-control-bar';
import { ChatEntry } from '@/components/livekit/chat/chat-entry';
import { ChatMessageView } from '@/components/livekit/chat/chat-message-view';
import { MediaTiles } from '@/components/livekit/media-tiles';
import { Button } from '@/components/ui/button';
import useChatAndTranscription from '@/hooks/useChatAndTranscription';
import { useDebugMode } from '@/hooks/useDebug';
import { useDimensionStateContext } from '@/hooks/useDimensionStateContext';
import { cn } from '@/lib/utils';

interface SessionViewProps {
  disabled: boolean;
  capabilities: {
    supportsChatInput: boolean;
    supportsVideoInput: boolean;
    supportsScreenShare: boolean;
  };
  sessionStarted: boolean;
}

export const SessionView = ({
  disabled,
  capabilities,
  sessionStarted,
  ref,
}: React.ComponentProps<'div'> & SessionViewProps) => {
  const [chatOpen, setChatOpen] = useState(true);
  const [isVoiceMode, setIsVoiceMode] = useState(false);

  const { messages, send, sendToggleOutput, sendToggleInput, isHistoryLoaded } =
    useChatAndTranscription();
  const { dimensionState, analyzingDimension } = useDimensionStateContext();
  const router = useRouter();

  useDebugMode();

  // Check if assessment is completed using the same logic as dimension-display
  const assessmentCompleted = dimensionState?.current === 'COMPLETED';

  async function handleSendMessage(message: string) {
    await send(message);
  }

  const handleToggleVoiceMode = async (enabled: boolean) => {
    setIsVoiceMode(enabled);
    setChatOpen(!enabled);
    if (enabled) {
      await sendToggleInput('audio_on');
      await sendToggleOutput('audio_on');
    } else {
      await sendToggleInput('audio_off');
      await sendToggleOutput('audio_off');
    }
  };

  const handleViewReport = () => {
    router.push('/results');
  };

  return (
    <main ref={ref} inert={disabled}>
      <DimensionDisplay />
      {/* Only show MediaTiles when chat is closed (agent speaking) and not in voice mode */}
      {!isVoiceMode && !chatOpen && <MediaTiles chatOpen={chatOpen} />}

      <ChatMessageView
        className={cn(
          'mx-auto min-h-svh w-full max-w-2xl px-3 pt-32 pb-40 transition-[opacity,translate] duration-300 ease-out md:px-0 md:pt-36 md:pb-48',
          'translate-y-0 opacity-100'
        )}
      >
        <div className="space-y-3 whitespace-pre-wrap">
          <AnimatePresence>
            {messages.map((message: ReceivedChatMessage) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 1, height: 'auto', translateY: 0.001 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              >
                <ChatEntry
                  hideName
                  entry={message}
                  messageFormatter={(text: string) => (
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
                  )}
                />
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Analysis Status Component */}
          <AnimatePresence>
            {analyzingDimension && (
              <motion.div
                key="analysis-status"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              >
                <AnalysisStatus className="mt-4" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Show "View Full Report" button when assessment is completed */}
        {assessmentCompleted && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="mt-8 flex justify-center"
          >
            <Button
              className="bg-green-500 px-8 py-3 text-lg font-semibold hover:bg-green-600"
              onClick={handleViewReport}
            >
              View Full Report
            </Button>
          </motion.div>
        )}
      </ChatMessageView>

      <div className="bg-background mp-12 fixed top-0 right-0 left-0 h-32 md:h-36">
        {/* Gradient removed to prevent text fading */}
      </div>

      {/* Only show control bar if assessment is not completed */}
      {!assessmentCompleted && (
        <div className="bg-background fixed right-0 bottom-0 left-0 z-50 px-3 pt-2 pb-3 md:px-12 md:pb-12">
          <motion.div
            key="control-bar"
            initial={{ opacity: 0, translateY: '100%' }}
            animate={{
              opacity: sessionStarted ? 1 : 0,
              translateY: sessionStarted ? '0%' : '100%',
            }}
            transition={{ duration: 0.3, delay: sessionStarted ? 0.5 : 0, ease: 'easeOut' }}
          >
            <div className="relative z-10 mx-auto w-full max-w-2xl">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{
                  opacity: sessionStarted && messages.length === 0 ? 1 : 0,
                  transition: {
                    ease: 'easeIn',
                    delay: messages.length > 0 ? 0 : 0.8,
                    duration: messages.length > 0 ? 0.2 : 0.5,
                  },
                }}
                aria-hidden={messages.length > 0}
                className={cn(
                  'absolute inset-x-0 -top-12 text-center',
                  sessionStarted && messages.length === 0 && 'pointer-events-none'
                )}
              >
                <p className="animate-text-shimmer inline-block !bg-clip-text text-sm font-semibold text-transparent">
                  {!isHistoryLoaded
                    ? 'Loading messages...'
                    : isVoiceMode
                      ? 'Agent is listening, ask it a question'
                      : 'Type your message or enable voice mode'}
                </p>
              </motion.div>

              <AgentControlBar
                capabilities={capabilities}
                chatOpen={chatOpen}
                onSendMessage={handleSendMessage}
                isVoiceMode={isVoiceMode}
                onToggleVoiceMode={handleToggleVoiceMode}
              />
            </div>
            {/* Gradient removed to prevent text fading at bottom */}
          </motion.div>
        </div>
      )}
    </main>
  );
};
