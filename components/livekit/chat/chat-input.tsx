/* eslint-disable prettier/prettier */
import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ChatInputProps extends React.HTMLAttributes<HTMLFormElement> {
  onSend?: (message: string) => void;
  disabled?: boolean;
  // When true, the text input itself will be disabled when `disabled` is true.
  // Defaults to true to preserve previous behavior.
  disableInput?: boolean;
}

export function ChatInput({
  onSend,
  className,
  disabled,
  disableInput = true,
  ...props
}: ChatInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<string>('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    props.onSubmit?.(e);
    onSend?.(message);
    setMessage('');
    inputRef.current?.focus();
  };

  const isDisabled = disabled || message.trim().length === 0;
  const inputIsDisabled = !!disabled && disableInput;

  return (
    <form
      {...props}
      onSubmit={handleSubmit}
      className={cn('flex flex-col gap-1 rounded-md pl-1 text-sm', className)}
    >
      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          type="text"
          className="flex-1 focus:outline-none"
          placeholder="Type something..."
          value={message}
          onChange={(e) => {
            if (e.target.value.length > 4000) return;
            setMessage(e.target.value);
          }}
          disabled={inputIsDisabled}
          maxLength={4000}
        />
        <Button
          size="sm"
          type="submit"
          variant={isDisabled ? 'secondary' : 'primary'}
          disabled={isDisabled}
          className="font-mono"
        >
          SEND
        </Button>
      </div>
      <div className="flex justify-end">
        <span
          className={cn(
            'text-muted-foreground text-xs',
            message.length > 3800 && 'text-amber-500',
            message.length >= 4000 && 'text-red-500'
          )}
        >
          {message.length}/4000
        </span>
      </div>
    </form>
  );
}
