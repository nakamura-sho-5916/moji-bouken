const STRUGGLE_ATTEMPT_THRESHOLD = 3;
const STRUGGLE_ACCURACY_THRESHOLD = 0.7;

export type LetterPracticeStats = {
  attempts: number;
  correct: number;
};

export function calculateAccuracy(stats: LetterPracticeStats): number {
  if (stats.attempts <= 0) {
    return 0;
  }

  return stats.correct / stats.attempts;
}

export function isStrugglingLetter(stats: LetterPracticeStats): boolean {
  if (stats.attempts < STRUGGLE_ATTEMPT_THRESHOLD) {
    return false;
  }

  return calculateAccuracy(stats) <= STRUGGLE_ACCURACY_THRESHOLD;
}
