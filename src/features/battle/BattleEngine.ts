import { calculateComboBonus } from './calculateComboBonus';
import { calculateDamage } from './calculateDamage';
import { calculateSpecialGauge } from './calculateSpecialGauge';
import { getEnemy } from './enemies';
import type { BattleAnswerResult, BattleSession } from './types';

function getDefense(battle: BattleSession) {
  return getEnemy(battle.enemyId)?.defense ?? 0;
}

function completeIfDefeated(battle: BattleSession): BattleSession {
  if (battle.enemyCurrentHp > 0) {
    return battle;
  }
  return {
    ...battle,
    enemyCurrentHp: 0,
    status: 'victory',
    completedAt: new Date().toISOString(),
    lastMessage: 'やったね',
  };
}

export const BattleEngine = {
  applyAnswer(input: {
    battle: BattleSession;
    correct: boolean;
  }): BattleAnswerResult {
    if (
      input.battle.status === 'victory' ||
      input.battle.status === 'completed'
    ) {
      return {
        battle: input.battle,
        damage: 0,
        correct: input.correct,
        comboBonus: calculateComboBonus(input.battle.comboCount),
        specialGaugeGain: 0,
      };
    }

    if (!input.correct) {
      return {
        battle: {
          ...input.battle,
          comboCount: 0,
          status: 'feedback',
          lastMessage: 'もういちど みてみよう',
        },
        damage: 0,
        correct: false,
        comboBonus: 0,
        specialGaugeGain: 0,
      };
    }

    const comboCount = input.battle.comboCount + 1;
    const comboBonus = calculateComboBonus(comboCount);
    const nextGauge = calculateSpecialGauge({
      currentGauge: input.battle.specialGauge,
      correct: true,
      comboCount,
    });
    const damage = calculateDamage({
      playerAttack: input.battle.playerAttack,
      enemyDefense: getDefense(input.battle),
      comboBonus,
    });
    const damaged: BattleSession = {
      ...input.battle,
      enemyCurrentHp: Math.max(0, input.battle.enemyCurrentHp - damage),
      comboCount,
      maxCombo: Math.max(input.battle.maxCombo, comboCount),
      specialGauge: nextGauge,
      totalDamage: input.battle.totalDamage + damage,
      currentMissionIndex: input.battle.currentMissionIndex + 1,
      status: 'feedback',
      lastMessage: 'ことばの ちからが とどいたよ',
    };

    return {
      battle: completeIfDefeated(damaged),
      damage,
      correct: true,
      comboBonus,
      specialGaugeGain: nextGauge - input.battle.specialGauge,
    };
  },

  applySpecialAttack(battle: BattleSession): BattleAnswerResult {
    if (battle.specialGauge < battle.specialGaugeMax) {
      return {
        battle,
        damage: 0,
        correct: true,
        comboBonus: calculateComboBonus(battle.comboCount),
        specialGaugeGain: 0,
      };
    }

    const comboBonus = calculateComboBonus(battle.comboCount);
    const damage = calculateDamage({
      playerAttack: battle.playerAttack,
      enemyDefense: getDefense(battle),
      comboBonus,
      special: true,
    });
    const damaged: BattleSession = {
      ...battle,
      enemyCurrentHp: Math.max(0, battle.enemyCurrentHp - damage),
      specialGauge: 0,
      totalDamage: battle.totalDamage + damage,
      status: 'feedback',
      lastMessage: 'ことばフラッシュ',
    };

    return {
      battle: completeIfDefeated(damaged),
      damage,
      correct: true,
      comboBonus,
      specialGaugeGain: -battle.specialGauge,
    };
  },
};
