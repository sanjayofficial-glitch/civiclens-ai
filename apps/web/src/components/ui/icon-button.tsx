import type { ButtonProps } from '@/components/ui/button';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface IconButtonProps extends ButtonProps {
  /** Render a Lucide (or any) icon directly. */
  icon: React.ReactNode;
  /** Accessible label for the icon button (rendered as sr-only text). */
  'aria-label': string;
}

/**
 * Convenience wrapper for icon-only Buttons. Enforces `aria-label` for
 * accessibility and collapses padding.
 */
export function IconButton({
  icon,
  variant = 'ghost',
  size = 'icon',
  className,
  children,
  ...props
}: IconButtonProps) {
  return (
    <Button variant={variant} size={size} className={cn(className)} {...props}>
      {icon}
      {children}
    </Button>
  );
}
