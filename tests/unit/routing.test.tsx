import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from '../../src/router';
import { describe, expect, it } from 'vitest';
import { AppRouter } from '../../src/routes/AppRouter';

describe('AppRouter', () => {
  it('タイトル画面からホームへ移動できる', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={['/']}>
        <AppRouter />
      </MemoryRouter>,
    );

    await user.click(screen.getByRole('link', { name: 'はじめる' }));

    expect(
      await screen.findByRole('heading', { name: 'ホーム' }),
    ).toBeInTheDocument();
  });

  it('存在しないURLで404画面を表示する', () => {
    render(
      <MemoryRouter initialEntries={['/missing']}>
        <AppRouter />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: '404' })).toBeInTheDocument();
  });

  it('開発時に報酬デバッグ画面を表示する', async () => {
    render(
      <MemoryRouter initialEntries={['/debug/reward']}>
        <AppRouter />
      </MemoryRouter>,
    );

    expect(
      await screen.findByRole('heading', { name: 'Debug Reward' }),
    ).toBeInTheDocument();
    expect(screen.getAllByText('Common').length).toBeGreaterThan(0);
  });
});
