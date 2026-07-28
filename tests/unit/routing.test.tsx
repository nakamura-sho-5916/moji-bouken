import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { MemoryRouter } from '../../src/router';
import { AppRouter } from '../../src/routes/AppRouter';

describe('AppRouter', () => {
  it('selects a save slot before opening the title flow', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={['/']}>
        <AppRouter />
      </MemoryRouter>,
    );

    const [firstStartButton] = await screen.findAllByRole('button', {
      name: 'あたらしく はじめる',
    });
    expect(firstStartButton).toBeDefined();
    await user.click(firstStartButton);

    await user.click(await screen.findByRole('link', { name: 'はじめる' }));
    await user.click(await screen.findByTestId('story-skip'));

    expect(await screen.findByRole('navigation')).toBeInTheDocument();
  });

  it('shows a 404 page for an unknown URL', () => {
    render(
      <MemoryRouter initialEntries={['/missing']}>
        <AppRouter />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: '404' })).toBeInTheDocument();
  });

  it('shows the reward debug page in development', async () => {
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

  it('shows the companions debug page in development', async () => {
    render(
      <MemoryRouter initialEntries={['/debug/companions']}>
        <AppRouter />
      </MemoryRouter>,
    );

    expect(
      await screen.findByRole('heading', { name: 'Debug Companions' }),
    ).toBeInTheDocument();
  });

  it('shows the boss debug page in development', async () => {
    render(
      <MemoryRouter initialEntries={['/debug/boss']}>
        <AppRouter />
      </MemoryRouter>,
    );

    expect(
      await screen.findByRole('heading', { name: 'Debug Boss' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'VICTORY' }),
    ).toBeInTheDocument();
  });

  it('shows the story debug page in development', async () => {
    render(
      <MemoryRouter initialEntries={['/debug/story']}>
        <AppRouter />
      </MemoryRouter>,
    );

    expect(
      await screen.findByRole('heading', { name: 'Debug Story' }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole('button').length).toBeGreaterThan(0);
  });

  it('shows the save debug page in development', async () => {
    render(
      <MemoryRouter initialEntries={['/debug/save']}>
        <AppRouter />
      </MemoryRouter>,
    );

    expect(
      await screen.findByRole('heading', { name: 'Debug Save' }),
    ).toBeInTheDocument();
  });
});
