import type { RewardReason } from '../rewards/types';

export type WorldAreaId =
  | 'starting-village'
  | 'word-forest'
  | 'picture-hill'
  | 'ordering-cave'
  | 'word-castle';

export type WorldAreaTheme = 'village' | 'forest' | 'hill' | 'cave' | 'castle';

export type WorldArea = {
  id: WorldAreaId;
  name: string;
  shortName: string;
  theme: WorldAreaTheme;
  order: number;
  initiallyUnlocked: boolean;
  requiredPreviousAreaId: WorldAreaId | null;
  requiredRecoveryStage: number;
  enemyIds: string[];
  bossEnemyId: string | null;
};

export type NpcData = {
  id: string;
  name: string;
  areaId: WorldAreaId;
  requiredRecoveryStage: number;
  message: string;
};

export type WorldRecoveryInput = {
  battleId: string;
  areaId: string;
  bossDefeated: boolean;
  bonusReasons: RewardReason[];
  experienceEarned: number;
  goldEarned: number;
};

export type AreaUnlockResult = {
  areaId: WorldAreaId;
  unlocked: boolean;
  reason: string;
};

export type AreaViewModel = {
  area: WorldArea;
  unlocked: boolean;
  recoveryStage: number;
  recoveryPoints: number;
  unlockedEvents: string[];
  availableNpc: NpcData[];
};

export type RecoveryEvent = {
  id: string;
  areaId: WorldAreaId;
  title: string;
  message: string;
};

export type WorldRecoveryResult = {
  areaId: WorldAreaId;
  pointsAdded: number;
  totalPoints: number;
  previousStage: number;
  nextStage: number;
  triggeredEvents: RecoveryEvent[];
  unlockedAreaIds: WorldAreaId[];
  alreadyApplied: boolean;
};
