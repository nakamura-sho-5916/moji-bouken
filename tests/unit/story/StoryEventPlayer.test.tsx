import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  getStoryEvent,
  loadStoryProgress,
  resetStoryProgress,
  StoryEventPlayer,
} from '../../../src/features/story';

describe('StoryEventPlayer', () => {
  beforeEach(() => {
    resetStoryProgress();
  });

  it('advances by button and saves a viewed event', async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    const opening = getStoryEvent('opening');

    render(<StoryEventPlayer event={opening} onComplete={onComplete} />);

    expect(screen.getByTestId('story-event-player')).toBeInTheDocument();
    await user.click(screen.getByTestId('story-next'));
    await user.click(screen.getByTestId('story-next'));
    await user.click(screen.getByTestId('story-next'));

    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(loadStoryProgress().entries[0]).toMatchObject({
      eventId: 'opening',
      status: 'seen',
    });
  });

  it('advances with the space key and saves skip state', async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    const opening = getStoryEvent('opening');

    render(<StoryEventPlayer event={opening} onComplete={onComplete} />);

    await user.keyboard('[Space]');
    expect(screen.getByText('きみの こたえが')).toBeInTheDocument();
    await user.click(screen.getByTestId('story-skip'));

    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(loadStoryProgress().entries[0]).toMatchObject({
      eventId: 'opening',
      status: 'skipped',
    });
  });
});
