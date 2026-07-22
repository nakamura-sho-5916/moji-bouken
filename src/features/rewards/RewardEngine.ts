import { DEFAULT_PLAYER_ID } from '../../db/constants';
import { initializeAppData } from '../../db/initializeAppData';
import {
  addEquipment,
  addItem,
  changeGold,
  getInventory,
} from '../../db/repositories/inventoryRepository';
import {
  getPlayerById,
  updatePlayer,
} from '../../db/repositories/playerRepository';
import {
  BATTLE_RESULT_STORAGE_KEY,
  REWARDED_BATTLE_IDS_STORAGE_KEY,
} from '../battle/constants';
import { getEnemy } from '../battle/enemies';
import type { BattleSession } from '../battle/types';
import { equipmentData, getSelectedCompanion } from '../collection';
import type { MissionResult } from '../missions';
import { calculateExperience } from './calculateExperience';
import { calculateGold } from './calculateGold';
import { calculateLevel, experienceRequiredForLevel } from './calculateLevel';
import type { RewardReason, RewardSummary } from './types';

function loadRewardedIds() {
  const raw = localStorage.getItem(REWARDED_BATTLE_IDS_STORAGE_KEY);
  if (!raw) {
    return [];
  }
  try {
    return JSON.parse(raw) as string[];
  } catch {
    localStorage.removeItem(REWARDED_BATTLE_IDS_STORAGE_KEY);
    return [];
  }
}

function saveRewardedId(battleId: string) {
  const ids = loadRewardedIds();
  if (!ids.includes(battleId)) {
    localStorage.setItem(
      REWARDED_BATTLE_IDS_STORAGE_KEY,
      JSON.stringify([...ids, battleId]),
    );
  }
}

function dropRoll(seed: string) {
  let value = 0;
  for (const char of seed) {
    value = (value * 33 + char.charCodeAt(0)) % 100000;
  }
  return value / 100000;
}

function dropCount(seed: string, minCount: number, maxCount: number) {
  if (minCount >= maxCount) {
    return minCount;
  }
  return minCount + Math.floor(dropRoll(seed) * (maxCount - minCount + 1));
}

export function createRewardReasons(input: {
  battle: BattleSession;
  missionResults: MissionResult[];
}): RewardReason[] {
  const reasons: RewardReason[] = ['session-complete'];
  const enemy = getEnemy(input.battle.enemyId);
  for (const result of input.missionResults) {
    if (result.correct) {
      reasons.push('normal-correct');
    }
    for (const reason of result.learningResult?.rewardBonusReasons ?? []) {
      reasons.push(reason);
    }
  }
  if (input.battle.enemyCurrentHp <= 0 && enemy?.type === 'boss') {
    reasons.push('boss-defeated');
  }
  return [...new Set(reasons)];
}

export const RewardEngine = {
  async grantBattleRewards(input: {
    battle: BattleSession;
    missionResults: MissionResult[];
  }): Promise<RewardSummary> {
    await initializeAppData();
    const rewardedIds = loadRewardedIds();
    const player = await getPlayerById(DEFAULT_PLAYER_ID);
    const inventory = await getInventory(DEFAULT_PLAYER_ID);
    const selectedCompanion = await getSelectedCompanion(DEFAULT_PLAYER_ID);
    const reasons = createRewardReasons(input);
    const enemy = getEnemy(input.battle.enemyId);
    const bossDefeated =
      input.battle.enemyCurrentHp <= 0 && enemy?.type === 'boss';
    const baseSummary = {
      battleId: input.battle.battleId,
      areaId: enemy?.areaId ?? 'starting-village',
      bossDefeated,
      bonusReasons: reasons,
      experienceEarned: 0,
      goldEarned: 0,
      experienceGained: 0,
      goldGained: 0,
      experienceBefore: player?.experience ?? 0,
      experienceAfter: player?.experience ?? 0,
      goldBefore: inventory?.gold ?? 0,
      goldAfter: inventory?.gold ?? 0,
      levelBefore: player?.level ?? 1,
      levelAfter: player?.level ?? 1,
      levelUp: false,
      nextLevelExperience: player
        ? experienceRequiredForLevel((player.level ?? 1) + 1)
        : null,
      experienceToNextLevel: player
        ? Math.max(
            0,
            experienceRequiredForLevel((player.level ?? 1) + 1) -
              player.experience,
          )
        : 0,
      reasons,
      player: player ?? null,
      inventory: inventory ?? null,
    };

    if (rewardedIds.includes(input.battle.battleId) || !player || !inventory) {
      const summary: RewardSummary = { ...baseSummary, alreadyRewarded: true };
      localStorage.setItem(BATTLE_RESULT_STORAGE_KEY, JSON.stringify(summary));
      return summary;
    }

    const victory = input.battle.enemyCurrentHp <= 0;
    const owlBonus =
      selectedCompanion?.skillId === 'review-bonus' &&
      reasons.some((reason) => reason.startsWith('weak-letter'))
        ? 15
        : 0;
    const experienceGained =
      calculateExperience(reasons) +
      (victory ? (enemy?.rewardExperience ?? 0) : 0) +
      owlBonus;
    const squirrelMultiplier =
      selectedCompanion?.skillId === 'bonus-gold' ? 1.1 : 1;
    const goldGained = Math.max(
      0,
      Math.round(
        (calculateGold(reasons) + (victory ? (enemy?.rewardGold ?? 0) : 0)) *
          squirrelMultiplier,
      ),
    );
    const nextExperience = player.experience + experienceGained;
    const nextLevel = calculateLevel(nextExperience);
    const nextLevelExperience = experienceRequiredForLevel(nextLevel + 1);
    const updatedPlayer = await updatePlayer(DEFAULT_PLAYER_ID, {
      experience: nextExperience,
      level: nextLevel,
      gold: player.gold + goldGained,
    });
    const updatedInventory = await changeGold(DEFAULT_PLAYER_ID, goldGained);
    if (victory && enemy) {
      for (const drop of enemy.drops) {
        const key = `${input.battle.battleId}:${drop.itemId}`;
        if (dropRoll(key) <= drop.chance) {
          const equipment = equipmentData.find(
            (item) => item.id === drop.itemId,
          );
          if (drop.kind === 'equipment' && equipment) {
            await addEquipment(DEFAULT_PLAYER_ID, {
              id: equipment.id,
              slot: equipment.type,
            });
          } else {
            await addItem(DEFAULT_PLAYER_ID, {
              id: drop.itemId,
              count: dropCount(key, drop.minCount, drop.maxCount),
            });
          }
        }
      }
    }
    saveRewardedId(input.battle.battleId);

    const summary: RewardSummary = {
      ...baseSummary,
      experienceGained,
      experienceEarned: experienceGained,
      goldGained,
      goldEarned: goldGained,
      experienceAfter: nextExperience,
      goldAfter: updatedInventory?.gold ?? inventory.gold + goldGained,
      levelAfter: nextLevel,
      levelUp: nextLevel > player.level,
      nextLevelExperience,
      experienceToNextLevel: Math.max(0, nextLevelExperience - nextExperience),
      alreadyRewarded: false,
      player: updatedPlayer ?? player,
      inventory: updatedInventory ?? inventory,
    };
    localStorage.setItem(BATTLE_RESULT_STORAGE_KEY, JSON.stringify(summary));
    return summary;
  },

  loadLastRewardSummary() {
    const raw = localStorage.getItem(BATTLE_RESULT_STORAGE_KEY);
    if (!raw) {
      return null;
    }
    try {
      return JSON.parse(raw) as RewardSummary;
    } catch {
      localStorage.removeItem(BATTLE_RESULT_STORAGE_KEY);
      return null;
    }
  },
};
