import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  BOSS_INTRO_DURATION_MS,
  getEnemy,
  selectBossBattleMoment,
} from '../../../src/features/battle';
import { BossDefeatCinematic } from '../../../src/features/battle/components/BossDefeatCinematic';
import { BossIntroCinematic } from '../../../src/features/battle/components/BossIntroCinematic';
import {
  loadBossBattleStats,
  recordBossDefeat,
} from '../../../src/features/collection';

describe('boss battle presentation', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('shows boss moments only for boss battles at the presentation cadence', () => {
    const boss = getEnemy('boss-village-kana-guardian');
    const normal = getEnemy('enemy-moji-slime');

    expect(
      selectBossBattleMoment({
        battleId: 'battle-boss',
        enemy: boss,
        missionIndex: 3,
      }),
    ).not.toBeNull();
    expect(
      selectBossBattleMoment({
        battleId: 'battle-boss',
        enemy: boss,
        missionIndex: 2,
      }),
    ).toBeNull();
    expect(
      selectBossBattleMoment({
        battleId: 'battle-normal',
        enemy: normal,
        missionIndex: 3,
      }),
    ).toBeNull();
  });

  it('records boss defeat count and first and last defeat dates', () => {
    recordBossDefeat(
      'boss-village-kana-guardian',
      new Date('2026-07-28T10:00:00.000Z'),
    );
    recordBossDefeat(
      'boss-village-kana-guardian',
      new Date('2026-07-29T10:00:00.000Z'),
    );

    const stat = loadBossBattleStats().stats.find(
      (item) => item.enemyId === 'boss-village-kana-guardian',
    );

    expect(stat?.defeatCount).toBe(2);
    expect(stat?.firstDefeatedAt).toBe('2026-07-28T10:00:00.000Z');
    expect(stat?.lastDefeatedAt).toBe('2026-07-29T10:00:00.000Z');
  });

  it('renders intro and defeat cinematic without changing the enemy name', () => {
    vi.useFakeTimers();
    const boss = getEnemy('boss-village-kana-guardian');
    const onComplete = vi.fn();

    if (!boss) {
      throw new Error('boss fixture is missing');
    }

    render(
      <>
        <BossIntroCinematic enemy={boss} onComplete={onComplete} visible />
        <BossDefeatCinematic enemy={boss} visible />
      </>,
    );

    expect(screen.getByText('BOSS')).toBeInTheDocument();
    expect(screen.getAllByText(boss.name).length).toBeGreaterThan(0);
    expect(screen.getByText('VICTORY')).toBeInTheDocument();

    vi.advanceTimersByTime(BOSS_INTRO_DURATION_MS);
    expect(onComplete).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });
});
