import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SpinnerProps extends React.SVGProps<SVGSVGElement> {
  /** Visual size preset. */
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = {
  sm: 'size-4',
  md: 'size-6',
  lg: 'size-8',
};

export function Spinner({ className, size = 'md', ...props }: SpinnerProps) {
  return (
    <Loader2
      role="status"
      aria-label="Loading"
      className={cn('animate-spin text-muted-foreground', sizeMap[size], className)}
      {...props}
    />
  );
}

/** A centred, padded full-area spinner for page/section loading states. */
export function SpinnerOverlay({ label }: { label?: string }) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-3 py-16"
      role="status"
      aria-live="polite"
    >
      <Spinner size="lg" />
      {label ? (
        <p className="text-sm text-muted-foreground">{label}</p>
      ) : null}
      <span className="sr-only">Loading</span>
    </div>
  );
}
