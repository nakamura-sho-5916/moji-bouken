import type { BattleSession } from '../battle';
import type { CompanionData } from './types';

export const COMPANION_SUPPORT_RATE = 0.32;
export const COMPANION_SUPPORT_MAX_PER_BATTLE = 1;

export type CompanionSupportSkill =
  'cheer' | 'magic' | 'critical' | 'exp-bonus' | 'gold-bonus';

export type CompanionSupportEvent = {
  companionId: string;
  companionName: string;
  skill: CompanionSupportSkill;
  skillName: string;
  line: string;
  effectLabel: string;
  damageBonus: number;
  experienceBonus: number;
  goldBonus: number;
};

export type CompanionSupportDefinition = {
  skill: CompanionSupportSkill;
  skillName: string;
  line: string;
  effectLabel: string;
  getDamageBonus: (baseDamage: number) => number;
  experienceBonus: number;
  goldBonus: number;
};

const supportDefinitions: Record<string, CompanionSupportDefinition> = {
  rabbit: {
    skill: 'cheer',
    skillName: '応援',
    line: 'いまだよ、いっしょに！',
    effectLabel: '攻撃+10%',
    getDamageBonus: (baseDamage) => Math.max(1, Math.round(baseDamage * 0.1)),
    experienceBonus: 0,
    goldBonus: 0,
  },
  fox: {
    skill: 'magic',
    skillName: '魔法',
    line: 'ひらめきの ひかり！',
    effectLabel: '追加ダメージ',
    getDamageBonus: () => 4,
    experienceBonus: 0,
    goldBonus: 0,
  },
  bear: {
    skill: 'critical',
    skillName: 'クリティカル',
    line: 'ここで ぐっと いくよ！',
    effectLabel: 'クリティカル',
    getDamageBonus: (baseDamage) => Math.max(2, Math.round(baseDamage * 0.25)),
    experienceBonus: 0,
    goldBonus: 0,
  },
  owl: {
    skill: 'exp-bonus',
    skillName: 'EXPボーナス',
    line: 'よく みていたね',
    effectLabel: 'EXP +3',
    getDamageBonus: () => 0,
    experienceBonus: 3,
    goldBonus: 0,
  },
  squirrel: {
    skill: 'gold-bonus',
    skillName: 'Goldボーナス',
    line: 'きらりを みつけたよ',
    effectLabel: 'Gold +2',
    getDamageBonus: () => 0,
    experienceBonus: 0,
    goldBonus: 2,
  },
};

function hashToUnit(seed: string) {
  let value = 0;
  for (const char of seed) {
    value = (value * 31 + char.charCodeAt(0)) % 100000;
  }
  return value / 100000;
}

function hashToIndex(seed: string, length: number) {
  if (length <= 0) {
    return 0;
  }
  return Math.floor(hashToUnit(seed) * length) % length;
}

export function getCompanionSupportDefinition(companionId: string) {
  return supportDefinitions[companionId] ?? null;
}

export function evaluateCompanionBattleSupport(input: {
  battle: BattleSession;
  missionIndex: number;
  totalMissions: number;
  companions: CompanionData[];
  previousCompanionId: string | null;
  alreadyActivatedCount: number;
  baseDamage: number;
}): CompanionSupportEvent | null {
  if (
    input.alreadyActivatedCount >= COMPANION_SUPPORT_MAX_PER_BATTLE ||
    input.companions.length === 0 ||
    input.baseDamage <= 0
  ) {
    return null;
  }

  const triggerRoll = hashToUnit(`${input.battle.battleId}:support`);
  if (triggerRoll >= COMPANION_SUPPORT_RATE) {
    return null;
  }

  const totalMissions = Math.max(1, input.totalMissions);
  const triggerIndex = hashToIndex(
    `${input.battle.battleId}:support-index`,
    totalMissions,
  );
  if (input.missionIndex !== triggerIndex) {
    return null;
  }

  const candidates = input.companions.filter((companion) =>
    getCompanionSupportDefinition(companion.id),
  );
  const freshCandidates = candidates.filter(
    (companion) => companion.id !== input.previousCompanionId,
  );
  const pool = freshCandidates.length > 0 ? freshCandidates : candidates;
  const companion =
    pool[hashToIndex(`${input.battle.battleId}:companion`, pool.length)];
  if (!companion) {
    return null;
  }

  const definition = getCompanionSupportDefinition(companion.id);
  if (!definition) {
    return null;
  }

  return {
    companionId: companion.id,
    companionName: companion.name,
    skill: definition.skill,
    skillName: definition.skillName,
    line: definition.line,
    effectLabel: definition.effectLabel,
    damageBonus: definition.getDamageBonus(input.baseDamage),
    experienceBonus: definition.experienceBonus,
    goldBonus: definition.goldBonus,
  };
}
