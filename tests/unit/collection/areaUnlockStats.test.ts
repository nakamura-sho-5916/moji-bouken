import { beforeEach, describe, expect, it } from 'vitest';
import {
  loadAreaUnlockStats,
  recordAreaUnlock,
} from '../../../src/features/collection';

describe('area unlock stats', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('records area unlock date once for collection display', () => {
    const first = recordAreaUnlock(
      'word-forest',
      new Date('2026-07-28T09:00:00.000Z'),
    );
    const second = recordAreaUnlock(
      'word-forest',
      new Date('2026-07-29T09:00:00.000Z'),
    );

    const state = loadAreaUnlockStats();

    expect(first.unlockedAt).toBe('2026-07-28T09:00:00.000Z');
    expect(second.unlockedAt).toBe('2026-07-28T09:00:00.000Z');
    expect(state.stats).toHaveLength(1);
    expect(state.stats[0]?.areaId).toBe('word-forest');
  });
});
