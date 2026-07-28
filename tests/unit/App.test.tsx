import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { App } from '../../src/App';

describe('App', () => {
  it('shows the save slot screen first', async () => {
    render(<App />);

    expect(
      await screen.findByRole('heading', { name: 'セーブを えらぶ' }),
    ).toBeInTheDocument();
  });
});
