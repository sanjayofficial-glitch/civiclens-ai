import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './button';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          role="alert"
          className="flex flex-col items-center justify-center gap-4 px-6 py-16 text-center"
        >
          <div className="grid size-14 place-items-center rounded-full bg-destructive/12 text-destructive">
            <AlertCircle className="size-7" aria-hidden="true" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-base font-semibold text-foreground">Page crashed</h3>
            <p className="mx-auto max-w-sm text-sm text-muted-foreground">
              Something went wrong loading this page.
            </p>
          </div>
          <div className="mt-1">
            <Button onClick={this.handleRetry} size="sm">
              <RefreshCw className="mr-2 size-4" />
              Try again
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
