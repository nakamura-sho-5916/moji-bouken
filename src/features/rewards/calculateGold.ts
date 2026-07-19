import {
  GOLD_NORMAL_CORRECT,
  GOLD_SESSION_COMPLETE,
  GOLD_SPEED_IMPROVEMENT,
  GOLD_WEAK_MASTERED,
  GOLD_WEAK_PROGRESS,
} from './constants';
import type { RewardReason } from './types';

export function calculateGold(reasons: RewardReason[]) {
  const uniqueReasons = [...new Set(reasons)];
  return uniqueReasons.reduce((total, reason) => {
    if (reason === 'normal-correct') return total + GOLD_NORMAL_CORRECT;
    if (reason === 'session-complete') return total + GOLD_SESSION_COMPLETE;
    if (reason === 'speed-improvement') return total + GOLD_SPEED_IMPROVEMENT;
    if (reason === 'weak-letter-progress') return total + GOLD_WEAK_PROGRESS;
    if (reason === 'weak-letter-mastered') return total + GOLD_WEAK_MASTERED;
    if (reason === 'boss-defeated') return total + 50;
    return total;
  }, 0);
}
