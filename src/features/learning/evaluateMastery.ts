import {
  MASTERY_ACCURACY_THRESHOLD,
  MASTERY_RECENT_WINDOW,
  MASTERY_REQUIRED_CORRECT,
} from './constants';
import type { MasteryEvaluation } from './types';

export function evaluateMastery(input: {
  recentCorrect: boolean[];
  accuracy: number;
  finalReviewCompletedCorrect: boolean;
}): MasteryEvaluation {
  const recentWindow = input.recentCorrect.slice(-MASTERY_RECENT_WINDOW);
  const recentCorrectCount = recentWindow.filter(Boolean).length;

  if (recentWindow.length < MASTERY_RECENT_WINDOW) {
    return {
      mastered: false,
      weakCleared: false,
      reason: 'not-enough-recent-answers',
    };
  }

  if (recentCorrectCount < MASTERY_REQUIRED_CORRECT) {
    return {
      mastered: false,
      weakCleared: false,
      reason: 'recent-correct-count-low',
    };
  }

  if (input.accuracy < MASTERY_ACCURACY_THRESHOLD) {
    return {
      mastered: false,
      weakCleared: false,
      reason: 'accuracy-low',
    };
  }

  if (!input.finalReviewCompletedCorrect) {
    return {
      mastered: false,
      weakCleared: false,
      reason: 'final-review-not-completed',
    };
  }

  return {
    mastered: true,
    weakCleared: true,
    reason: 'mastery-conditions-met',
  };
}
