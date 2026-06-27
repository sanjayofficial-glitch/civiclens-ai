import * as React from 'react';
import { cn } from '@/lib/utils';

type TypographyProps<T extends React.ElementType> = {
  as?: T;
  className?: string;
  children: React.ReactNode;
} & React.ComponentPropsWithoutRef<T>;

function createTypography<T extends React.ElementType>(
  defaultTag: T,
  baseClass: string,
) {
  // eslint-disable-next-line react/only-export-components
  return function Typography({
    as,
    className,
    children,
    ...props
  }: TypographyProps<T>) {
    const Comp = (as ?? defaultTag) as React.ElementType;
    return (
      <Comp className={cn(baseClass, className)} {...props}>
        {children}
      </Comp>
    );
  };
}

export const H1 = createTypography(
  'h1',
  'scroll-m-20 text-3xl font-bold tracking-tight sm:text-4xl',
);
export const H2 = createTypography(
  'h2',
  'scroll-m-20 text-2xl font-semibold tracking-tight',
);
export const H3 = createTypography(
  'h3',
  'scroll-m-20 text-xl font-semibold tracking-tight',
);
export const H4 = createTypography(
  'h4',
  'scroll-m-20 text-lg font-semibold tracking-tight',
);
export const Lead = createTypography(
  'p',
  'text-lg text-muted-foreground leading-relaxed',
);
export const Text = createTypography('p', 'text-sm leading-relaxed');
export const Muted = createTypography('p', 'text-sm text-muted-foreground');
export const Small = createTypography('small', 'text-xs text-muted-foreground');
export const LabelText = createTypography(
  'span',
  'text-xs font-medium uppercase tracking-wide text-muted-foreground',
);
