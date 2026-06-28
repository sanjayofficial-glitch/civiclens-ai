import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground',
        secondary: 'border-transparent bg-secondary text-secondary-foreground',
        destructive:
          'border-rose-500/25 bg-rose-500/10 text-rose-700',
        critical:
          'border-rose-500/35 bg-rose-600/12 text-rose-800 font-bold',
        outline: 'border-border text-foreground',
        success: 'border-emerald-500/25 bg-emerald-500/10 text-emerald-600',
        warning:
          'border-amber-500/25 bg-amber-500/10 text-amber-700',
        info: 'border-indigo-500/25 bg-indigo-500/10 text-indigo-600',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

// eslint-disable-next-line react/only-export-components
export { Badge, badgeVariants };
