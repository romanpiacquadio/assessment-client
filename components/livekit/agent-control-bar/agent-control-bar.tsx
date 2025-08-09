'use client';

import * as React from 'react';
import { Track } from 'livekit-client';
import { BarVisualizer } from '@livekit/components-react';
import { PhoneDisconnectIcon, WaveformIcon, X } from '@phosphor-icons/react/dist/ssr';
import { ChatInput } from '@/components/livekit/chat/chat-input';
import { Button } from '@/components/ui/button';
import { Toggle } from '@/components/ui/toggle';
import { AppConfig } from '@/lib/types';
import { cn } from '@/lib/utils';
import { DeviceSelect } from '../device-select';
import { TrackToggle } from '../track-toggle';
import { UseAgentControlBarProps, useAgentControlBar } from './hooks/use-agent-control-bar';

export interface AgentControlBarProps
  extends React.HTMLAttributes<HTMLDivElement>,
    UseAgentControlBarProps {
  capabilities: Pick<AppConfig, 'supportsChatInput' | 'supportsVideoInput' | 'supportsScreenShare'>;
  chatOpen: boolean;
  onSendMessage?: (message: string) => Promise<void>;
  onDisconnect?: () => void;
  onDeviceError?: (error: { source: Track.Source; error: Error }) => void;
  isVoiceMode?: boolean;
  onToggleVoiceMode?: (enabled: boolean) => void;
}

/**
 * A control bar specifically designed for voice assistant interfaces
 */
export function AgentControlBar({
  controls,
  saveUserChoices = true,
  capabilities,
  className,
  onSendMessage,
  chatOpen,
  onDisconnect,
  onDeviceError,
  isVoiceMode,
  onToggleVoiceMode,
  ...props
}: AgentControlBarProps) {
  const [isSendingMessage, setIsSendingMessage] = React.useState(false);

  const {
    micTrackRef,
    visibleControls,
    microphoneToggle,
    handleAudioDeviceChange,
    handleDisconnect,
  } = useAgentControlBar({
    controls,
    saveUserChoices,
  });

  const handleSendMessage = async (message: string) => {
    setIsSendingMessage(true);
    try {
      await onSendMessage?.(message);
    } finally {
      setIsSendingMessage(false);
    }
  };

  const onLeave = () => {
    handleDisconnect();
    onDisconnect?.();
  };

  React.useEffect(() => {
    if (!isVoiceMode && microphoneToggle.enabled) {
      microphoneToggle.toggle();
    }
  }, [isVoiceMode, microphoneToggle]);

  // Voice Mode UI - Compact centered interface
  if (isVoiceMode) {
    return (
      <div
        aria-label="Voice mode controls"
        className={cn('flex flex-col items-center justify-center gap-3 py-3', className)}
        {...props}
      >
        {/* Waveform visualization - ABOVE buttons */}
        <div className="flex items-center justify-center">
          <BarVisualizer
            barCount={7}
            trackRef={micTrackRef}
            options={{ minHeight: 8, maxHeight: 36 }}
            className="flex h-12 items-center justify-center gap-1"
          >
            <span
              className={cn([
                'bg-primary w-1 rounded-full transition-all duration-150',
                'data-lk-muted:bg-muted',
              ])}
            />
          </BarVisualizer>
        </div>

        {/* Buttons row - BELOW waveform */}
        <div className="flex items-center gap-4">
          {/* Single microphone toggle */}
          {visibleControls.microphone && (
            <div className="group relative">
              <TrackToggle
                variant="primary"
                source={Track.Source.Microphone}
                pressed={microphoneToggle.enabled}
                onPressedChange={microphoneToggle.toggle}
                className="h-12 w-12 rounded-full p-0"
              />
              {/* Tooltip for microphone */}
              <div className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 transform rounded bg-gray-900 px-2 py-1 text-xs whitespace-nowrap text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                {microphoneToggle.enabled ? 'Mute microphone' : 'Unmute microphone'}
              </div>
            </div>
          )}

          {/* Exit voice mode button */}
          <div className="group relative">
            <Button
              variant="outline"
              size="icon"
              onClick={() => onToggleVoiceMode?.(false)}
              className="h-10 w-10 rounded-full"
              aria-label="Exit voice mode"
            >
              <X size={16} />
            </Button>
            {/* Tooltip for exit */}
            <div className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 transform rounded bg-gray-900 px-2 py-1 text-xs whitespace-nowrap text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              Exit voice mode
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Regular text mode UI
  return (
    <div
      aria-label="Voice assistant controls"
      className={cn(
        'bg-background border-bg2 dark:border-separator1 flex flex-col rounded-[31px] border p-3 drop-shadow-md/3',
        className
      )}
      {...props}
    >
      {capabilities.supportsChatInput && (
        <div
          inert={!chatOpen}
          className={cn(
            'overflow-hidden transition-[height] duration-300 ease-out',
            chatOpen ? 'h-[57px]' : 'h-0'
          )}
        >
          <div className="flex h-8 w-full">
            <ChatInput
              onSend={handleSendMessage}
              disabled={isVoiceMode || isSendingMessage}
              className="w-full"
            />
          </div>
          <hr className="border-bg2 my-3" />
        </div>
      )}

      <div className="flex flex-row justify-between gap-1">
        <div className="flex gap-1">
          {typeof isVoiceMode === 'boolean' && typeof onToggleVoiceMode === 'function' && (
            <div className="group relative">
              <Toggle
                variant="primary"
                aria-label={isVoiceMode ? 'Desactivar modo voz' : 'Activar modo voz'}
                pressed={isVoiceMode}
                onPressedChange={onToggleVoiceMode}
                className="mr-2 aspect-square h-full"
              >
                <WaveformIcon weight={isVoiceMode ? 'fill' : 'regular'} />
              </Toggle>
              {/* Tooltip */}
              <div className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 transform rounded bg-gray-900 px-2 py-1 text-xs whitespace-nowrap text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                {isVoiceMode ? 'Turn off voice mode' : 'Use voice mode'}
              </div>
            </div>
          )}
          {visibleControls.microphone && (
            <div className="flex items-center gap-0">
              <TrackToggle
                variant="primary"
                source={Track.Source.Microphone}
                pressed={isVoiceMode && microphoneToggle.enabled}
                disabled={!isVoiceMode}
                onPressedChange={(enabled) => {
                  if (isVoiceMode) {
                    microphoneToggle.toggle(enabled);
                  }
                }}
                className="peer/track group/track relative w-auto pr-3 pl-3 md:rounded-r-none md:border-r-0 md:pr-2"
              >
                <BarVisualizer
                  barCount={3}
                  trackRef={micTrackRef}
                  options={{ minHeight: 5 }}
                  className="flex h-full w-auto items-center justify-center gap-0.5"
                >
                  <span
                    className={cn([
                      'h-full w-0.5 origin-center rounded-2xl',
                      'group-data-[state=on]/track:bg-fg1 group-data-[state=off]/track:bg-destructive-foreground',
                      'data-lk-muted:bg-muted',
                    ])}
                  ></span>
                </BarVisualizer>
              </TrackToggle>
              <hr className="bg-separator1 peer-data-[state=off]/track:bg-separatorSerious relative z-10 -mr-px hidden h-4 w-px md:block" />
              <DeviceSelect
                size="sm"
                kind="audioinput"
                onError={(error) =>
                  onDeviceError?.({ source: Track.Source.Microphone, error: error as Error })
                }
                disabled={!isVoiceMode}
                onActiveDeviceChange={handleAudioDeviceChange}
                className={cn([
                  'pl-2',
                  'peer-data-[state=off]/track:text-destructive-foreground',
                  'hover:text-fg1 focus:text-fg1',
                  'hover:peer-data-[state=off]/track:text-destructive-foreground focus:peer-data-[state=off]/track:text-destructive-foreground',
                  'hidden rounded-l-none md:block',
                ])}
              />
            </div>
          )}
        </div>
        {visibleControls.leave && (
          <Button variant="destructive" onClick={onLeave} className="font-mono">
            <PhoneDisconnectIcon weight="bold" />
            <span className="hidden md:inline">END CALL</span>
            <span className="inline md:hidden">END</span>
          </Button>
        )}
      </div>
    </div>
  );
}
