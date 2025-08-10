import { CodeBlockIcon } from '@phosphor-icons/react/dist/ssr';
import { Button } from '@/components/ui/button';

interface WelcomeProps {
  disabled: boolean;
  startButtonText: string;
  onStartCall: () => void;
}

export const Welcome = ({
  disabled,
  startButtonText,
  onStartCall,
  ref,
}: React.ComponentProps<'div'> & WelcomeProps) => {
  return (
    <div
      ref={ref}
      inert={disabled}
      className="fixed inset-0 z-10 mx-auto flex h-svh flex-col items-center justify-center text-center"
    >
      <CodeBlockIcon size={64} className="mx-auto mb-4" />
      <h1 className="font-semibold">AI Maturity Assessment</h1>
      <p className="text-muted-foreground max-w-prose pt-1 font-medium">
        Start and our AI agent will guide you through.
        <br />
        Need to contact us? Visit our{' '}
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://cloudx.com/contact-us"
          className="underline underline-offset-4"
        >
          contact page
        </a>
        .
      </p>
      <Button variant="primary" size="lg" onClick={onStartCall} className="mt-12 w-64 font-mono">
        {startButtonText}
      </Button>
    </div>
  );
};
