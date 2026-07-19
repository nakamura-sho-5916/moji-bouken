import { MIN_SPEED_DIFFERENCE_MS, SPEED_IMPROVEMENT_RATIO } from './constants';
import { normalizeResponseTime } from './calculateResponseTime';
import type { SpeedImprovement } from './types';

export function evaluateSpeedImprovement(input: {
  correct: boolean;
  previousTimeMs: number | null;
  currentTimeMs: number;
}): SpeedImprovement {
  const currentTimeMs = normalizeResponseTime(input.currentTimeMs);
  const previousTimeMs = input.previousTimeMs;

  if (!input.correct || previousTimeMs === null) {
    return {
      improved: false,
      previousTimeMs,
      currentTimeMs,
      improvementMs: 0,
      improvementRatio: 0,
    };
  }

  const improvementMs = previousTimeMs - currentTimeMs;
  const improvementRatio = improvementMs / previousTimeMs;
  const improved =
    improvementMs >= MIN_SPEED_DIFFERENCE_MS &&
    improvementRatio >= SPEED_IMPROVEMENT_RATIO;

  return {
    improved,
    previousTimeMs,
    currentTimeMs,
    improvementMs: Math.max(0, improvementMs),
    improvementRatio: Math.max(0, Math.round(improvementRatio * 10000) / 10000),
  };
}
