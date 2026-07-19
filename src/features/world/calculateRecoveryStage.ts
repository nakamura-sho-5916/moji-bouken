import { MAX_RECOVERY_STAGE, RECOVERY_STAGE_THRESHOLDS } from './constants';

export function calculateRecoveryStage(points: number) {
  for (let stage = MAX_RECOVERY_STAGE; stage >= 0; stage -= 1) {
    if (points >= RECOVERY_STAGE_THRESHOLDS[stage]) {
      return stage;
    }
  }
  return 0;
}
