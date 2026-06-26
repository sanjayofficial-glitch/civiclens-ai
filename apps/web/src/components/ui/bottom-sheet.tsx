import * as React from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from './sheet';
import { cn } from '@/lib/utils';

export interface BottomSheetProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  /** Hide the default close button (use when providing custom header) */
  hideClose?: boolean;
}

/**
 * Mobile-first bottom sheet built on the shared Sheet primitive.
 * Used for map issue previews, filters, and contextual actions.
 */
export function BottomSheet({
  open,
  onOpenChange,
  trigger,
  title,
  description,
  children,
  className,
}: BottomSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {trigger ? <SheetTrigger asChild>{trigger}</SheetTrigger> : null}
      <SheetContent
        side="bottom"
        className={cn(
          'glass max-h-[85vh] overflow-y-auto rounded-t-2xl pb-safe pt-2',
          className,
        )}
      >
        <div className="mx-auto mb-3 h-1 w-10 shrink-0 rounded-full bg-muted-foreground/30" />
        {(title || description) && (
          <SheetHeader className="mb-4 text-left">
            {title ? <SheetTitle>{title}</SheetTitle> : null}
            {description ? (
              <SheetDescription>{description}</SheetDescription>
            ) : null}
          </SheetHeader>
        )}
        {children}
      </SheetContent>
    </Sheet>
  );
}
