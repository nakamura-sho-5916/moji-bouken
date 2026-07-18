import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { App } from '../../src/App';

describe('App', () => {
  it('タイトル画面を表示する', () => {
    render(<App />);

    expect(
      screen.getByRole('heading', { name: 'もじぼうけん！' }),
    ).toBeInTheDocument();
  });
});
