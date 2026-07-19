import { RECOVERY_POINT_VALUES } from './constants';
import type { WorldRecoveryInput } from './types';

export function calculateRecoveryPoints(input: WorldRecoveryInput) {
  let points = input.bossDefeated
    ? RECOVERY_POINT_VALUES.bossBattleVictory
    : RECOVERY_POINT_VALUES.normalBattleVictory;

  if (input.bonusReasons.includes('weak-letter-progress')) {
    points += RECOVERY_POINT_VALUES.weakLetterProgress;
  }
  if (input.bonusReasons.includes('weak-letter-mastered')) {
    points += RECOVERY_POINT_VALUES.weakLetterMastered;
  }
  if (input.bonusReasons.includes('final-review-completed')) {
    points += RECOVERY_POINT_VALUES.finalReviewCompleted;
  }

  return Math.max(0, points);
}
