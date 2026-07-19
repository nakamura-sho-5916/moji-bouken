import { beforeEach, describe, expect, it } from 'vitest';
import { DEFAULT_PLAYER_ID } from '../../../src/db/constants';
import { initializeAppData } from '../../../src/db/initializeAppData';
import { getInventory } from '../../../src/db/repositories/inventoryRepository';
import { getPlayerById } from '../../../src/db/repositories/playerRepository';
import {
  BattleEngine,
  calculateComboBonus,
  calculateDamage,
  calculateSpecialGauge,
  createBattleSession,
  getDefaultEnemy,
} from '../../../src/features/battle';
import { RewardEngine } from '../../../src/features/rewards';
import { calculateLevel } from '../../../src/features/rewards/calculateLevel';
import { resetIndexedDb } from '../dbTestUtils';

describe('battle and rewards', () => {
  beforeEach(async () => {
    localStorage.clear();
    await resetIndexedDb();
    await initializeAppData();
  });

  it('バトル初期値を作成する', () => {
    const battle = createBattleSession({ sessionId: 'test-battle' });

    expect(battle.enemyCurrentHp).toBe(battle.enemyMaxHp);
    expect(battle.comboCount).toBe(0);
    expect(battle.specialGauge).toBe(0);
    expect(battle.playerAttack).toBe(10);
  });

  it('正解時だけダメージを与え、誤答ではHPを減らさない', () => {
    const battle = createBattleSession({ sessionId: 'damage-test' });
    const correct = BattleEngine.applyAnswer({ battle, correct: true });
    const wrong = BattleEngine.applyAnswer({
      battle: correct.battle,
      correct: false,
    });

    expect(correct.damage).toBeGreaterThan(0);
    expect(correct.battle.enemyCurrentHp).toBeLessThan(battle.enemyCurrentHp);
    expect(wrong.damage).toBe(0);
    expect(wrong.battle.enemyCurrentHp).toBe(correct.battle.enemyCurrentHp);
  });

  it('コンボと必殺ゲージを計算する', () => {
    expect(calculateComboBonus(1)).toBe(0);
    expect(calculateComboBonus(3)).toBeGreaterThan(0);
    expect(calculateComboBonus(20)).toBeLessThanOrEqual(0.5);
    expect(
      calculateSpecialGauge({ currentGauge: 95, correct: true, comboCount: 3 }),
    ).toBe(100);
    expect(
      calculateSpecialGauge({
        currentGauge: 50,
        correct: false,
        comboCount: 0,
      }),
    ).toBe(50);
  });

  it('必殺技は通常より大きなダメージを与え、使用後ゲージを戻す', () => {
    const enemy = getDefaultEnemy(false);
    const normal = calculateDamage({
      playerAttack: 10,
      enemyDefense: enemy.defense,
      comboBonus: 0,
    });
    const battle = {
      ...createBattleSession({ sessionId: 'special-test' }),
      specialGauge: 100,
    };
    const special = BattleEngine.applySpecialAttack(battle);

    expect(special.damage).toBeGreaterThan(normal);
    expect(special.battle.specialGauge).toBe(0);
  });

  it('報酬をPlayerとInventoryへ一度だけ保存する', async () => {
    const battle = {
      ...createBattleSession({ sessionId: 'reward-test' }),
      enemyCurrentHp: 0,
      status: 'victory' as const,
    };
    const first = await RewardEngine.grantBattleRewards({
      battle,
      missionResults: [],
    });
    const second = await RewardEngine.grantBattleRewards({
      battle,
      missionResults: [],
    });
    const player = await getPlayerById(DEFAULT_PLAYER_ID);
    const inventory = await getInventory(DEFAULT_PLAYER_ID);

    expect(first.alreadyRewarded).toBe(false);
    expect(second.alreadyRewarded).toBe(true);
    expect(player?.experience).toBe(first.experienceGained);
    expect(inventory?.gold).toBe(first.goldGained);
  });

  it('経験値からレベルを計算する', () => {
    expect(calculateLevel(0)).toBe(1);
    expect(calculateLevel(100)).toBe(2);
    expect(calculateLevel(450)).toBe(4);
  });
});
