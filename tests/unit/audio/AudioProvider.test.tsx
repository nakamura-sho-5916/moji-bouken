import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { AudioProvider, useAudio } from '../../../src/features/audio';

function AudioConsumer() {
  const audio = useAudio();
  return (
    <div>
      <p>supported: {String(audio.state.supported)}</p>
      <button onClick={() => audio.playSoundEffect('ui-tap')} type="button">
        play
      </button>
    </div>
  );
}

describe('AudioProvider split exports', () => {
  it('renders provider children and exposes useAudio inside the provider', () => {
    render(
      <MemoryRouter>
        <AudioProvider>
          <AudioConsumer />
        </AudioProvider>
      </MemoryRouter>,
    );

    expect(screen.getByText(/supported:/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'play' })).toBeInTheDocument();
  });

  it('keeps useAudio safe outside the provider', () => {
    render(<AudioConsumer />);

    expect(screen.getByText(/supported:/)).toBeInTheDocument();
  });
});
