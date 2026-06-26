import { Toaster as Sonner } from 'sonner';

/**
 * Toast provider — pre-styled to match the BlockSeBlock design system.
 * Call `toast.success()`, `toast.error()` etc. from anywhere.
 */
export function Toaster() {
  return (
    <Sonner
      theme="var(--theme)"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-xl',
          description: 'group-[.toast]:text-muted-foreground',
          actionButton:
            'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
          cancelButton:
            'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground',
        },
      }}
    />
  );
}
