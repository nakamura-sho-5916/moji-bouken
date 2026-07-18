import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ErrorBoundary } from '../../src/components/ErrorBoundary';

function BrokenComponent(): ReactNode {
  throw new Error('test error');
}

describe('ErrorBoundary', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('代替画面を表示する', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);

    render(
      <ErrorBoundary>
        <BrokenComponent />
      </ErrorBoundary>,
    );

    expect(screen.getByText('うまく ひらけなかったよ')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'もういちど' }),
    ).toBeInTheDocument();
  });
});
