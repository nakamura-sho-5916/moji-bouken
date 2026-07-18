import type { ErrorInfo, ReactNode } from 'react';
import { Component } from 'react';

type ErrorBoundaryProps = {
  children: ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
};

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = {
    hasError: false,
  };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    if (import.meta.env.DEV) {
      console.error('Application error:', error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="flex min-h-dvh items-center justify-center bg-[var(--color-background)] px-6 text-center">
          <section className="max-w-sm rounded-[var(--radius-large)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-soft)]">
            <h1 className="text-2xl font-black text-[var(--color-primary-strong)]">
              うまく ひらけなかったよ
            </h1>
            <p className="mt-3 text-lg font-bold text-[var(--color-text-muted)]">
              もういちど ためしてみよう
            </p>
            <button
              className="mt-6 min-h-14 rounded-[var(--radius-medium)] bg-[var(--color-primary)] px-6 text-lg font-black text-white"
              onClick={() => window.location.reload()}
              type="button"
            >
              もういちど
            </button>
          </section>
        </main>
      );
    }

    return this.props.children;
  }
}
