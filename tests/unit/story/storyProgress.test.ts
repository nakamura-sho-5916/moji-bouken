import { beforeEach, describe, expect, it } from 'vitest';
import {
  hasSeenStoryEvent,
  loadStoryProgress,
  recordStoryEvent,
  resetStoryProgress,
} from '../../../src/features/story';

describe('storyProgress', () => {
  beforeEach(() => {
    resetStoryProgress();
  });

  it('records seen and skipped story events without duplicates', () => {
    recordStoryEvent('opening', 'skipped');
    recordStoryEvent('opening', 'seen');

    const progress = loadStoryProgress();
    expect(progress.entries).toHaveLength(1);
    expect(progress.entries[0]).toMatchObject({
      eventId: 'opening',
      status: 'seen',
    });
    expect(hasSeenStoryEvent('opening')).toBe(true);
  });
});
