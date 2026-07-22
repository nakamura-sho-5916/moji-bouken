import type { MissionResult } from '../missions';

export type BattleStatus =
  'ready' | 'active' | 'feedback' | 'victory' | 'completed' | 'error';

export type EnemyType = 'normal' | 'boss';
export type EnemyRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export type EnemyDropItem = {
  itemId: string;
  kind: 'item' | 'equipment' | 'collection';
  chance: number;
  minCount: number;
  maxCount: number;
};

export type Enemy = {
  id: string;
  name: string;
  type: EnemyType;
  rarity: EnemyRarity;
  maxHp: number;
  defense: number;
  rewardExperience: number;
  rewardGold: number;
  drops: EnemyDropItem[];
  battleLine: string;
  attackLine: string;
  defeatLine: string;
  imageId: string;
  areaId: string;
  active: boolean;
};

export type BattleSession = {
  battleId: string;
  sessionId: string;
  enemyId: string;
  enemyMaxHp: number;
  enemyCurrentHp: number;
  playerAttack: number;
  comboCount: number;
  maxCombo: number;
  specialGauge: number;
  specialGaugeMax: number;
  totalDamage: number;
  currentMissionIndex: number;
  status: BattleStatus;
  startedAt: string;
  completedAt: string | null;
  lastMessage: string;
};

export type BattleAnswerResult = {
  battle: BattleSession;
  damage: number;
  correct: boolean;
  comboBonus: number;
  specialGaugeGain: number;
  missionResult?: MissionResult;
};

export type BattleRewardInput = {
  battle: BattleSession;
  missionResults: MissionResult[];
};
