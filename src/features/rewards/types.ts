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
  experienceGained: number;
  goldGained: number;
  levelBefore: number;
  levelAfter: number;
  levelUp: boolean;
  reasons: RewardReason[];
  alreadyRewarded: boolean;
  player: Player | null;
  inventory: Inventory | null;
};
