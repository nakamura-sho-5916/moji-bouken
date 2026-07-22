export const WORLD_RECOVERY_STORAGE_KEY = 'moji-bouken:world-recovery-points';

export const RECOVERY_POINT_VALUES = {
  normalBattleVictory: 10,
  bossBattleVictory: 40,
  weakLetterProgress: 5,
  weakLetterMastered: 20,
  finalReviewCompleted: 15,
} as const;

export const RECOVERY_STAGE_THRESHOLDS = [0, 10, 20, 30, 50] as const;

export const MAX_RECOVERY_STAGE = RECOVERY_STAGE_THRESHOLDS.length - 1;

export const WORLD_EVENT_IDS = {
  bridgeRepaired: 'bridge-repaired',
  natureReturned: 'nature-returned',
  shopOpened: 'shop-opened',
  npcJoined: 'npc-joined',
} as const;
