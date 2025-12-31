'use client';

import React, { useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'motion/react';
import remarkGfm from 'remark-gfm';
import { type ReceivedChatMessage } from '@livekit/components-react';
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
import { AnalysisStatusEvaluation } from './analysis-status-evaluation';
import { AnalysisStatusModal } from './analysis-status-modal';

interface SessionViewProps {
  disabled: boolean;
  capabilities: {
    supportsChatInput: boolean;
    supportsVideoInput: boolean;
    supportsScreenShare: boolean;
  };
  sessionStarted: boolean;
  onSessionFinished: () => void;
}

export const SessionView = ({
  disabled,
  capabilities,
  sessionStarted,
  onSessionFinished,
  ref,
}: React.ComponentProps<'div'> & SessionViewProps) => {
  const [chatOpen, setChatOpen] = useState(true);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);

  // States to handle the partial feedback
  const [isWaitingForPartialFeedback, setIsWaitingForPartialFeedback] = useState(false);
  const [isViewingPartialFeedback, setIsViewingPartialFeedback] = useState(false);
  const [partialFeedbackDimension, setPartialFeedbackDimension] = useState<string | null>(null);

  const { messages, send, sendToggleOutput, sendToggleInput, isHistoryLoaded, localMessages } =
    useChatAndTranscription();
  const { dimensionState, analyzingDimension, analyzingDimensionState } =
    useDimensionStateContext();
  const router = useRouter();
  const chatViewRef = useRef<{ scrollToBottom: () => void }>(null);

  useDebugMode();

  // Check if assessment is completed using the same logic as dimension-display
  const assessmentCompleted = dimensionState?.current === 'COMPLETED';

  // Validate if we are waiting for partial feedback to show the analysis status evaluation component
  if (
    analyzingDimension &&
    analyzingDimensionState === 'started' &&
    !isWaitingForPartialFeedback &&
    !isViewingPartialFeedback &&
    !assessmentCompleted
  ) {
    setIsWaitingForPartialFeedback(true);
    setPartialFeedbackDimension(analyzingDimension);
  }

  // Validate if the partial feedback is incompleted or failed hide the analysis status evaluation component
  if (
    analyzingDimension &&
    (analyzingDimensionState === 'incompleted' || analyzingDimensionState === 'failed') &&
    isWaitingForPartialFeedback
  ) {
    setIsWaitingForPartialFeedback(false);
    setPartialFeedbackDimension(null);
  }

  // Validate if the partial feedback is ready to be viewed
  const partialFeedback = dimensionState?.[partialFeedbackDimension ?? 'Evolution'];
  const partialFeedbackItems = partialFeedback?.partial_feedback;
  const isPartialFeedbackReady = partialFeedbackItems && partialFeedbackItems.length > 0;

  if (isPartialFeedbackReady && isWaitingForPartialFeedback) {
    setIsWaitingForPartialFeedback(false);
    setIsViewingPartialFeedback(true);
  }

  async function handleSendMessage(message: string) {
    setIsWaitingForResponse(true);
    await send(message);

    // Scroll to bottom after sending message with a longer delay
    setTimeout(() => {
      chatViewRef.current?.scrollToBottom();
    }, 300);
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
        ref={chatViewRef}
        className={cn(
          'mx-auto min-h-svh w-full max-w-2xl px-3 pt-32 pb-40 transition-[opacity,translate] duration-300 ease-out md:px-0 md:pt-36 md:pb-48',
          'translate-y-0 opacity-100'
        )}
      >
        <div className="space-y-3 whitespace-pre-wrap" id="chat-messages">
          <AnimatePresence>
            {(assessmentCompleted ? localMessages : messages).map(
              (message: ReceivedChatMessage) => (
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
              )
            )}
          </AnimatePresence>

          {/* Analysis Status Evaluation */}
          {isWaitingForPartialFeedback && (
            <AnalysisStatusEvaluation
              className="mt-4"
              partialFeedbackDimension={partialFeedbackDimension}
            />
          )}

          {/* Analysis Status Modal */}
          {isViewingPartialFeedback && (
            <AnalysisStatusModal
              isViewingPartialFeedback={isViewingPartialFeedback}
              partialFeedbackDimension={partialFeedbackDimension}
              setPartialFeedbackDimension={setPartialFeedbackDimension}
              setIsViewingPartialFeedback={setIsViewingPartialFeedback}
            />
          )}

          {/* Space for response when waiting */}
          {isWaitingForResponse && (
            <motion.div
              key="response-space"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="min-h-[300px]"
            />
          )}
        </div>
      </ChatMessageView>

      {/* Show "View Full Report" button when assessment is completed */}
      {assessmentCompleted && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="pointer-events-none fixed bottom-20 z-50 flex w-full justify-center"
        >
          <div className="pointer-events-auto">
            <Button
              className="bg-green-500 px-8 py-3 text-lg font-semibold shadow-lg hover:bg-green-600"
              onClick={handleViewReport}
              id="view-report-button"
            >
              View Full Report
            </Button>
          </div>
        </motion.div>
      )}

      {/* Only show control bar if assessment is not completed */}
      {!assessmentCompleted && (
        <div className="bg-background fixed right-0 bottom-0 left-0 z-50 px-3 pt-2 pb-3 md:px-12 md:pb-3">
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
                isViewingPartialFeedback={isViewingPartialFeedback}
                onToggleVoiceMode={handleToggleVoiceMode}
                onDisconnect={() => onSessionFinished()}
              />
            </div>
            {/* Gradient removed to prevent text fading at bottom */}
          </motion.div>
        </div>
      )}
    </main>
  );
};
