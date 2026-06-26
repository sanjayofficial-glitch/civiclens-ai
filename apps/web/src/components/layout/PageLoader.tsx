import { Spinner } from '@/components/ui/spinner';

export function PageLoader() {
  return (
    <div className="flex min-h-dvh items-center justify-center">
      <Spinner className="size-8 text-primary" label="Loading page" />
    </div>
  );
}
