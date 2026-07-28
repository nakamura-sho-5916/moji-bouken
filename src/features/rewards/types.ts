import type { Player, Inventory } from '../../types';
import type { GameAssetRarity } from '../assets';

export type RewardReason =
  | 'normal-correct'
  | 'session-complete'
  | 'speed-improvement'
  | 'weak-letter-progress'
  | 'weak-letter-mastered'
  | 'final-review-completed'
  | 'boss-defeated';

export type RewardDropItem = {
  itemId: string;
  name: string;
  kind: 'item' | 'equipment' | 'collection';
  count: number;
  rarity: GameAssetRarity;
  newToCollection: boolean;
};

export type RewardSummary = {
  battleId: string;
  areaId: string;
  bossDefeated: boolean;
  bonusReasons: RewardReason[];
  experienceEarned: number;
  goldEarned: number;
  experienceGained: number;
  goldGained: number;
  experienceBefore: number;
  experienceAfter: number;
  goldBefore: number;
  goldAfter: number;
  levelBefore: number;
  levelAfter: number;
  levelUp: boolean;
  nextLevelExperience: number | null;
  experienceToNextLevel: number;
  reasons: RewardReason[];
  droppedItems: RewardDropItem[];
  alreadyRewarded: boolean;
  player: Player | null;
  inventory: Inventory | null;
};
