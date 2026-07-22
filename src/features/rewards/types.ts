import type { Player, Inventory } from '../../types';

export type RewardReason =
  | 'normal-correct'
  | 'session-complete'
  | 'speed-improvement'
  | 'weak-letter-progress'
  | 'weak-letter-mastered'
  | 'final-review-completed'
  | 'boss-defeated';

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
  alreadyRewarded: boolean;
  player: Player | null;
  inventory: Inventory | null;
};
