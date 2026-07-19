import { beforeEach, describe, expect, it } from 'vitest';
import { DEFAULT_PLAYER_ID } from '../../../src/db/constants';
import { getWorldProgress } from '../../../src/db/repositories/worldProgressRepository';
import { enemies } from '../../../src/features/battle/enemies';
import {
  calculateRecoveryPoints,
  calculateRecoveryStage,
  evaluateAreaUnlock,
  selectAreaEnemy,
  WorldRecoveryEngine,
  worldAreas,
} from '../../../src/features/world';
import type { AreaViewModel } from '../../../src/features/world';
import { resetIndexedDb } from '../dbTestUtils';

function createAreaView(areaId = 'starting-village'): AreaViewModel {
  const area = worldAreas.find((item) => item.id === areaId) ?? worldAreas[0];
  if (!area) {
    throw new Error('world area data is empty');
  }
  return {
    area,
    unlocked: true,
    recoveryStage: 0,
    recoveryPoints: 0,
    unlockedEvents: [],
    availableNpc: [],
  };
}

describe('world recovery', () => {
  beforeEach(async () => {
    localStorage.clear();
    await resetIndexedDb();
  });

  it('通常敵5体とボス1体を持ち、IDとエリアが妥当である', () => {
    const normalEnemies = enemies.filter((enemy) => enemy.type === 'normal');
    const bossEnemies = enemies.filter((enemy) => enemy.type === 'boss');
    const enemyIds = new Set(enemies.map((enemy) => enemy.id));
    const areaIds = new Set<string>(worldAreas.map((area) => area.id));

    expect(normalEnemies).toHaveLength(5);
    expect(bossEnemies).toHaveLength(1);
    expect(enemyIds.size).toBe(enemies.length);
    expect(enemies.every((enemy) => areaIds.has(enemy.areaId))).toBe(true);
  });

  it('世界エリアは5つで、最初のエリアだけ解放済みとして定義される', () => {
    const areaIds = new Set(worldAreas.map((area) => area.id));

    expect(worldAreas).toHaveLength(5);
    expect(areaIds.size).toBe(5);
    expect(worldAreas.filter((area) => area.initiallyUnlocked)).toHaveLength(1);
    expect(worldAreas[0]?.id).toBe('starting-village');
  });

  it('復興ポイントと復興段階を計算する', () => {
    expect(
      calculateRecoveryPoints({
        battleId: 'battle-1',
        areaId: 'starting-village',
        bossDefeated: false,
        bonusReasons: ['weak-letter-progress'],
        experienceEarned: 25,
        goldEarned: 10,
      }),
    ).toBe(15);
    expect(
      calculateRecoveryPoints({
        battleId: 'battle-2',
        areaId: 'word-castle',
        bossDefeated: true,
        bonusReasons: ['weak-letter-mastered', 'final-review-completed'],
        experienceEarned: 120,
        goldEarned: 60,
      }),
    ).toBe(75);

    expect(calculateRecoveryStage(0)).toBe(0);
    expect(calculateRecoveryStage(20)).toBe(1);
    expect(calculateRecoveryStage(50)).toBe(2);
    expect(calculateRecoveryStage(90)).toBe(3);
    expect(calculateRecoveryStage(140)).toBe(4);
  });

  it('前のエリアの復興段階からエリア解放を判定する', () => {
    const forest = worldAreas.find((area) => area.id === 'word-forest');
    if (!forest) {
      throw new Error('word-forest is missing');
    }

    const locked = evaluateAreaUnlock(
      forest,
      new Map([['starting-village', { unlocked: true, recoveryStage: 2 }]]),
    );
    const unlocked = evaluateAreaUnlock(
      forest,
      new Map([['starting-village', { unlocked: true, recoveryStage: 3 }]]),
    );

    expect(locked.unlocked).toBe(false);
    expect(unlocked.unlocked).toBe(true);
  });

  it('解放済みエリアから敵を選び、ロック中は選ばない', () => {
    const unlockedArea = createAreaView('starting-village');
    const lockedArea = { ...unlockedArea, unlocked: false };

    const selected = selectAreaEnemy({
      area: unlockedArea,
      seed: 'seed-1',
      previousEnemyId: null,
    });
    const locked = selectAreaEnemy({
      area: lockedArea,
      seed: 'seed-1',
      previousEnemyId: null,
    });

    expect(selected?.type).toBe('normal');
    expect(unlockedArea.area.enemyIds).toContain(selected?.id);
    expect(locked).toBeNull();
  });

  it('復興結果を保存し、同じ戦闘IDは二重反映しない', async () => {
    const first = await WorldRecoveryEngine.applyRecovery({
      battleId: 'world-battle-1',
      areaId: 'starting-village',
      bossDefeated: true,
      bonusReasons: ['weak-letter-mastered', 'final-review-completed'],
      experienceEarned: 120,
      goldEarned: 60,
    });
    const second = await WorldRecoveryEngine.applyRecovery({
      battleId: 'world-battle-1',
      areaId: 'starting-village',
      bossDefeated: true,
      bonusReasons: ['weak-letter-mastered', 'final-review-completed'],
      experienceEarned: 120,
      goldEarned: 60,
    });
    const progress = await getWorldProgress(
      DEFAULT_PLAYER_ID,
      'starting-village',
    );

    expect(first?.alreadyApplied).toBe(false);
    expect(first?.nextStage).toBe(2);
    expect(second?.alreadyApplied).toBe(true);
    expect(progress?.recoveryStage).toBe(2);
    expect(progress?.unlockedEvents).toContain('reward:world-battle-1');
  });
});
