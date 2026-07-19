import {
  EXP_FINAL_REVIEW,
  EXP_NORMAL_CORRECT,
  EXP_SESSION_COMPLETE,
  EXP_SPEED_IMPROVEMENT,
  EXP_WEAK_MASTERED,
  EXP_WEAK_PROGRESS,
} from './constants';
import type { RewardReason } from './types';

export function calculateExperience(reasons: RewardReason[]) {
  const uniqueReasons = [...new Set(reasons)];
  return uniqueReasons.reduce((total, reason) => {
    if (reason === 'normal-correct') return total + EXP_NORMAL_CORRECT;
    if (reason === 'session-complete') return total + EXP_SESSION_COMPLETE;
    if (reason === 'speed-improvement') return total + EXP_SPEED_IMPROVEMENT;
    if (reason === 'weak-letter-progress') return total + EXP_WEAK_PROGRESS;
    if (reason === 'weak-letter-mastered') return total + EXP_WEAK_MASTERED;
    if (reason === 'final-review-completed') return total + EXP_FINAL_REVIEW;
    if (reason === 'boss-defeated') return total + 100;
    return total;
  }, 0);
}
