import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { AppShell } from '../../src/components/AppShell';
import { BottomNavigation } from '../../src/components/BottomNavigation';

describe('AppShell', () => {
  it('子要素を表示する', () => {
    render(
      <MemoryRouter>
        <AppShell>
          <p>なかみ</p>
        </AppShell>
      </MemoryRouter>,
    );

    expect(screen.getByText('なかみ')).toBeInTheDocument();
  });
});

describe('BottomNavigation', () => {
  it('主要ナビゲーションを表示する', () => {
    render(
      <MemoryRouter>
        <BottomNavigation />
      </MemoryRouter>,
    );

    expect(screen.getByRole('link', { name: /ホーム/ })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /ぼうけん/ })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /ずかん/ })).toBeInTheDocument();
  });
});
