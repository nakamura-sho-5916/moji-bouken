import { describe, expect, it } from 'vitest';
import { createBattleSession } from '../../../src/features/battle';
import {
  companionData,
  evaluateCompanionBattleSupport,
  recordCompanionSupportEvent,
  resetCompanionBattleStats,
  getCompanionBattleStat,
} from '../../../src/features/collection';

describe('companion battle support', () => {
  it('keeps companion support to at most one event per battle', () => {
    const battle = createBattleSession({
      sessionId: 'support-seed-1',
      now: '2026-07-28T00:00:00.000Z',
    });

    const event = evaluateCompanionBattleSupport({
      battle,
      missionIndex: 0,
      totalMissions: 10,
      companions: companionData,
      previousCompanionId: null,
      alreadyActivatedCount: 1,
      baseDamage: 12,
    });

    expect(event).toBeNull();
  });

  it('records activation counts and total support values', () => {
    localStorage.clear();
    resetCompanionBattleStats();
    recordCompanionSupportEvent({
      companionId: 'rabbit',
      companionName: 'うさぎ',
      skill: 'cheer',
      skillName: '応援',
      line: 'いまだよ、いっしょに！',
      effectLabel: '攻撃+10%',
      damageBonus: 2,
      experienceBonus: 0,
      goldBonus: 0,
    });

    const stat = getCompanionBattleStat('rabbit');
    expect(stat.activationCount).toBe(1);
    expect(stat.cheerCount).toBe(1);
    expect(stat.extraDamageTotal).toBe(2);
  });
});
