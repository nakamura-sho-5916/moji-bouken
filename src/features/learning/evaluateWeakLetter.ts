import { MIN_ATTEMPTS_FOR_WEAK, WEAK_ACCURACY_THRESHOLD } from './constants';
import type { WeakEvaluation } from './types';

export function evaluateWeakLetter(input: {
  attempts: number;
  accuracy: number;
}): WeakEvaluation {
  if (input.attempts < MIN_ATTEMPTS_FOR_WEAK) {
    return {
      weak: false,
      reason: 'not-enough-attempts',
      attempts: input.attempts,
      accuracy: input.accuracy,
    };
  }

  const weak = input.accuracy <= WEAK_ACCURACY_THRESHOLD;
  return {
    weak,
    reason: weak ? 'accuracy-threshold' : 'accuracy-above-threshold',
    attempts: input.attempts,
    accuracy: input.accuracy,
  };
}
